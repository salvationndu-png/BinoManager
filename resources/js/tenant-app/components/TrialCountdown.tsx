import React, { useState, useEffect } from 'react';

interface TrialCountdownProps {
  trialEndsAt: string | null;
  onUpgradeClick: () => void;
}

export default function TrialCountdown({ trialEndsAt, onUpgradeClick }: TrialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!trialEndsAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  if (!timeLeft || !trialEndsAt) return null;

  // Don't show if trial expired
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  // Format display based on time remaining
  let displayText = '';
  if (timeLeft.days > 0) {
    displayText = `${timeLeft.days}d ${timeLeft.hours}h`;
  } else if (timeLeft.hours > 0) {
    displayText = `${timeLeft.hours}h ${timeLeft.minutes}m`;
  } else {
    displayText = `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  }

  return (
    <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
      ⏳ Trial: {displayText} left
      <button onClick={onUpgradeClick} className="underline hover:no-underline">
        Upgrade
      </button>
    </span>
  );
}
