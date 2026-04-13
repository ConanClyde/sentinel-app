import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Save, ChevronLeft, ChevronRight, Plus, Trash2, Check, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import { CameraCaptureDialog } from '@/components/camera-capture-dialog';
import { CameraPhotoButton } from '@/components/camera-photo-button';

interface VehicleType {
    id: number;
    name: string;
    has_plate_number: boolean | number;
}

interface StaffRegistrationProps {
    role?: string;
    vehicleTypes?: VehicleType[];
}

interface Vehicle {
    vehicle_type_id: string;
    plate_number: string;
}

export function StaffRegistration({ role: roleProp, vehicleTypes }: StaffRegistrationProps) {
    const role = roleProp || 'staff';
    const { data, setData, post, processing } = useForm({
        role: role,
        first_name: '',
        middle_name: '',
        surname: '',
        name_extension: '',
        email: '',
        password: '',
        password_confirmation: '',
        staff_id: '',
        staff_id_image: null as File | null,
        license_image: null as File | null,
        vehicles: [{ vehicle_type_id: '', plate_number: '' }] as Vehicle[],
    });

    const [completedIndices, setCompletedIndices] = useState<number[]>([]);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraField, setCameraField] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [registered, setRegistered] = useState(false);
    const totalSteps = 4;

    const nextStep = () => {
        if (currentStep === 1) {
            if (!data.first_name.trim() || !data.surname.trim()) {
                toast.error('Please fill in first name and surname');
                return;
            }
        }
        if (currentStep === 2) {
            if (!data.staff_id.trim()) {
                toast.error('Please fill in staff ID');
                return;
            }
            if (!data.staff_id_image) {
                toast.error('Please take a photo of your staff ID');
                return;
            }
        }
        if (currentStep === 3 && !allDone) {
            toast.error('Please mark all vehicles as done');
            return;
        }
        if (currentStep === 4) {
            if (!data.email.trim() || !data.email.includes('@')) {
                toast.error('Please enter a valid email');
                return;
            }
            if (data.password.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
            }
            if (!/[A-Z]/.test(data.password)) {
                toast.error('Password must have at least 1 uppercase letter');
                return;
            }
            if (!/[0-9]/.test(data.password)) {
                toast.error('Password must have at least 1 number');
                return;
            }
            if (data.password !== data.password_confirmation) {
                toast.error('Passwords do not match');
                return;
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const allDone = completedIndices.length === data.vehicles.length;

    const passwordStrength = () => {
        const password = data.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (strength === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (strength === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const { strength, label, color } = passwordStrength();

    const openCamera = (field: string) => {
        setCameraField(field);
        setCameraOpen(true);
    };

    const handleCameraCapture = (file: File) => {
        if (cameraField === 'license_image') {
            setData('license_image', file);
        } else if (cameraField === 'staff_id_image') {
            setData('staff_id_image', file);
        }
        setCameraOpen(false);
        setCameraField(null);
    };

    const clearFile = (field: string) => {
        if (field === 'license_image') {
            setData('license_image', null);
        } else if (field === 'staff_id_image') {
            setData('staff_id_image', null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.email.trim() || !data.email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }
        if (data.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(data.password)) {
            toast.error('Password must have at least 1 uppercase letter');
            return;
        }
        if (!/[0-9]/.test(data.password)) {
            toast.error('Password must have at least 1 number');
            return;
        }
        if (data.password !== data.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }

        post(route('admin.registration.store'), {
            onSuccess: () => {
                setRegistered(true);
            },
        });
    };

    const handleRegisterAgain = () => {
        setRegistered(false);
        setCurrentStep(1);
        setData({
            role: role,
            first_name: '',
            middle_name: '',
            surname: '',
            name_extension: '',
            email: '',
            password: '',
            password_confirmation: '',
            staff_id: '',
            staff_id_image: null,
            license_image: null,
            vehicles: [{ vehicle_type_id: '', plate_number: '' }],
        });
        setCompletedIndices([]);
    };

    const handleSubmitWrapper = (e: React.FormEvent) => {
        if (registered) {
            handleRegisterAgain();
            return;
        }
        handleSubmit(e);
    };

    const stepLabels = ['Personal', 'Details', 'Vehicle Registration', 'Account'];

    const renderStepIndicator = () => (
        <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );

    const renderStep1 = () => (
        <>
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        value={data.first_name}
                        onChange={(e) => setData('first_name', e.target.value)}
                        placeholder="Juan"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                        id="surname"
                        value={data.surname}
                        onChange={(e) => setData('surname', e.target.value)}
                        placeholder="Dela Cruz"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                        id="middle_name"
                        value={data.middle_name}
                        onChange={(e) => setData('middle_name', e.target.value)}
                        placeholder="Santos"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name_extension">Name Extension <span className="text-muted-foreground">(optional)</span></Label>
                    <Select value={data.name_extension || undefined} onValueChange={(value) => setData('name_extension', value === 'none' ? '' : value)}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]">
                            <SelectItem value="none" className="pl-3">None</SelectItem>
                            <SelectItem value="Jr." className="pl-3">Jr.</SelectItem>
                            <SelectItem value="Sr." className="pl-3">Sr.</SelectItem>
                            <SelectItem value="I" className="pl-3">I</SelectItem>
                            <SelectItem value="II" className="pl-3">II</SelectItem>
                            <SelectItem value="III" className="pl-3">III</SelectItem>
                            <SelectItem value="IV" className="pl-3">IV</SelectItem>
                            <SelectItem value="V" className="pl-3">V</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h3 className="font-semibold text-lg">Staff Details</h3>
            <div className="space-y-2">
                <Label htmlFor="staff_id">Staff ID</Label>
                <Input
                    id="staff_id"
                    value={data.staff_id}
                    onChange={(e) => setData('staff_id', e.target.value)}
                    placeholder="e.g., FAC-001"
                    required
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Staff ID Photo</Label>
                <CameraPhotoButton
                    placeholder="Take photo of your Staff ID"
                    hasPhoto={!!data.staff_id_image}
                    capturedFile={data.staff_id_image}
                    onCapture={() => openCamera('staff_id_image')}
                    onUpload={(file) => setData('staff_id_image', file)}
                    onRemove={() => clearFile('staff_id_image')}
                    disabled={processing}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Driver's License Photo (Optional)</Label>
                <CameraPhotoButton
                    placeholder="Take photo of driver's license"
                    hasPhoto={!!data.license_image}
                    capturedFile={data.license_image}
                    onCapture={() => openCamera('license_image')}
                    onUpload={(file) => setData('license_image', file)}
                    onRemove={() => clearFile('license_image')}
                    disabled={processing}
                />
            </div>
            <CameraCaptureDialog
                isOpen={cameraOpen}
                onClose={() => {
                    setCameraOpen(false);
                    setCameraField(null);
                }}
                onCapture={handleCameraCapture}
                title={cameraField === 'staff_id_image' ? "Scan Staff ID" : "Scan Driver's License"}
            />
        </>
    );

    const renderStep3 = () => {
        const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
            const updated = [...data.vehicles];
            updated[index] = { ...updated[index], [field]: value };
            setData('vehicles', updated);
        };

        const addVehicle = () => {
            if (data.vehicles.length < 3) {
                setData('vehicles', [...data.vehicles, { vehicle_type_id: '', plate_number: '' }]);
            }
        };

        const removeVehicle = (index: number) => {
            if (data.vehicles.length > 1) {
                setData('vehicles', data.vehicles.filter((_, i) => i !== index));
            }
        };

        const isVehicleValid = (index: number) => {
            const v = data.vehicles[index];
            if (!v || !v.vehicle_type_id) return false;
            const type = vehicleTypes?.find(t => t.id.toString() === v.vehicle_type_id);
            const needsPlate = type ? (type.has_plate_number === true || type.has_plate_number === 1) : true;
            if (needsPlate && (!v.plate_number || v.plate_number.trim().length < 3)) return false;
            return true;
        };

        const toggleDone = (index: number) => {
            if (completedIndices.includes(index)) {
                setCompletedIndices(completedIndices.filter((i) => i !== index));
            } else {
                if (isVehicleValid(index)) {
                    setCompletedIndices([...completedIndices, index]);
                } else {
                    toast.error('Please fill in all vehicle details first.');
                }
            }
        };

        const canAddMore = data.vehicles.length < 3 && allDone;

        return (
            <>
                <h3 className="font-semibold text-lg">Vehicle Registration</h3>
                <p className="text-sm text-muted-foreground mb-4">Register your vehicle(s) for campus access (max 3).</p>
                <div className="space-y-4">
                    {data.vehicles.map((vehicle, index) => {
                        const isDone = completedIndices.includes(index);
                        const vehicleTypeName = vehicleTypes?.find(t => t.id.toString() === vehicle.vehicle_type_id)?.name || '';
                        const type = vehicleTypes?.find(t => t.id.toString() === vehicle.vehicle_type_id);
                        const needsPlate = type ? (type.has_plate_number === true || type.has_plate_number === 1) : true;

                        return (
                            <div
                                key={index}
                                className={`relative rounded-lg border transition-all duration-200 ${
                                    isDone
                                        ? "border-green-500/30 bg-green-500/[0.02] p-3"
                                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4"
                                }`}
                            >
                                <div className={`flex items-center justify-between ${!isDone ? 'mb-4' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                            isDone ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                        }`}>
                                            {isDone ? <Check className="h-3.5 w-3.5" /> : <Car className="h-3.5 w-3.5" />}
                                        </div>
                                        <div>
                                            <span className={`text-xs font-bold uppercase tracking-wider block leading-none ${
                                                isDone ? "text-green-500/70" : "text-zinc-500 dark:text-zinc-400 font-mono"
                                            }`}>
                                                Vehicle 0{index + 1}
                                            </span>
                                            {isDone && vehicleTypeName && (
                                                <span className="text-sm font-semibold">
                                                    {vehicleTypeName} &bull; <span className="uppercase tracking-widest">{vehicle.plate_number}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isDone ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDone(index)}
                                                className="h-7 px-2 text-xs font-bold uppercase text-zinc-500 hover:text-primary transition-colors rounded-lg"
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            data.vehicles.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeVehicle(index)}
                                                    className="h-7 w-7 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {!isDone && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 ml-1">
                                                    Type
                                                </Label>
                                                <Select
                                                    value={vehicle.vehicle_type_id}
                                                    onValueChange={(value) => {
                                                    const selectedType = vehicleTypes?.find(t => t.id.toString() === value);
                                                    const needsPlate = selectedType ? (selectedType.has_plate_number === true || selectedType.has_plate_number === 1) : true;
                                                    const updated = [...data.vehicles];
                                                    updated[index] = {
                                                        ...updated[index],
                                                        vehicle_type_id: value,
                                                        plate_number: needsPlate ? updated[index].plate_number : ''
                                                    };
                                                    setData('vehicles', updated);
                                                }}
                                                >
                                                    <SelectTrigger className="h-10 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 text-sm rounded-lg shadow-none">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {vehicleTypes?.map((type) => (
                                                            <SelectItem key={type.id} value={type.id.toString()} className="text-sm pl-3">
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 ml-1">
                                                    Plate Number {!needsPlate && <span className="text-zinc-400">(N/A)</span>}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={vehicle.plate_number}
                                                    onChange={(e) => updateVehicle(index, 'plate_number', e.target.value.toUpperCase())}
                                                    placeholder={needsPlate ? "ABC 123" : "No plate"}
                                                    disabled={!needsPlate}
                                                    className="h-10 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 text-sm uppercase tracking-widest placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-mono rounded-lg shadow-none disabled:bg-zinc-100 disabled:text-zinc-400"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="success"
                                            onClick={() => toggleDone(index)}
                                            className="w-full h-10 border-none text-sm mt-1 rounded-lg shadow-none"
                                        >
                                            Mark as done
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {canAddMore && (
                    <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white rounded-lg shadow-none"
                            onClick={addVehicle}
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            Add another vehicle ({3 - data.vehicles.length} remaining)
                        </Button>
                    </div>
                )}
            </>
        );
    };

    const renderStep4 = () => (
        <>
            <h3 className="font-semibold text-lg">Account Credentials</h3>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="juan@example.com"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                    {data.password && (
                        <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                                <div
                                    className={`h-full rounded-full transition-all ${color}`}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with 1 uppercase letter and 1 number.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Confirm password"
                        required
                    />
                </div>
            </div>
        </>
    );

    if (registered) {
        return (
            <div className="space-y-6 text-center">
                <div className="py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                    <p className="text-muted-foreground mb-6">The staff member has been registered successfully.</p>
                    <Button type="button" onClick={handleRegisterAgain}>
                        <Save className="h-4 w-4 mr-2" />
                        Register Another Staff
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmitWrapper} className="space-y-6">
            {renderStepIndicator()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between gap-4">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || processing}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                {currentStep < totalSteps ? (
                    <Button
                        type="button"
                        onClick={nextStep}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {processing ? 'Creating...' : 'Register Staff'}
                    </Button>
                )}
            </div>
        </form>
    );
}
