<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialExpired extends Notification implements ShouldQueue
{
    use Queueable;

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your BinoManager trial has expired')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your 14-day free trial for **' . $notifiable->name . '** has ended.')
            ->line('Your workspace has been suspended, but your data is safe and secure.')
            ->line('Subscribe to any plan to restore access immediately.')
            ->action('View Plans & Subscribe', url('/billing'))
            ->line('All your products, sales, and customer data will be available as soon as you subscribe.')
            ->line('Questions? Our support team is here to help.');
    }
}
