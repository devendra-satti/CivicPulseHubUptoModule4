//Added newly 10-12-2025
package com.civicpulse.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;


@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    // Generic method to send HTML emails
    @Async  //To run this method using a thread(As a background process,passing control to next process in execution)
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            //MimeMessage for HTML content , In general we use SimpleMessage(plain text)
            MimeMessage message = mailSender.createMimeMessage(); 
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // helper.setTo(to);    - To Send Actual mail        
            helper.setTo("civicpulse.official@gmail.com");
            helper.setSubject(subject + to);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}