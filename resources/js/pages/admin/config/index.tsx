import { BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Building2, GraduationCap, Car, Palette, Users, Building, Plus, Settings, ClipboardList, GitBranch, Map, MapPin, DollarSign } from 'lucide-react';
import { CollegeSection } from './CollegeSection';
import { ProgramSection } from './ProgramSection';
import { VehicleTypeSection } from './VehicleTypeSection';
import { StickerColorSection } from './StickerColorSection';
import { StakeholderTypeSection } from './StakeholderTypeSection';
import { DepartmentSection } from './DepartmentSection';
import { StickerRuleSection } from './StickerRuleSection';
import { StickerFeeSection } from './StickerFeeSection';
import { ViolationTypeSection } from './ViolationTypeSection';
import { ViolationRoutingSection } from './ViolationRoutingSection';
import { CampusMapSection } from './CampusMapSection';
import { LocationTypeSection } from './LocationTypeSection';
import { ConfigHeader } from './components/ConfigHeader';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuration', href: '#' },
];

interface College {
    id: number;
    code: string;
    name: string;
    description: string | null;
    type: string;
}

interface Program {
    id: number;
    college_id: number;
    code: string;
    name: string;
    description: string | null;
    college?: College;
}

interface VehicleType {
    id: number;
    name: string;
    description: string | null;
    has_plate_number: boolean;
}

interface StickerColor {
    id: number;
    name: string;
    hex_code: string;
}

interface RoleType {
    id: number;
    main_role: string;
    name: string;
    description: string | null;
}

interface ViolationTypeRow {
    id: number;
    name: string;
    description: string | null;
}

interface ViolationSettings {
    default_department_id: number | null;
    student_department_id: number | null;
}

interface MapLocationTypeRow {
    id: number;
    name: string;
    default_color: string;
    icon: string;
}

interface MapLocationRow {
    id: number;
    name: string;
    short_code: string;
    type_id: number;
    vertices: { x: number; y: number }[];
    center_x: number;
    center_y: number;
    color: string | null;
    is_active: boolean;
    type?: MapLocationTypeRow;
}

interface PageProps {
    colleges: College[];
    collegesPagination?: { current_page: number; last_page: number; total: number };
    programs: Program[];
    programsPagination?: { current_page: number; last_page: number; total: number };
    vehicleTypes: VehicleType[];
    vehicleTypesPagination?: { current_page: number; last_page: number; total: number };
    stickerColors: StickerColor[];
    stickerColorsPagination?: { current_page: number; last_page: number; total: number };
    roleTypes: RoleType[];
    departmentsPagination?: { current_page: number; last_page: number; total: number };
    stakeholderTypesPagination?: { current_page: number; last_page: number; total: number };
    stickerRules?: any;
    violationTypes?: ViolationTypeRow[];
    violationTypesPagination?: { current_page: number; last_page: number; total: number };
    violationSettings?: ViolationSettings;
    locations?: MapLocationRow[];
    locationTypes?: MapLocationTypeRow[];
    locationTypesPagination?: { current_page: number; last_page: number; total: number };
    activeTab?: string;
    privileges?: Record<string, any[]>;
}

export default function Configuration() {
    const props = usePage().props as unknown as PageProps;
    const {
        colleges,
        collegesPagination,
        programs,
        programsPagination,
        vehicleTypes,
        vehicleTypesPagination,
        stickerColors,
        stickerColorsPagination,
        roleTypes,
        departmentsPagination,
        stakeholderTypesPagination,
        stickerRules,
        violationTypes = [],
        violationTypesPagination,
        violationSettings = { default_department_id: null, student_department_id: null },
        locations = [],
        locationTypes = [],
        locationTypesPagination,
        activeTab = 'colleges',
    } = props;

    const tabs = [
        {
            id: 'colleges',
            label: 'Colleges',
            icon: Building2,
            href: route('admin.config.colleges'),
            addLabel: 'Add College',
            headerTitle: 'Colleges',
            headerDescription: 'Manage institutional colleges and academic units.'
        },
        {
            id: 'programs',
            label: 'Programs',
            icon: GraduationCap,
            href: route('admin.config.programs'),
            addLabel: 'Add Program',
            headerTitle: 'Academic Programs',
            headerDescription: 'Manage degree programs and courses offered.'
        },
        {
            id: 'departments',
            label: 'Departments',
            icon: Building,
            href: route('admin.config.departments'),
            addLabel: 'Add Department',
            headerTitle: 'Departments',
            headerDescription: 'Configure administrative and academic departments.'
        },
        {
            id: 'violation-types',
            label: 'Violation types',
            icon: ClipboardList,
            href: route('admin.config.violation-types'),
            addLabel: 'Add violation type',
            headerTitle: 'Violation types',
            headerDescription: 'Categories available when filing incident reports.',
        },
        {
            id: 'violation-routing',
            label: 'Violation routing',
            icon: GitBranch,
            href: route('admin.config.violation-routing'),
            addLabel: '',
            headerTitle: 'Violation routing',
            headerDescription: 'Assign which department receives new reports by default and for student vehicles.',
        },
        {
            id: 'campus-map',
            label: 'Campus map',
            icon: Map,
            href: route('admin.config.campus-map'),
            addLabel: 'Add Location',
            headerTitle: 'Campus map',
            headerDescription: 'Draw zones on the campus map and manage location metadata (same tools as before, now under Configuration).',
        },
        {
            id: 'location-types',
            label: 'Location Types',
            icon: MapPin,
            href: route('admin.config.location-types'),
            addLabel: 'Add Location Type',
            headerTitle: 'Location Types',
            headerDescription: 'Define categories for map locations (buildings, gates, parking, etc.).'
        },
        {
            id: 'vehicle-types',
            label: 'Vehicle Types',
            icon: Car,
            href: route('admin.config.vehicle-types'),
            addLabel: 'Add Vehicle Type',
            headerTitle: 'Vehicle Types',
            headerDescription: 'Define categories for vehicles allowed on campus.'
        },
        {
            id: 'sticker-colors',
            label: 'Sticker Colors',
            icon: Palette,
            href: route('admin.config.sticker-colors'),
            addLabel: 'Add Sticker Color',
            headerTitle: 'Sticker Colors',
            headerDescription: 'Manage color-coded stickers for different vehicle categories.'
        },
        {
            id: 'stakeholder-types',
            label: 'Stakeholder Types',
            icon: Users,
            href: route('admin.config.stakeholder-types'),
            addLabel: 'Add Stakeholder Type',
            headerTitle: 'Stakeholder Types',
            headerDescription: 'Define specific roles for students, staff, and partners.'
        },
        {
            id: 'sticker-rules',
            label: 'Sticker Rules',
            icon: Settings,
            href: route('admin.config.sticker-rules'),
            addLabel: '',
            headerTitle: 'Sticker Generation Rules',
            headerDescription: 'Configure expiration periods and color mapping logic.'
        },
        {
            id: 'sticker-fees',
            label: 'Sticker Fees',
            icon: DollarSign,
            href: route('admin.config.sticker-fees'),
            addLabel: 'Add Fee',
            headerTitle: 'Sticker Fees',
            headerDescription: 'Configure fees for sticker replacement and renewal requests.'
        },
    ];

    const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

    const tabComponents: Record<string, React.ReactNode> = {
        colleges: <CollegeSection colleges={colleges} pagination={collegesPagination} />,
        departments: <DepartmentSection roleTypes={roleTypes} privileges={props.privileges} pagination={departmentsPagination} />,
        programs: <ProgramSection programs={programs} colleges={colleges} pagination={programsPagination} />,
        'violation-types': <ViolationTypeSection violationTypes={violationTypes} pagination={violationTypesPagination} />,
        'violation-routing': (
            <ViolationRoutingSection roleTypes={roleTypes} violationSettings={violationSettings} />
        ),
        'campus-map': <CampusMapSection locations={locations} locationTypes={locationTypes} />,
        'location-types': <LocationTypeSection locationTypes={locationTypes || []} pagination={locationTypesPagination} />,
        'vehicle-types': <VehicleTypeSection vehicleTypes={vehicleTypes} pagination={vehicleTypesPagination} />,
        'sticker-colors': <StickerColorSection stickerColors={stickerColors} pagination={stickerColorsPagination} />,
        'stakeholder-types': <StakeholderTypeSection roleTypes={roleTypes} pagination={stakeholderTypesPagination} />,
        'sticker-rules': (
            <StickerRuleSection stickerRules={stickerRules} stickerColors={stickerColors} roleTypes={roleTypes} />
        ),
        'sticker-fees': <StickerFeeSection fees={(props as any).stickerFees || []} pagination={(props as any).stickerFeesPagination} />,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuration" />

            <div className="space-y-4">
            <ConfigHeader
                title={(currentTab as any).headerTitle}
                description={(currentTab as any).headerDescription}
                activeTab={activeTab}
                tabs={tabs}
                currentTab={currentTab as any}
            />

            {/* Desktop Sidebar */}
            <div className="flex gap-6">
                <div className="hidden md:block w-48 shrink-0 space-y-4">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1">
                    {tabComponents[activeTab] || tabComponents[colleges ? 'colleges' : Object.keys(tabComponents)[0]]}
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
