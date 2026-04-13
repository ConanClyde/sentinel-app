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

class StickerRequestRejected extends Mailable implements ShouldQueue
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
        return new Envelope(
            subject: 'Sticker Request Update - Action Required',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.sticker-request.rejected',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
