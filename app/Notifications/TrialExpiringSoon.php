<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialExpiringSoon extends Notification implements ShouldQueue
{
    use Queueable;

    protected $daysLeft;

    public function __construct($daysLeft = 3)
    {
        $this->daysLeft = $daysLeft;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $trialEndsDate = $notifiable->trial_ends_at->format('F j, Y');
        
        return (new MailMessage)
            ->subject('Your BinoManager trial expires in ' . $this->daysLeft . ' days')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your BinoManager free trial will expire in **' . $this->daysLeft . ' days** on ' . $trialEndsDate . '.')
            ->line('To continue using BinoManager and keep your data, please subscribe to a plan.')
            ->action('Subscribe Now', url('/billing'))
            ->line('Your data is safe and will remain accessible after you subscribe.')
            ->line('Need help choosing a plan? Contact our support team.');
    }
}
