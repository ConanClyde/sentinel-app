<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\StickerRequestApproved;
use App\Mail\StickerRequestRejected;
use App\Models\Invoice;
use App\Models\StickerFee;
use App\Models\StickerRequest;
use App\Services\StickerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminStickerRequestController extends Controller
{
    public function __construct(protected StickerService $stickerService) {}

    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_stickers');

        $paginated = StickerRequest::with(['user', 'vehicle.vehicleType', 'vehicle.stickerColor'])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/sticker-requests/index', [
            'requests' => $paginated->items(),
            'canManage' => auth()->user()?->can('print_stickers') ?? false,
            'stickerRequestsPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function approve(int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view_stickers');

        $stickerRequest = StickerRequest::with(['vehicle.user', 'vehicle.stickerColor'])->findOrFail($id);

        if ($stickerRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        DB::transaction(function () use ($stickerRequest) {
            $vehicle = $stickerRequest->vehicle;
            $user    = $vehicle->user;

            if ($stickerRequest->type === 'renewal') {
                // Recalculate expiry and regenerate sticker in background
                $newExpiry = $this->stickerService->calculateExpirationDate($user);

                $vehicle->update([
                    'expires_at' => $newExpiry,
                    'is_active'  => true,
                ]);

                \App\Jobs\GenerateVehicleStickerJob::dispatch($vehicle, $user);
            } else {
                // Replacement: regenerate sticker only (same number, same expiry) in background
                \App\Jobs\GenerateVehicleStickerJob::dispatch($vehicle, $user);
            }


            $stickerRequest->update(['status' => 'approved']);

            // Create invoice for renewal/replacement
            $fee = StickerFee::getByType($stickerRequest->type);
            if ($fee && $fee->amount > 0) {
                Invoice::createForRegistration(
                    $user,
                    $vehicle,
                    $stickerRequest->type,
                    $fee->amount,
                    auth()->id()
                );
            }
        });

        // Send approval email with new sticker attachment
        if ($stickerRequest->user && $stickerRequest->user->email) {
            try {
                Mail::to($stickerRequest->user->email)
                    ->queue(new StickerRequestApproved($stickerRequest));

                Log::info('Sticker request approval email queued', [
                    'request_id' => $stickerRequest->id,
                    'user_email' => $stickerRequest->user->email,
                    'type' => $stickerRequest->type,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue sticker request approval email', [
                    'request_id' => $stickerRequest->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Sticker request approved and sticker regenerated.');
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view_stickers');

        $request->validate(['notes' => 'nullable|string|max:500']);

        $stickerRequest = StickerRequest::findOrFail($id);

        if ($stickerRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $stickerRequest->update([
            'status' => 'rejected',
            'notes'  => $request->input('notes'),
        ]);

        // Send rejection email
        if ($stickerRequest->user && $stickerRequest->user->email) {
            try {
                Mail::to($stickerRequest->user->email)
                    ->queue(new StickerRequestRejected($stickerRequest));

                Log::info('Sticker request rejection email queued', [
                    'request_id' => $stickerRequest->id,
                    'user_email' => $stickerRequest->user->email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue sticker request rejection email', [
                    'request_id' => $stickerRequest->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Sticker request rejected.');
    }
}
