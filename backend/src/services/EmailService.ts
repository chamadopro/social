import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpConfig = {
      host: process.env['SMTP_HOST'] || 'smtpout.secureserver.net',
      port: parseInt(process.env['SMTP_PORT'] || '465'),
      secure: true, // true para 465 (SSL/TLS)
      auth: {
        user: process.env['SMTP_USER'] || 'contato@chamadopro.com.br',
        pass: process.env['SMTP_PASS'] || '25DgoAlx*',
      },
      tls: {
        rejectUnauthorized: false // Necessário para GoDaddy
      }
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  // Enviar email de verificação
  public async sendVerificationEmail(email: string, nome: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/verify?token=${token}`;
      
      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'ChamadoPro <contato@chamadopro.com.br>',
        to: email,
        subject: 'ChamadoPro - Verifique seu email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificação de Email - ChamadoPro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ChamadoPro</h1>
                <p>Plataforma de Intermediação de Serviços</p>
              </div>
              <div class="content">
                <h2>Olá, ${nome}!</h2>
                <p>Bem-vindo ao ChamadoPro! Para ativar sua conta, clique no botão abaixo para verificar seu email:</p>
                <a href="${verificationUrl}" class="button">Verificar Email</a>
                <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>
                <p><strong>Importante:</strong> Este link expira em 24 horas.</p>
                <p>Se você não criou uma conta no ChamadoPro, ignore este email.</p>
              </div>
              <div class="footer">
                <p>© 2025 ChamadoPro - Teep Tecnologia</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de verificação enviado para: ${email}`);

    } catch (error) {
      logger.error('Erro ao enviar email de verificação:', error);
      throw error;
    }
  }

  // Enviar email de recuperação de senha
  public async sendPasswordResetEmail(email: string, nome: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env['FRONTEND_URL']}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'ChamadoPro <contato@chamadopro.com.br>',
        to: email,
        subject: 'ChamadoPro - Redefinir senha',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha - ChamadoPro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ChamadoPro</h1>
                <p>Redefinir Senha</p>
              </div>
              <div class="content">
                <h2>Olá, ${nome}!</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no ChamadoPro.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
                <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
                <p><strong>Importante:</strong> Este link expira em 1 hora.</p>
                <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
              </div>
              <div class="footer">
                <p>© 2025 ChamadoPro - Teep Tecnologia</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de recuperação de senha enviado para: ${email}`);

    } catch (error) {
      logger.error('Erro ao enviar email de recuperação de senha:', error);
      throw error;
    }
  }

  // Enviar notificação de novo orçamento
  public async sendNewOrcamentoNotification(email: string, nome: string, prestadorNome: string, valor: number): Promise<void> {
    try {
      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'ChamadoPro <contato@chamadopro.com.br>',
        to: email,
        subject: 'ChamadoPro - Novo orçamento recebido',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Novo Orçamento - ChamadoPro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ChamadoPro</h1>
                <p>Novo Orçamento Recebido</p>
              </div>
              <div class="content">
                <h2>Olá, ${nome}!</h2>
                <p>Você recebeu um novo orçamento de <strong>${prestadorNome}</strong> no valor de <strong>R$ ${valor.toFixed(2)}</strong>.</p>
                <p>Acesse sua conta para visualizar os detalhes e responder ao prestador.</p>
                <a href="${process.env['FRONTEND_URL']}/orcamentos" class="button">Ver Orçamentos</a>
                <p>Não perca esta oportunidade! Responda rapidamente para garantir o serviço.</p>
              </div>
              <div class="footer">
                <p>© 2025 ChamadoPro - Teep Tecnologia</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Notificação de novo orçamento enviada para: ${email}`);

    } catch (error) {
      logger.error('Erro ao enviar notificação de novo orçamento:', error);
      throw error;
    }
  }

  // Enviar notificação de orçamento aceito
  public async sendOrcamentoAcceptedNotification(email: string, nome: string, clienteNome: string, valor: number): Promise<void> {
    try {
      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'ChamadoPro <contato@chamadopro.com.br>',
        to: email,
        subject: 'ChamadoPro - Orçamento aceito!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orçamento Aceito - ChamadoPro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ChamadoPro</h1>
                <p>Orçamento Aceito!</p>
              </div>
              <div class="content">
                <h2>Parabéns, ${nome}!</h2>
                <p>Seu orçamento foi aceito por <strong>${clienteNome}</strong> no valor de <strong>R$ ${valor.toFixed(2)}</strong>.</p>
                <p>O contrato foi criado e o pagamento está em processo. Acesse sua conta para acompanhar o progresso.</p>
                <a href="${process.env['FRONTEND_URL']}/contratos" class="button">Ver Contrato</a>
                <p>Lembre-se de manter uma comunicação clara com o cliente e cumprir os prazos acordados.</p>
              </div>
              <div class="footer">
                <p>© 2025 ChamadoPro - Teep Tecnologia</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Notificação de orçamento aceito enviada para: ${email}`);

    } catch (error) {
      logger.error('Erro ao enviar notificação de orçamento aceito:', error);
      throw error;
    }
  }

  // Enviar notificação de serviço concluído
  public async sendServiceCompletedNotification(email: string, nome: string, prestadorNome: string, valor: number): Promise<void> {
    try {
      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'ChamadoPro <contato@chamadopro.com.br>',
        to: email,
        subject: 'ChamadoPro - Serviço concluído',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Serviço Concluído - ChamadoPro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ChamadoPro</h1>
                <p>Serviço Concluído</p>
              </div>
              <div class="content">
                <h2>Olá, ${nome}!</h2>
                <p>O serviço de <strong>${prestadorNome}</strong> foi concluído com sucesso!</p>
                <p>Valor do serviço: <strong>R$ ${valor.toFixed(2)}</strong></p>
                <p>Acesse sua conta para confirmar a entrega e liberar o pagamento.</p>
                <a href="${process.env['FRONTEND_URL']}/contratos" class="button">Confirmar Entrega</a>
                <p>Após a confirmação, o pagamento será liberado para o prestador em até 24 horas.</p>
              </div>
              <div class="footer">
                <p>© 2025 ChamadoPro - Teep Tecnologia</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Notificação de serviço concluído enviada para: ${email}`);

    } catch (error) {
      logger.error('Erro ao enviar notificação de serviço concluído:', error);
      throw error;
    }
  }

  // Verificar conexão com o servidor de email
  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('✅ Conexão com servidor de email verificada');
      return true;
    } catch (error) {
      logger.error('❌ Erro na conexão com servidor de email:', error);
      return false;
    }
  }
}

