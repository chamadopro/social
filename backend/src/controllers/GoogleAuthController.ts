import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { config } from '../config/database';
import { generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class GoogleAuthController {
  public async start(_req: Request, res: Response): Promise<void> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;

    if (!clientId) {
      res.status(501).json({ success: false, message: 'Google OAuth não configurado (GOOGLE_CLIENT_ID ausente).' });
      return;
    }

    const state = encodeURIComponent(Math.random().toString(36).slice(2));
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=online&include_granted_scopes=true&state=${state}`;
    res.redirect(authUrl);
  }

  public async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query as { code?: string };
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;

      if (!clientId || !clientSecret) {
        res.status(501).json({ success: false, message: 'Google OAuth não configurado (credenciais ausentes).' });
        return;
      }
      if (!code) {
        res.status(400).json({ success: false, message: 'Código OAuth ausente.' });
        return;
      }

      // Trocar code por access_token e id_token
      const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code,
        }) as any,
      });
      const tokenData = await tokenResp.json();
      if (!tokenResp.ok) {
        logger.error('Google token error:', tokenData);
        res.status(400).json({ success: false, message: 'Falha ao obter token do Google', data: tokenData });
        return;
      }

      const accessToken = tokenData.access_token;

      // Obter userinfo
      const userinfoResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await userinfoResp.json();
      if (!profile?.sub) {
        res.status(400).json({ success: false, message: 'Não foi possível obter o perfil do Google.' });
        return;
      }

      const email = profile.email as string | undefined;
      const name = (profile.name as string) || (profile.given_name as string) || 'Google User';
      const googleId = profile.sub as string;

      // Localizar/crear usuário por email quando disponível; fallback por google_id
      let usuario = await (config.prisma as any).usuario.findFirst({
        where: email ? { email } : { google_id: googleId },
      });

      if (!usuario) {
        usuario = await (config.prisma as any).usuario.create({
          data: {
            id: crypto.randomUUID(),
            nome: name,
            email: email || `google_${googleId}@social.local`,
            senha: await bcrypt.hash(crypto.randomUUID(), 10),
            tipo: 'CLIENTE',
            ativo: true,
            verificado: true,
            google_id: googleId,
          } as any,
        });
      } else {
        await (config.prisma as any).usuario.update({
          where: { id: usuario.id },
          data: { google_id: googleId },
        });
      }

      const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirect = `${frontendUrl}/auth/social-callback?provider=google&token=${encodeURIComponent(token)}`;
      res.redirect(redirect);
    } catch (error) {
      next(error);
    }
  }
}

export const googleAuthController = new GoogleAuthController();


