<?php

namespace App\Http\Controllers\Auth;

use App\Enums\NameExtension;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\RegistrationVerificationCode;
use App\Models\College;
use App\Models\PendingRegistration;
use App\Models\PendingVehicle;
use App\Models\RoleType;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show current registration step based on session.
     */
    public function show(): Response
    {
        $previousUrl = url()->previous();

        // If entering the register flow from somewhere else (like login or home), clear partial sessions
        // We ensure previousUrl is not the current URL to avoid wiping on page reloads
        if (! str_contains($previousUrl, '/register') && $previousUrl !== url()->current()) {
            session()->forget([
                'registration_main_role',
                'registration_requires_approval',
                'registration_role_type_id',
                'registration_name',
                'registration_role_specific',
                'registration_vehicles',
                'registration_email',
                'registration_password_hash',
                'pending_registration_id',
                'registration_step',
                'registration_completed_recently',
            ]);
        }

        $mainRole = session('registration_main_role');
        $roleTypeId = session('registration_role_type_id');
        $nameData = session('registration_name');
        $roleSpecificData = session('registration_role_specific');
        $vehicles = session('registration_vehicles');
        $pendingId = session('pending_registration_id');
        $currentStep = session('registration_step', 0);

        // Check if we need to go back (step was decremented)
        $targetStep = $currentStep;

        // Determine step based on data availability
        $dataStep = 0; // role selection
        if ($mainRole) {
            if ($mainRole === UserRole::STAKEHOLDER->value && ! $roleTypeId) {
                $dataStep = 1; // role type
            } else {
                $dataStep = 2; // name
                if ($nameData) {
                    $dataStep = 3; // role-specific
                    if ($roleSpecificData) {
                        $dataStep = 4; // vehicles
                        if ($vehicles) {
                            $dataStep = 5; // credentials
                            if (session('registration_email')) {
                                $dataStep = 6; // verify
                            }
                        }
                    }
                }
            }
        }

        // Use the earlier of target step or data step
        $step = min($targetStep, $dataStep);

        return match ($step) {
            0 => $this->renderRoleSelection(),
            1 => $this->renderRoleTypeSelection(),
            2 => $this->renderNameForm($mainRole),
            3 => $this->renderRoleSpecificForm($mainRole),
            4 => $this->renderVehiclesForm($mainRole),
            5 => $this->renderCredentialsForm(),
            6 => $this->renderVerifyForm(),
            default => $this->renderRoleSelection(),
        };
    }

    /**
     * Go back to previous step.
     * Decrements step counter without clearing data.
     */
    public function goBack(): RedirectResponse
    {
        $currentStep = session('registration_step', 0);
        $mainRole = session('registration_main_role');

        // Decrement step but don't go below 0
        $newStep = max(0, $currentStep - 1);

        // Skip role type selection (Step 1) if not a Stakeholder
        if ($newStep === 1 && $mainRole !== UserRole::STAKEHOLDER->value) {
            $newStep = 0;
        }

        // If the user lands back on Step 0 (Role Picker),
        // clear all downstream forms to ensure fresh state if they choose a new role
        if ($newStep === 0) {
            session()->forget([
                'registration_role_type_id',
                'registration_name',
                'registration_role_specific',
                'registration_vehicles',
                'registration_email',
                'registration_password_hash',
            ]);
        }

        session(['registration_step' => $newStep]);
        session()->save();

        return to_route('register');
    }

    /**
     * Render role selection.
     */
    private function renderRoleSelection(): Response
    {
        $allowedRoles = [UserRole::STUDENT, UserRole::STAFF, UserRole::STAKEHOLDER];

        $mainRoles = collect($allowedRoles)->map(fn ($role) => [
            'value' => $role->value,
            'label' => $role->label(),
            'requiresApproval' => $role->requiresApproval(),
            'description' => match ($role) {
                UserRole::STUDENT => 'Enrolled student in the institution',
                UserRole::STAFF => 'Faculty or staff member',
                UserRole::STAKEHOLDER => 'Guardian, visitor, or service provider',
            },
            'color' => match ($role) {
                UserRole::STUDENT => 'bg-blue-600',
                UserRole::STAFF => 'bg-emerald-600',
                UserRole::STAKEHOLDER => 'bg-amber-600',
            },
            'borderColor' => match ($role) {
                UserRole::STUDENT => '#2563eb',
                UserRole::STAFF => '#059669',
                UserRole::STAKEHOLDER => '#d97706',
            },
        ]);

        return Inertia::render('auth/register-role', [
            'mainRoles' => $mainRoles,
            'savedMainRole' => session('registration_main_role'),
        ]);
    }

    /**
     * Render role type selection (Stakeholder only).
     */
    private function renderRoleTypeSelection(): Response
    {
        $roleTypes = RoleType::where('main_role', UserRole::STAKEHOLDER->value)->get();

        return Inertia::render('auth/register-role-type', [
            'roleTypes' => $roleTypes->map(fn ($type) => [
                'value' => $type->id,
                'name' => $type->name,
                'description' => $type->description,
            ]),
            'savedRoleTypeId' => session('registration_role_type_id'),
        ]);
    }

    /**
     * Render name form.
     */
    private function renderNameForm(string $mainRole): Response
    {
        $roleLabel = match ($mainRole) {
            UserRole::STUDENT->value => 'Student',
            UserRole::STAFF->value => 'Staff',
            UserRole::STAKEHOLDER->value => 'Stakeholder',
            default => $mainRole,
        };

        return Inertia::render('auth/register-name', [
            'nameExtensions' => NameExtension::options(),
            'selectedRole' => $mainRole,
            'roleLabel' => $roleLabel,
            'savedName' => session('registration_name'),
        ]);
    }

    /**
     * Render role-specific fields.
     */
    private function renderRoleSpecificForm(string $mainRole): Response
    {
        $savedData = session('registration_role_specific', []);

        // If stakeholder, ensure subtype is set from Step 1 selection for the dynamic UI logic
        if ($mainRole === UserRole::STAKEHOLDER->value && empty($savedData['stakeholder_type'])) {
            $roleTypeId = session('registration_role_type_id');
            if ($roleTypeId) {
                $roleType = RoleType::find($roleTypeId);
                if ($roleType) {
                    $savedData['stakeholder_type'] = $roleType->name;
                }
            }
        }

        // Generate signed URLs for saved images
        // Note: Session check in route middleware provides security - URL becomes invalid when session is cleared
        $imageFields = ['student_id_image', 'staff_id_image', 'face_scan_data', 'license_image', 'student_school_id_image'];
        foreach ($imageFields as $field) {
            if (! empty($savedData[$field])) {
                $path = str_replace('/', '|', $savedData[$field]);
                $encodedPath = urlencode($path);
                $signedUrl = URL::signedRoute('register.files.show', ['path' => $encodedPath]);
                $savedData[$field] = $signedUrl;
            }
        }

        return Inertia::render('auth/register-role-specific', [
            'role' => $mainRole,
            'colleges' => College::with('programs')->get(),
            'savedData' => $savedData,
        ]);
    }

    /**
     * Render vehicles form.
     */
    private function renderVehiclesForm(string $mainRole): Response
    {
        return Inertia::render('auth/register-vehicles', [
            'vehicleTypes' => VehicleType::all(),
            'role' => $mainRole,
            'savedVehicles' => session('registration_vehicles'),
        ]);
    }

    /**
     * Render credentials form.
     */
    private function renderCredentialsForm(): Response
    {
        return Inertia::render('auth/register-credentials', [
            'savedEmail' => session('registration_email'),
        ]);
    }

    /**
     * Render verification form.
     */
    private function renderVerifyForm(): Response
    {
        $email = session('registration_email');

        return Inertia::render('auth/register-verify', [
            'email' => $email,
        ]);
    }

    /**
     * Step 0: Store role selection in session.
     */
    public function storeRoleSelection(Request $request): RedirectResponse
    {
        $request->validate([
            'main_role' => ['required', 'string', Rule::in(array_column(UserRole::cases(), 'value'))],
        ]);

        $mainRole = UserRole::from($request->main_role);

        session([
            'registration_main_role' => $request->main_role,
            'registration_requires_approval' => $mainRole->requiresApproval(),
            'registration_step' => 1,
        ]);

        // If Stakeholder, go to role type selection first
        if ($mainRole === UserRole::STAKEHOLDER) {
            return to_route('register');
        }

        // Skip role type for Student/Staff, go to name form
        session(['registration_step' => 2]);

        return to_route('register');
    }

    /**
     * Step 0.5: Store role type selection (Stakeholder only).
     */
    public function storeRoleTypeSelection(Request $request): RedirectResponse
    {
        $mainRole = session('registration_main_role');

        if ($mainRole !== UserRole::STAKEHOLDER->value) {
            return to_route('register');
        }

        $request->validate([
            'role_type_id' => 'required|exists:role_types,id',
        ]);

        session(['registration_role_type_id' => $request->role_type_id, 'registration_step' => 2]);

        return to_route('register');
    }

    /**
     * Clear registration session and go back to role selection.
     */
    public function clearSession(): RedirectResponse
    {
        session()->forget([
            'registration_main_role',
            'registration_requires_approval',
            'registration_role_type_id',
            'registration_name',
            'registration_role_specific',
            'registration_vehicles',
            'registration_email',
            'registration_password_hash',
            'pending_registration_id',
            'registration_step',
        ]);

        return to_route('register');
    }

    /**
     * Step 1: Store name fields in session.
     */
    public function storeName(Request $request): RedirectResponse
    {
        // Security: Validate previous step completed
        if (! session('registration_main_role')) {
            return to_route('register');
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'surname' => 'required|string|max:255',
            'name_extension' => ['nullable', 'string', Rule::in(NameExtension::values())],
        ]);

        session([
            'registration_name' => [
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'surname' => $request->surname,
                'name_extension' => $request->name_extension === 'none' ? '' : $request->name_extension,
            ],
            'registration_step' => 3,
        ]);

        return to_route('register');
    }

    /**
     * Step 2: Store role-specific fields (no vehicles).
     */
    public function storeRoleSpecificFields(Request $request): RedirectResponse
    {
        // Security: Validate previous steps completed
        if (! session('registration_main_role') || ! session('registration_name')) {
            return to_route('register');
        }

        $mainRole = session('registration_main_role');

        $rules = match ($mainRole) {
            UserRole::STUDENT->value => [
                'student_id' => 'required|string|max:50',
                'college_id' => 'required|exists:colleges,id',
                'program_id' => 'required|exists:programs,id',
                'student_id_image' => session('registration_role_specific.student_id_image') ? 'nullable|image|max:5120' : 'required|image|max:5120',
                'face_scan_data' => session('registration_role_specific.face_scan_data') ? 'nullable|image|max:5120' : 'required|image|max:5120',
                'license_image' => 'nullable|image|max:5120',
            ],
            UserRole::STAFF->value => [
                'staff_id' => 'required|string|max:50',
                'staff_id_image' => ! session('registration_role_specific.staff_id_image') ? 'required|image|max:5120' : 'nullable|image|max:5120',
                'face_scan_data' => session('registration_role_specific.face_scan_data') ? 'nullable|image|max:5120' : 'required|image|max:5120',
                'license_image' => 'nullable|image|max:5120',
            ],
            UserRole::STAKEHOLDER->value => [
                'stakeholder_type' => 'required|string|in:Guardian,Service Provider,Visitor',
                'student_school_id_image' => request('stakeholder_type') === 'Guardian' && ! session('registration_role_specific.student_school_id_image') ? 'required|image|max:5120' : 'nullable|image|max:5120',
                'face_scan_data' => session('registration_role_specific.face_scan_data') ? 'nullable|image|max:5120' : 'required|image|max:5120',
                'license_image' => 'nullable|image|max:5120',
            ],
            default => [],
        };

        $request->validate($rules);

        // Store role-specific data
        $roleSpecificData = [];

        if ($mainRole === UserRole::STUDENT->value) {
            $roleSpecificData = [
                'student_id' => $request->student_id,
                'college_id' => $request->college_id,
                'program_id' => $request->program_id,
                'student_id_image' => $request->hasFile('student_id_image')
                    ? $this->storeFile($request->file('student_id_image'), 'student-ids')
                    : session('registration_role_specific.student_id_image'),
                'face_scan_data' => $request->hasFile('face_scan_data')
                    ? $this->storeFile($request->file('face_scan_data'), 'face-scans')
                    : session('registration_role_specific.face_scan_data'),
                'license_image' => $request->hasFile('license_image')
                    ? $this->storeFile($request->file('license_image'), 'licenses')
                    : session('registration_role_specific.license_image'),
            ];
        } elseif ($mainRole === UserRole::STAFF->value) {
            $roleSpecificData = [
                'staff_id' => $request->staff_id,
                'staff_id_image' => $request->hasFile('staff_id_image')
                    ? $this->storeFile($request->file('staff_id_image'), 'staff-ids')
                    : session('registration_role_specific.staff_id_image'),
                'face_scan_data' => $request->hasFile('face_scan_data')
                    ? $this->storeFile($request->file('face_scan_data'), 'face-scans')
                    : session('registration_role_specific.face_scan_data'),
                'license_image' => $request->hasFile('license_image')
                    ? $this->storeFile($request->file('license_image'), 'licenses')
                    : session('registration_role_specific.license_image'),
            ];
        } elseif ($mainRole === UserRole::STAKEHOLDER->value) {
            $roleSpecificData = [
                'stakeholder_type' => $request->stakeholder_type,
                'face_scan_data' => $request->hasFile('face_scan_data')
                    ? $this->storeFile($request->file('face_scan_data'), 'face-scans')
                    : session('registration_role_specific.face_scan_data'),
                'license_image' => $request->hasFile('license_image')
                    ? $this->storeFile($request->file('license_image'), 'licenses')
                    : session('registration_role_specific.license_image'),
                'student_school_id_image' => $request->stakeholder_type === 'Guardian'
                    ? ($request->hasFile('student_school_id_image')
                        ? $this->storeFile($request->file('student_school_id_image'), 'student-school-ids')
                        : session('registration_role_specific.student_school_id_image'))
                    : null,
            ];
        }

        session(['registration_role_specific' => $roleSpecificData, 'registration_step' => 4]);

        return to_route('register');
    }

    /**
     * Step 3: Store vehicles.
     */
    public function storeVehicles(Request $request): RedirectResponse
    {
        // Security: Validate previous steps completed
        if (! session('registration_main_role') || ! session('registration_name') || ! session('registration_role_specific')) {
            return to_route('register');
        }

        $request->validate([
            'vehicles' => 'required|array|min:1|max:3',
            'vehicles.*.vehicle_type_id' => 'required|exists:vehicle_types,id',
            'vehicles.*.plate_number' => 'nullable|string|max:20',
        ]);

        // Collect submitted plate numbers (non-empty, normalised to uppercase)
        $submittedPlates = collect($request->vehicles)
            ->pluck('plate_number')
            ->filter(fn ($p) => ! empty(trim((string) $p)))
            ->map(fn ($p) => strtoupper(trim($p)));

        // 1. Check for duplicates within the submitted batch
        if ($submittedPlates->count() !== $submittedPlates->unique()->count()) {
            return back()
                ->withErrors(['vehicles' => 'You have entered the same plate number more than once.'])
                ->withInput()
                ->with('error', 'You have entered the same plate number more than once.');
        }

        // 2. Check against already-registered vehicles
        $existingVehicle = Vehicle::whereIn('plate_number', $submittedPlates)->first();
        if ($existingVehicle) {
            return back()
                ->withErrors(['vehicles' => "Plate number \"{$existingVehicle->plate_number}\" is already registered in the system."])
                ->withInput()
                ->with('error', "Plate number \"{$existingVehicle->plate_number}\" is already registered in the system.");
        }

        // 3. Check against pending (awaiting approval) vehicles
        $existingPending = PendingVehicle::whereIn('plate_number', $submittedPlates)
            ->whereHas('pendingRegistration', fn ($q) => $q->where('status', 'pending'))
            ->first();
        if ($existingPending) {
            return back()
                ->withErrors(['vehicles' => "Plate number \"{$existingPending->plate_number}\" is already submitted and pending approval."])
                ->withInput()
                ->with('error', "Plate number \"{$existingPending->plate_number}\" is already submitted and pending approval.");
        }

        session(['registration_vehicles' => $request->vehicles, 'registration_step' => 5]);

        return to_route('register');
    }

    /**
     * Store file in private disk.
     */
    private function storeFile($file, string $folder): string
    {
        return $file->store("registrations/{$folder}", 'private');
    }

    /**
     * Save partial credentials to session for persistence when navigating.
     */
    public function savePartialCredentials(Request $request): RedirectResponse
    {
        if ($request->has('email')) {
            $request->validate(['email' => 'string|lowercase|email|max:255']);
            session(['registration_email' => strtolower($request->email)]);
        }

        // Do not persist passwords in session (even partial); credentials are hashed only on submit.

        return to_route('register');
    }

    /**
     * Step 4: Store credentials and send verification code to ALL users.
     */
    public function storeCredentials(Request $request): RedirectResponse
    {
        $nameData = session('registration_name');
        $mainRole = session('registration_main_role');
        $roleSpecificData = session('registration_role_specific');
        $vehicles = session('registration_vehicles');
        $roleTypeId = session('registration_role_type_id');

        if (! $nameData || ! $mainRole) {
            return to_route('register');
        }

        // Check if vehicles are registered
        if (! session('registration_vehicles')) {
            return to_route('register');
        }

        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $email = strtolower($request->email);

        // Get or create role_type
        if ($roleTypeId) {
            $roleType = RoleType::find($roleTypeId);
        } else {
            $roleType = RoleType::firstOrCreate(
                ['main_role' => $mainRole],
                ['name' => $mainRole, 'description' => $mainRole.' role']
            );
        }

        // Generate 6-digit verification code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Send verification email
        try {
            Mail::to($email)->send(new RegistrationVerificationCode($code, $email));
        } catch (\Exception $e) {
            // Continue even if email fails (for testing)
        }

        // Store verification info in session instead of DB
        session([
            'registration_email' => $email,
            'registration_password_hash' => Hash::make($request->password),
            'registration_verification_code' => $code,
            'registration_verification_code_expires_at' => now()->addMinutes(10),
            'registration_step' => 6,
        ]);

        return to_route('register')
            ->with('success', 'Verification code sent to your email.');
    }

    /**
     * Resend verification code.
     */
    public function resendCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $email = strtolower($request->email);

        $savedEmail = session('registration_email');
        if (! $savedEmail || $savedEmail !== $email) {
            return back()->withErrors(['email' => 'No registration session found for this email.']);
        }

        // Generate new code in session
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        session([
            'registration_verification_code' => $code,
            'registration_verification_code_expires_at' => now()->addMinutes(10),
        ]);

        // Send email
        try {
            Mail::to($email)->send(new RegistrationVerificationCode($code, $email));
        } catch (\Exception $e) {
            // Continue
        }

        return back()->with('success', 'A new verification code has been sent to your email.');
    }

    /**
     * Step 4: Verify the code.
     */
    public function verifyCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $email = strtolower($request->email);

        $savedEmail = session('registration_email');
        $savedCode = session('registration_verification_code');
        $expiresAt = session('registration_verification_code_expires_at');

        if (! $savedEmail || $savedEmail !== $email || $savedCode !== $request->code || ! $expiresAt || now()->isAfter($expiresAt)) {
            return back()->withErrors(['code' => 'Invalid or expired verification code.'])->withInput();
        }

        // Now that email is verified, save to database
        $nameData = session('registration_name');
        $mainRole = session('registration_main_role');
        $roleSpecificData = session('registration_role_specific');
        $vehicles = session('registration_vehicles');
        $roleTypeId = session('registration_role_type_id');
        $passwordHash = session('registration_password_hash');
        if (! $passwordHash || ! is_string($passwordHash)) {
            return back()->withErrors(['code' => 'Your session expired. Please enter your credentials again.'])->withInput();
        }

        $pendingData = array_merge($nameData, $roleSpecificData, [
            'email' => $email,
            'password' => $passwordHash,
            'role' => $mainRole,
            'role_type_id' => $roleTypeId,
            'status' => 'pending',
            'email_verified' => true,
        ]);

        // Create Pending Registration
        $pending = PendingRegistration::updateOrCreate(
            ['email' => $email],
            $pendingData
        );

        // Create Pending Vehicles
        foreach ($vehicles as $vehicleData) {
            PendingVehicle::create([
                'pending_registration_id' => $pending->id,
                'vehicle_type_id' => $vehicleData['vehicle_type_id'],
                'plate_number' => $vehicleData['plate_number'] ?? null,
            ]);
        }

        // Notify admins about the new registration
        NotificationService::notifyNewRegistration($pending);

        // Clear session (except for the 'completed recently' flag)
        session()->forget([
            'registration_main_role',
            'registration_requires_approval',
            'registration_role_type_id',
            'registration_name',
            'registration_role_specific',
            'registration_vehicles',
            'registration_email',
            'registration_password_hash',
            'registration_verification_code',
            'registration_verification_code_expires_at',
            'registration_step',
        ]);
        session(['registration_completed_recently' => true]);

        // Redirect to pending approval page
        return to_route('register.pending-approval')
            ->with('success', 'Email verified successfully. Your registration is now pending admin approval.');
    }
}
