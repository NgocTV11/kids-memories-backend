import { Injectable, Logger } from '@nestjs/common';
import sgMail = require('@sendgrid/mail');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      this.logger.warn('⚠️  SENDGRID_API_KEY not set. Email sending will be disabled.');
      return;
    }

    sgMail.setApiKey(apiKey);
    this.logger.log('✅ SendGrid initialized');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetUrl: string,
    displayName?: string,
  ): Promise<boolean> {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      this.logger.warn(`Email service disabled. Reset URL for ${to}: ${resetUrl}`);
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || 'noreply@kidsmemories.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Kids Memories';

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: 'Đặt lại mật khẩu - Kids Memories',
      html: this.getPasswordResetTemplate(resetUrl, displayName),
      text: `
Xin chào ${displayName || ''},

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Kids Memories của mình.

Nhấp vào liên kết sau để đặt lại mật khẩu:
${resetUrl}

Liên kết này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Kids Memories Team
      `.trim(),
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Password reset email sent to: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      
      if (error.response) {
        this.logger.error('SendGrid error:', error.response.body);
      }
      
      return false;
    }
  }

  /**
   * HTML template for password reset email
   */
  private getPasswordResetTemplate(resetUrl: string, displayName?: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333;
      line-height: 1.6;
    }
    .content h2 {
      color: #667eea;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧒 Kids Memories</h1>
      <p>Ghi lại những khoảnh khắc đáng nhớ</p>
    </div>
    
    <div class="content">
      <h2>Xin chào ${displayName || 'bạn'}! 👋</h2>
      
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Kids Memories của bạn.</p>
      
      <p>Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Lưu ý bảo mật:</strong><br>
        • Liên kết này chỉ có hiệu lực trong <strong>1 giờ</strong><br>
        • Liên kết chỉ sử dụng được <strong>một lần</strong><br>
        • Không chia sẻ liên kết này với bất kỳ ai
      </div>
      
      <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">
        ${resetUrl}
      </p>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <strong>Bạn không yêu cầu đặt lại mật khẩu?</strong><br>
        Vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    
    <div class="footer">
      <p>
        Email này được gửi từ <strong>Kids Memories</strong><br>
        Ứng dụng lưu trữ kỷ niệm gia đình
      </p>
      <p>
        <a href="https://mihhan.vercel.app">Truy cập ứng dụng</a> • 
        <a href="#">Trợ giúp</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 15px;">
        © 2025 Kids Memories. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send welcome email (optional)
   */
  async sendWelcomeEmail(to: string, displayName: string): Promise<boolean> {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      this.logger.warn('Email service disabled');
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || 'noreply@kidsmemories.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Kids Memories';

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: 'Chào mừng đến với Kids Memories! 🎉',
      html: `
        <h1>Chào mừng ${displayName}!</h1>
        <p>Cảm ơn bạn đã đăng ký Kids Memories.</p>
        <p>Bắt đầu ghi lại những khoảnh khắc đáng nhớ của gia đình bạn ngay hôm nay!</p>
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Welcome email sent to: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${to}:`, error);
      return false;
    }
  }
}
