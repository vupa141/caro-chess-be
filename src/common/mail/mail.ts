import * as nodemailer from 'nodemailer';
require('dotenv').config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface MailData {
    from: string;
    to: string;
    subject: string;
    html: string;
}
export async function sendMail(data: MailData) {
    const sendResult = await transporter.sendMail({
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
    });
    return sendResult;
}

export function createAccountTemplate(verificationCode: string) {
    return `
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Caro Game Account</title>
            <style>
                body {
                    font-family: sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    border-radius: 5px;
                    background-color: #f2f2f2;
                }
                .header {
                    text-align: center;
                    background-color: #3b5998; /* Blue color */
                    color: #fff; /* Text color for header */
                    padding: 15px 0;
                }
                .content {
                    padding: 20px;
                }
                .verification-code {
                    font-weight: bold;
                    font-size: 18px;
                    text-align: center;
                    color: #007bff;
                }
                .cta {
                    text-align: center;
                    margin-top: 20px;
                }
                a {
                    text-decoration: none;
                    color: #fff;
                    padding: 10px 20px;
                    background-color: #43a047;
                    border-radius: 5px;
                }
            </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Caro Game!</h1>
                    </div>
                    <div class="content">
                        <p>Thank you for creating an account with Caro Game. To complete your registration and unlock all the features, please verify your email address.</p>
                        <p>Your verification code is:<strong> ${verificationCode} </strong></p>
                        <p>Please enter this code on the verification page to activate your account.</p>
                    </div>
                </div>
            </body>
        </html>
        `;
}

export function forgotPasswordTemplate(forgotPasswordCode: string) {
    return `
    <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password for [Company Name]</title>
        <style>
            body {
                font-family: sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                border-radius: 5px;
                background-color: #f2f2f2;
            }
            .header {
                text-align: center;
                background-color: #3b5998;
                color: #fff;
                padding: 15px 0;
            }
            .content {
                padding: 20px;
            }
            .cta {
                text-align: center;
                margin-top: 20px;
            }
            a {
                text-decoration: none;
                color: #fff;
                padding: 10px 20px;
                background-color: #43a047;
                border-radius: 5px;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
                <h1>Reset Password for Caro Game</h1>
            </div>
            <div class="content">
            <p>Hi there,</p>
            <p>We received a request to reset your password for your Caro Game account. If you didn't request this, please ignore this email.</p>
            <p>Your reset password code is:<strong> ${forgotPasswordCode} </strong></p>
            <p>Please enter this code on the forgot password page to reset your password.</p>
            <p>Thanks,</p>
            <p>The Caro Game Team</p>
            </div>
        </div>
        </body>
    </html>
    `;
}
