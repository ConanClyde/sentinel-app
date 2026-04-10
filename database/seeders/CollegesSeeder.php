<?php

namespace Database\Seeders;

use App\Models\College;
use Illuminate\Database\Seeder;

class CollegesSeeder extends Seeder
{
    public function run(): void
    {
        $colleges = [
            [
                'code' => 'CGS',
                'name' => 'College of Graduate Studies',
                'description' => 'College of Graduate Studies - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'CLAW',
                'name' => 'College of Law',
                'description' => 'College of Law - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'COE',
                'name' => 'College of Engineering',
                'description' => 'College of Engineering - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'CIT',
                'name' => 'College of Information Technology',
                'description' => 'College of Information Technology - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'CAS',
                'name' => 'College of Arts and Sciences',
                'description' => 'College of Arts and Sciences - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'COM',
                'name' => 'College of Management',
                'description' => 'College of Management - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'ICJE',
                'name' => 'Institute of Criminal Justice Education',
                'description' => 'Institute of Criminal Justice Education - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'COT',
                'name' => 'College of Technology',
                'description' => 'College of Technology - Led by Dean',
                'type' => 'college',
            ],
            [
                'code' => 'CE',
                'name' => 'College of Education',
                'description' => 'College of Education - Led by Dean',
                'type' => 'college',
            ],
        ];

        foreach ($colleges as $collegeData) {
            College::updateOrCreate(
                ['code' => $collegeData['code']],
                $collegeData
            );
        }

        $this->command->info('Colleges seeded successfully.');
    }
}
