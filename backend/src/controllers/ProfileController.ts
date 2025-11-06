import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

export class ProfileController {
  // Obter perfil do usuário
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const user = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          cpf_cnpj: true,
          data_nascimento: true,
          tipo: true,
          foto_perfil: true,
          endereco: true,
          data_cadastro: true,
          data_atualizacao: true
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
      return;

    } catch (error) {
      next(error);
    }
  }

  // Atualizar perfil do usuário
  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, phone, address } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se o usuário existe
      const existingUser = await config.prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Atualizar dados do usuário
      const updatedUser = await config.prisma.usuario.update({
        where: { id: userId },
        data: {
          nome: name || existingUser.nome,
          telefone: phone || existingUser.telefone,
          endereco: address || existingUser.endereco,
          data_atualizacao: new Date()
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          foto_perfil: true,
          data_atualizacao: true
        }
      });

      logger.info(`Perfil atualizado para usuário: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser
      });
      return;

    } catch (error) {
      next(error);
    }
  }

  // Atualizar foto de perfil
  public async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { profile_picture } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!profile_picture) {
        res.status(400).json({
          success: false,
          message: 'URL da foto de perfil é obrigatória'
        });
        return;
      }

      const updatedUser = await config.prisma.usuario.update({
        where: { id: userId },
        data: {
          foto_perfil: profile_picture,
          data_atualizacao: new Date()
        },
        select: {
          id: true,
          nome: true,
          foto_perfil: true,
          data_atualizacao: true
        }
      });

      logger.info(`Foto de perfil atualizada para usuário: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        data: updatedUser
      });
      return;

    } catch (error) {
      next(error);
    }
  }

  // Alterar senha
  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Nova senha deve ter pelo menos 8 caracteres'
        });
        return;
      }

      // Buscar usuário com senha
      const user = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          senha: true
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.senha);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
        return;
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha
      await config.prisma.usuario.update({
        where: { id: userId },
        data: {
          senha: hashedNewPassword,
          data_atualizacao: new Date()
        }
      });

      logger.info(`Senha alterada para usuário: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
      return;

    } catch (error) {
      next(error);
    }
  }

  // Obter histórico de atividades do usuário
  public async getActivityHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);

      // Buscar posts do usuário
      const posts = await config.prisma.post.findMany({
        where: { usuario_id: userId },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          status: true,
          data_criacao: true,
          data_atualizacao: true
        },
        orderBy: { data_criacao: 'desc' },
        skip,
        take: Number(limit)
      });

      // Buscar avaliações recebidas
      const ratings = await config.prisma.avaliacao.findMany({
        where: { avaliado_id: userId },
        select: {
          id: true,
          nota: true,
          comentario: true,
          data_criacao: true,
          avaliador: {
            select: {
              nome: true,
              foto_perfil: true
            }
          }
        },
        orderBy: { data_criacao: 'desc' },
        skip,
        take: Number(limit)
      });

      // Buscar contratos
      const contracts = await config.prisma.contrato.findMany({
        where: {
          OR: [
            { cliente_id: userId },
            { prestador_id: userId }
          ]
        },
        select: {
          id: true,
          status: true,
          valor: true,
          data_criacao: true,
          cliente: {
            select: {
              nome: true,
              foto_perfil: true
            }
          },
          prestador: {
            select: {
              nome: true,
              foto_perfil: true
            }
          }
        },
        orderBy: { data_criacao: 'desc' },
        skip,
        take: Number(limit)
      });

      const totalPosts = await config.prisma.post.count({
        where: { usuario_id: userId }
      });

      const totalRatings = await config.prisma.avaliacao.count({
        where: { avaliado_id: userId }
      });

      const totalContracts = await config.prisma.contrato.count({
        where: {
          OR: [
            { cliente_id: userId },
            { prestador_id: userId }
          ]
        }
      });

      res.status(200).json({
        success: true,
        data: {
          posts: {
            items: posts,
            total: totalPosts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalPosts / Number(limit))
          },
          ratings: {
            items: ratings,
            total: totalRatings,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalRatings / Number(limit))
          },
          contracts: {
            items: contracts,
            total: totalContracts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalContracts / Number(limit))
          }
        }
      });
      return;

    } catch (error) {
      next(error);
    }
  }

  // Deletar conta do usuário
  public async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { password } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Senha é obrigatória para deletar a conta'
        });
        return;
      }

      // Buscar usuário com senha
      const user = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          senha: true
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.senha);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Senha incorreta'
        });
        return;
      }

      // Deletar usuário (cascade delete irá deletar dados relacionados)
      await config.prisma.usuario.delete({
        where: { id: userId }
      });

      logger.warn(`Conta deletada para usuário: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Conta deletada com sucesso'
      });
      return;

    } catch (error) {
      next(error);
    }
  }
}