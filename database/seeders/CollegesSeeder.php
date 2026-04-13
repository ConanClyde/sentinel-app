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
            ],
            [
                'code' => 'CLAW',
                'name' => 'College of Law',
                'description' => 'College of Law - Led by Dean',
            ],
            [
                'code' => 'COE',
                'name' => 'College of Engineering',
                'description' => 'College of Engineering - Led by Dean',
            ],
            [
                'code' => 'CIT',
                'name' => 'College of Information Technology',
                'description' => 'College of Information Technology - Led by Dean',
            ],
            [
                'code' => 'CAS',
                'name' => 'College of Arts and Sciences',
                'description' => 'College of Arts and Sciences - Led by Dean',
            ],
            [
                'code' => 'COM',
                'name' => 'College of Management',
                'description' => 'College of Management - Led by Dean',
            ],
            [
                'code' => 'ICJE',
                'name' => 'Institute of Criminal Justice Education',
                'description' => 'Institute of Criminal Justice Education - Led by Dean',
            ],
            [
                'code' => 'COT',
                'name' => 'College of Technology',
                'description' => 'College of Technology - Led by Dean',
            ],
            [
                'code' => 'CE',
                'name' => 'College of Education',
                'description' => 'College of Education - Led by Dean',
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
