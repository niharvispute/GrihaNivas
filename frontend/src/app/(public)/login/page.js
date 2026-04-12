'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { loginWithOtp, sendOtp } from '@/services/authService';

const PHONE_REGEX = /^[6-9]\d{9}$/;

const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);
  const isValidPhone = PHONE_REGEX.test(normalizedPhone);
  const isValidOtp = /^\d{6}$/.test(String(otp).trim());

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!isValidPhone) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await sendOtp(normalizedPhone);
      setStep('otp');
      setFeedback({
        type: 'success',
        message: `OTP sent to +91 ${normalizedPhone}.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to send OTP right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!isValidOtp) {
      setFeedback({
        type: 'error',
        message: 'OTP must be exactly 6 digits.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = await loginWithOtp({
        phone: normalizedPhone,
        otp: String(otp).trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });

      const destination = data?.user?.role === 'admin' ? '/admin' : '/dashboard';
      router.push(destination);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'OTP verification failed. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-10rem)] max-w-5xl mx-auto px-6 lg:px-8 py-14">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="bg-linear-to-br from-slate-50 via-white to-slate-100 border border-slate-100 rounded-4xl p-8 md:p-10">
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-primary mb-4">Secure Access</p>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-5 leading-none">Login With OTP</h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            Sign in using your phone number. We will send a one-time password for quick and secure access.
          </p>

          <div className="space-y-4 text-sm text-slate-600">
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Access saved and compared properties</p>
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Track your enquiries in dashboard</p>
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Faster form submissions with autofill profile</p>
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8 md:p-10">
          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Mobile Number</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-transparent focus-within:border-primary/30">
                  <span className="text-sm font-bold text-slate-500 mr-2">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => setPhone(normalizePhone(event.target.value))}
                    placeholder="9876543210"
                    className="w-full bg-transparent py-4 outline-none text-sm font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3">
                OTP sent to +91 {normalizedPhone}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setFeedback({ type: '', message: '' });
                  }}
                  className="ml-2 text-primary hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!isValidPhone) return;
                  setIsSubmitting(true);
                  setFeedback({ type: '', message: '' });
                  try {
                    await sendOtp(normalizedPhone);
                    setFeedback({ type: 'success', message: 'A fresh OTP has been sent.' });
                  } catch (error) {
                    setFeedback({ type: 'error', message: getErrorMessage(error, 'Unable to resend OTP.') });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-70"
              >
                Resend OTP
              </button>
            </form>
          )}

          {feedback.message && (
            <p className={`mt-5 text-sm font-medium ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
              {feedback.message}
            </p>
          )}

          <p className="mt-6 text-xs text-slate-500">
            By continuing, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
