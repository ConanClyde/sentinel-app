import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import InputError from '@/components/input-error';

interface StickerFee {
    id: number;
    name: string;
    type: string;
    amount: number;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface StickerFeeSectionProps {
    fees: StickerFee[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export function StickerFeeSection({ fees, pagination }: StickerFeeSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<StickerFee | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<StickerFee | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        name: string;
        type: string;
        amount: string;
        description: string;
        is_active: boolean;
    }>({
        name: '',
        type: 'replacement',
        amount: '',
        description: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingFee(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (fee: StickerFee) => {
        setEditingFee(fee);
        setData({
            name: fee.name,
            type: fee.type,
            amount: String(fee.amount),
            description: fee.description || '',
            is_active: fee.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            amount: parseFloat(data.amount),
        };

        if (editingFee) {
            put(route('admin.config.sticker-fees.update', { stickerFee: editingFee.id }), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success('Fee updated successfully');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((error: string) => toast.error(error));
                },
            });
        } else {
            post(route('admin.config.sticker-fees.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success('Fee created successfully');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((error: string) => toast.error(error));
                },
            });
        }
    };

    const handleDelete = (fee: StickerFee) => {
        router.delete(route('admin.config.sticker-fees.destroy', { stickerFee: fee.id }), {
            onSuccess: () => {
                setDeleteConfirm(null);
                toast.success('Fee deleted successfully');
            },
            onError: (errors) => {
                Object.values(errors).forEach((error: string) => toast.error(error));
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fee
                </Button>
            </div>

            {fees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sticker fees configured yet.</p>
                    <p className="text-sm">Add fees for sticker replacement and renewal requests.</p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium">Name</th>
                                <th className="text-left p-4 font-medium">Type</th>
                                <th className="text-left p-4 font-medium">Amount</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-muted/30">
                                    <td className="p-4">
                                        <div className="font-medium">{fee.name}</div>
                                        {fee.description && (
                                            <div className="text-sm text-muted-foreground">{fee.description}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            fee.type === 'replacement'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : fee.type === 'new_registration'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                            {fee.type === 'replacement' ? 'Replacement' : fee.type === 'new_registration' ? 'New Registration' : 'Renewal'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium">Php {Number(fee.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            fee.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                        }`}>
                                            {fee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(fee)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteConfirm(fee)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Fee Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Sticker Replacement Fee"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new_registration">New Registration</SelectItem>
                                    <SelectItem value="replacement">Replacement</SelectItem>
                                    <SelectItem value="renewal">Renewal</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (Php)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of this fee"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-input"
                            />
                            <Label htmlFor="is_active" className="font-normal">Active</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingFee ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Fee</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
