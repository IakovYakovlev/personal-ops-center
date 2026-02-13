import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationLink(email: string, token: string, type: 'register' | 'reset') {
    const appUrl = this.configService.get('APP_URL');

    // TODO: Refactor to method that generates both link and email content based on type
    const linkMap = {
      register: {
        link: `${appUrl}/auth/verify-registration?token=${token}`,
        subject: 'Confirm Your Registration',
        title: 'Confirm Your Email',
        expiry: '24 hours',
      },
      reset: {
        link: `${appUrl}/auth/verify-reset?token=${token}`,
        subject: 'Reset Your Password',
        title: 'Password Reset',
        expiry: '15 minutes',
      },
    };

    const config = linkMap[type];

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: config.subject,
      html: `
        <h1>${config.title}</h1>
        <p>Click the link below to continue:</p>
        <a href="${config.link}">Verify</a>
        <p>Link expires in ${config.expiry}.</p>
      `,
    });
  }

  async sendPassword(email: string, password: string, type: 'register' | 'reset') {
    const titleMap = {
      register: 'Welcome!',
      reset: 'Password Reset Successful',
    };

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: `Your ${type === 'register' ? 'Registration' : 'New'} Password`,
      html: `
        <h1>${titleMap[type]}</h1>
        <p>Your password is:</p>
        <h2 style="font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${password}
        </h2>
        <p>You can now login with your email and this password.</p>
      `,
    });
  }
}
