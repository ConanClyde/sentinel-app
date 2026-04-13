<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_invoices');

        $query = Invoice::with(['user', 'vehicle.vehicleType', 'creator', 'receiver'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('plate_number', 'like', "%{$search}%");
                    });
            });
        }

        $paginated = $query->paginate(15);

        $totals = Invoice::selectRaw('status, SUM(amount) as total')
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($inner) use ($search) {
                    $inner->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('vehicle', fn($vq) => $vq->where('plate_number', 'like', "%{$search}%"));
                });
            })
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return Inertia::render('admin/invoices/index', [
            'invoices' => $paginated->items(),
            'canManage' => auth()->user()?->can('edit_invoices') ?? false,
            'invoicesPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
            'totals' => [
                'pending' => (float) ($totals['pending'] ?? 0),
                'paid'    => (float) ($totals['paid'] ?? 0),
            ],
        ]);
    }

    public function markPaid(Request $request, int $id)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_invoices');

        $request->validate([
            'payment_method' => 'required|string|in:cash,card,online,other',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice = Invoice::findOrFail($id);

        if ($invoice->status !== 'pending') {
            return back()->with('error', 'This invoice has already been processed.');
        }

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $request->payment_method,
            'received_by' => auth()->id(),
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Invoice marked as paid.');
    }

    public function cancel(Request $request, int $id)
    {
        \Illuminate\Support\Facades\Gate::authorize('edit_invoices');

        $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        $invoice = Invoice::findOrFail($id);

        if ($invoice->status === 'cancelled') {
            return back()->with('error', 'This invoice is already cancelled.');
        }

        $invoice->update([
            'status' => 'cancelled',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Invoice cancelled.');
    }
}
