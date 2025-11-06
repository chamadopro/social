# 🧪 INSTRUÇÕES PARA EXECUTAR OS TESTES

## 📋 Pré-requisitos

1. **Backend rodando**: O servidor deve estar executando em `http://localhost:3001`
2. **Banco de dados**: PostgreSQL deve estar acessível e com as migrations aplicadas
3. **Dados de teste**: Usuários de teste do seed devem existir:
   - `cliente@exemplo.com` / senha: `123456789`
   - `prestador@exemplo.com` / senha: `123456789`

## 🚀 Como Executar

### Opção 1: Via npm script (Recomendado)

```bash
cd backend
npm run test:endpoints
```

### Opção 2: Via ts-node diretamente

```bash
cd backend
npx ts-node scripts/test-novos-endpoints.ts
```

## 📊 O que os testes validam

### ✅ Teste 1: Login
- Realiza login com credenciais de teste
- Valida se o token é retornado
- Armazena token para testes subsequentes

### ✅ Teste 2: GET /api/contratos/concluidos
- Busca contratos concluídos do cliente logado
- Valida resposta e estrutura de dados
- Verifica se permite usuários híbridos

### ✅ Teste 3: GET /api/posts/:id/curtidas
- Busca informações de curtidas de um post
- Valida se funciona sem autenticação (opcional)
- Verifica contador e status do usuário logado

### ✅ Teste 4: POST /api/posts/:id/curtir
- Testa toggle de curtida (curtir/descurtir)
- Valida mudança de estado antes/depois
- Verifica contador atualizado

### ✅ Teste 5: POST /api/posts (com servico_relacionado_id)
- Cria post Vitrine Cliente com serviço relacionado
- Valida associação de contrato concluído
- Verifica crédito automático de moeda
- Valida preenchimento automático de prestador

## 📝 Resultado Esperado

### ✅ Cenário de Sucesso

```
🚀 Iniciando testes dos novos endpoints...
============================================================

🧪 Testando: Login
   ✅ Login: PASSOU

🧪 Testando: GET /api/contratos/concluidos
   ✅ GET /api/contratos/concluidos: PASSOU

🧪 Testando: GET /api/posts/:id/curtidas
   ✅ GET /api/posts/:id/curtidas: PASSOU

🧪 Testando: POST /api/posts/:id/curtir
   ✅ POST /api/posts/:id/curtir: PASSOU

🧪 Testando: POST /api/posts (Vitrine Cliente com servico_relacionado_id)
   ✅ POST /api/posts (Vitrine Cliente com servico_relacionado_id): PASSOU

============================================================
📊 RESUMO DOS TESTES

✅ Login
✅ GET /api/contratos/concluidos
✅ GET /api/posts/:id/curtidas
✅ POST /api/posts/:id/curtir
✅ POST /api/posts (Vitrine Cliente com servico_relacionado_id)

============================================================
Total: 5 | Passou: 5 | Falhou: 0

🎉 Todos os testes passaram!
```

### ⚠️ Cenário com Problemas

Se algum teste falhar, o script mostrará:
- ❌ Nome do teste que falhou
- Mensagem de erro detalhada
- Resposta da API (se disponível)

## 🔧 Troubleshooting

### Erro: "Cannot connect to server"
- **Causa**: Backend não está rodando
- **Solução**: Execute `npm run dev` no diretório backend

### Erro: "Login falhou"
- **Causa**: Credenciais de teste não existem ou estão incorretas
- **Solução**: Execute `npm run db:seed` para criar usuários de teste

### Erro: "Nenhum post encontrado"
- **Causa**: Não há posts no banco de dados
- **Solução**: Crie posts manualmente ou via seed

### Erro: "Nenhum contrato concluído encontrado"
- **Causa**: Não há contratos concluídos no banco
- **Solução**: O teste será pulado automaticamente (não é erro crítico)

## 📌 Notas Importantes

1. **Teste 5 é opcional**: Se não houver contratos concluídos, o teste é pulado (não falha)
2. **Token válido**: O token gerado no login é usado em todos os testes subsequentes
3. **Dados de teste**: Os testes criam um post de teste que pode ser removido depois
4. **Backend deve estar rodando**: O script faz requisições HTTP reais ao servidor

## 🎯 Próximos Passos Após Testes

Se todos os testes passarem:
1. ✅ Backend está funcionando corretamente
2. ✅ Pode prosseguir com implementação do frontend
3. ✅ Endpoints estão prontos para uso

Se algum teste falhar:
1. Revisar logs do backend para identificar o problema
2. Verificar se as migrations foram aplicadas
3. Verificar se o Prisma Client foi regenerado

