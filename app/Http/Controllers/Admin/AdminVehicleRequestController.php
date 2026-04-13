<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\VehicleRequestApproved;
use App\Mail\VehicleRequestRejected;
use App\Models\Invoice;
use App\Models\StickerFee;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use App\Services\StickerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminVehicleRequestController extends Controller
{
    public function __construct(protected StickerService $stickerService) {}

    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_vehicles');

        $paginated = VehicleRequest::with(['user', 'vehicleType'])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/pending-vehicles/index', [
            'requests' => $paginated->items(),
            'pendingVehiclesPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function approve(int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('create_vehicle');

        $vehicleRequest = VehicleRequest::with(['user', 'vehicleType'])->findOrFail($id);

        if ($vehicleRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        DB::transaction(function () use ($vehicleRequest) {
            $user        = $vehicleRequest->user;
            $plateNumber = $vehicleRequest->plate_number;

            $stickerColor  = $this->stickerService->calculateStickerColor($user, $plateNumber);
            $stickerNumber = $this->stickerService->generateStickerNumber($stickerColor);

            $vehicle = Vehicle::create([
                'user_id'          => $user->id,
                'vehicle_type_id'  => $vehicleRequest->vehicle_type_id,
                'plate_number'     => $plateNumber,
                'sticker_number'   => $stickerNumber,
                'sticker_color_id' => $stickerColor->id,
                'expires_at'       => $this->stickerService->calculateExpirationDate($user),
                'is_active'        => true,
            ]);

            $vehicle->qr_code_path = $this->stickerService->generateSticker($vehicle, $user);
            $vehicle->save();

            $vehicleRequest->update(['status' => 'approved']);

            // Create invoice for the new vehicle sticker
            $fee = StickerFee::getByType('new_registration');
            if ($fee && $fee->amount > 0) {
                Invoice::createForRegistration(
                    $user,
                    $vehicle,
                    'new_registration',
                    $fee->amount,
                    auth()->id()
                );
            }
        });

        // Send approval email with sticker attachment
        if ($vehicleRequest->user && $vehicleRequest->user->email) {
            try {
                Mail::to($vehicleRequest->user->email)
                    ->queue(new VehicleRequestApproved($vehicleRequest));
                
                Log::info('Vehicle request approval email queued', [
                    'request_id' => $vehicleRequest->id,
                    'user_email' => $vehicleRequest->user->email,
                    'vehicle_id' => $vehicleRequest->vehicle?->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue vehicle request approval email', [
                    'request_id' => $vehicleRequest->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Vehicle request approved and sticker generated.');
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('create_vehicle');

        $request->validate(['notes' => 'nullable|string|max:500']);

        $vehicleRequest = VehicleRequest::findOrFail($id);

        if ($vehicleRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $vehicleRequest->update([
            'status' => 'rejected',
            'notes'  => $request->input('notes'),
        ]);

        // Send rejection email
        if ($vehicleRequest->user && $vehicleRequest->user->email) {
            try {
                Mail::to($vehicleRequest->user->email)
                    ->queue(new VehicleRequestRejected($vehicleRequest));
                
                Log::info('Vehicle request rejection email queued', [
                    'request_id' => $vehicleRequest->id,
                    'user_email' => $vehicleRequest->user->email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue vehicle request rejection email', [
                    'request_id' => $vehicleRequest->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Vehicle request rejected.');
    }
}
