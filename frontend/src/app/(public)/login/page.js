'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import {
  EMAIL_REGEX,
  INDIA_PHONE_DIGITS_REGEX,
  PASSWORD_REGEX,
  isValidAuthIdentifier,
  normalizeAuthIdentifier,
  normalizeIndianPhoneInput,
} from '@/lib/validation/phone';
import {
  completeSignupVerification,
  forgotPasswordRequest,
  forgotPasswordReset,
  forgotPasswordVerify,
  loginWithPassword,
  signupRequest,
  signupResendOtp,
} from '@/services/authService';

const routeAfterAuth = (router, data) => {
  const destination = data?.user?.role === 'admin' ? '/admin' : '/account';
  try {
    router.push(destination);
  } catch {
    if (typeof window !== 'undefined') {
      window.location.assign(destination);
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupStep, setSignupStep] = useState('form');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOtp, setSignupOtp] = useState('');

  const [forgotStep, setForgotStep] = useState('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const normalizedSignupPhone = useMemo(
    () => normalizeIndianPhoneInput(signupPhone),
    [signupPhone]
  );

  const resetFeedback = () => setFeedback({ type: '', message: '' });

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetFeedback();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const identifier = normalizeAuthIdentifier(loginIdentifier);

    if (!isValidAuthIdentifier(identifier)) {
      setFeedback({
        type: 'error',
        message: 'Enter a valid email or +91 mobile number.',
      });
      return;
    }

    if (!loginPassword) {
      setFeedback({ type: 'error', message: 'Password is required.' });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      const data = await loginWithPassword({
        identifier,
        password: loginPassword,
      });

      routeAfterAuth(router, data);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to log in right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupRequest = async (event) => {
    event.preventDefault();

    if (signupName.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }

    if (!EMAIL_REGEX.test(signupEmail.trim().toLowerCase())) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!INDIA_PHONE_DIGITS_REGEX.test(normalizedSignupPhone)) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
      return;
    }

    if (!PASSWORD_REGEX.test(signupPassword)) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters with upper, lower, and number.',
      });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      await signupRequest({
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: `+91${normalizedSignupPhone}`,
        password: signupPassword,
      });

      setSignupStep('otp');
      setFeedback({
        type: 'success',
        message: `OTP sent to ${signupEmail.trim().toLowerCase()}.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to start signup right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupVerify = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(String(signupOtp).trim())) {
      setFeedback({ type: 'error', message: 'OTP must be exactly 6 digits.' });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      const data = await completeSignupVerification({
        otp: String(signupOtp).trim(),
      });

      routeAfterAuth(router, data);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'OTP verification failed. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupResend = async () => {
    setIsSubmitting(true);
    resetFeedback();

    try {
      await signupResendOtp();
      setFeedback({ type: 'success', message: 'A fresh OTP has been sent to your email.' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Unable to resend OTP.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotRequest = async (event) => {
    event.preventDefault();
    const identifier = normalizeAuthIdentifier(forgotIdentifier);

    if (!isValidAuthIdentifier(identifier)) {
      setFeedback({ type: 'error', message: 'Enter a valid email or +91 mobile number.' });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      await forgotPasswordRequest({ identifier });
      setForgotStep('otp');
      setForgotIdentifier(identifier);
      setFeedback({
        type: 'success',
        message: 'If your account exists, OTP has been sent to your registered email.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to start password reset.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotVerify = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(String(forgotOtp).trim())) {
      setFeedback({ type: 'error', message: 'OTP must be exactly 6 digits.' });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      await forgotPasswordVerify({ otp: String(forgotOtp).trim() });
      setForgotStep('reset');
      setFeedback({ type: 'success', message: 'OTP verified. Set your new password.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'OTP verification failed.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotReset = async (event) => {
    event.preventDefault();

    if (!PASSWORD_REGEX.test(forgotPassword)) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters with upper, lower, and number.',
      });
      return;
    }

    if (forgotPassword !== forgotConfirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      await forgotPasswordReset({ newPassword: forgotPassword });

      setMode('login');
      setForgotStep('request');
      setForgotOtp('');
      setForgotPassword('');
      setForgotConfirmPassword('');
      setLoginIdentifier(forgotIdentifier);
      setLoginPassword('');

      setFeedback({
        type: 'success',
        message: 'Password updated. Please login with your new password.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to reset password.'),
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
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-5 leading-none">Account Access</h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            Login with password, create an account with email OTP verification, or reset password with secure OTP flow.
          </p>

          <div className="space-y-4 text-sm text-slate-600">
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Access saved and compared properties</p>
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Track your enquiries in dashboard</p>
            <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary" /> Faster form submissions with autofill profile</p>
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8 md:p-10">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2 text-xs font-black tracking-wide transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg py-2 text-xs font-black tracking-wide transition-colors ${
                mode === 'signup' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className={`rounded-lg py-2 text-[11px] font-black tracking-wide transition-colors ${
                mode === 'forgot' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {mode === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Email or Mobile</label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(event) => setLoginIdentifier(event.target.value)}
                  placeholder="you@example.com or +91XXXXXXXXXX"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {mode === 'signup' && signupStep === 'form' && (
            <form className="space-y-5" onSubmit={handleSignupRequest}>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Mobile Number</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-transparent focus-within:border-primary/30">
                  <span className="text-sm font-bold text-slate-500 mr-2">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={signupPhone}
                    onChange={(event) => setSignupPhone(normalizeIndianPhoneInput(event.target.value))}
                    placeholder="9876543210"
                    className="w-full bg-transparent py-4 outline-none text-sm font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="Min 8 chars with upper, lower, number"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Sending OTP...' : 'Create Account'}
              </button>
            </form>
          )}

          {mode === 'signup' && signupStep === 'otp' && (
            <form className="space-y-5" onSubmit={handleSignupVerify}>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3">
                OTP sent to {signupEmail.trim().toLowerCase()}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={signupOtp}
                  onChange={(event) => setSignupOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email OTP'}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSignupResend}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-70"
              >
                Resend OTP
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSignupStep('form');
                  setSignupOtp('');
                  resetFeedback();
                }}
                className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
              >
                Edit Signup Details
              </button>
            </form>
          )}

          {mode === 'forgot' && forgotStep === 'request' && (
            <form className="space-y-5" onSubmit={handleForgotRequest}>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Email or Mobile</label>
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(event) => setForgotIdentifier(event.target.value)}
                  placeholder="you@example.com or +91XXXXXXXXXX"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Requesting OTP...' : 'Send Reset OTP'}
              </button>
            </form>
          )}

          {mode === 'forgot' && forgotStep === 'otp' && (
            <form className="space-y-5" onSubmit={handleForgotVerify}>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3">
                Enter the OTP sent to your registered email.
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(event) => setForgotOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {mode === 'forgot' && forgotStep === 'reset' && (
            <form className="space-y-5" onSubmit={handleForgotReset}>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">New Password</label>
                <input
                  type="password"
                  value={forgotPassword}
                  onChange={(event) => setForgotPassword(event.target.value)}
                  placeholder="Min 8 chars with upper, lower, number"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(event) => setForgotConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 rounded-xl px-4 py-4 outline-none border border-transparent focus:border-primary/30 text-sm font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-black tracking-wide text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
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
