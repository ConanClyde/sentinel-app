<?php

namespace App\Mail;

use App\Models\VehicleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VehicleRequestApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public VehicleRequest $vehicleRequest;

    // Queue configuration
    public $tries = 3;
    public $maxExceptions = 2;
    public $timeout = 120;

    /**
     * Create a new message instance.
     */
    public function __construct(VehicleRequest $vehicleRequest)
    {
        $this->vehicleRequest = $vehicleRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Vehicle Request Approved - Your Sticker is Ready',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.vehicle-request.approved',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        // Attach the sticker file if available
        if ($this->vehicleRequest->vehicle?->qr_code_path) {
            $stickerPath = storage_path('app/public/' . $this->vehicleRequest->vehicle->qr_code_path);
            if (file_exists($stickerPath)) {
                $attachments[] = Attachment::fromPath($stickerPath)
                    ->as('vehicle-sticker.svg')
                    ->withMime('image/svg+xml');
            }
        }

        return $attachments;
    }
}
