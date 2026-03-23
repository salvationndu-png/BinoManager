import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

interface VerificationStatus {
  verified: boolean;
  verified_at?: string;
  code_sent?: boolean;
  code_expires_at?: string;
  attempts_remaining?: number;
}

export default function EmailVerificationBanner() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiGet('/api/email-verification/status');
      setStatus(response.status);
    } catch (error) {
      console.error('Failed to fetch verification status', error);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiPost('/api/email-verification/send', {});
      setMessage(response.message);
      setMessageType('success');
      fetchStatus();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send code');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setMessage('Please enter a 6-digit code');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await apiPost('/api/email-verification/verify', { code });
      setMessage(response.message);
      setMessageType('success');
      
      // Update status to verified immediately
      setStatus({ ...status!, verified: true });
      
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Verification failed');
      setMessageType('error');
      fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  if (!status || status.verified || dismissed) return null;

  return (
    <>
      {/* Banner */}
      <div className="bg-blue-600 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <div>
              <p className="font-medium">Verify your email address</p>
              <p className="text-sm text-blue-100">
                Some features are limited until you verify your email
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Verify Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-blue-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              {status.code_sent
                ? 'Enter the 6-digit code sent to your email'
                : 'Click below to receive a verification code'}
            </p>

            {message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}

            {!status.code_sent ? (
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            ) : (
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {status.attempts_remaining !== undefined &&
                      `${status.attempts_remaining} attempts remaining`}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mb-3"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Resend Code
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
