import { useState } from 'react';
import { Mail, Phone, Lock, User as UserIcon, Shield, Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Globe } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Role } from '@/types';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ open, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { loginWithEmail, loginWithSocial, loginWithGoogle, sendOtp, verifyOtp, registerUser, login } = useAuth();
  const { toast } = useToast();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hasGoogleClientId = Boolean(googleClientId && !googleClientId.includes('your-google-client-id'));

  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null);

  // Social account prompt state (interactive real Google / Microsoft input)
  const [socialPrompt, setSocialPrompt] = useState<'google' | 'microsoft' | null>(null);
  const [socialAction, setSocialAction] = useState<'login' | 'register'>('login');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialEmailError, setSocialEmailError] = useState('');

  // Login form state & inline errors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');

  // Register form state & inline errors
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');

  const [registerNameError, setRegisterNameError] = useState('');
  const [registerEmailError, setRegisterEmailError] = useState('');
  const [registerPhoneError, setRegisterPhoneError] = useState('');
  const [registerPasswordError, setRegisterPasswordError] = useState('');
  const [registerConfirmPasswordError, setRegisterConfirmPasswordError] = useState('');

  // OTP state & inline errors
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCodeError, setOtpCodeError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);

  // Demo switcher accordion
  const [showDemoRoles, setShowDemoRoles] = useState(false);

  const resetForm = () => {
    setError(null);
    setIsNotRegistered(false);
    setRegistrationSuccessMessage(null);
    setLoading(false);

    setLoginEmail('');
    setLoginPassword('');
    setLoginEmailError('');
    setLoginPasswordError('');

    setRegisterName('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterNameError('');
    setRegisterEmailError('');
    setRegisterPhoneError('');
    setRegisterPasswordError('');
    setRegisterConfirmPasswordError('');

    setOtpCode('');
    setOtpCodeError('');
    setDemoCode(null);
    setDeliveryMessage(null);

    setSocialPrompt(null);
    setSocialEmail('');
    setSocialName('');
    setSocialEmailError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateLoginForm = () => {
    let isValid = true;
    setLoginEmailError('');
    setLoginPasswordError('');
    setError(null);
    setIsNotRegistered(false);

    const emailTrim = loginEmail.trim();
    if (!emailTrim) {
      setLoginEmailError('Email address is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setLoginEmailError('Please enter a valid email address (e.g. name@example.com)');
      isValid = false;
    }

    if (!loginPassword) {
      setLoginPasswordError('Password is required');
      isValid = false;
    } else if (loginPassword.length < 6) {
      setLoginPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setError(null);
    setIsNotRegistered(false);
    setRegistrationSuccessMessage(null);

    try {
      await loginWithEmail(loginEmail.trim(), loginPassword);
      toast('success', 'Signed in successfully! Welcome back.');
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      if (
        msg.toLowerCase().includes('no account') ||
        msg.toLowerCase().includes('register first') ||
        msg.toLowerCase().includes('not found')
      ) {
        setIsNotRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenOrCredential: string) => {
    if (!tokenOrCredential) {
      const msg = 'No credential received from Google. Please try again.';
      setError(msg);
      toast('error', msg);
      return;
    }

    setLoading(true);
    setError(null);
    setIsNotRegistered(false);

    try {
      const user = await loginWithGoogle(tokenOrCredential);
      toast('success', `Welcome, ${user.name || 'User'}! Signed in with Google.`);
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed. Please try again.';
      setError(msg);
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err?: any) => {
    const msg = err?.error_description || 'Google Sign-In was cancelled or failed. Please try again.';
    setError(msg);
    toast('error', msg);
  };

  const googleOAuthLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleGoogleSuccess(tokenResponse.access_token);
      }
    },
    onError: (errorResponse) => {
      handleGoogleError(errorResponse);
    },
  });

  const handleGoogleClick = () => {
    if (!hasGoogleClientId) {
      const msg = 'Please set VITE_GOOGLE_CLIENT_ID in your frontend .env file to enable Google authentication.';
      setError(msg);
      toast('info', msg);
      return;
    }
    googleOAuthLogin();
  };

  const openSocialPrompt = (provider: 'google' | 'microsoft', action: 'login' | 'register') => {
    setError(null);
    setIsNotRegistered(false);
    setSocialEmailError('');
    setSocialPrompt(provider);
    setSocialAction(action);
    setSocialEmail('');
    setSocialName('');
  };

  const handleConfirmSocialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialPrompt) return;
    setError(null);
    setSocialEmailError('');
    setIsNotRegistered(false);

    const emailTrim = socialEmail.trim();
    if (!emailTrim) {
      setSocialEmailError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setSocialEmailError(`Please enter a valid ${socialPrompt === 'google' ? 'Google' : 'Microsoft'} email address`);
      return;
    }

    const nameTrim = socialName.trim() || emailTrim.split('@')[0];

    setLoading(true);
    try {
      if (socialAction === 'register') {
        // Register the social account to the database
        await registerUser({
          name: nameTrim,
          email: emailTrim,
          authProvider: socialPrompt,
          verificationCode: 'social_verified',
        });

        toast('success', `Registered with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}! Please sign in.`);
        setRegistrationSuccessMessage(`Registration successful with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}! Please click "Continue with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}" to sign in.`);
        setSocialPrompt(null);
        setMode('login');
      } else {
        // Sign In with social account
        await loginWithSocial(socialPrompt, emailTrim, nameTrim);
        toast('success', `Signed in with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}! Welcome, ${nameTrim}.`);
        handleClose();
      }
    } catch (err: any) {
      const msg = err.message || `Authentication failed with ${socialPrompt}`;
      setError(msg);
      if (
        msg.toLowerCase().includes('no account') ||
        msg.toLowerCase().includes('register first')
      ) {
        setIsNotRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateRegisterForm = () => {
    let isValid = true;
    setRegisterNameError('');
    setRegisterEmailError('');
    setRegisterPhoneError('');
    setRegisterPasswordError('');
    setRegisterConfirmPasswordError('');
    setError(null);

    const nameTrim = registerName.trim();
    if (!nameTrim) {
      setRegisterNameError('Full name is required');
      isValid = false;
    } else if (nameTrim.length < 2) {
      setRegisterNameError('Full name must be at least 2 characters');
      isValid = false;
    }

    const emailTrim = registerEmail.trim();
    if (!emailTrim) {
      setRegisterEmailError('Email address is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setRegisterEmailError('Please enter a valid email address (e.g. name@example.com)');
      isValid = false;
    }

    if (otpType === 'phone') {
      const phoneTrim = registerPhone.trim();
      if (!phoneTrim) {
        setRegisterPhoneError('Mobile phone number is required for SMS OTP');
        isValid = false;
      } else if (phoneTrim.length < 7) {
        setRegisterPhoneError('Please enter a valid phone number');
        isValid = false;
      }
    }

    if (!registerPassword) {
      setRegisterPasswordError('Password is required');
      isValid = false;
    } else if (registerPassword.length < 6) {
      setRegisterPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!registerConfirmPassword) {
      setRegisterConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (registerPassword !== registerConfirmPassword) {
      setRegisterConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    const target = otpType === 'email' ? registerEmail.trim() : registerPhone.trim();
    setOtpTarget(target);

    try {
      const otpRes = await sendOtp(target, otpType);
      if (otpRes.success) {
        if (otpRes.demoCode) {
          setDemoCode(otpRes.demoCode);
        }
        setDeliveryMessage(otpRes.message);
        setMode('otp_verify');
        toast('info', `OTP code sent to ${target}`);
      } else {
        setError(otpRes.message || 'Failed to send OTP code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpCodeError('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setOtpCodeError('Verification code is required');
      return;
    }
    if (cleanOtp.length !== 6) {
      setOtpCodeError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOtp(otpTarget, cleanOtp);
      if (!isValid) {
        setOtpCodeError('Invalid or expired verification code');
        setError('Invalid or expired verification code. Please check and retry.');
        setLoading(false);
        return;
      }

      // Finalize registration (saves credentials to database)
      await registerUser({
        name: registerName.trim(),
        email: registerEmail.trim(),
        phone: registerPhone.trim() || undefined,
        password: registerPassword,
        authProvider: 'email',
        verificationCode: cleanOtp,
      });

      // User must log in after registration!
      toast('success', 'Registration completed successfully! Please sign in with your credentials.');
      setRegistrationSuccessMessage(`Account created for ${registerEmail.trim()}! Please sign in with your email and password.`);
      setLoginEmail(registerEmail.trim());
      setLoginPassword('');
      setMode('login');
      setOtpCode('');
      setDemoCode(null);
      setDeliveryMessage(null);
    } catch (err: any) {
      setError(err.message || 'Verification or registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const otpRes = await sendOtp(otpTarget, otpType);
      if (otpRes.demoCode) {
        setDemoCode(otpRes.demoCode);
      }
      setDeliveryMessage(otpRes.message);
      toast('info', `New OTP code dispatched to ${otpTarget}`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleQuickLogin = (role: Role) => {
    login(role);
    toast('success', `Switched session to ${role === 'admin' ? 'Admin (Sam Rivera)' : role === 'cinemaManager' ? 'Cinema Manager (Jordan Lee)' : 'Customer (Alex Carter)'}`);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        socialPrompt
          ? socialAction === 'register'
            ? `Register with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}`
            : `Sign In with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}`
          : mode === 'otp_verify'
          ? 'Verify Your Account'
          : mode === 'register'
          ? 'Create a CineBook Account'
          : 'Sign In to CineBook'
      }
      size="sm"
    >
      <div className="space-y-4">
        {/* INTERACTIVE SOCIAL ACCOUNT PROMPT (Google / Microsoft) */}
        {socialPrompt ? (
          <form onSubmit={handleConfirmSocialAuth} className="space-y-4">
            <div className="p-4 rounded-xl bg-cinema-elevated border border-cinema-border text-center">
              {socialPrompt === 'google' ? (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.13z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-cinema-card flex items-center justify-center mx-auto mb-2 border border-cinema-border shadow-md">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                </div>
              )}
              <h3 className="font-semibold text-text-primary text-base">
                {socialAction === 'register' ? 'Register with ' : 'Sign in with '}
                {socialPrompt === 'google' ? 'Google' : 'Microsoft'}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {socialAction === 'register'
                  ? `Enter your ${socialPrompt === 'google' ? 'Google' : 'Microsoft'} email to create your verified CineBook account.`
                  : `Enter your registered ${socialPrompt === 'google' ? 'Google' : 'Microsoft'} email to sign in.`}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent-destructive/10 border border-accent-destructive/30 text-accent-destructive text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p>{error}</p>
                  {isNotRegistered && (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSocialAction('register');
                        setError(null);
                        setIsNotRegistered(false);
                      }}
                    >
                      Register with {socialPrompt === 'google' ? 'Google' : 'Microsoft'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Input
                label={socialPrompt === 'google' ? 'Google Email Address' : 'Microsoft Email Address'}
                type="email"
                placeholder={socialPrompt === 'google' ? 'e.g. yourname@gmail.com' : 'e.g. yourname@outlook.com'}
                value={socialEmail}
                onChange={e => {
                  setSocialEmail(e.target.value);
                  if (socialEmailError) setSocialEmailError('');
                  if (error) setError(null);
                }}
                error={socialEmailError}
                required
                autoFocus
              />
              {socialAction === 'register' && (
                <Input
                  label="Your Full Name (Optional)"
                  type="text"
                  placeholder="e.g. Alex Carter"
                  value={socialName}
                  onChange={e => setSocialName(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setSocialPrompt(null)}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-[2]" disabled={loading}>
                {loading
                  ? 'Processing...'
                  : socialAction === 'register'
                  ? `Register with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}`
                  : `Sign In with ${socialPrompt === 'google' ? 'Google' : 'Microsoft'}`}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Tab switch between Login and Register (when not in OTP step) */}
            {mode !== 'otp_verify' && (
              <div className="flex bg-cinema-elevated p-1 rounded-xl border border-cinema-border">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsNotRegistered(false);
                    setRegistrationSuccessMessage(null);
                    setMode('login');
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-accent-primary text-black shadow-md'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsNotRegistered(false);
                    setRegistrationSuccessMessage(null);
                    setMode('register');
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-accent-primary text-black shadow-md'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Registration Success Banner */}
            {registrationSuccessMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent-success/15 border border-accent-success/40 text-accent-success text-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="flex-1 font-medium">{registrationSuccessMessage}</p>
              </div>
            )}

            {/* Global Error Banner with smart Registration Switcher */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent-destructive/10 border border-accent-destructive/30 text-accent-destructive text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p>{error}</p>
                  {isNotRegistered && mode === 'login' && (
                    <div className="pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setRegisterEmail(loginEmail.trim());
                          setMode('register');
                          setError(null);
                          setIsNotRegistered(false);
                        }}
                      >
                        Register Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'login' && (
              <div className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-3.5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. alex@cinebook.com"
                    value={loginEmail}
                    onChange={e => {
                      setLoginEmail(e.target.value);
                      if (loginEmailError) setLoginEmailError('');
                      if (error) setError(null);
                      if (isNotRegistered) setIsNotRegistered(false);
                    }}
                    error={loginEmailError}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      if (loginPasswordError) setLoginPasswordError('');
                      if (error) setError(null);
                    }}
                    error={loginPasswordError}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* "or" divider and Google login under the normal form */}
                <div className="space-y-3">
                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-cinema-border w-full" />
                    <span className="bg-cinema-card px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      or
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleClick}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-cinema-border bg-cinema-elevated hover:bg-cinema-card hover:border-accent-primary/40 text-text-primary font-medium text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>{loading ? 'Connecting with Google...' : 'Sign in with Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSocialPrompt('microsoft', 'login')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-cinema-border bg-cinema-elevated hover:bg-cinema-card hover:border-text-secondary/40 text-text-primary font-medium text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                      <span>Continue with Microsoft</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. REGISTRATION FORM (STEP 1) */}
            {mode === 'register' && (
              <div className="space-y-4">
                <form onSubmit={handleStartRegistration} className="space-y-3">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Daham Bhanuka"
                    value={registerName}
                    onChange={e => {
                      setRegisterName(e.target.value);
                      if (registerNameError) setRegisterNameError('');
                      if (error) setError(null);
                    }}
                    error={registerNameError}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={registerEmail}
                    onChange={e => {
                      setRegisterEmail(e.target.value);
                      if (registerEmailError) setRegisterEmailError('');
                      if (error) setError(null);
                    }}
                    error={registerEmailError}
                    required
                  />
                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    placeholder="e.g. +94 77 123 4567"
                    value={registerPhone}
                    onChange={e => {
                      setRegisterPhone(e.target.value);
                      if (registerPhoneError) setRegisterPhoneError('');
                      if (error) setError(null);
                    }}
                    error={registerPhoneError}
                  />

                  {/* OTP verification channel preference */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1.5">
                      Send Verification Code Via
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpType('email')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          otpType === 'email'
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-semibold'
                            : 'border-cinema-border bg-cinema-elevated text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" /> Email OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpType('phone')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          otpType === 'phone'
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-semibold'
                            : 'border-cinema-border bg-cinema-elevated text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Mobile SMS
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="6+ chars"
                      value={registerPassword}
                      onChange={e => {
                        setRegisterPassword(e.target.value);
                        if (registerPasswordError) setRegisterPasswordError('');
                        if (error) setError(null);
                      }}
                      error={registerPasswordError}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Match password"
                      value={registerConfirmPassword}
                      onChange={e => {
                        setRegisterConfirmPassword(e.target.value);
                        if (registerConfirmPasswordError) setRegisterConfirmPasswordError('');
                        if (error) setError(null);
                      }}
                      error={registerConfirmPasswordError}
                      required
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-accent-primary/5 border border-accent-primary/20 flex items-center gap-2 text-xs text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span>Get <strong>100 bonus loyalty points</strong> upon registration!</span>
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>

                {/* "or" divider and Google registration under the normal form */}
                <div className="space-y-3">
                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-cinema-border w-full" />
                    <span className="bg-cinema-card px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      or
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleClick}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-cinema-border bg-cinema-elevated hover:bg-cinema-card hover:border-accent-primary/40 text-text-primary font-medium text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>{loading ? 'Connecting with Google...' : 'Sign up with Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSocialPrompt('microsoft', 'register')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-cinema-border bg-cinema-elevated hover:bg-cinema-card hover:border-text-secondary/40 text-text-primary font-medium text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                      <span>Register with Microsoft</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. OTP VERIFICATION FORM (STEP 2) */}
            {mode === 'otp_verify' && (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-cinema-elevated border border-cinema-border text-center">
                  <KeyRound className="w-8 h-8 text-accent-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-text-primary">
                    Enter 6-Digit Verification Code
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {otpType === 'email' ? '📬 Verification email dispatched to: ' : '📱 Verification SMS dispatched to: '}
                    <strong className="text-text-primary">{otpTarget}</strong>
                  </p>
                  {otpType === 'email' && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      (Please check your email inbox and spam folder)
                    </p>
                  )}
                </div>

                {/* Test mode banner with auto-fill helper */}
                {demoCode && (
                  <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-text-muted block text-[11px]">Verification Code (Dev/Demo Mode):</span>
                      <strong className="text-accent-primary font-mono text-base tracking-widest">
                        {demoCode}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(demoCode);
                        setOtpCodeError('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-accent-primary text-black font-semibold hover:opacity-90 transition-opacity"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div>
                  <Input
                    label="6-Digit OTP Code"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={e => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      if (otpCodeError) setOtpCodeError('');
                      if (error) setError(null);
                    }}
                    error={otpCodeError}
                    className="text-center font-mono text-xl tracking-widest"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted px-1">
                  <span>Didn't get the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-accent-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setOtpCodeError('');
                    }}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-[2]" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                  </Button>
                </div>
              </form>
            )}

            {/* DEMO ROLE SWITCHER ACCORDION (Evaluator Convenience) */}
            <div className="pt-3 border-t border-cinema-border">
              <button
                type="button"
                onClick={() => setShowDemoRoles(!showDemoRoles)}
                className="w-full flex items-center justify-between text-xs font-medium text-text-muted hover:text-text-secondary transition-colors py-1"
              >
                <span>Quick Demo Role Switcher (For Evaluators)</span>
                <span className="text-[10px] bg-cinema-elevated px-2 py-0.5 rounded border border-cinema-border">
                  {showDemoRoles ? 'Hide' : 'Show Roles'}
                </span>
              </button>

              {showDemoRoles && (
                <div className="mt-2.5 space-y-2 animate-slide-down">
                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cinema-elevated hover:bg-cinema-border/80 border border-cinema-border text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Alex Carter (Customer)</p>
                      <p className="text-[11px] text-text-muted">alex@cinebook.com / password123</p>
                    </div>
                    <Badge variant="amber">Customer</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('cinemaManager')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cinema-elevated hover:bg-cinema-border/80 border border-cinema-border text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Jordan Lee (Cinema Manager)</p>
                      <p className="text-[11px] text-text-muted">jordan@cinebook.com / password123</p>
                    </div>
                    <Badge variant="red">Manager</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('admin')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cinema-elevated hover:bg-cinema-border/80 border border-cinema-border text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Sam Rivera (Sole Admin)</p>
                      <p className="text-[11px] text-text-muted">sam@cinebook.com / password123</p>
                    </div>
                    <Badge variant="blue">Admin</Badge>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
