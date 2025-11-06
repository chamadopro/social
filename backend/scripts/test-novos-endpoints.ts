/**
 * Script de teste para validar os novos endpoints implementados:
 * - GET /api/contratos/concluidos
 * - GET /api/posts/:id/curtidas
 * - POST /api/posts/:id/curtir
 * - POST /api/posts (criação com servico_relacionado_id)
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Garantir que a URL sempre termine com /api
const API_BASE_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/api$/, '') + '/api';
console.log(`[INFO] API_BASE_URL configurado como: ${API_BASE_URL}`);

// Função para limpar tentativas de login antes dos testes
async function clearLoginAttempts(): Promise<void> {
  try {
    const prisma = new PrismaClient();
    
    // Limpar todas as tentativas dos últimos 2 minutos (para garantir que rate limit seja resetado)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    // 1. Deletar tentativas recentes
    const deleted = await prisma.loginAttempt.deleteMany({
      where: {
        created_at: {
          gte: twoMinutesAgo
        }
      }
    });
    
    // 2. Limpar bloqueios expirados ou ativos
    const now = new Date();
    await prisma.loginAttempt.updateMany({
      where: {
        OR: [
          { blocked: true, block_expires: { lt: now } },
          { blocked: true, block_expires: { gte: twoMinutesAgo } }
        ]
      },
      data: {
        blocked: false,
        block_expires: null
      }
    });
    
    console.log(`[INFO] ${deleted.count} tentativas de login limpas`);
    await prisma.$disconnect();
  } catch (error) {
    console.warn('[WARN] Não foi possível limpar tentativas de login:', error);
    // Não falhar se não conseguir limpar
  }
}

// Helper para fazer requisições HTTP
async function httpRequest(method: string, url: string, options: any = {}): Promise<any> {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    // Verificar se a resposta tem conteúdo JSON
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const error: any = new Error(data.message || `HTTP ${response.status}`);
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  } catch (error: any) {
    // Se já tem response, re-lança
    if (error.response) {
      throw error;
    }
    // Caso contrário, é erro de rede/conexão
    throw new Error(`Erro ao fazer requisição para ${url}: ${error.message}`);
  }
}

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

class EndpointTester {
  private token: string | null = null;
  private userId: string | null = null;
  private results: TestResult[] = [];

  // Cores para output
  private colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };

  private log(message: string, color: string = this.colors.reset) {
    console.log(`${color}${message}${this.colors.reset}`);
  }

  private async test(name: string, testFn: () => Promise<any>): Promise<void> {
    try {
      this.log(`\n🧪 Testando: ${name}`, this.colors.cyan);
      const result = await testFn();
      this.results.push({
        name,
        success: true,
        message: '✅ Passou',
        data: result,
      });
      this.log(`   ✅ ${name}: PASSOU`, this.colors.green);
    } catch (error: any) {
      this.results.push({
        name,
        success: false,
        message: error.message || 'Erro desconhecido',
        error: error.response?.data || error.message,
      });
      this.log(`   ❌ ${name}: FALHOU`, this.colors.red);
      this.log(`   Erro: ${error.message}`, this.colors.red);
      if (error.response?.data) {
        this.log(`   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`, this.colors.yellow);
      }
    }
  }

  // Teste 1: Login
  private async testLogin(): Promise<void> {
    await this.test('Login', async () => {
      // Tentar com prestador primeiro (pode ter menos tentativas)
      const emails = ['prestador@exemplo.com', 'cliente@exemplo.com'];
      let response: any = null;
      let lastError: any = null;
      
      for (const email of emails) {
        try {
          const loginUrl = `${API_BASE_URL}/auth/login`;
          
          response = await httpRequest('POST', loginUrl, {
            body: {
              email: email,
              senha: '123456789',
            },
          });
          
          if (response.success && response.data?.token) {
            break; // Sucesso!
          }
        } catch (error: any) {
          lastError = error;
          // Se for rate limit, tentar próximo email após breve espera
          if (error.response?.status === 429) {
            this.log(`   ⚠️  Rate limit para ${email}, tentando próximo...`, this.colors.yellow);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      
      if (!response || !response.success || !response.data?.token) {
        throw lastError || new Error('Login falhou - nenhuma credencial funcionou');
      }

      if (!response.success || !response.data?.token) {
        throw new Error('Login falhou - token não retornado');
      }

      this.token = response.data.token;
      this.userId = response.data.user?.id;

      return {
        userId: this.userId,
        hasToken: !!this.token,
      };
    });
  }

  // Teste 2: GET /api/contratos/concluidos
  private async testGetContratosConcluidos(): Promise<void> {
    await this.test('GET /api/contratos/concluidos', async () => {
      if (!this.token) {
        throw new Error('Token não disponível - faça login primeiro');
      }

      const response = await httpRequest('GET', `${API_BASE_URL}/contratos/concluidos`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.success) {
        throw new Error('Resposta não indica sucesso');
      }

      return {
        contratos: response.data?.contratos || [],
        total: response.data?.contratos?.length || 0,
      };
    });
  }

  // Teste 3: GET /api/posts/:id/curtidas (buscar um post existente)
  private async testGetCurtidas(): Promise<void> {
    await this.test('GET /api/posts/:id/curtidas', async () => {
      // Buscar um post existente primeiro
      const headers: any = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const postsResponse = await httpRequest('GET', `${API_BASE_URL}/posts?limit=1`, { headers });

      if (!postsResponse.success || !postsResponse.data?.posts?.length) {
        throw new Error('Nenhum post encontrado para testar');
      }

      const postId = postsResponse.data.posts[0].id;

      const response = await httpRequest('GET', `${API_BASE_URL}/posts/${postId}/curtidas`, { headers });

      if (!response.success) {
        throw new Error('Resposta não indica sucesso');
      }

      return {
        postId,
        totalCurtidas: response.data?.totalCurtidas || 0,
        usuarioCurtiu: response.data?.usuarioCurtiu || false,
      };
    });
  }

  // Teste 4: POST /api/posts/:id/curtir
  private async testToggleCurtida(): Promise<void> {
    await this.test('POST /api/posts/:id/curtir', async () => {
      if (!this.token) {
        throw new Error('Token não disponível - faça login primeiro');
      }

      const headers = { Authorization: `Bearer ${this.token}` };

      // Buscar um post existente
      const postsResponse = await httpRequest('GET', `${API_BASE_URL}/posts?limit=1`, { headers });

      if (!postsResponse.success || !postsResponse.data?.posts?.length) {
        throw new Error('Nenhum post encontrado para testar');
      }

      const postId = postsResponse.data.posts[0].id;

      // Primeiro, verificar estado atual
      const beforeResponse = await httpRequest('GET', `${API_BASE_URL}/posts/${postId}/curtidas`, { headers });

      const curtidasAntes = beforeResponse.data?.totalCurtidas || 0;
      const jaCurtiuAntes = beforeResponse.data?.usuarioCurtiu || false;

      // Curtir/descurtir
      const toggleResponse = await httpRequest('POST', `${API_BASE_URL}/posts/${postId}/curtir`, {
        headers,
        body: {},
      });

      if (!toggleResponse.success) {
        throw new Error('Resposta não indica sucesso');
      }

      // Verificar estado depois
      const afterResponse = await httpRequest('GET', `${API_BASE_URL}/posts/${postId}/curtidas`, { headers });

      const curtidasDepois = afterResponse.data?.totalCurtidas || 0;
      const jaCurtiuDepois = afterResponse.data?.usuarioCurtiu || false;

      return {
        postId,
        acao: toggleResponse.data?.acao || 'desconhecida',
        antes: { total: curtidasAntes, usuarioCurtiu: jaCurtiuAntes },
        depois: { total: curtidasDepois, usuarioCurtiu: jaCurtiuDepois },
        toggleFuncionou: jaCurtiuDepois !== jaCurtiuAntes,
      };
    });
  }

  // Teste 5: POST /api/posts com servico_relacionado_id (se houver contratos)
  private async testCreatePostComServicoRelacionado(): Promise<void> {
    await this.test('POST /api/posts (Vitrine Cliente com servico_relacionado_id)', async () => {
      if (!this.token) {
        throw new Error('Token não disponível - faça login primeiro');
      }

      const headers = {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      };

      // Primeiro, verificar se há contratos concluídos
      const contratosResponse = await httpRequest('GET', `${API_BASE_URL}/contratos/concluidos`, { headers });

      if (!contratosResponse.success) {
        throw new Error('Não foi possível buscar contratos concluídos');
      }

      const contratos = contratosResponse.data?.contratos || [];

      if (!contratos || contratos.length === 0) {
        this.log('   ⚠️  Nenhum contrato concluído encontrado - pulando teste', this.colors.yellow);
        return {
          skipped: true,
          reason: 'Nenhum contrato concluído disponível',
        };
      }

      const contratoId = contratos[0].id;

      // Criar post Vitrine Cliente com servico_relacionado_id
      const postResponse = await httpRequest('POST', `${API_BASE_URL}/posts`, {
        headers,
        body: {
          tipo: 'VITRINE_CLIENTE',
          titulo: 'Teste de Vitrine Cliente',
          categoria: 'Teste',
          descricao: 'Post de teste criado pelo script de validação',
          servico_relacionado_id: contratoId,
        },
      });

      if (!postResponse.success) {
        throw new Error('Resposta não indica sucesso');
      }

      const post = postResponse.data?.post;
      const moedaCreditada = postResponse.data?.moedaCreditada || false;

      return {
        postId: post?.id,
        servico_relacionado_id: post?.servico_relacionado_id,
        prestador_recomendado_id: post?.prestador_recomendado_id,
        moedaCreditada,
        message: postResponse.message || 'Post criado',
      };
    });
  }

  // Executar todos os testes
  public async runAllTests(skipLogin: boolean = false, providedToken?: string): Promise<void> {
    this.log('\n🚀 Iniciando testes dos novos endpoints...\n', this.colors.blue);
    this.log('='.repeat(60), this.colors.blue);
    
    // Se um token foi fornecido, usar ele
    if (providedToken) {
      this.token = providedToken;
      this.log('✅ Token fornecido - pulando teste de login', this.colors.green);
    } else if (!skipLogin) {
      // Limpar tentativas de login antes de começar
      this.log('🧹 Limpando tentativas de login anteriores...', this.colors.yellow);
      await clearLoginAttempts();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo

      // Teste de login primeiro
      await this.testLogin();
    }

    try {
      // Se login falhou e não temos token, não continuar
      if (!this.token) {
        this.log('\n❌ Token não disponível - não é possível continuar os testes', this.colors.red);
        this.log('💡 Dica: Faça login manualmente e forneça o token via variável de ambiente:', this.colors.yellow);
        this.log('   TOKEN=seu_token_aqui npm run test:endpoints', this.colors.yellow);
        return;
      }

      // Executar testes dos novos endpoints
      await this.testGetContratosConcluidos();
      await this.testGetCurtidas();
      await this.testToggleCurtida();
      await this.testCreatePostComServicoRelacionado();

      // Resumo
      this.printSummary();
    } catch (error: any) {
      this.log(`\n❌ Erro fatal: ${error.message}`, this.colors.red);
    }
  }

  private printSummary(): void {
    this.log('\n' + '='.repeat(60), this.colors.blue);
    this.log('\n📊 RESUMO DOS TESTES\n', this.colors.blue);

    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const total = this.results.length;

    this.results.forEach((result) => {
      const icon = result.success ? '✅' : '❌';
      const color = result.success ? this.colors.green : this.colors.red;
      this.log(`${icon} ${result.name}`, color);
      if (!result.success) {
        this.log(`   ${result.message}`, this.colors.yellow);
      }
    });

    this.log('\n' + '='.repeat(60), this.colors.blue);
    this.log(`\nTotal: ${total} | Passou: ${passed} | Falhou: ${failed}`, this.colors.blue);

    if (failed === 0) {
      this.log('\n🎉 Todos os testes passaram!', this.colors.green);
    } else {
      this.log(`\n⚠️  ${failed} teste(s) falharam`, this.colors.yellow);
    }
  }
}

// Executar testes
const tester = new EndpointTester();

// Verificar se há um token fornecido via variável de ambiente
const providedToken = process.env.TOKEN;
const skipLogin = !!providedToken || process.env.SKIP_LOGIN === 'true';

if (providedToken) {
  console.log('[INFO] Token fornecido via variável de ambiente - pulando login');
}

tester.runAllTests(skipLogin, providedToken).catch((error: any) => {
  console.error('\n❌ Erro ao executar testes:', error.message);
  if (error.response?.status === 429 || error.message?.includes('Muitas tentativas')) {
    console.error('\n💡 Dica: O rate limiting está ativo.');
    console.error('   Opções:');
    console.error('   1. Aguarde 1 minuto e execute novamente');
    console.error('   2. Reinicie o servidor backend');
    console.error('   3. Faça login manualmente e forneça o token:');
    console.error('      TOKEN=seu_token_aqui npm run test:endpoints');
  }
  process.exit(1);
});

