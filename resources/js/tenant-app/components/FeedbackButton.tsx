import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { apiPost } from '../lib/api';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'support' | 'feedback' | 'bug'>('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/api/feedback', { type, subject, message });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setSubject('');
        setMessage('');
        setType('feedback');
      }, 2000);
    } catch (err) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Give Feedback"
        >
          <MessageSquare size={20} />
          <span className="hidden sm:inline text-sm font-semibold">Feedback</span>
        </button>
      )}

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare size={20} />
              <h3 className="font-bold text-base">Send Feedback</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <CheckCircle size={48} className="text-emerald-500 mb-3" />
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">Thank you!</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-1">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'feedback', label: 'Feedback', color: 'blue' },
                    { value: 'bug', label: 'Bug Report', color: 'rose' },
                    { value: 'support', label: 'Support', color: 'amber' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        type === t.value
                          ? `bg-${t.color}-600 text-white`
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description..."
                  required
                  maxLength={200}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  required
                  maxLength={5000}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none resize-none"
                />
                <p className="text-xs text-zinc-400 text-right">{message.length}/5000</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
