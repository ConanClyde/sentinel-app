<?php

namespace App\Mail;

use App\Models\StickerRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StickerRequestApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public StickerRequest $stickerRequest;

    // Queue configuration
    public $tries = 3;
    public $maxExceptions = 2;
    public $timeout = 120;

    /**
     * Create a new message instance.
     */
    public function __construct(StickerRequest $stickerRequest)
    {
        $this->stickerRequest = $stickerRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->stickerRequest->type === 'renewal'
            ? 'Sticker Renewal Approved - Your New Sticker is Ready'
            : 'Sticker Replacement Approved - Download Your Sticker';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.sticker-request.approved',
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

        // Attach the new sticker file
        if ($this->stickerRequest->vehicle?->qr_code_path) {
            $stickerPath = storage_path('app/public/' . $this->stickerRequest->vehicle->qr_code_path);
            if (file_exists($stickerPath)) {
                $attachments[] = Attachment::fromPath($stickerPath)
                    ->as('vehicle-sticker.svg')
                    ->withMime('image/svg+xml');
            }
        }

        return $attachments;
    }
}
