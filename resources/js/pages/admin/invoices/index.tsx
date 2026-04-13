import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Search, Filter, DollarSign, CheckCircle, XCircle, Clock, CreditCard, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
    email: string;
}

interface VehicleType {
    name: string;
}

interface Vehicle {
    id: number;
    plate_number: string;
    vehicleType?: VehicleType;
}

interface Invoice {
    id: number;
    invoice_number: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    payment_method: string | null;
    paid_at: string | null;
    created_at: string;
    user?: User;
    vehicle?: Vehicle;
    creator?: User;
    receiver?: User;
}

interface PageProps {
    invoices: Invoice[];
    invoicesPagination: {
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status: string;
        search: string;
    };
    totals: {
        pending: number;
        paid: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Invoices', href: '#' },
];

export default function InvoicesIndex() {
    const props = usePage().props as unknown as PageProps;
    const { invoices, invoicesPagination, filters, totals, canManage = false } = props as any;

    const [search, setSearch] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.invoices.index'), { search, status: statusFilter }, { replace: true });
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get(route('admin.invoices.index'), { search, status: value }, { replace: true });
    };

    const openPayDialog = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setPaymentMethod('cash');
        setNotes('');
        setPayDialogOpen(true);
    };

    const openCancelDialog = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setNotes('');
        setCancelDialogOpen(true);
    };

    const handleMarkPaid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        router.post(route('admin.invoices.mark-paid', { id: selectedInvoice.id }), {
            payment_method: paymentMethod,
            notes,
        }, {
            onSuccess: () => {
                setPayDialogOpen(false);
                toast.success('Invoice marked as paid');
            },
            onError: () => {
                toast.error('Failed to mark invoice as paid');
            },
        });
    };

    const handleCancel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        router.post(route('admin.invoices.cancel', { id: selectedInvoice.id }), {
            notes,
        }, {
            onSuccess: () => {
                setCancelDialogOpen(false);
                toast.success('Invoice cancelled');
            },
            onError: () => {
                toast.error('Failed to cancel invoice');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'new_registration': return 'New Registration';
            case 'renewal': return 'Renewal';
            case 'replacement': return 'Replacement';
            default: return type;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by invoice #, user, plate..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-semibold">
                                    Php {totals.pending.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paid</p>
                                <p className="text-2xl font-semibold">
                                    Php {totals.paid.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Invoices</p>
                                <p className="text-2xl font-semibold">{invoicesPagination.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                {invoices.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No invoices found.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Invoice #</th>
                                    <th className="text-left p-4 font-medium">User</th>
                                    <th className="text-left p-4 font-medium">Vehicle</th>
                                    <th className="text-left p-4 font-medium">Type</th>
                                    <th className="text-left p-4 font-medium">Amount</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Date</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-muted/30">
                                        <td className="p-4">
                                            <div className="font-medium">{invoice.invoice_number}</div>
                                            {invoice.description && (
                                                <div className="text-sm text-muted-foreground">{invoice.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{invoice.user?.name}</div>
                                            <div className="text-sm text-muted-foreground">{invoice.user?.email}</div>
                                        </td>
                                        <td className="p-4">{invoice.vehicle?.plate_number || '-'}</td>
                                        <td className="p-4">
                                            <span className="text-sm">{getTypeLabel(invoice.type)}</span>
                                        </td>
                                        <td className="p-4 font-medium">Php {Number(invoice.amount).toFixed(2)}</td>
                                        <td className="p-4">{getStatusBadge(invoice.status)}</td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {invoice.status === 'pending' && canManage && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openPayDialog(invoice)}
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                        Mark Paid
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openCancelDialog(invoice)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {invoicesPagination.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: invoicesPagination.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === invoicesPagination.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(route('admin.invoices.index'), { page, status: statusFilter, search })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mark Paid Dialog */}
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Invoice as Paid</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleMarkPaid} className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="font-medium">{selectedInvoice?.invoice_number}</div>
                            <div className="text-2xl font-bold mt-1">Php {Number(selectedInvoice?.amount || 0).toFixed(2)}</div>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="online">Online Transfer</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Input
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPayDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Confirm Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Invoice</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCancel} className="space-y-4">
                        <p className="text-muted-foreground">
                            Are you sure you want to cancel invoice <strong>{selectedInvoice?.invoice_number}</strong>?
                        </p>

                        <div className="space-y-2">
                            <Label>Reason for cancellation</Label>
                            <Input
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Required reason..."
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                Close
                            </Button>
                            <Button type="submit" variant="destructive">
                                Cancel Invoice
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
