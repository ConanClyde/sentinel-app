import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Save } from 'lucide-react';

interface RoleTypeRow {
    id: number;
    name: string;
    main_role: string;
}

interface ViolationSettings {
    default_department_id: number | null;
    student_department_id: number | null;
}

export function ViolationRoutingSection({
    roleTypes,
    violationSettings,
}: {
    roleTypes: RoleTypeRow[];
    violationSettings: ViolationSettings;
}) {
    const departments = roleTypes.filter((rt) => rt.main_role === 'Department');

    const [defaultDepartmentId, setDefaultDepartmentId] = useState(
        violationSettings.default_department_id != null ? String(violationSettings.default_department_id) : '',
    );
    const [studentDepartmentId, setStudentDepartmentId] = useState(
        violationSettings.student_department_id != null ? String(violationSettings.student_department_id) : '',
    );
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put(
            route('admin.config.violation-routing.update'),
            {
                default_department_id: defaultDepartmentId === '' ? null : Number(defaultDepartmentId),
                student_department_id: studentDepartmentId === '' ? null : Number(studentDepartmentId),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Violation routing</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose which department receives new incident reports. Student-owned vehicles use the student department when
                        identified; all other cases use the default.
                    </p>
                </div>
                <Button type="submit" disabled={processing} className="gap-2 shrink-0">
                    <Save className="h-4 w-4" />
                    Save
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Departments
                    </CardTitle>
                    <CardDescription>Only departments configured under Configuration → Departments appear here.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="default_department_id">Default department</Label>
                        <Select
                            value={defaultDepartmentId === '' ? '__none__' : defaultDepartmentId}
                            onValueChange={(v) => setDefaultDepartmentId(v === '__none__' ? '' : v)}
                        >
                            <SelectTrigger id="default_department_id">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None (fallback: first department)</SelectItem>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student_department_id">Student vehicle department</Label>
                        <Select
                            value={studentDepartmentId === '' ? '__none__' : studentDepartmentId}
                            onValueChange={(v) => setStudentDepartmentId(v === '__none__' ? '' : v)}
                        >
                            <SelectTrigger id="student_department_id">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None (use default)</SelectItem>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
