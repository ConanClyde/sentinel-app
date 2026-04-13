<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NameExtension;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\College;
use App\Models\Program;
use App\Models\RoleType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view_users');

        $user = auth()->user();

        // Department Officers can only see allowed roles — redirect to first allowed role
        $allowedRoles = $this->getAllowedRoles($user);
        $firstRole = $allowedRoles[0] ?? UserRole::STUDENT->value;
        $slug = strtolower(str_replace(' ', '-', $firstRole));

        return to_route('admin.users.byRole', ['role' => $slug]);
    }

    /**
     * Get the roles a user is allowed to view based on their permissions.
     */
    private function getAllowedRoles($user): array
    {
        if ($user->isAdministrator()) {
            return array_column(UserRole::cases(), 'value');
        }

        // Department Officers: only roles they have view_* privilege for
        $allowed = [];
        if ($user->can('view_students'))     $allowed[] = UserRole::STUDENT->value;
        if ($user->can('view_staff'))        $allowed[] = UserRole::STAFF->value;
        if ($user->can('view_stakeholders')) $allowed[] = UserRole::STAKEHOLDER->value;
        if ($user->can('view_security'))     $allowed[] = UserRole::SECURITY_PERSONNEL->value;

        return $allowed ?: [UserRole::STUDENT->value];
    }

    public function byRole(string $role): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_users');

        $authUser = auth()->user();

        // Convert slug to proper case
        $activeRole = ucwords(str_replace('-', ' ', $role));

        // Check if this user is allowed to view this role
        $allowedRoles = $this->getAllowedRoles($authUser);
        if (!in_array($activeRole, $allowedRoles)) {
            abort(403, 'You do not have permission to view this role.');
        }

        $page = request()->input('page', 1);

        // Load relationships based on role
        $with = ['roleType'];
        if ($activeRole === 'Student') {
            $with = ['roleType', 'program', 'college', 'vehicles.vehicleType', 'vehicles.stickerColor'];
        } elseif (in_array($activeRole, ['Staff', 'Stakeholder', 'Security Personnel'])) {
            $with = ['roleType', 'vehicles.vehicleType', 'vehicles.stickerColor'];
        }

        $users = User::with($with)
            ->where('role', $activeRole)
            ->orderBy('surname')
            ->paginate(10, ['*'], 'page', $page);

        $roles = $allowedRoles; // Only show tabs for allowed roles
        $departments = RoleType::whereIn('main_role', ['Department', 'Security', 'Reporter'])->orderBy('name')->get();
        $stakeholderTypes = RoleType::where('main_role', 'Stakeholder')->orderBy('name')->get();
        $colleges = College::with('programs')->orderBy('name')->get();
        $programs = Program::orderBy('name')->get();
        $nameExtensions = NameExtension::options();

        // Department Officers are view-only — no edit or delete
        $canManage = $authUser->isAdministrator();

        return Inertia::render('admin/users/index', [
            'users' => $users->items(),
            'roles' => $roles,
            'departments' => $departments,
            'stakeholderTypes' => $stakeholderTypes,
            'colleges' => $colleges,
            'programs' => $programs,
            'nameExtensions' => $nameExtensions,
            'activeRole' => $activeRole,
            'roleSlug' => $role,
            'canManage' => $canManage,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(int $id): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_users');
        $user = User::with(['roleType', 'vehicles.vehicleType', 'vehicles.stickerColor'])->findOrFail($id);


        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function update(int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_user');
        $user = User::findOrFail($id);


        $validated = request()->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role' => 'required|string',
            'role_type_id' => 'nullable|exists:role_types,id',
            'student_id' => 'nullable|string|max:255',
            'staff_id' => 'nullable|string|max:255',
            'stakeholder_type' => 'nullable|string|max:255',
            'college_id' => 'nullable|exists:colleges,id',
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:role_types,id',
            'license_number' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        // Keep role_type_id and department_id in sync for Department Officers
        if ($user->role === UserRole::DEPARTMENT_OFFICER && ! empty($validated['role_type_id'])) {
            $user->department_id = $validated['role_type_id'];
            $user->save();
        }

        Log::info('User profile updated by admin', [
            'user_id' => $user->id,
            'updated_by' => auth()->id(),
            'changes' => array_keys($validated)
        ]);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('delete_user');
        $user = User::findOrFail($id);

        $user->delete();

        Log::info('User deleted by admin', [
            'user_id' => $user->id,
            'email' => $user->email,
            'deleted_by' => auth()->id()
        ]);

        return back()->with('success', 'User deleted successfully.');
    }
}
