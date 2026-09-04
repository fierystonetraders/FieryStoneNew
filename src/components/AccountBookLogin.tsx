/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, ShieldAlert, RefreshCw, BookOpen } from 'lucide-react';
import { getSupabase } from '../supabaseClient';
import { safeSetItem } from '../utils/safeStorage';

// Only these accounts may sign in to the Account Book. Supabase Auth is configured
// with shouldCreateUser: false, so an OTP will only actually be delivered if a
// matching user already exists in the project's Auth users list (see setup notes).
export const SECURE_USERS: Record<string, string> = {
  'ramanalv2020@gmail.com': 'LV Ramana',
  'vamsih@gmail.com': 'S Vamsi',
  'mbmnaidu@yahoo.com': 'MBM Naidu'
};

interface AccountBookLoginProps {
  onLoginSuccess: (email: string, name: string) => void;
}

export default function AccountBookLogin({ onLoginSuccess }: AccountBookLoginProps) {
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<string | null>(null);
  const [isMailSent, setIsMailSent] = useState(false);
  const [isMailSending, setIsMailSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setIsMailSending(true);
    setStatusMessage(null);

    const targetEmail = emailInput.toLowerCase().trim();

    if (!SECURE_USERS[targetEmail]) {
      setErrors('Unauthorized access. This account book only accepts authorized accounts.');
      setIsMailSending(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setErrors('Supabase is not configured, so sign-in is unavailable.');
      setIsMailSending(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      setIsMailSending(false);
      setIsMailSent(true);
      setStatusMessage('✅ An access code has been dispatched to your email inbox.');
    } catch (err: any) {
      setIsMailSending(false);
      setErrors(`Authentication Dispatch Failure: ${err.message || 'Could not contact database auth layers.'}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    if (!verificationCode) {
      setErrors('Please enter the verification code.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setErrors('Supabase is not configured, so sign-in is unavailable.');
      return;
    }

    const targetEmail = emailInput.toLowerCase().trim();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: verificationCode,
        type: 'email'
      });

      if (error) throw error;

      if (data.session) {
        const name = SECURE_USERS[targetEmail] || targetEmail;
        safeSetItem('fstone_secure_session_active', 'true');
        safeSetItem('fstone_secure_user_email', targetEmail);
        safeSetItem('fstone_secure_user_name', name);
        onLoginSuccess(targetEmail, name);
      } else {
        setErrors('Verification failed. Unable to establish a secure user session.');
      }
    } catch (err: any) {
      setErrors(`Token Verification Failure: ${err.message}`);
    }
  };

  return (
    <div id="secure-login-screen" className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-950 font-sans">
      <div className="max-w-md w-full space-y-6">

        <div id="secure-login-card" className="bg-stone-900 border border-stone-800 rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 rounded-full filter blur-3xl animate-pulse" />

          <div className="text-center mb-6 pb-4 border-b border-stone-800 flex flex-col items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" /> Account Book
            </h2>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500/70" /> Authorized personnel only
            </p>
          </div>

          {errors && (
            <div id="secure-login-error-alert" className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400 mt-0.5 flex-shrink-0" />
              <p id="secure-login-error-text" className="text-xs text-red-200 font-medium leading-relaxed">{errors}</p>
            </div>
          )}

          {statusMessage && (
            <div className="mb-6 rounded-lg border border-stone-800 bg-stone-950 p-3.5 text-xs text-stone-300 tracking-wide text-center">
              {statusMessage}
            </div>
          )}

          {!isMailSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label htmlFor="secure-email" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 text-left">
                  Authorized Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-stone-600" />
                  </div>
                  <input
                    id="secure-email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-stone-800 bg-stone-950 text-xs text-stone-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter your authorized email"
                  />
                </div>
              </div>

              <button
                id="btn-secure-send-otp"
                type="submit"
                disabled={isMailSending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition disabled:opacity-50"
              >
                {isMailSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Contacting Authentication Gateways...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="rounded-lg bg-stone-950/65 border border-amber-500/20 p-4 space-y-1 text-left">
                <span className="text-[9px] uppercase tracking-widest text-amber-500 block font-bold">Verification Pending</span>
                <p className="text-xs text-stone-200">
                  Please check your mailbox for your secure access code token.
                </p>
              </div>

              <div className="text-left">
                <label htmlFor="secure-otp-code" className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Enter Verification Token
                </label>
                <input
                  id="secure-otp-code"
                  type="text"
                  required
                  placeholder="--------"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full text-center py-3.5 rounded-lg border border-amber-500/40 bg-stone-950 text-base tracking-[0.4em] font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  id="btn-secure-verify"
                  type="submit"
                  className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition"
                >
                  Verify Access Code
                </button>
                <button
                  id="btn-secure-change-email"
                  type="button"
                  onClick={() => {
                    setIsMailSent(false);
                    setVerificationCode('');
                    setStatusMessage(null);
                  }}
                  className="rounded-lg border border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200 px-4 text-xs font-semibold uppercase tracking-wider"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
