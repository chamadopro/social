import { Request, Response, NextFunction } from 'express';
import { documentValidator } from '../utils/documentValidator';
import { phoneValidator } from '../utils/phoneValidator';
import { cepValidator } from '../utils/cepValidator';
import { loginAttemptService } from '../services/LoginAttemptService';
import { badRequest } from '../middleware/errorHandler';

export class TestController {
  // Testar validação de documento
  public async testDocumentValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.body;

      if (!document) {
        throw badRequest('Documento é obrigatório');
      }

      const validation = documentValidator.validateDocument(document);

      res.status(200).json({
        success: true,
        data: {
          original: document,
          validation: validation
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Gerar CPF válido para testes
  public async generateValidCPF(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const cpf = documentValidator.generateValidCPF();
      const validation = documentValidator.validateCPF(cpf);

      res.status(200).json({
        success: true,
        data: {
          cpf: cpf,
          formatted: validation.formatted,
          validation: validation
        }
      });

    } catch (error) {
      _next(error);
    }
  }

  // Gerar CNPJ válido para testes
  public async generateValidCNPJ(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const cnpj = documentValidator.generateValidCNPJ();
      const validation = documentValidator.validateCNPJ(cnpj);

      res.status(200).json({
        success: true,
        data: {
          cnpj: cnpj,
          formatted: validation.formatted,
          validation: validation
        }
      });

    } catch (error) {
      _next(error);
    }
  }

  // Verificar status de tentativas de login
  public async checkLoginAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ip, email } = req.query;

      if (!ip) {
        throw badRequest('IP é obrigatório');
      }

      const ipCheck = await loginAttemptService.isIPBlocked(ip as string);
      const emailCheck = email ? await loginAttemptService.isEmailBlocked(email as string) : null;
      const stats = await loginAttemptService.getAttemptStats(ip as string, email as string);

      res.status(200).json({
        success: true,
        data: {
          ip: ip as string,
          email: email as string,
          ipCheck,
          emailCheck,
          stats
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Limpar tentativas de login (apenas para testes)
  public async clearLoginAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ip, email } = req.body;

      if (!ip) {
        throw badRequest('IP é obrigatório');
      }

      await loginAttemptService.clearAttempts(ip, email);

      res.status(200).json({
        success: true,
        message: 'Tentativas de login limpas com sucesso',
        data: { ip, email }
      });

    } catch (error) {
      next(error);
    }
  }

  // Executar limpeza manual
  public async runCleanup(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const [oldAttempts, expiredBlocks] = await Promise.all([
        loginAttemptService.cleanupOldAttempts(),
        loginAttemptService.cleanupExpiredBlocks()
      ]);

      res.status(200).json({
        success: true,
        message: 'Limpeza executada com sucesso',
        data: {
          oldAttemptsRemoved: oldAttempts,
          expiredBlocksRemoved: expiredBlocks
        }
      });

    } catch (error) {
      _next(error);
    }
  }

  // Testar validação de telefone
  public async testPhoneValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;

      if (!phone) {
        throw badRequest('Telefone é obrigatório');
      }

      const validation = phoneValidator.validate(phone);

      res.status(200).json({
        success: true,
        message: 'Validação de telefone executada',
        data: {
          phone,
          validation
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Gerar telefone válido para teste
  public async generatePhone(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { type, ddd } = _req.query;

      const phoneType = (type as string) === 'landline' ? 'landline' : 'mobile';
      const phoneDDD = ddd as string;

      const phone = phoneValidator.generate(phoneType, phoneDDD);

      res.status(200).json({
        success: true,
        message: 'Telefone gerado com sucesso',
        data: {
          phone,
          type: phoneType,
          ddd: phoneDDD || 'aleatório'
        }
      });

    } catch (error) {
      _next(error);
    }
  }

  // Testar validação de CEP
  public async testCEPValidation(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { cep } = _req.body;

      if (!cep) {
        throw badRequest('CEP é obrigatório');
      }

      const validation = await cepValidator.validate(cep);

      res.status(200).json({
        success: true,
        message: 'Validação de CEP executada',
        data: {
          cep,
          validation
        }
      });

    } catch (error) {
      _next(error);
    }
  }

  // Gerar CEP válido para teste
  public async generateCEP(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const cep = cepValidator.generate();

      res.status(200).json({
        success: true,
        message: 'CEP gerado com sucesso',
        data: {
          cep
        }
      });

    } catch (error) {
      _next(error);
    }
  }
}
