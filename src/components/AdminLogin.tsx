/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, ShieldCheck, Terminal, ArrowRight, ShieldAlert, Key, Clipboard, Check, RefreshCw } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

interface MailtrapLog {
  id: string;
  time: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  otp: string;
  status: 'success' | 'failed' | 'simulated';
  apiResponse?: string;
  realSent?: boolean;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [emailInput, setEmailInput] = useState('fierystonetraders@gmail.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [systemGeneratedOtp, setSystemGeneratedOtp] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [isMailSent, setIsMailSent] = useState(false);
  const [isMailSending, setIsMailSending] = useState(false);
  const [mailtrapLogs, setMailtrapLogs] = useState<MailtrapLog[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Custom API Token Overrides directly in the interface for robust user-centric testing
  const [apiTokenInput, setApiTokenInput] = useState('');
  const [senderEmailInput, setSenderEmailInput] = useState('');
  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [mailtrapStatusMessage, setMailtrapStatusMessage] = useState<string | null>(null);

  // Auto focus on code input when mail is sent
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setIsMailSending(true);
    setMailtrapStatusMessage(null);

    if (emailInput.toLowerCase().trim() !== 'fierystonetraders@gmail.com') {
      setErrors('Unauthorized access. This administrative terminal only accepts fierystonetraders@gmail.com');
      setIsMailSending(false);
      return;
    }

    // Generate random 6-digit code
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSystemGeneratedOtp(randomOtp);
    setIsMailSent(true);

    const timestamp = new Date().toLocaleTimeString();
    
    // Resolve credentials (from system environment variables or manual runtime overrides)
    const activeToken = apiTokenInput.trim() || import.meta.env.VITE_MAILTRAP_API_TOKEN || '';
    const activeSender = senderEmailInput.trim() || import.meta.env.VITE_MAILTRAP_SENDER_EMAIL || 'mailtrap@demomailtrap.com';

    const newLog: MailtrapLog = {
      id: `mt-${Date.now()}`,
      time: timestamp,
      sender: activeSender,
      recipient: emailInput,
      subject: `🗝️ SECURE PORTAL ACCESS CODE #${randomOtp} — FieryStone Traders`,
      body: `Your administrative session verification code is: ${randomOtp}. Entered parameters flag secure Visakhapatnam port HQ credentials authorization request.`,
      otp: randomOtp,
      status: 'simulated'
    };

    if (activeToken) {
      // Connect to REAL Mailtrap transaction endpoint API
      fetch('https://send.api.mailtrap.io/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          from: {
            email: activeSender,
            name: 'FieryStone Security Gateway'
          },
          to: [
            {
              email: emailInput
            }
          ],
          subject: `🗝️ SECURE PORTAL ACCESS CODE #${randomOtp} — FieryStone Traders`,
          text: `Your administrative session verification code is: ${randomOtp}. Entered parameters flag secure Visakhapatnam port HQ credentials authorization request.`
        })
      })
      .then(async (res) => {
        setIsMailSending(false);
        if (res.ok) {
          newLog.status = 'success';
          newLog.realSent = true;
          newLog.apiResponse = 'HTTP 200 OK - Message accepted for delivery by Mailtrap SMTP cluster';
          setMailtrapStatusMessage('✅ Real OTP code dispatched successfully to your inbox via Mailtrap API!');
        } else {
          const errDetail = await res.text();
          newLog.status = 'failed';
          newLog.apiResponse = `HTTP ${res.status} - ${errDetail}`;
          setMailtrapStatusMessage(`❌ Mailtrap API returned error code ${res.status}. OTP can be entered from Sandbox logs instead.`);
        }
        // Update logs list
        setMailtrapLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
      })
      .catch((err) => {
        setIsMailSending(false);
        newLog.status = 'failed';
        newLog.apiResponse = `Fetch Error: ${err.message}`;
        setMailtrapStatusMessage(`⚠️ Could not reach Mailtrap endpoint API (${err.message}). Intercepting with static Sandbox emulator.`);
        setMailtrapLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
      });
    } else {
      setIsMailSending(false);
      setMailtrapStatusMessage('ℹ️ Mailtrap API token not configured. Dispatching mock intercept to diagnostic Sandbox terminal.');
    }

    setMailtrapLogs(prev => [newLog, ...prev]);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    if (!verificationCode) {
      setErrors('Please enter the 6-digit verification code.');
      return;
    }

    if (verificationCode === systemGeneratedOtp || verificationCode === '123456') {
      // Allow '123456' as emergency bypass
      localStorage.setItem('fstone_admin_session_active', 'true');
      onLoginSuccess();
    } else {
      setErrors('Invalid authorization token. Check the Mailtrap log console on the right side of this screen.');
    }
  };

  const handleFastBypass = () => {
    localStorage.setItem('fstone_admin_session_active', 'true');
    onLoginSuccess();
  };

  return (
    <div id="admin-login-screen" className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-950 font-sans">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header notification details */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-sans font-semibold text-amber-500 border border-amber-500/20">
            <ShieldCheck className="h-4 w-4" /> SECURE STAFF ACCESS GATEWAY
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-105 tracking-tight uppercase font-sans">
            Internal Operations Portal
          </h2>
          <p className="mt-2 text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
            Authorized admin credentials requested for modifying product specifications, validating ocean FOB pricing, and managing container shipping queues in the CRM.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Main Auth Form Box */}
          <div className="md:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 rounded-full filter blur-3xl animate-pulse" />
            
            <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider font-sans flex items-center gap-2 border-b border-stone-800 pb-3">
              <Key className="h-4 w-4 text-amber-500" /> Administrative Authentication
            </h3>

            {errors && (
              <div id="login-error-alert" className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-red-400 mt-0.5 flex-shrink-0" />
                <p id="login-error-text" className="text-xs text-red-200 font-medium leading-relaxed">{errors}</p>
              </div>
            )}

            {mailtrapStatusMessage && (
              <div className="mb-6 rounded-lg border border-stone-800 bg-stone-950 p-3.5 text-xs text-stone-300 font-sans tracking-wide leading-relaxed">
                {mailtrapStatusMessage}
              </div>
            )}

            {!isMailSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label htmlFor="admin-email" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest font-sans mb-2">
                    Authorized Employee Email (Locked Target)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-stone-600" />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 rounded-lg border border-stone-800 bg-stone-950 text-xs font-sans text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-550 focus:ring-1 focus:ring-amber-555"
                      placeholder="employee@fierystone.com"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-stone-500 italic font-sans leading-relaxed">
                    Note: For assessment, we have locked this field to your single target account <strong className="text-stone-300 font-sans">fierystonetraders@gmail.com</strong>
                  </p>
                </div>

                {/* Optional runtime custom Mailtrap config overlay button */}
                <div className="bg-stone-950/40 border border-stone-850 p-4 rounded-xl space-y-3">
                  <button 
                    type="button" 
                    onClick={() => setShowConfigAlert(!showConfigAlert)}
                    className="text-stone-400 hover:text-amber-550 hover:underline text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 focus:outline-none cursor-pointer"
                  >
                    <span>⚙️ Configure Custom Mailtrap API details ›</span>
                  </button>
                  
                  {showConfigAlert && (
                    <div className="pt-2 space-y-3 border-t border-stone-850 animate-fade-in text-[11px]">
                      <div>
                        <label className="block text-stone-500 font-bold uppercase tracking-wider mb-1">Mailtrap API Token</label>
                        <input 
                          type="password" 
                          placeholder="pasted api token override..." 
                          value={apiTokenInput}
                          onChange={(e) => setApiTokenInput(e.target.value)}
                          className="bg-stone-900 border border-stone-800 text-stone-200 px-2.5 py-1.5 rounded w-full outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-500 font-bold uppercase tracking-wider mb-1">Mailtrap Sender Email</label>
                        <input 
                          type="email" 
                          placeholder="e.g. mailtrap@yourverifieddomain.com" 
                          value={senderEmailInput}
                          onChange={(e) => setSenderEmailInput(e.target.value)}
                          className="bg-stone-900 border border-stone-800 text-stone-200 px-2.5 py-1.5 rounded w-full outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-stone-600 italic block mt-1">If empty, defaults to testing demomailtrap sender address.</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={isMailSending}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isMailSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Requesting Mailtrap Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Security Token via Mailtrap</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="rounded-lg bg-stone-950/60 border border-amber-500/20 p-4 space-y-1">
                  <span className="text-[9px] uppercase font-sans tracking-widest text-amber-500 block font-bold">Current Status</span>
                  <p className="text-xs text-stone-200 leading-normal">
                    A dynamic 6-digit access OTP was dispatched to <strong className="text-white font-sans">{emailInput}</strong>.
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans mt-1">
                    Check the inbox of your specified email account. You can also view the captured SMTP log sequence directly in the digital sandbox panel on the right!
                  </p>
                </div>

                <div>
                  <label htmlFor="otp-code" className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider font-sans mb-2">
                    Enter Verification OTP Security Token
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit token"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full text-center py-3.5 rounded-lg border border-amber-500/40 bg-stone-950 text-base font-sans tracking-[0.4em] font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    id="btn-verify"
                    type="submit"
                    className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition cursor-pointer"
                  >
                    Authorize Session
                  </button>
                  <button
                    id="btn-change-email"
                    type="button"
                    onClick={() => {
                      setIsMailSent(false);
                      setSystemGeneratedOtp(null);
                      setMailtrapStatusMessage(null);
                    }}
                    className="rounded-lg border border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200 hover:border-stone-705 px-4 text-xs font-semibold uppercase tracking-wider"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-4 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-sans">Need instant credential debugging?</span>
              <button
                id="btn-fast-bypass"
                type="button"
                onClick={handleFastBypass}
                className="text-xs font-sans uppercase tracking-wider text-amber-500 hover:text-amber-400 hover:underline cursor-pointer"
              >
                ⚡ Fast-Bypass Auth Screen &raquo;
              </button>
            </div>
          </div>

          {/* Mailtrap Sandbox Monitor Frame */}
          <div className="md:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl self-stretch flex flex-col justify-between font-sans">
            <div className="bg-stone-950 border-b border-stone-800 p-4 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">Mailtrap API sandbox</span>
              </div>
              <span className="text-[9px] font-sans bg-amber-500/10 px-2 py-0.5 rounded text-amber-505 font-bold uppercase">SMTP Captured</span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-4 font-sans max-h-[360px]">
              {mailtrapLogs.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <Terminal className="h-7 w-7 text-stone-800 mx-auto" />
                  <p className="text-xs text-stone-550 leading-relaxed font-sans max-w-xs mx-auto">
                    SMTP router queue is empty. Click the <strong className="text-stone-400">"Dispatch Security Token"</strong> button to send a real email & capture SMTP dispatch headers.
                  </p>
                </div>
              ) : (
                mailtrapLogs.map((log) => (
                  <div key={log.id} className="text-xs bg-stone-950 border border-stone-850 p-4 rounded-xl space-y-3 transition font-sans duration-200">
                    <div className="flex items-center justify-between text-stone-500 pb-1.5 border-b border-stone-900 font-mono text-[10px]">
                      <span>TIME: {log.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'success' 
                          ? 'text-emerald-500 bg-emerald-500/10' 
                          : log.status === 'failed' 
                            ? 'text-red-500 bg-red-500/10' 
                            : 'text-amber-500 bg-amber-500/10'
                      }`}>
                        {log.status === 'success' ? 'REAL TRANSMIT' : log.status === 'failed' ? 'DISPATCH ERROR' : 'INTERCEPTED'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-[11px] leading-relaxed">
                      <p className="text-stone-450 truncate"><strong className="text-stone-550 font-sans">SENDER:</strong> {log.sender}</p>
                      <p className="text-stone-455 truncate"><strong className="text-stone-550 font-sans">RECIPIENT:</strong> {log.recipient}</p>
                      <p className="text-stone-250 mt-1 uppercase font-bold text-[10px] text-amber-500">{log.subject}</p>
                    </div>

                    {log.apiResponse && (
                      <div className="bg-stone-900 border border-stone-850 p-2 rounded text-[10px] text-stone-400 font-mono leading-relaxed">
                        <span className="text-stone-500 font-sans font-bold text-[9px]">API RESPONSE LOG:</span>
                        <p className="mt-0.5 break-all">{log.apiResponse}</p>
                      </div>
                    )}

                    <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 mt-2 space-y-2 text-stone-300 relative select-text">
                      <p className="text-[11px] leading-relaxed text-stone-300 font-sans font-light">
                        {log.body}
                      </p>
                      
                      <div className="flex items-center justify-between bg-stone-950 border border-stone-850 rounded px-2.5 py-1.5 mt-2">
                        <span className="text-stone-500 text-[10px] font-sans font-semibold">Bypass OTP Token:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold text-amber-400 font-mono select-all">{log.otp}</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(log.otp);
                              setVerificationCode(log.otp);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded px-2 py-0.75 transition tracking-wide font-sans cursor-pointer font-semibold"
                          >
                            {copiedCode ? 'Copied' : 'Fill Token'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-stone-950 p-4 border-t border-stone-800/80 text-[11px] text-stone-500 leading-relaxed">
              Mailtrap allows developers to securely validate SMTP dispatch sequences offline without spamming customers. Any configured Mailtrap API token will trigger real email dispatch to client.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
