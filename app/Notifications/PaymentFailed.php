<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailed extends Notification implements ShouldQueue
{
    use Queueable;

    protected $graceDays;

    public function __construct($graceDays = 7)
    {
        $this->graceDays = $graceDays;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $graceEndsDate = $notifiable->grace_ends_at?->format('F j, Y');
        
        return (new MailMessage)
            ->subject('Payment failed for BinoManager')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We were unable to process your payment for **' . $notifiable->name . '**.')
            ->line('You have **' . $this->graceDays . ' days** (until ' . $graceEndsDate . ') to update your payment method.')
            ->line('Your workspace remains accessible during this grace period.')
            ->action('Update Payment Method', url('/billing'))
            ->line('If payment is not updated by ' . $graceEndsDate . ', your workspace will be suspended.')
            ->line('Need help? Contact our support team.');
    }
}
