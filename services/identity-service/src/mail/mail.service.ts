import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private senderEmail: string;
  private appUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    const appUrl = this.configService.get<string>('APP_URL');

    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }

    if (!senderEmail) {
      throw new Error('BREVO_FROM_EMAIL environment variable is not set');
    }

    if (!appUrl) {
      throw new Error('APP_URL environment variable is not set');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    this.senderEmail = senderEmail;
    this.appUrl = appUrl;
  }

  async sendVerificationLink(email: string, token: string, type: 'register' | 'reset') {
    const linkMap = {
      register: {
        link: `${this.appUrl}/auth/verify-registration?token=${token}`,
        subject: 'Confirm Your Registration',
        title: 'Confirm Your Email',
        expiry: '24 hours',
      },
      reset: {
        link: `${this.appUrl}/auth/verify-reset?token=${token}`,
        subject: 'Reset Your Password',
        title: 'Password Reset',
        expiry: '15 minutes',
      },
    };

    const config = linkMap[type];

    const sendSmtpEmail = {
      to: [{ email }],
      sender: { name: 'noreply', email: this.senderEmail },
      subject: config.subject,
      htmlContent: `
        <h1>${config.title}</h1>
        <p>Click the link below to continue:</p>
        <a href="${config.link}">Verify</a>
        <p>Link expires in ${config.expiry}.</p>
      `,
    };

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }

  async sendPassword(email: string, password: string, type: 'register' | 'reset') {
    const titleMap = {
      register: 'Welcome!',
      reset: 'Password Reset Successful',
    };

    const sendSmtpEmail = {
      to: [{ email }],
      sender: { name: 'noreply', email: this.senderEmail },
      subject: `Your ${type === 'register' ? 'Registration' : 'New'} Password`,
      htmlContent: `
        <h1>${titleMap[type]}</h1>
        <p>Your password is:</p>
        <h2 style="font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${password}
        </h2>
        <p>You can now login with your email and this password.</p>
      `,
    };

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
