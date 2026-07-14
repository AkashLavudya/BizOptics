import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  // ─── Transporter Factory ────────────────────────────────────────────────────

  private createTransporter(): Transporter {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // ─── Generic Send ────────────────────────────────────────────────────────────

  private async sendMail(options: MailOptions): Promise<void> {
    const from = this.configService.get<string>(
      'SMTP_FROM',
      '"BizOptics" <noreply@bizoptics.com>',
    );

    const mailOptions: SendMailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? this.stripHtml(options.html),
    };

    try {
      const transporter = this.createTransporter();
      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

    const html = this.buildLayout(
      'Please verify your BizOptics email address.',
      `
        <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a2e;">
          Welcome to BizOptics, ${firstName}! 👋
        </h1>
        <p style="margin:0 0 16px;font-size:16px;color:#4a4a6a;line-height:1.6;">
          Thanks for signing up. We're excited to help you discover and evaluate
          business opportunities powered by AI.
        </p>
        <p style="margin:0 0 24px;font-size:16px;color:#4a4a6a;line-height:1.6;">
          Please verify your email address to activate your account and get started.
        </p>
        ${this.buildButton('Verify Email Address', verificationUrl)}
        <p style="margin:24px 0 0;font-size:14px;color:#9898b0;line-height:1.6;">
          This link expires in <strong>24 hours</strong>. If you didn't create a
          BizOptics account, you can safely ignore this email.
        </p>
        <p style="margin:12px 0 0;font-size:13px;color:#9898b0;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${verificationUrl}" style="color:#6c63ff;word-break:break-all;">${verificationUrl}</a>
        </p>
      `,
    );

    await this.sendMail({
      to: email,
      subject: 'Verify your BizOptics email address',
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const html = this.buildLayout(
      'Reset your BizOptics password.',
      `
        <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a2e;">
          Password Reset Request 🔐
        </h1>
        <p style="margin:0 0 16px;font-size:16px;color:#4a4a6a;line-height:1.6;">
          Hi ${firstName},
        </p>
        <p style="margin:0 0 16px;font-size:16px;color:#4a4a6a;line-height:1.6;">
          We received a request to reset your BizOptics account password.
          Click the button below to choose a new password.
        </p>
        ${this.buildButton('Reset My Password', resetUrl, '#e05c5c')}
        <p style="margin:24px 0 0;font-size:14px;color:#9898b0;line-height:1.6;">
          This link expires in <strong>1 hour</strong>. If you did not request a
          password reset, please ignore this email — your password will remain unchanged.
        </p>
        <p style="margin:12px 0 0;font-size:13px;color:#9898b0;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color:#6c63ff;word-break:break-all;">${resetUrl}</a>
        </p>
        <div style="margin:32px 0 0;padding:16px;background:#fff8f0;border-left:4px solid #e05c5c;border-radius:4px;">
          <p style="margin:0;font-size:14px;color:#c0392b;">
            <strong>Security tip:</strong> BizOptics will never ask for your password via email or phone.
          </p>
        </div>
      `,
    );

    await this.sendMail({
      to: email,
      subject: 'Reset your BizOptics password',
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const dashboardUrl = `${appUrl}/dashboard`;

    const html = this.buildLayout(
      "Your BizOptics account is active — let's get started!",
      `
        <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a2e;">
          You're all set, ${firstName}! 🚀
        </h1>
        <p style="margin:0 0 16px;font-size:16px;color:#4a4a6a;line-height:1.6;">
          Your BizOptics account has been successfully verified. You now have access
          to our full suite of AI-powered business opportunity analysis tools.
        </p>
        <div style="margin:24px 0;padding:24px;background:#f6f5ff;border-radius:12px;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#1a1a2e;">
            What you can do with BizOptics:
          </h2>
          <ul style="margin:0;padding:0 0 0 20px;color:#4a4a6a;font-size:15px;line-height:2;">
            <li>🔍 <strong>Search &amp; discover</strong> local businesses via Google Places</li>
            <li>📊 <strong>Analyze websites</strong> for automation &amp; AI agent opportunities</li>
            <li>🤖 <strong>Generate AI recommendations</strong> tailored to each business</li>
            <li>💼 <strong>Track opportunities</strong> and manage your pipeline</li>
            <li>📈 <strong>Export reports</strong> to share with potential clients</li>
          </ul>
        </div>
        ${this.buildButton('Go to Dashboard', dashboardUrl)}
        <p style="margin:32px 0 0;font-size:14px;color:#9898b0;line-height:1.6;">
          Need help? Reply to this email or visit our
          <a href="${appUrl}/docs" style="color:#6c63ff;">documentation</a>.
          Our team is happy to assist.
        </p>
      `,
    );

    await this.sendMail({
      to: email,
      subject: '🎉 Welcome to BizOptics — your account is ready!',
      html,
    });
  }

  // ─── Template Helpers ────────────────────────────────────────────────────────

  private buildButton(
    label: string,
    url: string,
    color = '#6c63ff',
  ): string {
    return `
      <div style="text-align:center;margin:32px 0;">
        <a href="${url}"
           target="_blank"
           style="display:inline-block;padding:14px 36px;background:${color};color:#ffffff;
                  font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;
                  letter-spacing:0.3px;">
          ${label}
        </a>
      </div>
    `;
  }

  private buildLayout(preheader: string, body: string): string {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>BizOptics</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f9;font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Preheader -->
  <span style="display:none;font-size:1px;color:#f4f4f9;max-height:0;overflow:hidden;">
    ${preheader}
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff 0%,#3f3d8f 100%);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                      Biz<span style="color:#c8c5ff;">Optics</span>
                    </span>
                    <span style="display:inline-block;margin-left:8px;font-size:12px;
                                 color:#c8c5ff;vertical-align:middle;">
                      AI Business Intelligence
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e8e8f0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#9898b0;">
                BizOptics · AI-Powered Business Opportunity Platform
              </p>
              <p style="margin:0;font-size:12px;color:#b8b8cc;">
                © ${year} BizOptics. All rights reserved.
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#b8b8cc;">
                You're receiving this email because you signed up at BizOptics.
                <a href="{{unsubscribeUrl}}" style="color:#9898b0;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}
