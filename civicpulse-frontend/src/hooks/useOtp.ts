import { useState, useRef } from 'react'; // <--- Import useRef
import { sendOtp, verifyOtpBackend } from '../api/auth';

export const useOtp = () => {
    // State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    
    // Feedback Strings
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    // Ref to prevent double-firing in Strict Mode
    const verificationInProgress = useRef(false);

    // Function 1: Send OTP
    const sendOtpHandler = async (email: string, type: 'SIGNUP' | 'RESET') => {
        setOtpError('');
        setOtpSuccess('');
        setIsVerifyingEmail(true);
        try {
            await sendOtp(email.trim(), type); // <--- Added trim() for safety
            setIsOtpSent(true);
            setOtpSuccess("OTP sent! Check your inbox.");
            setTimeout(() => setOtpSuccess(''), 3000);
        } catch (err: any) {
            setOtpError(err.message || "Failed to send OTP.");
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    // Function 2: Verify OTP
    const verifyOtpHandler = async (email: string, otp: string) => {
        // 1. Prevent double submission if already running
        if (verificationInProgress.current) return;
        
        verificationInProgress.current = true;
        setIsVerifyingOtp(true);
        
        // Clear previous messages
        setOtpError('');      
        setOtpSuccess('');   

        try {
            await verifyOtpBackend(email.trim(), otp.trim()); // <--- Added trim()
            setOtpVerified(true);
            setOtpSuccess("Email Verified Successfully! ✅");
        } catch (err: any) {
            setOtpVerified(false);
            // 2. Show the ACTUAL error from backend, not just "Invalid OTP"
            setOtpError(err.message || "Invalid OTP. Please check again.");
        } finally {
            setIsVerifyingOtp(false);
            verificationInProgress.current = false;
        }
    };

    // Function 3: Reset State
    const resetOtpState = () => {
        setIsOtpSent(false);
        setOtpVerified(false);
        setOtpError('');
        setOtpSuccess('');
        verificationInProgress.current = false;
    };

    return {
        isOtpSent,
        otpVerified,
        isVerifyingEmail,
        isVerifyingOtp,
        otpError,
        otpSuccess,
        sendOtpHandler,
        verifyOtpHandler,
        resetOtpState
    };
};