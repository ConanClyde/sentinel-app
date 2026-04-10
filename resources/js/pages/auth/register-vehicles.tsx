import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2, Car, X, Check } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

interface VehicleType {
    id: number;
    name: string;
    has_plate_number: boolean | number;
}

interface RegisterVehiclesProps {
    vehicleTypes: VehicleType[];
    role: string;
    savedVehicles?: Vehicle[];
}

interface Vehicle {
    [key: string]: string;
    vehicle_type_id: string;
    plate_number: string;
}

interface RegisterVehiclesForm {
    [key: string]: Vehicle[] | undefined;
    vehicles: Vehicle[];
}

export default function RegisterVehicles({ vehicleTypes, role, savedVehicles }: RegisterVehiclesProps) {
    const [vehicleCount, setVehicleCount] = useState(savedVehicles?.length || 1);
    const [completedIndices, setCompletedIndices] = useState<number[]>(
        savedVehicles ? savedVehicles.map((_, i) => i) : []
    );

    const { data, setData, post, processing, errors } = useForm<RegisterVehiclesForm>({
        vehicles: savedVehicles && savedVehicles.length > 0 ? savedVehicles : [{ vehicle_type_id: '', plate_number: '' }],
    });

    const formErrors = errors as Record<string, string>;

    const isVehicleValid = (index: number) => {
        const v = data.vehicles[index];
        if (!v || !v.vehicle_type_id) return false;

        const type = vehicleTypes.find(t => t.id.toString() === v.vehicle_type_id);
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

    const addVehicle = () => {
        if (vehicleCount < 3 && completedIndices.includes(data.vehicles.length - 1)) {
            setVehicleCount(vehicleCount + 1);
            setData('vehicles', [...(data.vehicles || []), { vehicle_type_id: '', plate_number: '' }]);
        }
    };

    const removeVehicle = (index: number) => {
        if (vehicleCount > 1) {
            setVehicleCount(vehicleCount - 1);
            setCompletedIndices(completedIndices.filter((i) => i !== index).map(i => i > index ? i - 1 : i));
            const newVehicles = [...(data.vehicles || [])];
            newVehicles.splice(index, 1);
            setData('vehicles', newVehicles);
        }
    };

    const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
        const newVehicles = [...(data.vehicles || [])];
        newVehicles[index] = { ...newVehicles[index], [field]: value };
        setData('vehicles', newVehicles);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (completedIndices.length !== data.vehicles.length) {
            toast.error('Please mark all vehicles as "Done" before continuing.');
            return;
        }
        post(route('register.store-vehicles'), {
            onSuccess: () => toast.success('Vehicles saved.'),
            onError: () => toast.error('Please ensure all vehicle details are correctly filled.'),
        });
    };

    const allDone = completedIndices.length === data.vehicles.length;
    const canAddMore = vehicleCount < 3 && allDone;

    return (
        <AuthLayout title="Vehicle Registration" description={`Step 3 of 5: Register your vehicle(s)`} backHref={route('register.back')} progress={60}>
            <Head title="Register - Vehicles" />
            <form className="flex flex-col gap-5 px-1" onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <InputError message={errors.vehicles} />

                    {/* Vehicles List */}
                    <div className="space-y-4">
                        {(data.vehicles || []).map((vehicle, index) => {
                            const isDone = completedIndices.includes(index);
                            const vehicleTypeName = vehicleTypes.find(t => t.id.toString() === vehicle.vehicle_type_id)?.name || 'Unknown';

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative rounded-lg border transition-all duration-200",
                                        isDone
                                            ? "border-green-500/30 bg-green-500/[0.02] dark:bg-green-500/[0.01] p-3"
                                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4"
                                    )}
                                >
                                    {/* Header */}
                                    <div className={cn("flex items-center justify-between", !isDone && "mb-4")}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex h-7 w-7 items-center justify-center rounded-lg",
                                                isDone ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                            )}>
                                                {isDone ? <Check className="h-3.5 w-3.5" /> : <Car className="h-3.5 w-3.5" />}
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider block leading-none",
                                                    isDone ? "text-green-500/70" : "text-zinc-500 dark:text-zinc-400 font-mono"
                                                )}>
                                                    Vehicle 0{index + 1}
                                                </span>
                                                {isDone && (
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {vehicleTypeName} • <span className="uppercase tracking-widest">{vehicle.plate_number}</span>
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
                                                vehicleCount > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeVehicle(index)}
                                                        className="h-7 w-7 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                                        disabled={processing}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit Mode Content */}
                                    {!isDone && (() => {
                                        const type = vehicleTypes.find(t => t.id.toString() === vehicle.vehicle_type_id);
                                        const needsPlate = type ? (type.has_plate_number === true || type.has_plate_number === 1) : true;

                                        return (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label htmlFor={`vehicle-type-${index}`} className="text-xs font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 ml-1">
                                                            Type
                                                        </Label>
                                                        <Select
                                                            value={vehicle.vehicle_type_id}
                                                            onValueChange={(value) => {
                                                                updateVehicle(index, 'vehicle_type_id', value);
                                                            }}
                                                            disabled={processing}
                                                        >
                                                            <SelectTrigger id={`vehicle-type-${index}`} className="h-10 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 text-sm rounded-lg shadow-none">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-background dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                                {vehicleTypes.map((type) => (
                                                                    <SelectItem key={type.id} value={type.id.toString()} className="text-sm pl-3">
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={formErrors[`vehicles.${index}.vehicle_type_id`]} />
                                                    </div>

                                                    <div className="flex flex-col gap-1.5">
                                                        <Label htmlFor={`plate-${index}`} className="text-xs font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 ml-1">
                                                            Plate Number {!needsPlate && <span className="text-zinc-400">(N/A)</span>}
                                                        </Label>
                                                        <Input
                                                            id={`plate-${index}`}
                                                            type="text"
                                                            value={vehicle.plate_number}
                                                            onChange={(e) => updateVehicle(index, 'plate_number', e.target.value.toUpperCase())}
                                                            placeholder={needsPlate ? "ABC 123" : "No plate"}
                                                            disabled={processing || !needsPlate}
                                                            className="h-10 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 text-sm uppercase tracking-widest placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-mono rounded-lg shadow-none disabled:bg-zinc-100 disabled:text-zinc-400"
                                                        />
                                                        <InputError message={formErrors[`vehicles.${index}.plate_number`]} />
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
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Compact Add Section */}
                    {canAddMore && (
                        <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white rounded-lg shadow-none"
                                onClick={addVehicle}
                                disabled={processing}
                            >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Add another vehicle ({2 - (vehicleCount - 1)} remaining)
                            </Button>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing || !allDone}
                        className={cn(
                            "mt-2 h-12 w-full text-base rounded-lg transition-all active:scale-[0.98] shadow-none",
                            allDone
                                ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                        )}
                    >
                        {processing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Continue'}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
