<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\AdminRegistrationCreated;
use App\Models\College;
use App\Models\Invoice;
use App\Models\RoleType;
use App\Models\StickerFee;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Services\StickerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminRegistrationController extends Controller
{
    protected StickerService $stickerService;

    public function __construct(StickerService $stickerService)
    {
        $this->stickerService = $stickerService;
    }

    public function index()
    {
        \Illuminate\Support\Facades\Gate::authorize('direct_registration');

        session(['kiosk_mode' => true]);

        $roles = ['Student', 'Staff', 'Stakeholder', 'Reporter', 'Security Personnel', 'Department Officer', 'Administrator'];

        return Inertia::render('admin/registration/role-picker', [
            'roles' => $roles,
        ]);
    }

    public function kiosk()
    {
        \Illuminate\Support\Facades\Gate::authorize('direct_registration');

        $allowedRoles = ['Student', 'Staff', 'Stakeholder'];

        $mainRoles = collect($allowedRoles)->map(fn ($role) => [
            'value' => strtolower($role),
            'label' => $role,
            'description' => match ($role) {
                'Student' => 'Enrolled student in the institution',
                'Staff' => 'Faculty or staff member',
                'Stakeholder' => 'Guardian, visitor, or service provider',
            },
            'color' => match ($role) {
                'Student' => 'bg-blue-600',
                'Staff' => 'bg-emerald-600',
                'Stakeholder' => 'bg-amber-600',
            },
            'borderColor' => match ($role) {
                'Student' => '#2563eb',
                'Staff' => '#059669',
                'Stakeholder' => '#d97706',
            },
        ]);

        return Inertia::render('admin/registration/kiosk-register', [
            'mainRoles' => $mainRoles,
        ]);
    }

    public function byRole(string $role)
    {
        \Illuminate\Support\Facades\Gate::authorize('direct_registration');

        session(['kiosk_mode' => true]);

        $activeRole = ucwords(str_replace('-', ' ', $role));

        $roles = ['Student', 'Staff', 'Stakeholder', 'Reporter', 'Security Personnel', 'Department Officer', 'Administrator'];

        $colleges = College::with('programs')->get();

        $stakeholderTypes = RoleType::where('main_role', 'Stakeholder')->get();

        $departments = RoleType::where('main_role', 'Department')->get();

        $vehicleTypes = VehicleType::all();

        return Inertia::render('admin/registration/index', [
            'roles' => $roles,
            'activeRole' => $activeRole,
            'roleSlug' => $role,
            'colleges' => $colleges,
            'stakeholderTypes' => $stakeholderTypes,
            'departments' => $departments,
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('direct_registration');

        try {
            $role = $request->input('role', 'student');

            $rules = $this->getValidationRules($role);

            $validated = $request->validate($rules);

            // --- Plate number duplicate check ---
            $vehicles = $request->input('vehicles', []);
            if (! empty($vehicles)) {
                $submittedPlates = collect($vehicles)
                    ->pluck('plate_number')
                    ->filter(fn ($p) => ! empty(trim((string) $p)))
                    ->map(fn ($p) => strtoupper(trim($p)));

                // Duplicates within the submitted batch
                if ($submittedPlates->count() !== $submittedPlates->unique()->count()) {
                    return back()
                        ->withInput()
                        ->with('error', 'You have entered the same plate number more than once.');
                }

                // Duplicate against existing registered vehicles
                $existingVehicle = Vehicle::whereIn('plate_number', $submittedPlates)->first();
                if ($existingVehicle) {
                    return back()
                        ->withInput()
                        ->with('error', "Plate number \"{$existingVehicle->plate_number}\" is already registered in the system.");
                }
            }
            // ------------------------------------

            $userData = $this->prepareUserData($validated, $role);

            $user = User::create($userData);

            // Set user expiration date based on role
            $user->expiration_date = $this->stickerService->calculateExpirationDate($user);
            $user->save();

            // Move files to user-specific storage
            $fileFields = ['license_image', 'student_id_image', 'staff_id_image', 'face_scan_data'];
            $movedFiles = [];

            foreach ($fileFields as $field) {
                // For stakeholders, the path might be in student_id_image even if it came from student_school_id_image
                $oldPath = $user->$field;
                if ($oldPath && Storage::disk('private')->exists($oldPath)) {
                    $filename = basename($oldPath);
                    $newPath = "users/{$user->id}/{$filename}";

                    try {
                        Storage::disk('private')->move($oldPath, $newPath);
                        $movedFiles[$field] = $newPath;
                    } catch (\Exception $e) {
                        $movedFiles[$field] = $oldPath;
                    }
                }
            }

            if (! empty($movedFiles)) {
                $user->update($movedFiles);
            }

            $this->createVehicles($validated, $user, $vehicles);

            Mail::to($user->email)->send(new AdminRegistrationCreated($user));

            Log::info('Direct registration created by admin', [
                'user_id' => $user->id,
                'role' => $role,
                'created_by' => auth()->id()
            ]);

            return back()->with('success', 'Registration successful!');

        } catch (\Exception $e) {
            logger('Registration error: '.$e->getMessage());

            return back()->with('error', 'Registration failed: '.$e->getMessage());
        }
    }

    private function getValidationRules(string $role): array
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'surname' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:10',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'license_image' => 'nullable|file|image|max:5120',
        ];

        switch ($role) {
            case 'student':
                $rules = array_merge($rules, [
                    'student_id' => 'nullable|string|max:255',
                    'program_id' => 'nullable|exists:programs,id',
                    'college_id' => 'nullable|exists:colleges,id',
                    'student_id_image' => 'nullable|file|image|max:5120',
                ]);
                break;
            case 'staff':
                $rules = array_merge($rules, [
                    'staff_id' => 'required|string|max:255',
                    'staff_id_image' => 'nullable|file|image|max:5120',
                ]);
                break;
            case 'stakeholder':
                $rules = array_merge($rules, [
                    'stakeholder_type' => 'nullable|exists:role_types,id',
                    'student_school_id_image' => 'nullable|file|image|max:5120',
                ]);
                break;
            case 'reporter':
                $rules = array_merge($rules, [
                    'department_id' => 'nullable|exists:role_types,id',
                ]);
                break;
            case 'security':
                $rules = array_merge($rules, [
                    'staff_id_image' => 'nullable|file|image|max:5120',
                ]);
                break;
            case 'department-officer':
                $rules = array_merge($rules, [
                    'department_id' => [
                        'required',
                        Rule::exists('role_types', 'id')->where('main_role', 'Department'),
                    ],
                ]);
                break;
            case 'administrator':
                break;
        }

        return $rules;
    }

    private function prepareUserData(array $data, string $role): array
    {
        $userData = [
            'first_name' => $data['first_name'],
            'middle_name' => $data['middle_name'] ?? '',
            'surname' => $data['surname'],
            'name_extension' => $data['name_extension'] ?? '',
            'name' => $data['first_name'].' '.($data['middle_name'] ? $data['middle_name'].' ' : '').$data['surname'],
            'email' => $data['email'],
            'password' => $data['password'],
            'email_verified_at' => now(),
            'role' => ucfirst($role),
        ];

        if (! empty($data['name_extension'])) {
            $userData['name_extension'] = $data['name_extension'];
        }

        if (! empty($data['license_image'])) {
            $userData['license_image'] = $this->storeFile($data['license_image'], 'licenses');
        }

        switch ($role) {
            case 'student':
                $userData['role'] = UserRole::STUDENT->value;
                $userData['student_id'] = $data['student_id'];
                $userData['program_id'] = $data['program_id'];
                $userData['college_id'] = $data['college_id'] ?? null;
                if (! empty($data['student_id_image'])) {
                    $userData['student_id_image'] = $this->storeFile($data['student_id_image'], 'student-ids');
                }
                break;
            case 'staff':
                $userData['role'] = UserRole::STAFF->value;
                $userData['staff_id'] = $data['staff_id'];
                if (! empty($data['staff_id_image'])) {
                    $userData['staff_id_image'] = $this->storeFile($data['staff_id_image'], 'staff-ids');
                }
                break;
            case 'stakeholder':
                $userData['role'] = UserRole::STAKEHOLDER->value;
                $userData['role_type_id'] = $data['stakeholder_type'];
                $userData['stakeholder_type'] = RoleType::find($data['stakeholder_type'])?->name;
                if (! empty($data['student_school_id_image'])) {
                    $userData['student_id_image'] = $this->storeFile($data['student_school_id_image'], 'student-school-ids');
                }
                break;
            case 'reporter':
                $userData['role'] = UserRole::REPORTER->value;
                $userData['role_type_id'] = $data['department_id'] ?? null;
                break;
            case 'security':
                $userData['role'] = UserRole::SECURITY_PERSONNEL->value;
                $userData['staff_id'] = $data['staff_id'] ?? null;
                if (! empty($data['staff_id_image'])) {
                    $userData['staff_id_image'] = $this->storeFile($data['staff_id_image'], 'security-ids');
                }
                break;
            case 'department-officer':
                $userData['role'] = UserRole::DEPARTMENT_OFFICER->value;
                $deptId = $data['department_id'] ?? null;
                $userData['role_type_id'] = $deptId;
                $userData['department_id'] = $deptId;
                break;
            case 'administrator':
                $userData['role'] = UserRole::ADMINISTRATOR->value;
                break;
        }

        return $userData;
    }

    private function createVehicles(array $data, User $user, array $rawVehicles = []): void
    {
        // Prefer $rawVehicles (direct request input) over $data['vehicles']
        // because $data may not include vehicles (they aren't in validation rules)
        $vehicleList = ! empty($rawVehicles) ? $rawVehicles : ($data['vehicles'] ?? []);

        if (empty($vehicleList)) {
            return;
        }

        foreach ($vehicleList as $vehicleData) {
            if (empty($vehicleData['vehicle_type_id'])) {
                continue;
            }

            $vehicleType = VehicleType::find($vehicleData['vehicle_type_id']);
            $needsPlate = $vehicleType ? ($vehicleType->has_plate_number == 1 || $vehicleType->has_plate_number === true) : true;

            if ($needsPlate && empty($vehicleData['plate_number'])) {
                continue;
            }

            $plateNumber = $needsPlate ? strtoupper(trim($vehicleData['plate_number'])) : null;

            $stickerColor = $this->stickerService->calculateStickerColor($user);

            $vehicle = Vehicle::create([
                'user_id' => $user->id,
                'vehicle_type_id' => $vehicleData['vehicle_type_id'],
                'plate_number' => $plateNumber,
                'sticker_number' => $this->stickerService->generateStickerNumber($stickerColor),
                'sticker_color_id' => $stickerColor->id,
                'expires_at' => $this->stickerService->calculateExpirationDate($user),
                'is_active' => true,
            ]);

            // Generate advanced SVG sticker with QR code in background
            \App\Jobs\GenerateVehicleStickerJob::dispatch($vehicle, $user);

            // Create invoice for the sticker
            $fee = StickerFee::getByType('new_registration');
            if ($fee && $fee->amount > 0) {
                Invoice::createForRegistration(
                    $user,
                    $vehicle,
                    'new_registration',
                    $fee->amount,
                    auth()->id()
                );
            }
        }
    }

    private function storeFile($file, string $folder): string
    {
        return $file->store("registrations/{$folder}", 'private');
    }
}
