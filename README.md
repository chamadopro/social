# 💼 ChamadoPro  
### Plataforma Inteligente de Intermediação de Serviços  

📦 **Versão:** v3.2.1  
📅 **Atualizado em:** 31/10/2025  
🧑‍💻 **Responsável Técnico:** Alexandro Trova  
🏢 **Empresa:** ChamadoPro  

---

## 📑 Sumário
- [🚀 Visão Geral](#-visão-geral)
- [🧩 Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [⚙️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [▶️ Como Executar o Projeto](#️-como-executar-o-projeto)
- [🔐 Segurança e Acesso](#-segurança-e-acesso)
- [📈 Performance e Escalabilidade](#-performance-e-escalabilidade)
- [📘 Documentação Técnica](#-documentação-técnica)
- [🧾 Checklists e Histórico](#-checklists-e-histórico)
- [🧱 Próximos Passos](#-próximos-passos)
- [📩 Contato e Créditos](#-contato-e-créditos)

---

## 🚀 Visão Geral
O **ChamadoPro** é uma plataforma inteligente de **intermediação de serviços**, conectando clientes a prestadores qualificados.  
Desenvolvido com foco em **segurança, automação e experiência**, o sistema oferece:

- Cadastro completo de clientes e prestadores;  
- Sistema de orçamentos e propostas dinâmicas;  
- Pagamentos com **escrow (intermediação segura)**;  
- Contratos automáticos e histórico de atendimento;  
- Notificações em tempo real via WebSocket;  
- Painel administrativo e interface moderna.  

---

## 🧩 Funcionalidades Implementadas
- **Cadastro de Cliente e Prestador** com validação de CPF/CNPJ.  
- **Gestão de Chamados:** abertura, orçamentos e status.  
- **Taxa de Orçamento e Pagamentos Escrow** via integração segura.  
- **Criação Automática de Contratos** entre as partes.  
- **Sistema de Notificações WebSocket.**  
- **Logs e Auditoria Completa** (pasta `/Checklist/`).  
- **Controle de Histórico de Implementações e Pendências.**  

---

## ⚙️ Tecnologias Utilizadas

| Área | Tecnologia | Descrição |
|------|-------------|-----------|
| **Backend** | Node.js + Express + Prisma | API RESTful e ORM conectado ao PostgreSQL |
| **Frontend** | Next.js + React + Zustand | SPA moderna e responsiva |
| **Banco de Dados** | PostgreSQL | Armazenamento seguro e escalável |
| **Infraestrutura** | Docker + Docker Compose | Ambientes isolados e reprodutíveis |
| **Autenticação** | JWT (JSON Web Token) | Controle de acesso seguro |
| **Comunicação em Tempo Real** | WebSocket | Atualização imediata de notificações e status |
| **Logs e Auditoria** | Winston + Checklists | Monitoramento e rastreabilidade |
| **Controle de Versão** | Git + Snapshots internos | Histórico documental técnico |

---

## 📁 Estrutura do Projeto

```
chamadopro/
├─ backend/        # API Node.js (Express + Prisma)
├─ frontend/       # Frontend Next.js + Zustand
├─ docs/           # Documentação oficial (ver seção abaixo)
├─ Checklist/      # Checklists históricos preservados
└─ shared/         # Utilitários compartilhados (se aplicável)
```

- **Ambiente local**: cada pasta possui seu próprio `README` com instruções de setup.
- **Documentação detalhada** agora está centralizada em `docs/README.md`.

---

## ▶️ Como Executar o Projeto
Consulte as instruções de setup rápido no `frontend/README.md` e `backend/README.md` (ou nos respectivos `docs`):

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Variáveis**
   - `backend/.env`: configure `DATABASE_URL`, chaves JWT, integrações sociais.
   - `frontend/.env.local`: configure `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`.

---

## 🔐 Segurança e Acesso
- Autenticação JWT (usuários finais e administradores).
- Painel admin protegido (`/admin`) só para `tipo: 'ADMIN'`.
- Rate limiting ativado em produção (desativado no dev para facilitar testes).
- Diretrizes completas em `docs/SECURITY_GUIDELINES.md` e `docs/infra/DOCUMENTACAO_SEGURANCA.md`.

---

## 📈 Performance e Escalabilidade
- Estrutura Prisma/PostgreSQL otimizada com índices nas principais consultas.
- Notificações e dashboard usando cargas leves + cache em memória.
- Próximas melhorias planejadas em `docs/historico/REVISAO_IMPLEMENTACAO.md` e no backlog do painel admin.

---

## 📘 Documentação Técnica
- Índice completo: [`docs/README.md`](docs/README.md)
- Painel admin: [`docs/admin/PAINEL_ADMIN.md`](docs/admin/PAINEL_ADMIN.md)
- Deploy QA: [`docs/admin/DEPLOY_QA.md`](docs/admin/DEPLOY_QA.md)
- Banco compartilhado: [`docs/admin/BANCO_COMPARTILHADO.md`](docs/admin/BANCO_COMPARTILHADO.md)
- Infraestrutura & mobile: [`docs/infra/`](docs/infra/)

---

## 🧾 Checklists e Histórico
- Índice consolidado: [`docs/historico/CHECKLISTS.md`](docs/historico/CHECKLISTS.md)
- Guias Git/GitHub: [`docs/historico/`](docs/historico/)
- Pasta original `Checklist/` preservada (pode ser consultada conforme necessidade).

---

## 🧱 Próximos Passos
- Evoluir página `/admin/configuracoes` com ajustes dinâmicos.
-, Gráficos interativos nos relatórios avançados.
- Automatizar testes e pipeline de deploy.
- Detalhes e prioridades atualizados em `docs/historico/REVISAO_IMPLEMENTACAO.md`.

---

## 📩 Contato e Créditos
- **Responsável Técnico**: Alexandro Trova – `alex@chamadopro.com.br`
- **Suporte técnico**: `dev@chamadopro.com.br`
- **Canal interno**: Slack `#chamadopro-dev`

---

© 2025 ChamadoPro. Documentação reorganizada em 06/11/2025.
