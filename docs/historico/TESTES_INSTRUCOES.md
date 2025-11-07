# Instruções Gerais de Testes

## 1. Preparação do Ambiente
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- Verificar variáveis de ambiente (`backend/.env`, `frontend/.env.local`).
- Banco de dados atualizado: `npx prisma migrate deploy` e `npx prisma db seed` (se necessário).

## 2. Fluxos Prioritários
1. **Autenticação**
   - Login/Logout usuário final.
   - Login admin (`/admin/login`).
   - Recuperação de sessão (recarregar aplicações).
2. **Posts e Orçamentos**
   - Criar post (cliente) e listar no feed.
   - Enviar orçamento (prestador) e aceitar/recusar.
3. **Contratos e Pagamentos**
   - Gerar contrato a partir de orçamento aceito.
   - Marcar conclusão, verificar liberação financeira e histórico.
4. **Disputas e Auditoria**
   - Abrir disputa, resolver como admin e checar logs.
5. **Notificações**
   - Receber notificações (web e admin), confirmar contagem de não lidos.

## 3. Testes no Painel Admin
- Dashboard (dados carregados e sem flickering).
- Listagens (usuários, posts, financeiro, disputas) com filtros e paginação.
- Exportações CSV/JSON e retorno de relatórios avançados.
- Página de auditoria: filtros por ação/data/usuário.

## 4. Testes Mobile (mesma rede Wi-Fi)
- Configurar IP no `.env.local` (`NEXT_PUBLIC_API_URL=http://IP:3001/api`).
- Acessar pelo celular: `http://IP:3000`.
- Validar login, navegação e abertura de post.
- Documentos de apoio em `docs/infra/` (configuração, troubleshooting, APK).

## 5. Checklist Final
- [ ] Nenhum erro no console ou na API (ver `backend/logs/`).
- [ ] Estado sincronizado após refresh e troca de abas.
- [ ] Ações críticas protegidas (auth + feedback visual).
- [ ] Documentação atualizada com mudanças relevantes.
- [ ] Branch limpa (`git status` sem alterações pendentes) antes do merge.
