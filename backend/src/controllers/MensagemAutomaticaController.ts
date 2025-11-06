import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/database';
import { notFoundError, badRequest } from '../middleware/errorHandler';

export class MensagemAutomaticaController {
  // Obter todas as mensagens automáticas
  public async getAllMensagens(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mensagens = await config.prisma.$queryRaw<any[]>`
        SELECT *
        FROM mensagens_automaticas
        ORDER BY data_criacao DESC
      `;

      res.json({
        success: true,
        data: mensagens
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter mensagem automática por tipo
  public async getMensagemByTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;

      const rows = await config.prisma.$queryRaw<any[]>`
        SELECT * FROM mensagens_automaticas WHERE tipo = ${tipo} LIMIT 1
      `;
      const mensagem = rows[0];

      if (!mensagem) {
        throw notFoundError('Mensagem automática não encontrada');
      }

      res.json({
        success: true,
        data: mensagem
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter mensagem ativa por tipo
  public async getMensagemAtiva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;

      const rows = await config.prisma.$queryRaw<any[]>`
        SELECT * FROM mensagens_automaticas WHERE tipo = ${tipo} LIMIT 1
      `;
      const mensagem = rows[0];

      if (!mensagem || !mensagem.ativo) {
        res.json({
          success: true,
          data: null
        });
        return;
      }

      res.json({
        success: true,
        data: mensagem
      });
    } catch (error) {
      next(error);
    }
  }

  // Criar mensagem automática (admin only)
  public async createMensagem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo, titulo, conteudo } = req.body;
      const userId = req.user!.id;

      if (!tipo || !titulo || !conteudo) {
        throw badRequest('Tipo, título e conteúdo são obrigatórios');
      }

      const id = uuidv4();
      const created = await config.prisma.$queryRaw<any[]>`
        INSERT INTO mensagens_automaticas
          (id, tipo, titulo, conteudo, ativo, data_criacao, data_update, criado_por)
        VALUES
          (${id}, ${tipo}, ${titulo}, ${conteudo}, true, NOW(), NOW(), ${userId})
        RETURNING *
      `;
      const mensagem = created[0];

      res.json({
        success: true,
        data: mensagem
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar mensagem automática (admin only)
  public async updateMensagem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;
      const { titulo, conteudo, ativo } = req.body;
      const userId = req.user!.id;

      const rows = await config.prisma.$queryRaw<any[]>`
        SELECT * FROM mensagens_automaticas WHERE tipo = ${tipo} LIMIT 1
      `;
      const mensagem = rows[0];

      if (!mensagem) {
        throw notFoundError('Mensagem automática não encontrada');
      }

      const updated = await config.prisma.$queryRaw<any[]>`
        UPDATE mensagens_automaticas
        SET
          titulo = COALESCE(${titulo as any}, titulo),
          conteudo = COALESCE(${conteudo as any}, conteudo),
          ativo = COALESCE(${ativo as any}, ativo),
          atualizado_por = ${userId},
          data_update = NOW()
        WHERE tipo = ${tipo}
        RETURNING *
      `;

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar mensagem automática (admin only)
  public async deleteMensagem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;

      const rows = await config.prisma.$queryRaw<any[]>`
        SELECT * FROM mensagens_automaticas WHERE tipo = ${tipo} LIMIT 1
      `;
      const mensagem = rows[0];

      if (!mensagem) {
        throw notFoundError('Mensagem automática não encontrada');
      }

      await config.prisma.$executeRaw`
        DELETE FROM mensagens_automaticas WHERE tipo = ${tipo}
      `;

      res.json({
        success: true,
        message: 'Mensagem automática removida'
      });
    } catch (error) {
      next(error);
    }
  }
}
