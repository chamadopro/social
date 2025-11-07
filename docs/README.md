# 📘 ChamadoPro – Documentação Técnica

> Este diretório centraliza toda a documentação do projeto. Os arquivos estão agrupados por tema para facilitar a navegação e evitar redundâncias.

## 🗂️ Estrutura

```
docs/
 ├─ admin/        → Painel administrativo e governança
 ├─ infra/        → Infraestrutura, deploy e mobilidade
 ├─ historico/    → Registros, guias de git e checklists
 └─ *.md          → Documentação técnica geral (API, manutenção, segurança, etc.)
```

### 📑 Documentos gerais
| Documento | Descrição |
|-----------|-----------|
| [DOCUMENTACAO_TECNICA_MANUTENCAO.md](./DOCUMENTACAO_TECNICA_MANUTENCAO.md) | Guia completo de manutenção, arquitetura e troubleshooting. |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Referência da API (endpoints, parâmetros, exemplos). |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deploy padrão de produção/infra. |
| [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) | Diretrizes de segurança e compliance. |
| [AUDITORIA_FUNCIONALIDADES.md](./AUDITORIA_FUNCIONALIDADES.md) | Auditoria funcional e cobertura atual. |
| [DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md](./DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md) | snapshot técnico consolidado (versão 3.2). |
| [DOCUMENTACAO_TECNICA_MANUTENCAO.md](./DOCUMENTACAO_TECNICA_MANUTENCAO.md#troubleshooting) | Seção de troubleshooting com incidentes recorrentes. |

### 🛡️ Diretório `admin/`
Documentação do painel administrativo:

| Arquivo | Descrição |
|---------|-----------|
| [PAINEL_ADMIN.md](./admin/PAINEL_ADMIN.md) | Visão funcional de cada página do admin. |
| [DEPLOY_QA.md](./admin/DEPLOY_QA.md) | Guia de deploy em ambiente de homologação (QA). |
| [ARQUITETURA_FASES.md](./admin/ARQUITETURA_FASES.md) | Roadmap faseado do painel administrativo. |
| [BANCO_COMPARTILHADO.md](./admin/BANCO_COMPARTILHADO.md) | Estratégia de banco compartilhado entre sistemas. |

### ⚙️ Diretório `infra/`
Guia de infraestrutura, mobile e banco de dados:

| Arquivo | Descrição |
|---------|-----------|
| [DOCUMENTACAO_BANCO_DADOS.md](./infra/DOCUMENTACAO_BANCO_DADOS.md) | Estrutura do banco e procedimentos. |
| [DOCUMENTACAO_SEGURANCA.md](./infra/DOCUMENTACAO_SEGURANCA.md) | Segurança aplicada em infraestrutura. |
| [CONFIGURACAO_MOBILE_DEV.md](./infra/CONFIGURACAO_MOBILE_DEV.md) | Configuração de ambiente mobile. |
| [GUIA_CONVERSAO_APK_CAPACITOR.md](./infra/GUIA_CONVERSAO_APK_CAPACITOR.md) | Conversão do app para APK (Capacitor). |
| [GUIA_TESTE_MOBILE_DEV.md](./infra/GUIA_TESTE_MOBILE_DEV.md) | Roteiro de testes mobile. |
| [TROUBLESHOOTING_MOBILE.md](./infra/TROUBLESHOOTING_MOBILE.md) | Problemas comuns em mobile e soluções. |

### 🧾 Diretório `historico/`
Registros, guias de Git e referências de evolução:

| Arquivo | Descrição |
|---------|-----------|
| [CHECKLISTS.md](./historico/CHECKLISTS.md) | Índice da pasta `Checklist/` com passo a passo histórico. |
| [CONFIGURAR_GIT_EMPRESA.md](./historico/CONFIGURAR_GIT_EMPRESA.md) | Configuração Git com e-mail corporativo. |
| [PRIMEIRO_COMMIT.md](./historico/PRIMEIRO_COMMIT.md) | Sequência do primeiro commit/deploy. |
| [INSTALAR_GIT.md](./historico/INSTALAR_GIT.md) | Instalação do Git em Windows. |
| [COMANDOS_GIT_COMPLETO.md](./historico/COMANDOS_GIT_COMPLETO.md) | Comandos básicos de Git. |
| [COMANDOS_GIT_MANUAL.md](./historico/COMANDOS_GIT_MANUAL.md) | Script manual de versionamento. |
| [GIT_APOS_INSTALACAO.md](./historico/GIT_APOS_INSTALACAO.md) | Passos e checklist após instalar o Git. |
| [GIT_EMAIL_EXPLICACAO.md](./historico/GIT_EMAIL_EXPLICACAO.md) | Boas práticas de e-mail nos commits. |
| [ONDE_EXECUTAR_GIT.md](./historico/ONDE_EXECUTAR_GIT.md) | Orientação de diretórios para comandos. |
| [CONFIGURAR_GIT.md](./historico/CONFIGURAR_GIT.md) | Guia genérico de configuração Git. |
| [GUIA_CONFIGURACAO_GIT.md](./historico/GUIA_CONFIGURACAO_GIT.md) | Guia ampliado (histórico). |
| [LIMPEZA_COMENTARIOS.md](./historico/LIMPEZA_COMENTARIOS.md) | Registro da limpeza de comentários realizada. |
| [REVISAO_IMPLEMENTACAO.md](./historico/REVISAO_IMPLEMENTACAO.md) | Resumo das últimas implementações. |
| [TESTES_INSTRUCOES.md](./historico/TESTES_INSTRUCOES.md) | Instruções gerais de testes. |

> 🔎 A pasta `Checklist/` na raiz continua intacta. Consulte `docs/historico/CHECKLISTS.md` para entender a ordem de leitura e status real de cada checklist.

## 🔄 Boas práticas de atualização

1. **Documente mudanças relevantes** junto ao pull request (preferencialmente no diretório correto).
2. **Evite duplicidade**: verifique se já existe um arquivo sobre o assunto antes de criar um novo.
3. **Atualize links** quando mover/renomear arquivos.
4. **Checklists**: registrar status em `Checklist/` e atualizar o índice (`docs/historico/CHECKLISTS.md`).

## 📬 Contato e suporte
- Issues e dúvidas: abrir issue no GitHub.
- Canal interno: Slack `#chamadopro-dev`.
- Email técnico: `dev@chamadopro.com.br`.

---

© 2025 ChamadoPro. Documentação reorganizada em 06/11/2025.
