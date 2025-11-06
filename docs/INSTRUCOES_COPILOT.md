# 🧠 Instruções Oficiais ao Copilot / Cursor — Projeto **ChamadoPro**

## 📘 Contexto Geral

O **ChamadoPro** é uma plataforma completa de intermediação de serviços — um “marketplace inteligente” que conecta **clientes** a **prestadores de serviço** com CNPJ ou MEI, em formato de rede social.

O projeto está em **fase avançada de desenvolvimento**, com várias camadas já criadas e documentadas.
A arquitetura está consolidada, porém há **módulos em andamento e integrações pendentes**, descritos detalhadamente na pasta `Checklist/`.

---

## 🧩 Estrutura Geral do Projeto

```
ChamadoPro/
├── backend/               # API (Node.js + Express + Prisma + JWT)
├── frontend/              # Web App (Next.js + Tailwind + TypeScript + Zustand)
├── shared/                # Tipos e utilitários futuros compartilhados
├── Checklist/             # Controle de status, histórico e planejamento
├── docs/                  # Documentações técnicas e referenciais
└── README.md              # Resumo geral
```

📌 **O Copilot deve sempre considerar o conjunto `Checklist/ + docs/` como fonte de verdade.**

---

## 📍 Situação Atual do Sistema

O ChamadoPro já possui:

* Estrutura backend funcional com autenticação, rotas principais e comunicação via Prisma.
* Frontend com páginas dinâmicas estruturadas por módulos (`/src/app/`).
* Fluxo de cadastro, orçamentos, mensagens e notificações parcialmente integrados.
* Documentação técnica, funcional e de auditoria consolidada na pasta `docs/`.

Mas **ainda há tarefas abertas e pontos não implementados**, devidamente listados e descritos nos checklists.

---

## 🔎 Fontes que o Copilot deve analisar antes de qualquer desenvolvimento

### 🧾 Pasta `/Checklist`

Contém o **coração do acompanhamento funcional** do projeto:

| Arquivo                           | Função                                         |
| --------------------------------- | ---------------------------------------------- |
| `00_INDEX.md`                     | Índice geral das tarefas e tópicos ativos      |
| `00_STATUS_REAL_IMPLEMENTACAO.md` | Situação atual de cada módulo e componente     |
| `00_IMPLEMENTACOES_LOG.md`        | Histórico cronológico de implementações        |
| `00_HISTORICO_COPILOT.md`         | Registros e decisões tomadas junto à IA        |
| `00_CORRECOES_PENDENTES.md`       | Lista de correções e ajustes a executar        |
| `00_LEITURA_COMPLETA_RESUMO.md`   | Descrição detalhada do sistema atual           |
| `LEIA_MIM_PRIMEIRO.md`            | Instruções iniciais de entendimento do projeto |

### 📚 Pasta `/docs`

Contém a **base técnica e de referência**:

| Arquivo                                   | Conteúdo                                            |
| ----------------------------------------- | --------------------------------------------------- |
| `DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md` | Descrição detalhada da arquitetura, APIs e fluxos   |
| `AUDITORIA_FUNCIONALIDADES.md`            | Rastreamento e escopo de funcionalidades validadas  |
| `ESCALABILIDADE_E_PERFORMANCE.md`         | Diretrizes de performance e infraestrutura          |
| `SECURITY_GUIDELINES.md`                  | Regras de segurança e boas práticas de autenticação |
| `DEPLOYMENT_GUIDE.md`                     | Guia de implantação e configurações de ambiente     |
| `RESUMO_EXECUTIVO.md`                     | Visão macro do projeto para alinhamento de times    |

🔍 **O Copilot deve cruzar as informações entre essas duas pastas.**

* `Checklist/` = **O que foi feito e o que falta.**
* `docs/` = **Como o sistema deve funcionar e como foi projetado.**

---

## ⚙️ Fluxo de Ação para o Copilot

1. **Analisar** os documentos das pastas `Checklist/` e `docs/`.

   * Entender o estado atual do sistema.
   * Identificar pendências e prioridades.
2. **Evoluir o código** com base nas lacunas encontradas.
3. **Preservar toda estrutura existente.**
4. **Documentar tudo o que for alterado ou criado.**

---

## ⚠️ Regras Fundamentais

### 🚫 NUNCA FAZER

1. ❌ Apagar funções, classes, rotas, componentes ou migrações.
2. ❌ Modificar contratos de API ou assinaturas de funções existentes.
3. ❌ Reescrever código que já está funcional.
4. ❌ Corrigir erros apagando código — **presuma implementação pendente**.
5. ❌ Adicionar dependências externas sem justificativa ou documentação.

### ✅ SEMPRE FAZER

1. ✅ Criar implementações novas **sem quebrar o existente**.
2. ✅ Adicionar comentários `// TODO` e atualizar `00_IMPLEMENTACOES_LOG.md`.
3. ✅ Documentar cada modificação em `docs/` quando afetar estrutura, API ou arquitetura.
4. ✅ Testar backend e frontend localmente antes e depois de mudanças.
5. ✅ Validar se há relação entre a implementação e itens dos checklists.

---

## 🧱 Padrões Técnicos

### Frontend

* Next.js (App Router)
* TailwindCSS
* Zustand (estado global)
* Axios (`src/services/api.ts`)
* Estrutura modular: componentes, serviços, hooks, store e utils

### Backend

* Express + Prisma + JWT
* Estrutura Controller → Service → Prisma
* Middlewares reutilizáveis
* Logger centralizado (`src/utils/logger.ts`)
* Configurações de ambiente `.env`

---

## 🧠 Tratamento de Erros e TODOs

Se algo falhar:

1. Pesquise no `Checklist/00_STATUS_REAL_IMPLEMENTACAO.md` ou `00_CORRECOES_PENDENTES.md`.
2. Se o item não estiver pronto, adicione:

   ```ts
   // TODO[CP-20251101]: Implementar integração com módulo de pagamento escrow
   ```
3. Documente no log:

   ```
   [2025-11-01] Copilot identificou ausência de integração de escrow. Função placeholder criada.
   ```

---

## 🧾 Commits e Documentação

* `feat:` → nova funcionalidade
* `fix:` → correção
* `docs:` → atualização de documentação
* `refactor:` → refatoração não funcional
* `chore:` → ajustes de build/configuração

Sempre atualizar:

* `Checklist/00_IMPLEMENTACOES_LOG.md`
* `Checklist/00_STATUS_REAL_IMPLEMENTACAO.md`
* Qualquer documento técnico em `docs/` que se relacione com a mudança

---

## 🔐 Frase de Confirmação do Copilot

> “Estou ciente de que o projeto ChamadoPro está em fase de desenvolvimento.
> Antes de codar, lerei os documentos das pastas `Checklist/` e `docs/` para compreender o contexto, status e arquitetura.
> Não irei apagar nem substituir código existente.
> Tratarei erros como implementações pendentes, e toda alteração será incremental, segura e documentada.”

---

## 🎯 Objetivo do Copilot

* Compreender o **contexto funcional (Checklist)** e o **contexto técnico (docs)**.
* Evoluir o sistema conforme o **estágio atual**, sem quebra de compatibilidade.
* Contribuir com **novas implementações seguras**, **documentadas** e **auditáveis**.

---

**Autor:** Alexandro Trova
**Versão:** 1.3
**Documento:** `docs/INSTRUCOES_COPILOT.md`
**Data:** Novembro / 2025
