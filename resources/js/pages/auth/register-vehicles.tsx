import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2, Car } from 'lucide-react';
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

interface VehicleType {
    id: number;
    name: string;
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

    const { data, setData, post, processing, errors } = useForm<RegisterVehiclesForm>({
        vehicles: savedVehicles && savedVehicles.length > 0 ? savedVehicles : [{ vehicle_type_id: '', plate_number: '' }],
    });

    // Cast errors to allow nested access
    const formErrors = errors as Record<string, string>;

    const addVehicle = () => {
        if (vehicleCount < 3) {
            setVehicleCount(vehicleCount + 1);
            setData('vehicles', [...(data.vehicles || []), { vehicle_type_id: '', plate_number: '' }]);
        }
    };

    const removeVehicle = (index: number) => {
        if (vehicleCount > 1) {
            setVehicleCount(vehicleCount - 1);
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
        post(route('register.store-vehicles'), {
            onSuccess: () => toast.success('Vehicles saved.'),
            onError: () => toast.error('Please ensure all vehicle details are correctly filled.'),
        });
    };

    return (
        <AuthLayout title="Vehicle Registration" description={`Step 3 of 5: Register your vehicle(s)`} backHref={route('register.back')} progress={60}>
            <Head title="Register - Vehicles" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <InputError message={errors.vehicles} />

                    {/* Vehicles List */}
                    <div className="space-y-3">
                        {(data.vehicles || []).map((vehicle, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <Car className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">Vehicle {index + 1}</span>
                                    {vehicleCount > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVehicle(index)}
                                            className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                                            disabled={processing}
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`vehicle-type-${index}`} className="text-sm">Type</Label>
                                        <Select
                                            value={vehicle.vehicle_type_id}
                                            onValueChange={(value) => updateVehicle(index, 'vehicle_type_id', value)}
                                            disabled={processing}
                                        >
                                            <SelectTrigger id={`vehicle-type-${index}`} className="h-11">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                                {vehicleTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()} className="pl-3">
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={formErrors[`vehicles.${index}.vehicle_type_id`]} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`plate-${index}`} className="text-sm">Plate Number</Label>
                                        <Input
                                            id={`plate-${index}`}
                                            type="text"
                                            value={vehicle.plate_number}
                                            onChange={(e) => updateVehicle(index, 'plate_number', e.target.value)}
                                            placeholder="ABC 123"
                                            disabled={processing}
                                            className="h-11 uppercase"
                                        />
                                        <InputError message={formErrors[`vehicles.${index}.plate_number`]} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Add Vehicle Button */}
                    {vehicleCount < 3 && (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full border-dashed"
                            onClick={addVehicle}
                            disabled={processing}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vehicle ({3 - vehicleCount} remaining)
                        </Button>
                    )}

                    <Button type="submit" className="mt-2 h-12 w-full text-base transition-transform active:scale-[0.98]" disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Continue
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
