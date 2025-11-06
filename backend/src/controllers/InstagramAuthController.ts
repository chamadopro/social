import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { config } from '../config/database';
import { generateToken } from '../middleware/auth';
// Usar bcryptjs para evitar dependências nativas em Windows durante o dev
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class InstagramAuthController {
  public async start(_req: Request, res: Response): Promise<void> {
    const clientId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/instagram/callback`;

    if (!clientId) {
      res.status(501).json({ success: false, message: 'Instagram OAuth não configurado (INSTAGRAM_APP_ID ausente).' });
      return;
    }

    const state = encodeURIComponent(Math.random().toString(36).slice(2));
    const scope = 'user_profile';
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    res.redirect(authUrl);
  }

  public async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query as { code?: string };
      const clientId = process.env.INSTAGRAM_APP_ID;
      const clientSecret = process.env.INSTAGRAM_APP_SECRET;
      const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/instagram/callback`;

      if (!clientId || !clientSecret) {
        res.status(501).json({ success: false, message: 'Instagram OAuth não configurado (credenciais ausentes).' });
        return;
      }

      if (!code) {
        res.status(400).json({ success: false, message: 'Código OAuth ausente.' });
        return;
      }

      // Trocar code por access_token
      const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }) as any,
      });

      const tokenData = await tokenResp.json();
      if (!tokenResp.ok) {
        logger.error('Instagram token error:', tokenData);
        res.status(400).json({ success: false, message: 'Falha ao obter token do Instagram', data: tokenData });
        return;
      }

      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;

      // Buscar perfil básico
      const profileResp = await fetch(`https://graph.instagram.com/${userId}?fields=id,username,account_type&access_token=${accessToken}`);
      const profile = await profileResp.json();

      if (!profile?.id) {
        res.status(400).json({ success: false, message: 'Não foi possível obter o perfil do Instagram.' });
        return;
      }

      // Criar ou localizar usuário local pelo instagram_id (usando email sintético se necessário)
      const syntheticEmail = `ig_${profile.id}@social.local`;

      let usuario = await (config.prisma as any).usuario.findFirst({
        where: {
          OR: [
            { instagram_id: profile.id },
            { email: syntheticEmail },
          ] as any,
        },
      } as any);

      if (!usuario) {
        usuario = await (config.prisma as any).usuario.create({
          data: {
            id: crypto.randomUUID(),
            nome: profile.username || 'Instagram User',
            email: syntheticEmail,
            senha: await bcrypt.hash(crypto.randomUUID(), 10),
            tipo: 'CLIENTE',
            ativo: true,
            verificado: true,
            instagram_id: profile.id,
            instagram_username: profile.username,
          } as any,
        });
      } else {
        await (config.prisma as any).usuario.update({
          where: { id: usuario.id },
          data: { instagram_id: profile.id, instagram_username: profile.username },
        } as any);
      }

      const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });

      // Redirecionar de volta para o frontend com o token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirect = `${frontendUrl}/auth/social-callback?provider=instagram&token=${encodeURIComponent(token)}`;
      res.redirect(redirect);
    } catch (error) {
      next(error);
    }
  }
}

export const instagramAuthController = new InstagramAuthController();


