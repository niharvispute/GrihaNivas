'use client';
import { useState, useRef, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import {
  signupRequest,
  completeSignupVerification,
  signupResendOtp,
  loginWithPassword,
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
  googleAuth,
} from '@/services/authService';

// ── OTP Boxes ─────────────────────────────────────────────────────────────────

function OtpBoxes({ onChange, disabled }) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const refs = useRef([]);

  const update = (newDigits) => {
    setDigits(newDigits);
    onChange(newDigits.join(''));
  };

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    update(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((d, idx) => { next[idx] = d; });
    update(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl
                     focus:border-primary focus:outline-none transition-colors
                     disabled:bg-gray-50 disabled:text-gray-400"
        />
      ))}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, type = 'text', value, onChange, placeholder, disabled, autoComplete, labelRight }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {labelRight}
      </div>
      <div className="relative">
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
                     disabled:bg-gray-50 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPw ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Google Button ─────────────────────────────────────────────────────────────

function GoogleButton({ label, onToken, disabled }) {
  const login = useGoogleLogin({
    onSuccess: (res) => onToken(res.access_token),
    onError: () => {},
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2
                 border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-sm
                 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">or continue with email</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Error Alert ───────────────────────────────────────────────────────────────

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
      <span>{message}</span>
    </div>
  );
}

// ── Success Alert ─────────────────────────────────────────────────────────────

function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
      <span className="material-symbols-outlined text-base flex-shrink-0">check_circle</span>
      <span>{message}</span>
    </div>
  );
}

// ── Modal Header ──────────────────────────────────────────────────────────────

function ModalHeader({ onBack, onClose, showBack }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-2">
      {showBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
      ) : (
        <span className="font-black text-lg tracking-tighter text-slate-900">Mumbai Editorial</span>
      )}
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  );
}

// ── Submit Button ─────────────────────────────────────────────────────────────

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm
                 hover:bg-primary/90 active:scale-[0.99] transition-all
                 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Please wait...
        </span>
      ) : children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function LoginView({ ctx }) {
  const { loading, setLoading, error, setError, setView, onAuthSuccess, closeModal } = ctx;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginWithPassword({ identifier, password });
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (token) => {
    setError('');
    setLoading(true);
    try {
      const data = await googleAuth({ token });
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader onClose={closeModal} showBack={false} />
      <div className="px-6 pb-7 pt-2 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-0.5">Sign in to your account</p>
        </div>

        <GoogleButton label="Continue with Google" onToken={handleGoogle} disabled={loading} />
        <Divider />
        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email or Phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="email@example.com or +91XXXXXXXXXX"
            disabled={loading}
            autoComplete="username"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
            labelRight={
              <button
                type="button"
                onClick={() => { setError(''); setView('forgot'); }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Forgot password?
              </button>
            }
          />
          <div className="pt-1">
            <SubmitButton loading={loading}>Sign In</SubmitButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => { setError(''); setView('register'); }}
            className="text-primary font-semibold hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterView({ ctx }) {
  const { loading, setLoading, error, setError, setView, setFlowData, onAuthSuccess, closeModal } = ctx;
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signupRequest(form);
      setFlowData({ email: form.email });
      setView('register-otp');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (token) => {
    setError('');
    setLoading(true);
    try {
      const data = await googleAuth({ token });
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader onClose={closeModal} showBack={false} />
      <div className="px-6 pb-7 pt-2 space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="text-sm text-slate-500 mt-0.5">Join Mumbai Editorial today</p>
        </div>

        <GoogleButton label="Sign up with Google" onToken={handleGoogle} disabled={loading} />
        <Divider />
        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" value={form.name} onChange={set('name')} placeholder="Rahul Sharma" disabled={loading} autoComplete="name" />
          <Field label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="rahul@example.com" disabled={loading} autoComplete="email" />
          <Field label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="+91XXXXXXXXXX" disabled={loading} autoComplete="tel" />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters with A-Z, a-z, 0-9" disabled={loading} autoComplete="new-password" />
          <div className="pt-1">
            <SubmitButton loading={loading}>Create Account</SubmitButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            onClick={() => { setError(''); setView('login'); }}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterOtpView({ ctx }) {
  const { loading, setLoading, error, setError, setView, flowData, onAuthSuccess, closeModal } = ctx;
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, '').length < 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await completeSignupVerification({ otp });
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signupResendOtp();
      setResendCooldown(60);
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader onBack={() => setView('register')} onClose={closeModal} showBack />
      <div className="px-6 pb-7 pt-2 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            We sent a 6-digit OTP to{' '}
            <span className="font-semibold text-slate-700">{flowData?.email || 'your email'}</span>
          </p>
        </div>

        <ErrorAlert message={error} />
        <SuccessAlert message={successMsg} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <OtpBoxes onChange={setOtp} disabled={loading} />
          <SubmitButton loading={loading}>Verify &amp; Create Account</SubmitButton>
        </form>

        <p className="text-center text-sm text-slate-500">
          Didn&apos;t receive it?{' '}
          {resendCooldown > 0 ? (
            <span className="text-gray-400">Resend in {resendCooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function ForgotView({ ctx }) {
  const { loading, setLoading, error, setError, setView, setFlowData, closeModal } = ctx;
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPasswordRequest({ identifier });
      setFlowData({ identifier });
      setView('forgot-otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader onBack={() => { setError(''); setView('login'); }} onClose={closeModal} showBack />
      <div className="px-6 pb-7 pt-2 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Forgot password</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Enter your registered email or phone — we&apos;ll send an OTP to reset your password.
          </p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email or Phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="email@example.com or +91XXXXXXXXXX"
            disabled={loading}
            autoComplete="username"
          />
          <SubmitButton loading={loading}>Send OTP</SubmitButton>
        </form>
      </div>
    </div>
  );
}

function ForgotOtpView({ ctx }) {
  const { loading, setLoading, error, setError, setView, flowData, closeModal } = ctx;
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, '').length < 6) return;
    setError('');
    setLoading(true);
    try {
      await forgotPasswordVerify({ otp });
      setView('forgot-reset');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader onBack={() => { setError(''); setView('forgot'); }} onClose={closeModal} showBack />
      <div className="px-6 pb-7 pt-2 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Enter OTP</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Check {flowData?.identifier ? (
              <span className="font-semibold text-slate-700">{flowData.identifier}</span>
            ) : 'your email or phone'} for the OTP
          </p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <OtpBoxes onChange={setOtp} disabled={loading} />
          <SubmitButton loading={loading}>Verify OTP</SubmitButton>
        </form>
      </div>
    </div>
  );
}

function ForgotResetView({ ctx }) {
  const { loading, setLoading, error, setError, setView, closeModal } = ctx;
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPasswordReset({ newPassword });
      setDone(true);
      setTimeout(() => { setView('login'); }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div>
        <ModalHeader onClose={closeModal} showBack={false} />
        <div className="px-6 pb-10 pt-4 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Password reset!</h2>
          <p className="text-sm text-slate-500">Your password has been updated. Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModalHeader onBack={() => { setError(''); setView('forgot-otp'); }} onClose={closeModal} showBack />
      <div className="px-6 pb-7 pt-2 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
          <p className="text-sm text-slate-500 mt-0.5">Choose a strong password for your account</p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters with A-Z, a-z, 0-9"
            disabled={loading}
            autoComplete="new-password"
          />
          <Field
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            disabled={loading}
            autoComplete="new-password"
          />
          <div className="pt-1">
            <SubmitButton loading={loading}>Update Password</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { isOpen, view, setView, closeModal, onAuthSuccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flowData, setFlowData] = useState({});

  // Clear error when switching views
  useEffect(() => { setError(''); }, [view]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeModal]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const ctx = { loading, setLoading, error, setError, setView, flowData, setFlowData, onAuthSuccess, closeModal };

  const views = {
    'login': <LoginView ctx={ctx} />,
    'register': <RegisterView ctx={ctx} />,
    'register-otp': <RegisterOtpView ctx={ctx} />,
    'forgot': <ForgotView ctx={ctx} />,
    'forgot-otp': <ForgotOtpView ctx={ctx} />,
    'forgot-reset': <ForgotResetView ctx={ctx} />,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {views[view] ?? views['login']}
      </div>
    </div>
  );
}
