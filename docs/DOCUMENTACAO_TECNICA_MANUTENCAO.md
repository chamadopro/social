# ChamadoPro - Documentação Técnica de Manutenção

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Estrutura](#arquitetura-e-estrutura)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Backend - Detalhes Técnicos](#backend---detalhes-técnicos)
5. [Frontend - Detalhes Técnicos](#frontend---detalhes-técnicos)
6. [Banco de Dados](#banco-de-dados)
7. [APIs e Endpoints](#apis-e-endpoints)
8. [Segurança](#segurança)
9. [Deploy e Produção](#deploy-e-produção)
10. [Monitoramento e Logs](#monitoramento-e-logs)
11. [Troubleshooting](#troubleshooting)
12. [Manutenção Preventiva](#manutenção-preventiva)
13. [Atualizações e Versionamento](#atualizações-e-versionamento)

---

## 🎯 Visão Geral do Sistema

### Propósito
O ChamadoPro é uma plataforma de intermediação de serviços que conecta clientes e prestadores através de um sistema completo de orçamentos, chat moderado por IA, pagamentos seguros e avaliações.

### Tecnologias Principais
- **Backend**: Node.js + TypeScript + Express + PostgreSQL + Prisma
- **Frontend**: React + Next.js + TypeScript + Tailwind CSS
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis (opcional)
- **Storage**: AWS S3
- **Pagamentos**: Pagar.me
- **IA**: OpenAI API

---

## 🏗️ Arquitetura e Estrutura

### Estrutura de Diretórios
```
chamadopro/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── controllers/        # Controladores das rotas
│   │   ├── middleware/         # Middlewares customizados
│   │   ├── routes/            # Definição das rotas
│   │   ├── services/          # Lógica de negócio
│   │   ├── utils/             # Utilitários
│   │   ├── config/            # Configurações
│   │   └── server.ts          # Ponto de entrada
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco
│   │   └── migrations/        # Migrações
│   ├── package.json
│   └── .env.example
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── app/               # Páginas (App Router)
│   │   ├── components/        # Componentes React
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── services/          # Serviços da API
│   │   ├── types/             # Tipos TypeScript
│   │   └── utils/             # Utilitários
│   ├── package.json
│   └── next.config.ts
├── shared/                     # Código compartilhado
└── docs/                      # Documentação
```

### Fluxo de Dados
```
Frontend (React) → API (Express) → Banco (PostgreSQL)
     ↓                ↓
   Zustand         Prisma ORM
     ↓                ↓
  Services        Controllers
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+ (opcional)
- Git

### Variáveis de Ambiente

#### Backend (.env)
```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/chamadopro"

# JWT
JWT_SECRET="seu_segredo_jwt_muito_seguro"
JWT_EXPIRES_IN="7d"

# APIs Externas
PAGARME_API_KEY="sua_chave_api_pagarme"
OPENAI_API_KEY="sua_chave_api_openai"

# AWS S3
AWS_ACCESS_KEY_ID="seu_access_key_id_aws"
AWS_SECRET_ACCESS_KEY="seu_secret_access_key_aws"
AWS_REGION="sua_regiao_aws"
AWS_S3_BUCKET_NAME="seu_bucket_s3"

# Email
EMAIL_SERVICE_HOST="smtp.exemplo.com"
EMAIL_SERVICE_PORT="587"
EMAIL_SERVICE_USER="seu_email"
EMAIL_SERVICE_PASS="sua_senha_email"
EMAIL_FROM="noreply@chamadopro.com"

# Servidor
PORT=3001
NODE_ENV="development"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="sua_chave_google_maps"
NEXT_PUBLIC_AWS_S3_BUCKET="chamadopro-uploads"
NEXT_PUBLIC_APP_NAME="ChamadoPro"
```

### Instalação e Configuração

#### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas configurações
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

#### 2. Frontend
```bash
cd frontend
npm install
cp env.local.example .env.local
# Editar .env.local com suas configurações
npm run dev
```

#### 3. Banco de Dados
```bash
# Criar banco PostgreSQL
createdb chamadopro

# Executar migrações
cd backend
npx prisma migrate dev
npx prisma db seed
```

---

## 🔧 Backend - Detalhes Técnicos

### Estrutura de Controllers

#### AuthController
```typescript
// src/controllers/AuthController.ts
export const register = async (req: Request, res: Response) => {
  // Validação de dados
  // Hash da senha
  // Criação do usuário
  // Geração do token JWT
  // Envio de email de confirmação
}

export const login = async (req: Request, res: Response) => {
  // Verificação de credenciais
  // Geração do token JWT
  // Retorno dos dados do usuário
}
```

#### PostController
```typescript
// src/controllers/PostController.ts
export const createPost = async (req: Request, res: Response) => {
  // Validação dos dados
  // Upload de fotos para S3
  // Criação do post
  // Notificação para prestadores
}
```

### Middleware Customizados

#### Autenticação
```typescript
// src/middleware/auth.ts
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  // Verificação do token JWT
  // Validação do usuário
  // Adição do usuário ao request
}
```

#### Validação
```typescript
// src/middleware/validation.ts
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query') => {
  // Validação dos dados de entrada
  // Retorno de erros formatados
}
```

### Serviços

#### EmailService
```typescript
// src/services/EmailService.ts
export const sendEmail = async (options: EmailOptions) => {
  // Configuração do Nodemailer
  // Envio de emails transacionais
  // Logs de envio
}
```

#### PagarMeService
```typescript
// src/services/PagarMeService.ts
export const createPayment = async (data: PaymentData) => {
  // Integração com Pagar.me
  // Criação de transações
  // Webhooks de confirmação
}
```

---

## 🎨 Frontend - Detalhes Técnicos

### Estrutura de Componentes

#### Componentes UI Base
```
src/components/ui/
├── Button.tsx          # Botão reutilizável
├── Input.tsx           # Campo de entrada
├── Card.tsx            # Card de conteúdo
├── Modal.tsx           # Modal genérico
├── Loading.tsx         # Indicador de carregamento
├── Avatar.tsx          # Avatar de usuário
├── Badge.tsx           # Badge de status
└── Toast.tsx           # Sistema de notificações
```

#### Componentes de Funcionalidade
```
src/components/
├── PostCard.tsx        # Card de postagem
├── OrcamentoCard.tsx   # Card de orçamento
├── ContratoCard.tsx    # Card de contrato
├── Chat.tsx            # Componente de chat
├── CriarOrcamentoModal.tsx
└── ChatModal.tsx
```

### Gerenciamento de Estado (Zustand)

#### AuthStore
```typescript
// src/store/auth.ts
interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => void;
}
```

#### PostsStore
```typescript
// src/store/posts.ts
interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
}
```

### Serviços da API

#### ApiService
```typescript
// src/services/api.ts
class ApiService {
  private baseURL: string;
  private token: string | null;

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>
  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>>
}
```

---

## 🗄️ Banco de Dados

### Schema Prisma

#### Modelo Usuario
```prisma
model User {
  id              String      @id @default(uuid())
  tipo            String      // cliente | prestador | moderador | admin
  nome            String
  email           String      @unique
  senha           String
  telefone        String?
  cpf_cnpj        String?     @unique
  dataNascimento  DateTime?   @map("data_nascimento")
  endereco        Json?       // { cep, rua, numero, bairro, cidade, estado, latitude, longitude }
  fotoPerfil      String?     @map("foto_perfil")
  ativo           Boolean     @default(true)
  verificado      Boolean     @default(false)
  reputacao       Float       @default(0.0)
  dataCadastro    DateTime    @default(now()) @map("data_cadastro")
  
  // Relacionamentos
  posts           Post[]
  orcamentos      Orcamento[]
  contratos       Contrato[]
  pagamentos      Pagamento[]
  avaliacoes      Avaliacao[]
  disputas        Disputa[]
  logs            Log[]
}
```

### Migrações

#### Criar Nova Migração
```bash
cd backend
npx prisma migrate dev --name nome_da_migracao
```

#### Aplicar Migrações
```bash
npx prisma migrate deploy
```

#### Reset do Banco
```bash
npx prisma migrate reset
```

### Queries Comuns

#### Buscar Usuários com Relacionamentos
```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true,
    orcamentos: true,
    contratos: true,
  },
  where: {
    ativo: true,
  },
});
```

#### Buscar Posts com Filtros
```typescript
const posts = await prisma.post.findMany({
  where: {
    status: 'ATIVO',
    categoria: 'Encanamento',
    localizacao: {
      path: ['latitude'],
      gte: minLat,
      lte: maxLat,
    },
  },
  include: {
    usuario: true,
    orcamentos: true,
  },
  orderBy: {
    dataCriacao: 'desc',
  },
});
```

---

## 🌐 APIs e Endpoints

### Estrutura de Resposta Padrão
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
```

### Endpoints Principais

#### Autenticação
```
POST /api/auth/register          # Registro de usuário
POST /api/auth/login             # Login
POST /api/auth/logout            # Logout
GET  /api/auth/me                # Dados do usuário logado
POST /api/auth/forgot-password   # Recuperação de senha
PUT  /api/auth/reset-password    # Redefinir senha
```

#### Posts
```
GET    /api/posts                # Listar posts
POST   /api/posts                # Criar post
GET    /api/posts/:id            # Buscar post por ID
PUT    /api/posts/:id            # Atualizar post
DELETE /api/posts/:id            # Deletar post
POST   /api/posts/:id/curtir     # Curtir post
DELETE /api/posts/:id/curtir     # Descurtir post
POST   /api/posts/:id/comentar   # Comentar post
```

#### Orçamentos
```
GET    /api/orcamentos           # Listar orçamentos
POST   /api/orcamentos           # Criar orçamento
GET    /api/orcamentos/:id       # Buscar orçamento por ID
PUT    /api/orcamentos/:id       # Atualizar orçamento
DELETE /api/orcamentos/:id       # Deletar orçamento
POST   /api/orcamentos/:id/aceitar    # Aceitar orçamento
POST   /api/orcamentos/:id/recusar    # Recusar orçamento
POST   /api/orcamentos/:id/cancelar   # Cancelar orçamento
```

#### Chat
```
GET  /api/chat/messages          # Buscar mensagens
POST /api/chat/messages          # Enviar mensagem
POST /api/chat/mark-read         # Marcar como lida
GET  /api/chat/stats             # Estatísticas do chat
```

### Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

## 🔒 Segurança

### Autenticação JWT
```typescript
// Geração do token
const token = jwt.sign(
  { userId: user.id, userType: user.tipo },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// Verificação do token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Validação de Dados
```typescript
// Schema de validação
const userSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).required(),
});
```

### Rate Limiting
```typescript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições, tente novamente em 15 minutos.',
});
```

### CORS
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

### Headers de Segurança
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 🚀 Deploy e Produção

### Configuração de Produção

#### Backend
```bash
# Build
npm run build

# Start
npm start

# PM2
pm2 start dist/server.js --name chamadopro-api
```

#### Frontend
```bash
# Build
npm run build

# Start
npm start

# Vercel
vercel --prod
```

### Variáveis de Ambiente de Produção
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@prod-server:5432/chamadopro"
JWT_SECRET="secreto_super_seguro_producao"
REDIS_URL="redis://prod-redis:6379"
```

### Docker
```dockerfile
# Dockerfile Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name api.chamadopro.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoramento e Logs

### Sistema de Logs
```typescript
// src/utils/logger.ts
const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
};
```

### Logs de Banco de Dados
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Métricas Importantes
- Número de usuários ativos
- Posts criados por dia
- Orçamentos enviados/aceitos
- Tempo de resposta da API
- Erros 4xx/5xx
- Uso de memória/CPU

### Alertas Recomendados
- Taxa de erro > 5%
- Tempo de resposta > 2s
- Uso de CPU > 80%
- Uso de memória > 90%
- Falhas de conexão com banco

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U user -d chamadopro

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

#### 2. Erro de JWT
```bash
# Verificar se JWT_SECRET está definido
echo $JWT_SECRET

# Verificar formato do token
# Deve ser: Bearer <token>
```

#### 3. Erro de CORS
```typescript
// Verificar configuração CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

#### 4. Erro de Upload de Arquivos
```bash
# Verificar permissões do S3
aws s3 ls s3://seu-bucket

# Verificar variáveis AWS
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

### Logs de Debug
```typescript
// Habilitar logs detalhados
DEBUG=* npm run dev

// Logs específicos
DEBUG=prisma:query npm run dev
```

### Comandos Úteis
```bash
# Verificar status dos serviços
pm2 status
pm2 logs chamadopro-api

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar uso de recursos
htop
df -h
free -m
```

---

## 🛠️ Manutenção Preventiva

### Tarefas Diárias
- [ ] Verificar logs de erro
- [ ] Monitorar uso de recursos
- [ ] Verificar backups do banco
- [ ] Validar integridade dos dados

### Tarefas Semanais
- [ ] Atualizar dependências
- [ ] Verificar segurança
- [ ] Limpar logs antigos
- [ ] Otimizar queries lentas

### Tarefas Mensais
- [ ] Backup completo do sistema
- [ ] Análise de performance
- [ ] Atualização de segurança
- [ ] Revisão de código

### Backup do Banco
```bash
# Backup completo
pg_dump chamadopro > backup_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump --data-only chamadopro > data_backup_$(date +%Y%m%d).sql

# Restaurar backup
psql chamadopro < backup_20240101.sql
```

### Limpeza de Logs
```bash
# Limpar logs antigos (manter últimos 30 dias)
find /var/log -name "*.log" -mtime +30 -delete

# Rotacionar logs do PM2
pm2 install pm2-logrotate
```

---

## 🔄 Atualizações e Versionamento

### Estratégia de Versionamento
- **Major** (1.0.0): Mudanças incompatíveis
- **Minor** (0.1.0): Novas funcionalidades
- **Patch** (0.0.1): Correções de bugs

### Processo de Atualização

#### 1. Preparação
```bash
# Criar branch de atualização
git checkout -b update/v1.1.0

# Backup do banco
pg_dump chamadopro > backup_pre_update.sql
```

#### 2. Atualização do Código
```bash
# Atualizar dependências
npm update

# Executar migrações
npx prisma migrate deploy

# Testes
npm test
```

#### 3. Deploy
```bash
# Build
npm run build

# Restart serviços
pm2 restart chamadopro-api
pm2 restart chamadopro-frontend
```

### Rollback
```bash
# Voltar para versão anterior
git checkout v1.0.0

# Restaurar banco
psql chamadopro < backup_pre_update.sql

# Restart serviços
pm2 restart chamadopro-api
```

### Changelog
```markdown
## [1.1.0] - 2024-01-15
### Added
- Sistema de notificações push
- Upload de múltiplas fotos
- Filtros avançados de busca

### Changed
- Melhorado performance do chat
- Atualizado design dos cards

### Fixed
- Bug na validação de CPF
- Erro de timeout em uploads grandes
```

---

## 📞 Suporte e Contato

### Equipe de Desenvolvimento
- **Tech Lead**: [Nome] - [email]
- **Backend**: [Nome] - [email]
- **Frontend**: [Nome] - [email]
- **DevOps**: [Nome] - [email]

### Documentação Adicional
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Guidelines](./SECURITY_GUIDELINES.md)

### Ferramentas de Monitoramento
- **Logs**: PM2 + Winston
- **Métricas**: Prometheus + Grafana
- **Alertas**: Slack/Email
- **Uptime**: Pingdom

---

*Documentação atualizada em: Janeiro 2025*  
*Versão do Sistema: 3.2.0*  
*Próxima Revisão: Março 2025*

