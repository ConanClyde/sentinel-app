<?php

namespace Database\Seeders;

use App\Models\College;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramsSeeder extends Seeder
{
    public function run(): void
    {
        $collegeCodes = ['CGS', 'CLAW', 'COE', 'CIT', 'CAS', 'COM', 'ICJE', 'COT', 'CE'];
        $colleges = College::whereIn('code', $collegeCodes)->get()->keyBy('code');

        $programs = [];

        if ($college = $colleges->get('CGS')) {
            $programs = array_merge($programs, [
                ['name' => 'Doctor of Philosophy in Technology Education Management', 'code' => 'CGS-PHD-TEM', 'description' => 'PhD in Technology Education Management', 'college_id' => $college->id],
                ['name' => 'Doctor of Philosophy in Development Administration', 'code' => 'CGS-PHD-DA', 'description' => 'PhD in Development Administration', 'college_id' => $college->id],
                ['name' => 'Doctor of Philosophy in Science Education', 'code' => 'CGS-PHD-SE', 'description' => 'PhD in Science Education', 'college_id' => $college->id],
                ['name' => 'Doctor of Philosophy in Mathematics Education', 'code' => 'CGS-PHD-ME', 'description' => 'PhD in Mathematics Education', 'college_id' => $college->id],
                ['name' => 'Master of Arts in Technology Education', 'code' => 'CGS-MA-TE', 'description' => 'MA in Technology Education', 'college_id' => $college->id],
                ['name' => 'Master of Arts in Development Administration', 'code' => 'CGS-MA-DA', 'description' => 'MA in Development Administration', 'college_id' => $college->id],
                ['name' => 'Master of Arts in Science Education', 'code' => 'CGS-MA-SE', 'description' => 'MA in Science Education', 'college_id' => $college->id],
                ['name' => 'Master of Arts in Mathematics Education', 'code' => 'CGS-MA-ME', 'description' => 'MA in Mathematics Education', 'college_id' => $college->id],
                ['name' => 'Master in Management Engineering', 'code' => 'CGS-ME', 'description' => 'Master in Management Engineering', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('CLAW')) {
            $programs[] = ['name' => 'Juris Doctor (JD)', 'code' => 'CLAW-JD', 'description' => 'Juris Doctor Program', 'college_id' => $college->id];
        }

        if ($college = $colleges->get('COE')) {
            $programs = array_merge($programs, [
                ['name' => 'Bachelor of Science in Electrical Engineering (BSEE)', 'code' => 'COE-BSEE', 'description' => 'Electrical Engineering Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Mechanical Engineering (BSME)', 'code' => 'COE-BSME', 'description' => 'Mechanical Engineering Program', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('CIT')) {
            $programs = array_merge($programs, [
                ['name' => 'Master in Information Technology (MIT)', 'code' => 'CIT-MIT', 'description' => 'Master in Information Technology', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Information Technology (BSInfo-Tech)', 'code' => 'CIT-BSInfoTech', 'description' => 'Bachelor of Science in Information Technology', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('CAS')) {
            $programs = array_merge($programs, [
                ['name' => 'Bachelor of Science in Psychology (BSP)', 'code' => 'CAS-BSP', 'description' => 'Psychology Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Arts in Political Science (BAPoS)', 'code' => 'CAS-BAPoS', 'description' => 'Political Science Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Arts in English Language (BAEL)', 'code' => 'CAS-BAEL', 'description' => 'English Language Program', 'college_id' => $college->id],
                ['name' => 'Batsilyer ng Sining sa Filipino (BSF)', 'code' => 'CAS-BSF', 'description' => 'Filipino Program', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('COM')) {
            $programs = array_merge($programs, [
                ['name' => 'Bachelor of Science in Hospitality Management (BSHM)', 'code' => 'COM-BSHM', 'description' => 'Hospitality Management Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Business Administration (BSBA)', 'code' => 'COM-BSBA', 'description' => 'Business Administration Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Office Administration (BSOA)', 'code' => 'COM-BSOA', 'description' => 'Office Administration Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Public Administration (BPA)', 'code' => 'COM-BPA', 'description' => 'Public Administration Program', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('ICJE')) {
            $programs[] = ['name' => 'Bachelor of Science in Criminology (BSCrim)', 'code' => 'ICJE-BSCrim', 'description' => 'Criminology Program', 'college_id' => $college->id];
        }

        if ($college = $colleges->get('COT')) {
            $programs = array_merge($programs, [
                ['name' => 'Bachelor of Science in Industrial Technology (BSIT)', 'code' => 'COT-BSIT', 'description' => 'Industrial Technology Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Electro-mechanical Technology (BSEMT)', 'code' => 'COT-BSEMT', 'description' => 'Electro-mechanical Technology Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Food Technology (BSFT)', 'code' => 'COT-BSFT', 'description' => 'Food Technology Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Science in Textile and Fashion Technology (BSTFT)', 'code' => 'COT-BSTFT', 'description' => 'Textile and Fashion Technology Program', 'college_id' => $college->id],
            ]);
        }

        if ($college = $colleges->get('CE')) {
            $programs = array_merge($programs, [
                ['name' => 'Bachelor of Technical-Vocational Teacher Education (BTVTEd)', 'code' => 'CE-BTVTEd', 'description' => 'Technical-Vocational Teacher Education Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Technology and Livelihood Education (BTLed)', 'code' => 'CE-BTLEd', 'description' => 'Technology and Livelihood Education Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Secondary Education (BSEd)', 'code' => 'CE-BSEd', 'description' => 'Secondary Education Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Elementary Education (BEEd)', 'code' => 'CE-BEEd', 'description' => 'Elementary Education Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Early Childhood Education (BECEd)', 'code' => 'CE-BECEd', 'description' => 'Early Childhood Education Program', 'college_id' => $college->id],
                ['name' => 'Bachelor of Physical Education (BPEd)', 'code' => 'CE-BPEd', 'description' => 'Physical Education Program', 'college_id' => $college->id],
            ]);
        }

        foreach ($programs as $programData) {
            Program::updateOrCreate(
                ['code' => $programData['code']],
                $programData
            );
        }

        $this->command->info('Programs seeded successfully.');
    }
}
