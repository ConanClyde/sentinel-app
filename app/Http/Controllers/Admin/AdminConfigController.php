<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\College;
use App\Models\MapLocation;
use App\Models\MapLocationType;
use App\Models\Program;
use App\Models\RoleType;
use App\Models\StickerColor;
use App\Models\StickerFee;
use App\Models\StickerRule;
use App\Models\VehicleType;
use App\Models\ViolationSetting;
use App\Models\ViolationType;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminConfigController extends Controller
{
    public function index()
    {
        \Illuminate\Support\Facades\Gate::authorize('view_config');

        return to_route('admin.config.colleges');
    }

    public function colleges(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_colleges');

        $colleges = College::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => $colleges->items(),
            'collegesPagination' => [
                'current_page' => $colleges->currentPage(),
                'last_page' => $colleges->lastPage(),
                'total' => $colleges->total(),
            ],
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'activeTab' => 'colleges',
        ]);
    }

    public function programs(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_programs');

        $page = $request->input('page', 1);
        $programs = Program::with('college')->orderBy('name')->paginate(10, ['*'], 'page', $page);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => $programs->items(),
            'programsPagination' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'total' => $programs->total(),
            ],
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'activeTab' => 'programs',
        ]);
    }

    public function vehicleTypes(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_vehicle_types');

        $vehicleTypes = VehicleType::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => $vehicleTypes->items(),
            'vehicleTypesPagination' => [
                'current_page' => $vehicleTypes->currentPage(),
                'last_page' => $vehicleTypes->lastPage(),
                'total' => $vehicleTypes->total(),
            ],
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'activeTab' => 'vehicle-types',
        ]);
    }

    public function stickerColors(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_sticker_colors');

        $stickerColors = StickerColor::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => $stickerColors->items(),
            'stickerColorsPagination' => [
                'current_page' => $stickerColors->currentPage(),
                'last_page' => $stickerColors->lastPage(),
                'total' => $stickerColors->total(),
            ],
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'activeTab' => 'sticker-colors',
        ]);
    }

    public function locationTypes(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_location_types');

        $locationTypes = MapLocationType::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'locationTypes' => $locationTypes->items(),
            'locationTypesPagination' => [
                'current_page' => $locationTypes->currentPage(),
                'last_page' => $locationTypes->lastPage(),
                'total' => $locationTypes->total(),
            ],
            'activeTab' => 'location-types',
        ]);
    }

    public function stakeholderTypes(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_config');
        $roleTypes = RoleType::with('privileges')->orderBy('name')->get();

        $stakeholderTypes = RoleType::where('main_role', 'Stakeholder')->orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => $roleTypes,
            'stakeholderTypesPagination' => [
                'current_page' => $stakeholderTypes->currentPage(),
                'last_page' => $stakeholderTypes->lastPage(),
                'total' => $stakeholderTypes->total(),
            ],
            'activeTab' => 'stakeholder-types',
        ]);
    }

    public function stickerRules()
    {
        \Illuminate\Support\Facades\Gate::authorize('view_sticker_rules');

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'stickerRules' => StickerRule::getSingleton(),
            'activeTab' => 'sticker-rules',
        ]);
    }

    public function updateStickerRules(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_sticker_rules');
        $rules = StickerRule::getSingleton();


        $validated = $request->validate([
            'student_expiration_years' => 'required|integer|min:1|max:10',
            'staff_expiration_years' => 'required|integer|min:1|max:10',
            'security_expiration_years' => 'required|integer|min:1|max:10',
            'stakeholder_expiration_years' => 'required|integer|min:1|max:10',
            'staff_color' => 'required|string|exists:sticker_colors,name',
            'security_color' => 'required|string|exists:sticker_colors,name',
            'student_map' => 'required|array',
            'stakeholder_map' => 'required|array',
            'palette' => 'nullable|array',
        ]);

        // Sync palette from current sticker colors table for consistency
        $colors = StickerColor::all();
        $palette = [];
        foreach ($colors as $color) {
            $palette[$color->name] = $color->hex_code;
        }
        $validated['palette'] = $palette;

        $rules->update($validated);

        \Illuminate\Support\Facades\Log::info('Sticker rules configuration updated', [
            'updated_by' => auth()->id(),
            'changes' => array_keys($validated)
        ]);

        return back()->with('success', 'Sticker rules updated successfully.');
    }

    public function stickerFees(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_config');

        $fees = StickerFee::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'stickerFees' => $fees->items(),
            'stickerFeesPagination' => [
                'current_page' => $fees->currentPage(),
                'last_page' => $fees->lastPage(),
                'total' => $fees->total(),
            ],
            'activeTab' => 'sticker-fees',
        ]);
    }

    public function storeStickerFee(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_config');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:new_registration,replacement,renewal',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $fee = StickerFee::create($validated);

        \Illuminate\Support\Facades\Log::info('Sticker fee created', [
            'fee_id' => $fee->id,
            'name' => $fee->name,
            'amount' => $fee->amount,
            'created_by' => auth()->id()
        ]);

        return back()->with('success', 'Sticker fee created successfully.');
    }

    public function updateStickerFee(Request $request, StickerFee $stickerFee)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_config');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:new_registration,replacement,renewal',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $stickerFee->update($validated);

        return back()->with('success', 'Sticker fee updated successfully.');
    }

    public function destroyStickerFee(StickerFee $stickerFee)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_config');

        $stickerFee->delete();

        return back()->with('success', 'Sticker fee deleted successfully.');
    }

    public function departments(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_departments');

        $departments = RoleType::where('main_role', 'Department')->orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'departmentsPagination' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'total' => $departments->total(),
            ],
            'privileges' => RolePermissionService::getAllPrivilegesByCategory(),
            'activeTab' => 'departments',
        ]);
    }

    public function violationTypes(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('view_violation_types');

        $violationTypes = ViolationType::orderBy('name')->paginate(10);

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'violationTypes' => $violationTypes->items(),
            'violationTypesPagination' => [
                'current_page' => $violationTypes->currentPage(),
                'last_page' => $violationTypes->lastPage(),
                'total' => $violationTypes->total(),
            ],
            'activeTab' => 'violation-types',
        ]);
    }

    public function violationRouting()
    {
        \Illuminate\Support\Facades\Gate::authorize('view_violation_routing');

        $settings = ViolationSetting::getSingleton();

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'violationSettings' => [
                'default_department_id' => $settings->default_department_id,
                'student_department_id' => $settings->student_department_id,
            ],
            'activeTab' => 'violation-routing',
        ]);
    }

    public function updateViolationRouting(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_violation_routing');
        $request->merge([

            'default_department_id' => $request->filled('default_department_id') ? $request->integer('default_department_id') : null,
            'student_department_id' => $request->filled('student_department_id') ? $request->integer('student_department_id') : null,
        ]);

        $validated = $request->validate([
            'default_department_id' => 'nullable|exists:role_types,id',
            'student_department_id' => 'nullable|exists:role_types,id',
        ]);

        foreach (['default_department_id', 'student_department_id'] as $key) {
            $id = $validated[$key] ?? null;
            if ($id !== null) {
                $role = RoleType::find($id);
                if (! $role || $role->main_role !== 'Department') {
                    return back()->withErrors([$key => 'Select a valid department.'])->withInput();
                }
            }
        }

        $settings = ViolationSetting::getSingleton();
        $settings->update([
            'default_department_id' => $validated['default_department_id'] ?? null,
            'student_department_id' => $validated['student_department_id'] ?? null,
        ]);

        \Illuminate\Support\Facades\Log::info('Violation routing configuration updated', [
            'updated_by' => auth()->id(),
            'default_dept' => $validated['default_department_id'] ?? null,
            'student_dept' => $validated['student_department_id'] ?? null,
        ]);

        return back()->with('success', 'Violation routing updated successfully.');
    }

    public function campusMap()
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_map');

        return Inertia::render('admin/config/index', [
            'colleges' => College::orderBy('name')->get(),
            'programs' => Program::with('college')->orderBy('name')->get(),
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'stickerColors' => StickerColor::orderBy('name')->get(),
            'roleTypes' => RoleType::with('privileges')->orderBy('name')->get(),
            'locations' => MapLocation::with('type')->get(),
            'locationTypes' => MapLocationType::all(),
            'activeTab' => 'campus-map',
        ]);
    }

    // ============ COLLEGES ============
    public function storeCollege(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_colleges');

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:colleges,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:50',
        ]);

        $college = College::create($validated);

        \Illuminate\Support\Facades\Log::info('College created', [
            'college_id' => $college->id,
            'code' => $college->code,
            'created_by' => auth()->id()
        ]);

        return back()->with('success', 'College created successfully.');
    }

    public function updateCollege(Request $request, College $college)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_colleges');

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:colleges,code,'.$college->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:50',
        ]);

        $college->update($validated);

        return back()->with('success', 'College updated successfully.');
    }

    public function destroyCollege(College $college)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_colleges');

        if ($college->programs()->count() > 0) {
            return back()->with('error', 'Cannot delete college with existing programs.');
        }

        $college->delete();

        return back()->with('success', 'College deleted successfully.');
    }

    // ============ PROGRAMS ============
    public function storeProgram(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_programs');

        $validated = $request->validate([
            'college_id' => 'required|exists:colleges,id',
            'code' => 'required|string|max:20|unique:programs,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Program::create($validated);

        return back()->with('success', 'Program created successfully.');
    }

    public function updateProgram(Request $request, Program $program)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_programs');

        $validated = $request->validate([
            'college_id' => 'required|exists:colleges,id',
            'code' => 'required|string|max:20|unique:programs,code,'.$program->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $program->update($validated);

        return back()->with('success', 'Program updated successfully.');
    }

    public function destroyProgram(Program $program)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_programs');

        if ($program->students()->count() > 0) {
            return back()->with('error', 'Cannot delete program with existing students.');
        }

        $program->delete();

        return back()->with('success', 'Program deleted successfully.');
    }

    // ============ VEHICLE TYPES ============
    public function storeVehicleType(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_vehicle_types');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_types,name',
            'description' => 'nullable|string',
            'has_plate_number' => 'boolean',
        ]);

        VehicleType::create($validated);

        return back()->with('success', 'Vehicle type created successfully.');
    }

    public function updateVehicleType(Request $request, VehicleType $vehicleType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_vehicle_types');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_types,name,'.$vehicleType->id,
            'description' => 'nullable|string',
            'has_plate_number' => 'boolean',
        ]);

        $vehicleType->update($validated);

        return back()->with('success', 'Vehicle type updated successfully.');
    }

    public function destroyVehicleType(VehicleType $vehicleType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_vehicle_types');

        if ($vehicleType->vehicles()->count() > 0) {
            return back()->with('error', 'Cannot delete vehicle type with existing vehicles.');
        }

        $vehicleType->delete();

        return back()->with('success', 'Vehicle type deleted successfully.');
    }

    // ============ STICKER COLORS ============
    public function storeStickerColor(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_sticker_colors');
        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:sticker_colors,name',
            'hex_code' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        StickerColor::create($validated);

        return back()->with('success', 'Sticker color created successfully.');
    }

    public function updateStickerColor(Request $request, StickerColor $stickerColor)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_sticker_colors');
        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:sticker_colors,name,'.$stickerColor->id,
            'hex_code' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $stickerColor->update($validated);

        return back()->with('success', 'Sticker color updated successfully.');
    }

    public function destroyStickerColor(StickerColor $stickerColor)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_sticker_colors');
        if ($stickerColor->vehicles()->count() > 0) {

            return back()->with('error', 'Cannot delete sticker color with existing vehicles.');
        }

        $stickerColor->delete();

        return back()->with('success', 'Sticker color deleted successfully.');
    }

    // ============ LOCATION TYPES ============
    public function storeLocationType(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_location_types');
        $validated = $request->validate([

            'name' => 'required|string|max:100|unique:map_location_types,name',
            'default_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
        ]);

        MapLocationType::create($validated);

        return back()->with('success', 'Location type created successfully.');
    }

    public function updateLocationType(Request $request, MapLocationType $locationType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_location_types');
        $validated = $request->validate([

            'name' => 'required|string|max:100|unique:map_location_types,name,' . $locationType->id,
            'default_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
        ]);

        $locationType->update($validated);

        return back()->with('success', 'Location type updated successfully.');
    }

    public function destroyLocationType(MapLocationType $locationType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_location_types');
        if ($locationType->locations()->count() > 0) {

            return back()->with('error', 'Cannot delete location type with existing locations.');
        }

        $locationType->delete();

        return back()->with('success', 'Location type deleted successfully.');
    }

    // ============ ROLE TYPES (STAKEHOLDER TYPES) ============
    public function storeRoleType(Request $request)
    {
        if ($request->input('main_role') === 'Department') {
            \Illuminate\Support\Facades\Gate::authorize('manage_departments');
        } else {
            \Illuminate\Support\Facades\Gate::authorize('edit_stakeholder_types');
        }

        $validated = $request->validate([

            'main_role' => 'required|string|max:50',
            'name' => 'required|string|max:255|unique:role_types,name',
            'description' => 'nullable|string',
            'privilege_ids' => 'nullable|array',
            'privilege_ids.*' => 'exists:privileges,id',
        ]);

        $roleType = RoleType::create($request->only(['main_role', 'name', 'description']));

        if ($request->has('privilege_ids')) {
            $roleType->privileges()->sync($request->privilege_ids);
        }

        return back()->with('success', 'Stakeholder type created successfully.');
    }

    public function updateRoleType(Request $request, RoleType $roleType)
    {
        if ($roleType->main_role === 'Department' || $request->input('main_role') === 'Department') {
            \Illuminate\Support\Facades\Gate::authorize('manage_departments');
        } else {
            \Illuminate\Support\Facades\Gate::authorize('edit_stakeholder_types');
        }

        $validated = $request->validate([

            'main_role' => 'required|string|max:50',
            'name' => 'required|string|max:255|unique:role_types,name,'.$roleType->id,
            'description' => 'nullable|string',
            'privilege_ids' => 'nullable|array',
            'privilege_ids.*' => 'exists:privileges,id',
        ]);

        $roleType->update($request->only(['main_role', 'name', 'description']));

        if ($request->has('privilege_ids')) {
            $roleType->privileges()->sync($request->privilege_ids);
        }

        return back()->with('success', 'Stakeholder type updated successfully.');
    }

    public function destroyRoleType(RoleType $roleType)
    {
        if ($roleType->main_role === 'Department') {
            \Illuminate\Support\Facades\Gate::authorize('manage_departments');
        } else {
            \Illuminate\Support\Facades\Gate::authorize('edit_stakeholder_types');
        }

        if ($roleType->users()->count() > 0) {

            return back()->with('error', 'Cannot delete stakeholder type with existing users.');
        }

        $roleType->delete();

        return back()->with('success', 'Stakeholder type deleted successfully.');
    }

    // ============ VIOLATION TYPES ============
    public function storeViolationType(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_violation_types');
        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:violation_types,name',
            'description' => 'nullable|string',
        ]);

        ViolationType::create($validated);

        return back()->with('success', 'Violation type created successfully.');
    }

    public function updateViolationType(Request $request, ViolationType $violationType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_violation_types');
        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:violation_types,name,'.$violationType->id,
            'description' => 'nullable|string',
        ]);

        $violationType->update($validated);

        return back()->with('success', 'Violation type updated successfully.');
    }

    public function destroyViolationType(ViolationType $violationType)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_violation_types');
        if ($violationType->reports()->count() > 0) {

            return back()->with('error', 'Cannot delete a violation type that has existing reports.');
        }

        $violationType->delete();

        return back()->with('success', 'Violation type deleted successfully.');
    }
}
