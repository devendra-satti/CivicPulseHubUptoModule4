// PHASE - 3
package com.civicpulse.backend.services;


// import org.springframework.beans.factory.annotation.Autowired; - needed for actual mail feature
// import org.springframework.mail.SimpleMailMessage; - Essential While Sending the actual mail otps since we are using console otps
// import org.springframework.mail.javamail.JavaMailSender; - Essential for Actual OTPs
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // @Autowired -- needed for actual mail feature
    // private JavaMailSender mailSender; - Essential for Actual OTPs

    // Stores: "user@email.com" -> "123456"
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    
    // Stores: "user@email.com" -> true (only if verified)
    private final Set<String> verifiedEmails = ConcurrentHashMap.newKeySet();

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);
        verifiedEmails.remove(email); // Reset verification if they request a new one
        sendEmail(email, otp);
    }

    public boolean verifyOtp(String email, String inputOtp) {
        if (otpStorage.containsKey(email) && otpStorage.get(email).equals(inputOtp)) {
            otpStorage.remove(email); // Delete used OTP
            verifiedEmails.add(email); // Mark as verified
            return true;
        }
        return false;
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.contains(email);
    }
    
    public void clearVerification(String email) {
        verifiedEmails.remove(email);
    }

    //Actual Sending Logic
    // private void sendEmail(String to, String otp) {
    //     SimpleMailMessage message = new SimpleMailMessage();
    //     message.setTo(to);
    //     message.setSubject("CivicPulse Verification Code");
    //     message.setText("Your verification code is: " + otp);
    //     mailSender.send(message);
    // }

    //For Development Phase
    private void sendEmail(String to, String otp) {
        // --- DEV MODE: PRINT TO CONSOLE ---
        System.out.println("========================================");
        System.out.println(" DEVELOPMENT OTP FOR " + to + ": " + otp);
        System.out.println("========================================");
        // ----------------------------------

        // You can comment out the real email sending to save quota:
        // javaMailSender.send(message); 
    }
    // Optional: Clean up memory every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanup() {
        otpStorage.clear();
        verifiedEmails.clear();
    }
}