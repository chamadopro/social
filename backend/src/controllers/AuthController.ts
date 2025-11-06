import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/database';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticate 
} from '../middleware/auth';
import { 
  // CustomError, 
  badRequest, 
  unauthorized, 
  conflict, 
  notFoundError,
  internalServerError 
} from '../middleware/errorHandler';
import { logger, auditLog } from '../utils/logger';
import { EmailService } from '../services/EmailService';
import { passwordValidator } from '../utils/passwordValidator';
import { tokenService } from '../services/TokenService';
import { documentValidator } from '../utils/documentValidator';
import { phoneValidator } from '../utils/phoneValidator';
import { cepValidator } from '../utils/cepValidator';
import { loginAttemptService } from '../services/LoginAttemptService';

export class AuthController {
  // Registrar novo usuário
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Se o endereço veio como JSON string, fazer parse
      let endereco;
      if (typeof req.body.endereco === 'string') {
        endereco = JSON.parse(req.body.endereco);
      } else {
        endereco = req.body.endereco;
      }

      const { tipo, nome, email, senha, telefone, cpf_cnpj, data_nascimento, tipo_cliente, tipo_prestador, descricao_profissional } = req.body;
      
      // Processar arquivos enviados via multer
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      let foto_perfil: string | undefined = undefined;
      if (files?.foto_perfil && files.foto_perfil[0]) {
        foto_perfil = `/uploads/${files.foto_perfil[0].filename}`;
      }
      
      let documento_verificacao: string | undefined = undefined;
      if (files?.documento_verificacao && files.documento_verificacao[0]) {
        documento_verificacao = `/uploads/${files.documento_verificacao[0].filename}`;
      }

      // Verificar se email já existe
      const existingUser = await config.prisma.usuario.findFirst({
        where: { email }
      });

      if (existingUser) {
        throw conflict('Email já cadastrado');
      }

      // Verificar se CPF/CNPJ já existe
      const existingDocument = await config.prisma.usuario.findUnique({
        where: { cpf_cnpj }
      });

      if (existingDocument) {
        throw conflict('CPF/CNPJ já cadastrado');
      }

      // Validar CPF/CNPJ com validação robusta
      const documentValidation = documentValidator.validateDocument(cpf_cnpj);
      
      if (!documentValidation.isValid) {
        throw badRequest(`Documento inválido: ${documentValidation.errors.join(', ')}`);
      }
      
      // Usar o documento formatado
      const formattedDocument = documentValidation.formatted;

      // Validar senha
      const passwordValidation = passwordValidator.validate(senha);
      if (!passwordValidation.isValid) {
        throw badRequest(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
      }

      // Validar telefone
      const phoneValidation = phoneValidator.validate(telefone);
      if (!phoneValidation.isValid) {
        throw badRequest(`Telefone inválido: ${phoneValidation.errors.join(', ')}`);
      }

      // Validar CEP
      const cepValidation = await cepValidator.validate(endereco.cep);
      if (!cepValidation.isValid) {
        throw badRequest(`CEP inválido: ${cepValidation.errors.join(', ')}`);
      }

      // Criptografar senha
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      // Preparar dados extras
      const dadosExtras: any = {};
      
      if (tipo === 'CLIENTE' && tipo_cliente) {
        dadosExtras.tipo_cliente = tipo_cliente;
      }
      
      if (tipo === 'PRESTADOR') {
        dadosExtras.tipo_prestador = tipo_prestador || 'PF';
        dadosExtras.descricao_profissional = descricao_profissional || null;
        dadosExtras.documento_verificacao = documento_verificacao || null;
        dadosExtras.documento_verificado = false; // Aguarda aprovação
      }

      // Criar usuário
      const user = await config.prisma.usuario.create({
        data: {
          id: uuidv4(),
          tipo,
          nome,
          email,
          senha: hashedPassword,
          telefone: phoneValidation.formatted,
          cpf_cnpj: formattedDocument,
          data_nascimento: new Date(data_nascimento),
          endereco: {
            cep: cepValidation.formatted,
            rua: cepValidation.address?.logradouro || endereco.rua,
            numero: endereco.numero,
            complemento: endereco.complemento || '',
            bairro: cepValidation.address?.bairro || endereco.bairro,
            cidade: cepValidation.address?.localidade || endereco.cidade,
            estado: cepValidation.address?.uf || endereco.estado,
            latitude: endereco.latitude || 0,
            longitude: endereco.longitude || 0,
          },
          foto_perfil,
          ativo: true,
          verificado: false,
          reputacao: 0.0,
          pontos_penalidade: 0,
          ...dadosExtras,
        },
        select: {
          id: true,
          tipo: true,
          nome: true,
          email: true,
          telefone: true,
          cpf_cnpj: true,
          data_nascimento: true,
          endereco: true,
          foto_perfil: true,
          ativo: true,
          verificado: true,
          reputacao: true,
          data_cadastro: true,
        }
      });

      // Criar token de verificação e enviar email
      try {
        const verificationToken = await tokenService.createVerificationToken(
          user.id, 
          'VERIFICACAO_EMAIL', 
          24 // 24 horas
        );


        const emailService = new EmailService();
        await emailService.sendVerificationEmail(
          user.email, 
          user.nome, 
          verificationToken
        );

        logger.info(`Email de verificação enviado para: ${user.email}`);
      } catch (emailError) {
        logger.error('Erro ao enviar email de verificação:', emailError);
        // Não falhar o registro por erro de email, apenas logar
      }

      // Gerar tokens
      const token = generateToken({
        id: user.id,
        email: user.email,
        tipo: user.tipo
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        tipo: user.tipo
      });

      // Log de auditoria
      auditLog('USER_REGISTER', {
        userId: user.id,
        tipo: user.tipo,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso. Verifique seu email para ativar a conta.',
        data: {
          user: {
            id: user.id,
            tipo: user.tipo,
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            endereco: user.endereco,
            foto_perfil: user.foto_perfil,
            verificado: user.verificado,
            reputacao: user.reputacao,
            data_cadastro: user.data_cadastro,
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Login do usuário
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      // Buscar usuário primário pelo email (email não é único)
      const user = await config.prisma.usuario.findFirst({
        where: { email }
      });

      try {
        if (!user) {
          throw unauthorized('Credenciais inválidas');
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(senha, user.senha);
        if (!isValidPassword) {
          throw unauthorized('Credenciais inválidas');
        }

        // Verificar se conta está ativa
        if (!user.ativo) {
          throw unauthorized('Conta desativada');
        }

        // Verificar se email está verificado
        if (!user.verificado) {
          throw unauthorized('Email não verificado. Verifique sua caixa de entrada.');
        }
      } catch (error) {
        // Registrar tentativa falhada
        await loginAttemptService.recordAttempt(ip, email, false, userAgent);
        throw error;
      }

      // Detectar perfil híbrido baseado em perfis com o mesmo email
      let usuarioParaRetornar: any = user;
      let temClienteAssociado = false;
      try {
        if (user.tipo === 'PRESTADOR') {
          const cliente = await config.prisma.usuario.findFirst({ where: { email, tipo: 'CLIENTE' } });
          temClienteAssociado = !!cliente;
        } else if (user.tipo === 'CLIENTE') {
          const prestador = await config.prisma.usuario.findFirst({ where: { email, tipo: 'PRESTADOR' } });
          if (prestador) {
            // Priorizar login como Prestador quando houver ambos
            usuarioParaRetornar = prestador;
            temClienteAssociado = true;
          }
        }
      } catch (_) {
        // Ignorar falhas de detecção; seguir com user atual
      }

      // Gerar tokens
      const token = generateToken({
        id: usuarioParaRetornar.id,
        email: usuarioParaRetornar.email,
        tipo: usuarioParaRetornar.tipo
      });

      const refreshToken = generateRefreshToken({
        id: usuarioParaRetornar.id,
        email: usuarioParaRetornar.email,
        tipo: usuarioParaRetornar.tipo
      });

      // Log de auditoria
      auditLog('USER_LOGIN', {
        userId: usuarioParaRetornar.id,
        email: usuarioParaRetornar.email,
        tipo: usuarioParaRetornar.tipo,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: usuarioParaRetornar.id,
            tipo: usuarioParaRetornar.tipo,
            nome: usuarioParaRetornar.nome,
            email: usuarioParaRetornar.email,
            telefone: usuarioParaRetornar.telefone,
            endereco: usuarioParaRetornar.endereco,
            foto_perfil: usuarioParaRetornar.foto_perfil,
            verificado: usuarioParaRetornar.verificado,
            reputacao: usuarioParaRetornar.reputacao,
            data_cadastro: usuarioParaRetornar.data_cadastro,
            temClienteAssociado,
          },
          token,
          refreshToken
        }
      });

      // Registrar tentativa bem-sucedida
      await loginAttemptService.recordAttempt(ip, email, true, userAgent);

    } catch (error) {
      next(error);
    }
  }

  // Renovar token
  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Buscar usuário
      const user = await config.prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          tipo: true,
          ativo: true
        }
      });

      if (!user || !user.ativo) {
        throw unauthorized('Token inválido');
      }

      // Gerar novo token
      const newToken = generateToken({
        id: user.id,
        email: user.email,
        tipo: user.tipo
      });

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token: newToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Logout
  public async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Em uma implementação mais robusta, você poderia invalidar o token
      // adicionando-o a uma blacklist no Redis
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Esqueci minha senha
  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      // Buscar usuário
      const user = await config.prisma.usuario.findFirst({
        where: { email }
      });

      if (!user) {
        // Por segurança, não revelar se o email existe ou não
        res.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha'
        });
        return;
      }

      // Gerar token de reset
      const resetToken = generateToken({
        id: user.id,
        email: user.email,
        tipo: user.tipo
      });

      // Enviar email de reset
      try {
        const emailService = new EmailService();
        await emailService.sendPasswordResetEmail(user.email, user.nome, resetToken);
      } catch (error) {
        logger.error('Erro ao enviar email de reset:', error);
        throw internalServerError('Erro ao enviar email de recuperação');
      }

      res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha'
      });

    } catch (error) {
      next(error);
    }
  }

  // Redefinir senha
  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, senha } = req.body;

      // Verificar token
      const decoded = verifyRefreshToken(token);

      // Buscar usuário
      const user = await config.prisma.usuario.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      // Criptografar nova senha
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      // Atualizar senha
      await config.prisma.usuario.update({
        where: { id: user.id },
        data: { senha: hashedPassword }
      });

      // Log de auditoria
      auditLog('PASSWORD_RESET', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter perfil do usuário
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Usar middleware de autenticação
      authenticate(req, res, async () => {
        const user = await config.prisma.usuario.findUnique({
          where: { id: req.user!.id },
          select: {
            id: true,
            tipo: true,
            nome: true,
            email: true,
            telefone: true,
            cpf_cnpj: true,
            data_nascimento: true,
            endereco: true,
            foto_perfil: true,
            ativo: true,
            verificado: true,
            reputacao: true,
            pontos_penalidade: true,
            data_cadastro: true,
            data_atualizacao: true,
          }
        });

        if (!user) {
          throw notFoundError('Usuário não encontrado');
        }

        // Calcular flags híbridas com base em perfis do mesmo email
        let temClienteAssociado = false;
        try {
          if (user.tipo === 'PRESTADOR') {
            const cliente = await config.prisma.usuario.findFirst({ where: { email: user.email, tipo: 'CLIENTE' } });
            temClienteAssociado = !!cliente;
          } else if (user.tipo === 'CLIENTE') {
            const prestador = await config.prisma.usuario.findFirst({ where: { email: user.email, tipo: 'PRESTADOR' } });
            temClienteAssociado = !!prestador;
          }
        } catch (_) {}

        res.json({
          success: true,
          data: { user: { ...user, temClienteAssociado } }
        });
      });
    } catch (error) {
      next(error);
    }
  }



  // Verificar email
  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw badRequest('Token de verificação é obrigatório');
      }

      // Validar token
      const validation = await tokenService.validateToken(token, 'VERIFICACAO_EMAIL');
      
      if (!validation.isValid) {
        throw badRequest(validation.message || 'Token inválido');
      }

      // Marcar usuário como verificado
      const user = await config.prisma.usuario.update({
        where: { id: validation.usuarioId },
        data: { verificado: true },
        select: {
          id: true,
          nome: true,
          email: true,
          verificado: true
        }
      });

      // Marcar token como usado
      await tokenService.markTokenAsUsed(token);

      // Log de auditoria
      auditLog('VERIFICACAO_EMAIL', {
        email: user.email,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      }, user.id);

      res.status(200).json({
        success: true,
        message: 'Email verificado com sucesso!',
        data: {
          usuario: user
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Reenviar email de verificação
  public async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw badRequest('Email é obrigatório');
      }

      // Buscar usuário
      const user = await config.prisma.usuario.findFirst({
        where: { email },
        select: {
          id: true,
          nome: true,
          email: true,
          verificado: true,
          ativo: true
        }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      if (user.verificado) {
        throw badRequest('Email já foi verificado');
      }

      if (!user.ativo) {
        throw badRequest('Conta inativa');
      }

      // Verificar se já existe token ativo
      const hasActiveToken = await tokenService.hasActiveToken(user.id, 'VERIFICACAO_EMAIL');
      
      if (hasActiveToken) {
        throw badRequest('Email de verificação já foi enviado recentemente. Aguarde alguns minutos.');
      }

      // Criar novo token e enviar email
      const verificationToken = await tokenService.createVerificationToken(
        user.id, 
        'VERIFICACAO_EMAIL', 
        24 // 24 horas
      );

      const emailService = new EmailService();
      await emailService.sendVerificationEmail(
        user.email, 
        user.nome, 
        verificationToken
      );

      // Log de auditoria
      auditLog('REENVIO_VERIFICACAO_EMAIL', {
        email: user.email,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      }, user.id);

      res.status(200).json({
        success: true,
        message: 'Email de verificação reenviado com sucesso!'
      });

    } catch (error) {
      next(error);
    }
  }
}

