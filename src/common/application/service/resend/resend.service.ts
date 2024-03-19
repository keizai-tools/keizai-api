import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly server: any;
  constructor() {
    this.server = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(toEmail: string, subject: string, html: string) {
    const { data, error } = await this.server.emails.send({
      from: process.env.RESEND_EMAIL_FROM,
      to: [toEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      throw error;
    }

    return data;
  }
}
