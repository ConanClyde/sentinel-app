<?php

namespace App\Mail;

use App\Models\VehicleViolation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ViolationReported extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public VehicleViolation $violation;

    // Queue configuration
    public $tries = 3;
    public $maxExceptions = 2;
    public $timeout = 120;

    /**
     * Create a new message instance.
     */
    public function __construct(VehicleViolation $violation)
    {
        $this->violation = $violation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notice: Vehicle Violation Reported',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.violation.reported',
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

        // Attach evidence image if available
        if ($this->violation->evidence_image) {
            $evidencePath = storage_path('app/private/violations/evidence/' . $this->violation->evidence_image);
            if (file_exists($evidencePath)) {
                $attachments[] = Attachment::fromPath($evidencePath)
                    ->as('evidence-' . $this->violation->id . '.jpg')
                    ->withMime('image/jpeg');
            }
        }

        return $attachments;
    }
}
