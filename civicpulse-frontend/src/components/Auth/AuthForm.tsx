import React, { useState, useEffect, useRef } from 'react'; // <--- Add useRef here
import { useNavigate,Link} from 'react-router-dom'; // 18/12
import { useAuth } from '../../auth/AuthContext'; 
import { signin, signup, resetPassword } from '../../api/auth';
import { useOtp } from '../../hooks/useOtp'; // <--- IMPORT THE HOOK
import type { SigninRequest, SignupRequest } from '../../types/auth';

//18/12
interface AuthFormProps {
  view: 'login' | 'signup'; // New prop to control the mode
}

const AuthForm: React.FC<AuthFormProps> = ({view}) => {
  // --- 1. HOOKS ---
  const navigate = useNavigate();
  const { signin: saveUser } = useAuth();
  
  // Use our new custom hook for all OTP logic
  const { 
    isOtpSent, 
    otpVerified, 
    isVerifyingEmail, 
    isVerifyingOtp, 
    otpError, 
    otpSuccess, 
    sendOtpHandler, 
    verifyOtpHandler, 
    resetOtpState 
  } = useOtp();

  // --- DERIVED STATE --- 18/12
  // Instead of useState for isLogin, we derive it from the 'view' prop
  const isLogin = view === 'login';

  // --- 2. UI State ---
  // const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState<boolean>(false);
  const lastAttemptedOtp = useRef("");

  // --- 3. Form Data State ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
    wardNumber: '',
    department: '' 
  });
  // Local feedback state (for Login/Signup errors not related to OTP)
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // --- EFFECTS ---
  // 1. Reset state when switching between Login and Signup routes - Added 18/12
  useEffect(() => {
    setFormError('');
    setFormSuccess('');
    resetOtpState();
    setIsForgotMode(false); // Always exit forgot mode when switching routes
    setFormData(prev => ({ 
      ...prev, otp: '', password: '', confirmPassword: '' 
    }));
  }, [view]);

  //Added new 10/25  -- Used when officer clicks the link sent in email, so that form opens with pre-filled email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillEmail = params.get("email");
    if (prefillEmail) {
      setFormData(prev => ({ ...prev, email: prefillEmail }));
    }
  }, []);

  // Auto-Verify OTP Effect
  useEffect(() => {
    const isLengthCorrect = formData.otp.length === 6;
    const isNotVerified = !otpVerified;
    
    // CRITICAL FIX: Only run if this specific OTP hasn't been tried yet
    const isNewAttempt = formData.otp !== lastAttemptedOtp.current;

    const shouldVerify = (!isLogin || isForgotMode) && 
                         isOtpSent && 
                         isLengthCorrect && 
                         isNotVerified && 
                         isNewAttempt;

    if (shouldVerify) {
        // Mark this OTP as "attempted" so we don't loop
        lastAttemptedOtp.current = formData.otp;
        
        verifyOtpHandler(formData.email, formData.otp);
    }
  }, [formData.otp, isLogin, isForgotMode, isOtpSent, otpVerified, formData.email, verifyOtpHandler]);
  

  // --- 4. Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(''); 
  };

  const handleSendOtpClick = async () => {
    if (!formData.email) {
      setFormError("Please enter an email address first.");
      return;
    }
    setFormError(''); // Clear previous errors
    
    // Delegate to Hook
    const type = isForgotMode ? 'RESET' : 'SIGNUP';
    await sendOtpHandler(formData.email, type);
  };

  // const switchMode = (mode: 'LOGIN' | 'SIGNUP' | 'FORGOT') => {
  //   setFormError('');
  //   setFormSuccess('');
    
  //   // Reset OTP Hook State
  //   resetOtpState();

  //   // Clear sensitive fields
  //   setFormData(prev => ({ ...prev, otp: '', password: '', confirmPassword: '' }));
    
  //   if (mode === 'LOGIN') { setIsLogin(true); setIsForgotMode(false); }
  //   if (mode === 'SIGNUP') { setIsLogin(false); setIsForgotMode(false); }
  //   if (mode === 'FORGOT') { setIsLogin(true); setIsForgotMode(true); } 
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    try {
      if (isForgotMode) {
        // --- FORGOT PASSWORD ---
        if (!otpVerified) {
            setFormError("Please verify your email with OTP first.");
            setIsLoading(false); return;
        }
        await resetPassword({ email: formData.email, newPassword: formData.password });
        setFormSuccess("Password Reset Successfully! Please Login.");
        // setTimeout(() => switchMode('LOGIN'), 2000);

        // Return to login view after delay-18/12
        setTimeout(() => {
            setIsForgotMode(false);
            setFormSuccess('');
            resetOtpState();
        }, 2000)

      } else if (isLogin) {
        // --- LOGIN ---
        const payload: SigninRequest = { email: formData.email, password: formData.password };
        const response = await signin(payload);
        saveUser(response); 
        // Redirect happens in MainPage via useEffect

      } else {
        // --- SIGNUP ---
        if (!otpVerified) {
            setFormError("Please verify your email first.");
            setIsLoading(false); return;
        }
        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match");
            setIsLoading(false); return;
        }
        if (formData.role === 'CITIZEN' && !formData.wardNumber) {
            setFormError("Ward Number is required for Citizens");
            setIsLoading(false); return;
        }
        if (formData.role === 'OFFICER' && !formData.department) {
            setFormError("Department is required for Officers");
            setIsLoading(false); return;
        }

        const payload: SignupRequest = { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            role: formData.role,
            wardNumber: formData.role === 'CITIZEN' ? formData.wardNumber : undefined,
            department: formData.role === 'OFFICER' ? formData.department : undefined
        };

        await signup(payload);

        if (formData.role === 'OFFICER') {
            setFormSuccess("Account created! Please wait for Admin approval.");
        } else {
            setFormSuccess("Signup successful! Switching to login...");
        }
        
        // setTimeout(() => {
        //     setIsLogin(true);
        //     setFormSuccess('');
        //     resetOtpState();
        //     setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        //     setIsLoading(false);
        // }, 2000);

        // Navigate to /login route after success
        setTimeout(() => {
            navigate('/login'); 
        }, 2000);

      }
    } catch (err: any) {
        if(err.response && err.response.status === 403) {
            setFormError("Your account is still pending Admin approval.");
        } else {
            setFormError(err.message || "Authentication failed.");
        }
    } finally {
      // If success message is empty, it means we failed, so stop loading. - 18/12
      if (!formSuccess) setIsLoading(false);
    }
  };

  // Helper to determine what error/success to show (Merges Hook state + Local state)
  const displayError = formError || otpError;
  const displaySuccess = formSuccess || otpSuccess;

  return (
    <div className="auth-box">
      {/* TABS */}
      {!isForgotMode ? (
        <div className="auth-tabs">
            {/* <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => switchMode('LOGIN')}>Login</button>
            <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => switchMode('SIGNUP')}>Sign Up</button> */}
            <Link 
                to="/login" 
                className={`tab-btn ${isLogin ? 'active' : ''}`} 
                style={{textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center'}}
            >
                Login
            </Link>
            <Link 
                to="/signup" 
                className={`tab-btn ${!isLogin ? 'active' : ''}`} 
                style={{textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center'}}
            >
                Sign Up
            </Link>
        </div>
      ) : (
        <div className="auth-tabs">
             <button className="tab-btn active" style={{cursor: 'default'}}>Reset Password</button>
             <button className="tab-btn" onClick={() => setIsForgotMode(false)} style={{fontSize: '0.9rem'}}>← Back</button>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          
          {/* NAME */}
          {!isLogin && !isForgotMode && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" autoFocus value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
          )}

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
                <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} 
                    placeholder="name@example.com" required 
                    readOnly={ isOtpSent || otpVerified} 
                    style={otpVerified ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' } : {}}
                />
                
                { (!isLogin || isForgotMode) && !otpVerified && !isOtpSent && (
                    <button 
                        type="button" className="verify-btn" onClick={handleSendOtpClick}
                        disabled={!formData.email || isVerifyingEmail} 
                    >
                        {isVerifyingEmail ? "..." : "Verify"}
                    </button>
                )}
                {otpVerified && <span className="verified-badge">✅</span>}
            </div>
          </div>

          {/* OTP INPUT (Managed by Hook State) */}
          { (!isLogin || isForgotMode) && isOtpSent && (
              <div className="input-group animate-fade-in">
                  <label>Enter OTP</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                        type="text" name="otp" value={formData.otp} onChange={handleChange} 
                        placeholder="Enter 6-digit code" maxLength={6} required 
                        readOnly={otpVerified} 
                        style={otpVerified ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' } : {}}
                    />
                     {isVerifyingOtp && <span className="spinner">↻</span>}
                  </div>
                  {otpVerified && <small style={{color: '#22c55e', fontWeight: 500}}>Email Verified</small>}
              </div>
          )}

          {/* PASSWORD */}
          <div className="input-group" style={{ position: 'relative' }}>
            <label>{isForgotMode ? "New Password" : "Password"}</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" value={formData.password} onChange={handleChange} required 
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '45px', cursor: 'pointer', fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          { (!isLogin || isForgotMode) && (
            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
          )}

          {/* ROLE & DETAILS */}
          {!isLogin && !isForgotMode &&(
            <>
              <div className="input-group">
                <label>I am a:</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="CITIZEN">Citizen</option>
                  <option value="OFFICER">Govt. Officer</option>
                </select>
              </div>

              {formData.role === 'CITIZEN' && (
                <div className="input-group">
                  <label>Ward Number</label>
                  <input type="number" name="wardNumber" value={formData.wardNumber} onChange={handleChange} placeholder="e.g. 12" required={!isLogin && formData.role === 'CITIZEN'} />
                </div>
              )}

              {formData.role === 'OFFICER' && (
                <div className="input-group">
                  <label>Department</label>
                  <input list="departments" name="department" value={formData.department} onChange={handleChange} placeholder="Select or Type Department" required={!isLogin && formData.role === 'OFFICER'} />
                  <datalist id="departments">
                    <option value="Sanitary" /><option value="Electricity" /><option value="Roads & Transport" /><option value="Water Supply" />
                  </datalist>
                </div>
              )}
            </>
          )}

          {/* FEEDBACK MESSAGES (Combined) */}
          {displayError && (
            <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', border: '1px solid #fca5a5' }}>
              ⚠️ {displayError}
            </div>
          )}
          {displaySuccess && (
            <div style={{ padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', border: '1px solid #86efac' }}>
              ✅ {displaySuccess}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" className="submit-btn" disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading 
              ? "Processing..." 
              : (isForgotMode ? "Reset Password" : (isLogin ? "Login" : "Create Account"))
            }
          </button>
          
          {/* FORGOT LINK */}
          {isLogin && !isForgotMode && (
              <p className="forgot-pass" onClick={() => setIsForgotMode(true)} style={{cursor:'pointer'}}>
                  Forgot Password?
              </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;