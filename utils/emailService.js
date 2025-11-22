import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Common email styles with green palette (OKLCH colors) and Geist-like fonts
// Note: Using system fonts for better email client compatibility, with Geist-like characteristics
const getEmailStyles = () => {
    return `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: oklch(0.25 0 0);
                background-color: oklch(0.96 0.01 140);
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: oklch(1 0 0);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px oklch(0.85 0.02 140 / 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, oklch(0.55 0.15 160) 0%, oklch(0.45 0.12 150) 100%);
                color: oklch(1 0 0);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="mountain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0,100 L20,60 L40,80 L60,40 L80,70 L100,50 L100,100 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/></pattern></defs><rect width="100" height="100" fill="url(%23mountain)"/></svg>');
                opacity: 0.3;
            }
            
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 700;
                position: relative;
                z-index: 1;
            }
            
            .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.95;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .content p {
                margin: 0 0 16px 0;
                color: oklch(0.3 0.01 140);
                font-size: 16px;
            }
            
            .reference-box {
                background: linear-gradient(135deg, oklch(0.97 0.02 160) 0%, oklch(0.95 0.02 150) 100%);
                border-left: 4px solid oklch(0.55 0.15 160);
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
            }
            
            .reference-box strong {
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
                font-size: 18px;
                color: oklch(0.4 0.12 160);
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .reference-box small {
                display: block;
                margin-top: 8px;
                font-size: 13px;
                color: oklch(0.5 0.02 140);
            }
            
            .info-box {
                background-color: oklch(0.98 0.02 140);
                border-left: 4px solid oklch(0.65 0.15 155);
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
            }
            
            .info-box strong {
                color: oklch(0.4 0.12 150);
                font-size: 16px;
                display: block;
                margin-bottom: 12px;
            }
            
            .info-box ul {
                margin: 12px 0;
                padding-left: 24px;
            }
            
            .info-box li {
                margin: 8px 0;
                color: oklch(0.35 0.01 140);
            }
            
            .detail-box {
                background-color: oklch(0.98 0.01 140);
                border: 1px solid oklch(0.92 0.02 140);
                padding: 24px;
                margin: 24px 0;
                border-radius: 12px;
            }
            
            .detail-box h3 {
                margin: 0 0 20px 0;
                color: oklch(0.45 0.12 160);
                font-size: 20px;
                font-weight: 600;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid oklch(0.92 0.01 140);
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: oklch(0.45 0.02 140);
                font-size: 14px;
            }
            
            .detail-value {
                color: oklch(0.3 0.01 140);
                font-size: 15px;
                text-align: right;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
            }
            
            .total-box {
                background: linear-gradient(135deg, oklch(0.6 0.15 160) 0%, oklch(0.55 0.15 150) 100%);
                color: oklch(1 0 0);
                padding: 30px;
                margin: 24px 0;
                border-radius: 12px;
                text-align: center;
            }
            
            .total-box h2 {
                margin: 0 0 12px 0;
                font-size: 18px;
                font-weight: 600;
                opacity: 0.95;
            }
            
            .total-amount {
                font-size: 36px;
                font-weight: 700;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
                letter-spacing: 1px;
            }
            
            .total-box p {
                margin: 12px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .footer {
                background-color: oklch(0.97 0.01 140);
                padding: 24px 30px;
                text-align: center;
                color: oklch(0.5 0.01 140);
                font-size: 13px;
                border-top: 1px solid oklch(0.92 0.01 140);
            }
            
            .btn {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, oklch(0.55 0.15 160) 0%, oklch(0.5 0.15 150) 100%);
                color: oklch(1 0 0) !important;
                text-decoration: none;
                border-radius: 8px;
                margin: 24px 0;
                font-weight: 600;
                font-size: 15px;
                transition: all 0.3s ease;
            }
            
            .btn:hover {
                background: linear-gradient(135deg, oklch(0.5 0.15 160) 0%, oklch(0.45 0.15 150) 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px oklch(0.5 0.15 160 / 0.3);
            }
            
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 0;
                    border-radius: 0;
                }
                .header {
                    padding: 30px 20px;
                }
                .content {
                    padding: 30px 20px;
                }
            }
        </style>
    `;
};

// Helper functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

// Send booking received email (sent when booking is created)
export const sendBookingReceivedEmail = async (bookingData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Homestay Team"}" <${process.env.SMTP_USER}>`,
            to: bookingData.email,
            subject: `Booking Received - Reference: ${bookingData.bookingReference}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${getEmailStyles()}
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏔️ Booking Received</h1>
                            <p>We've received your booking request</p>
                        </div>
                        <div class="content">
                            <p>Dear ${bookingData.fullName},</p>
                            
                            <p>Thank you for choosing our homestay! We have successfully received your booking request and we're excited to host you.</p>
                            
                            <div class="reference-box">
                                <strong>Booking Reference:</strong> ${bookingData.bookingReference}
                                <small>Please keep this reference number for your records</small>
                            </div>
                            
                            <p>Our team is currently reviewing your booking. We will send you a booking confirmation shortly with all the details you need for your stay.</p>
                            
                            <div class="info-box">
                                <strong>What's Next?</strong>
                                <ul>
                                    <li>We're reviewing your booking request</li>
                                    <li>You'll receive a confirmation email shortly</li>
                                    <li>Check your email for updates on your booking status</li>
                                </ul>
                            </div>
                            
                            <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us using your booking reference number.</p>
                            
                            <p>We look forward to welcoming you soon!</p>
                            
                            <p>Best regards,<br>
                            <strong>DaraGhar Maila Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>For inquiries, please contact us directly with your booking reference: ${bookingData.bookingReference}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Dear ${bookingData.fullName},
                
                Thank you for choosing our homestay! We have successfully received your booking request and we're excited to host you.
                
                BOOKING REFERENCE: ${bookingData.bookingReference}
                Please keep this reference number for your records.
                
                Our team is currently reviewing your booking. We will send you a booking confirmation shortly with all the details you need for your stay.
                
                What's Next?
                - We're reviewing your booking request
                - You'll receive a confirmation email shortly
                - Check your email for updates on your booking status
                
                If you have any questions or need to make changes to your booking, please don't hesitate to contact us using your booking reference number.
                
                We look forward to welcoming you soon!
                
                Best regards,
                DaraGhar Maila Team
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Booking received email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending booking received email:", error);
        return { success: false, error: error.message };
    }
};

// Send booking confirmation email (sent when booking status is confirmed)
export const sendBookingConfirmationEmail = async (bookingData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Homestay Team"}" <${process.env.SMTP_USER}>`,
            to: bookingData.email,
            subject: `Booking Confirmed - Reference: ${bookingData.bookingReference}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${getEmailStyles()}
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Booking Confirmed!</h1>
                            <p>Your reservation is confirmed and ready</p>
                        </div>
                        <div class="content">
                            <p>Dear ${bookingData.fullName},</p>
                            
                            <p>We are delighted to confirm your booking! Your reservation has been successfully processed and confirmed. We can't wait to welcome you to our homestay.</p>
                            
                            <div class="reference-box">
                                <strong>Booking Reference:</strong> ${bookingData.bookingReference}
                                <small>Please keep this reference number for your records</small>
                            </div>
                            
                            <div class="detail-box">
                                <h3>Booking Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${bookingData.fullName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${bookingData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Phone:</span>
                                    <span class="detail-value">${bookingData.phoneNumber}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Accommodation:</span>
                                    <span class="detail-value">${bookingData.accommodationType}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-in Date:</span>
                                    <span class="detail-value">${formatDate(bookingData.checkInDate)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-out Date:</span>
                                    <span class="detail-value">${formatDate(bookingData.checkOutDate)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Nights:</span>
                                    <span class="detail-value">${bookingData.numberOfNights} night${bookingData.numberOfNights > 1 ? 's' : ''}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Guests:</span>
                                    <span class="detail-value">${bookingData.numberOfGuests} guest${bookingData.numberOfGuests > 1 ? 's' : ''}</span>
                                </div>
                                ${bookingData.specialRequests ? `
                                <div class="detail-row">
                                    <span class="detail-label">Special Requests:</span>
                                    <span class="detail-value">${bookingData.specialRequests}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="total-box">
                                <h2>Total Amount</h2>
                                <div class="total-amount">${formatCurrency(bookingData.totalAmount)}</div>
                                <p>
                                    ${formatCurrency(bookingData.accommodationPrice)} × ${bookingData.numberOfNights} night${bookingData.numberOfNights > 1 ? 's' : ''}
                                </p>
                            </div>
                            
                            <div class="info-box">
                                <strong>📋 Important Information:</strong>
                                <ul>
                                    <li>Please arrive at your scheduled check-in time</li>
                                    <li>If you need to modify or cancel your booking, please contact us at least 48 hours in advance</li>
                                    <li>For any questions or special requests, feel free to reach out to us</li>
                                    <li>Keep your booking reference number handy for any inquiries</li>
                                </ul>
                            </div>
                            
                            <p>We look forward to hosting you and ensuring you have a memorable stay in the mountains!</p>
                            
                            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
                            
                            <p>Best regards,<br>
                            <strong>DaraGhar Maila Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated confirmation email. Please do not reply to this message.</p>
                            <p>For inquiries, please contact us directly.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Dear ${bookingData.fullName},
                
                We are delighted to confirm your booking! Your reservation has been successfully processed and confirmed.
                
                BOOKING REFERENCE: ${bookingData.bookingReference}
                Please keep this reference number for your records.
                
                BOOKING DETAILS:
                Full Name: ${bookingData.fullName}
                Email: ${bookingData.email}
                Phone: ${bookingData.phoneNumber}
                Accommodation: ${bookingData.accommodationType}
                Check-in Date: ${formatDate(bookingData.checkInDate)}
                Check-out Date: ${formatDate(bookingData.checkOutDate)}
                Number of Nights: ${bookingData.numberOfNights} night${bookingData.numberOfNights > 1 ? 's' : ''}
                Number of Guests: ${bookingData.numberOfGuests} guest${bookingData.numberOfGuests > 1 ? 's' : ''}
                ${bookingData.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ''}
                
                TOTAL AMOUNT: ${formatCurrency(bookingData.totalAmount)}
                (${formatCurrency(bookingData.accommodationPrice)} × ${bookingData.numberOfNights} night${bookingData.numberOfNights > 1 ? 's' : ''})
                
                IMPORTANT INFORMATION:
                - Please arrive at your scheduled check-in time
                - If you need to modify or cancel your booking, please contact us at least 48 hours in advance
                - For any questions or special requests, feel free to reach out to us
                
                We look forward to hosting you and ensuring you have a memorable stay!
                
                Best regards,
                DaraGhar Maila Team
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Booking confirmation email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending booking confirmation email:", error);
        return { success: false, error: error.message };
    }
};

// Send contact confirmation email to user (updated design)
export const sendContactConfirmationEmail = async (contactData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Homestay Team"}" <${process.env.SMTP_USER}>`,
            to: contactData.email,
            subject: "Thank You for Contacting Us",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${getEmailStyles()}
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📬 Message Received</h1>
                            <p>Thank you for contacting us</p>
                        </div>
                        <div class="content">
                            <p>Dear ${contactData.fullName},</p>
                            
                            <p>We have received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.</p>
                            
                            <div class="detail-box">
                                <h3>Your Contact Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${contactData.fullName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${contactData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Subject:</span>
                                    <span class="detail-value">${contactData.subject}</span>
                                </div>
                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid oklch(0.92 0.01 140);">
                                    <strong style="color: oklch(0.45 0.02 140); font-size: 14px; display: block; margin-bottom: 8px;">Message:</strong>
                                    <p style="color: oklch(0.3 0.01 140); margin: 0;">${contactData.message}</p>
                                </div>
                            </div>
                            
                            <div class="info-box">
                                <strong>Response Time</strong>
                                <ul>
                                    <li>We typically respond within 24-48 hours</li>
                                    <li>If your inquiry is urgent, please feel free to contact us directly</li>
                                    <li>Check your email regularly for our response</li>
                                </ul>
                            </div>
                            
                            <p>Thank you for choosing us!</p>
                            
                            <p>Best regards,<br>
                            <strong>DaraGhar Maila Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated confirmation email. Please do not reply to this message.</p>
                            <p>For inquiries, please contact us directly.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Dear ${contactData.fullName},
                
                We have received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.
                
                Your Contact Details:
                Full Name: ${contactData.fullName}
                Email: ${contactData.email}
                Subject: ${contactData.subject}
                Message: ${contactData.message}
                
                We typically respond within 24-48 hours. If your inquiry is urgent, please feel free to contact us directly.
                
                Thank you for choosing us!
                
                Best regards,
                DaraGhar Maila Team
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Contact confirmation email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending contact confirmation email:", error);
        return { success: false, error: error.message };
    }
};

// Send notification email to admin (updated design)
export const sendAdminNotificationEmail = async (contactData) => {
    try {
        if (!process.env.ADMIN_EMAIL) {
            console.log("Admin email not configured, skipping admin notification");
            return { success: false, message: "Admin email not configured" };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "DaraGhar Maila Team"}" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Form Submission: ${contactData.subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${getEmailStyles()}
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📧 New Contact Submission</h1>
                            <p>Action required</p>
                        </div>
                        <div class="content">
                            <p>You have received a new contact form submission:</p>
                            
                            <div class="detail-box">
                                <h3>Contact Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${contactData.fullName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${contactData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Subject:</span>
                                    <span class="detail-value">${contactData.subject}</span>
                                </div>
                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid oklch(0.92 0.01 140);">
                                    <strong style="color: oklch(0.45 0.02 140); font-size: 14px; display: block; margin-bottom: 8px;">Message:</strong>
                                    <p style="color: oklch(0.3 0.01 140); margin: 0;">${contactData.message}</p>
                                </div>
                                <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid oklch(0.92 0.01 140);">
                                    <span class="detail-label">Submitted:</span>
                                    <span class="detail-value">${new Date(contactData.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Admin notification email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending admin notification email:", error);
        return { success: false, error: error.message };
    }
};

// Send booking notification email to admin (updated design)
export const sendAdminBookingNotificationEmail = async (bookingData) => {
    try {
        if (!process.env.ADMIN_EMAIL) {
            console.log("Admin email not configured, skipping admin notification");
            return { success: false, message: "Admin email not configured" };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "DaraGhar Maila Team"}" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Booking Received - Reference: ${bookingData.bookingReference}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${getEmailStyles()}
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏔️ New Booking Received</h1>
                            <p>Review required</p>
                        </div>
                        <div class="content">
                            <p>You have received a new booking request:</p>
                            
                            <div class="reference-box">
                                <strong>Booking Reference:</strong> ${bookingData.bookingReference}
                                <small>Status: ${bookingData.status}</small>
                            </div>
                            
                            <div class="detail-box">
                                <h3>Booking Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${bookingData.fullName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${bookingData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Phone:</span>
                                    <span class="detail-value">${bookingData.phoneNumber}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Accommodation:</span>
                                    <span class="detail-value">${bookingData.accommodationType}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-in Date:</span>
                                    <span class="detail-value">${formatDate(bookingData.checkInDate)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-out Date:</span>
                                    <span class="detail-value">${formatDate(bookingData.checkOutDate)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Nights:</span>
                                    <span class="detail-value">${bookingData.numberOfNights}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Guests:</span>
                                    <span class="detail-value">${bookingData.numberOfGuests}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Total Amount:</span>
                                    <span class="detail-value">${formatCurrency(bookingData.totalAmount)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value">${bookingData.status}</span>
                                </div>
                                ${bookingData.specialRequests ? `
                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid oklch(0.92 0.01 140);">
                                    <strong style="color: oklch(0.45 0.02 140); font-size: 14px; display: block; margin-bottom: 8px;">Special Requests:</strong>
                                    <p style="color: oklch(0.3 0.01 140); margin: 0;">${bookingData.specialRequests}</p>
                                </div>
                                ` : ''}
                                <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid oklch(0.92 0.01 140);">
                                    <span class="detail-label">Booking Date:</span>
                                    <span class="detail-value">${new Date(bookingData.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Admin booking notification email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending admin booking notification email:", error);
        return { success: false, error: error.message };
    }
};
