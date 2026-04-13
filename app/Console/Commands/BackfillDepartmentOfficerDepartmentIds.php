<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\RoleType;
use App\Models\User;
use Illuminate\Console\Command;

class BackfillDepartmentOfficerDepartmentIds extends Command
{
    protected $signature = 'users:backfill-department-officer-department-ids
                            {--dry-run : List changes without saving}';

    protected $description = 'Set users.department_id from role_type_id for Department Officers where department_id is null and role_type is a Department row';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $users = User::query()
            ->where('role', UserRole::DEPARTMENT_OFFICER->value)
            ->whereNull('department_id')
            ->whereNotNull('role_type_id')
            ->get();

        if ($users->isEmpty()) {
            $this->info('No department officers need backfill.');

            return self::SUCCESS;
        }

        $departmentIds = RoleType::query()
            ->where('main_role', 'Department')
            ->pluck('id')
            ->flip();

        $updated = 0;

        foreach ($users as $user) {
            if (! $departmentIds->has($user->role_type_id)) {
                $this->warn("Skip user {$user->id}: role_type_id {$user->role_type_id} is not a Department role_type.");

                continue;
            }

            $this->line("User {$user->id} ({$user->email}): department_id <- {$user->role_type_id}");

            if (! $dryRun) {
                $user->update(['department_id' => $user->role_type_id]);
            }
            $updated++;
        }

        $this->info($dryRun ? "Would update {$updated} user(s). Run without --dry-run to apply." : "Updated {$updated} user(s).");

        return self::SUCCESS;
    }
}
