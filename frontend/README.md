# ChamadoPro Frontend

Interface web moderna e responsiva para a plataforma ChamadoPro - Intermediação de serviços.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados
- **Socket.io** - Comunicação em tempo real
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Lucide React** - Ícones

## 📱 Funcionalidades

### ✅ Implementadas
- ✅ Sistema de autenticação (login/registro)
- ✅ Feed de postagens com filtros
- ✅ Interface responsiva (desktop/mobile)
- ✅ Componentes reutilizáveis
- ✅ Gerenciamento de estado global
- ✅ Sistema de notificações
- ✅ Validação de formulários

### 🚧 Em Desenvolvimento
- 🚧 Sistema de orçamentos
- 🚧 Chat com IA moderadora
- 🚧 Upload de fotos
- 🚧 Sistema de avaliações
- 🚧 Pagamentos integrados
- 🚧 Painel administrativo

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
cp env.local.example .env.local
# Edite o arquivo .env.local com suas configurações
```

3. **Executar em desenvolvimento**
```bash
npm run dev
```

4. **Acessar a aplicação**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Home
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks
├── lib/                  # Configurações e utilitários
├── services/             # Serviços da API
├── store/                # Estado global (Zustand)
├── types/                # Tipos TypeScript
└── utils/                # Funções utilitárias
```

## 🎨 Componentes

### UI Components
- **Button** - Botões com variantes
- **Input** - Campos de entrada
- **Card** - Cards de conteúdo
- **Modal** - Modais e diálogos
- **Loading** - Indicadores de carregamento
- **Avatar** - Avatares de usuário
- **Badge** - Badges de status
- **Toast** - Notificações

### Layout Components
- **Layout** - Layout principal
- **Header** - Cabeçalho com navegação

### Feature Components
- **PostCard** - Card de postagem
- **AuthForm** - Formulários de autenticação

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🌐 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:

- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔐 Autenticação

O sistema de autenticação inclui:

- Login com email/senha
- Registro de clientes e prestadores
- Validação de formulários
- Gerenciamento de sessão
- Proteção de rotas

## 📊 Estado Global

Gerenciamento de estado com Zustand:

- **AuthStore** - Autenticação e usuário
- **PostsStore** - Posts e feed
- **OrcamentosStore** - Orçamentos
- **ContratosStore** - Contratos
- **ChatStore** - Chat e mensagens

## 🎯 Próximos Passos

1. **Sistema de Orçamentos**
   - Envio de orçamentos
   - Negociação de preços
   - Aceite/recusa de propostas

2. **Chat com IA Moderadora**
   - Chat em tempo real
   - Moderação automática
   - Upload de arquivos

3. **Sistema de Pagamentos**
   - Integração com Pagar.me
   - Escrow automático
   - Histórico de transações

4. **Upload de Fotos**
   - Upload para AWS S3
   - Compressão de imagens
   - Galeria de fotos

5. **Sistema de Avaliações**
   - Avaliação mútua
   - Sistema de reputação
   - Comentários e feedback

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por**: Teep Tecnologia  
**Versão**: 3.2.0  
**Data**: Janeiro 2025