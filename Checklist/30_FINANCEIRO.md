# 💰 FINANCEIRO - CHAMADOPRO

## 📋 Descrição Geral

Página completa de gerenciamento financeiro para Prestadores e Clientes híbridos, incluindo saldos, contas bancárias, cartões, moedas ChamadoPro, movimentações e estatísticas.

---

## ✅ Status da Implementação

- [x] Estrutura base da página
- [x] Interface de saldos (disponível, pendente, moedas)
- [x] Sistema de tabs (Visão Geral, Movimentações, Contas, Cartões, Moedas)
- [x] Cadastro de contas bancárias
- [x] Cadastro de cartões (crédito/débito)
- [x] Sistema de moedas ChamadoPro
- [x] Histórico de movimentações com filtros
- [x] Estatísticas financeiras
- [ ] Integração com API backend
- [ ] Processamento de pagamentos
- [ ] Saque de valores

---

## 🎯 Funcionalidades Implementadas

### 1. **Saldo e Moedas**

#### Saldo Disponível
- Exibição do saldo disponível para saque
- Opção de ocultar/mostrar saldo (ícone de olho)
- Formatação em Real (R$)

#### Saldo Pendente
- Valores aguardando aprovação
- Indicação visual de status pendente

#### Moedas ChamadoPro
- Exibição do saldo atual de moedas
- Botão para comprar moedas
- Conversão: R$ 1,00 = 10 moedas

### 2. **Contas Bancárias**

#### Cadastro
- Banco
- Agência
- Conta
- Tipo (Conta Corrente / Poupança)
- Titular
- CPF/CNPJ

#### Funcionalidades
- Adicionar múltiplas contas
- Listar contas cadastradas
- Identificar conta principal

### 3. **Cartões**

#### Cadastro
- Número do cartão
- Nome do titular
- Validade (MM/AA)
- CVV
- Tipo (Crédito / Débito)
- Bandeira (opcional)

#### Funcionalidades
- Adicionar múltiplos cartões
- Mascaramento do número (últimos 4 dígitos)
- Identificar cartão principal

### 4. **Sistema de Moedas ChamadoPro**

#### Compra de Moedas
- Modal para inserir valor em R$
- Cálculo automático de moedas (1 real = 10 moedas)
- Confirmação antes da compra

#### Uso de Moedas
- Criar posts (evita taxas adicionais)
- Destacar serviços para maior visibilidade
- Incentivo para negociar dentro da plataforma

### 5. **Movimentações**

#### Tipos de Movimentação
- **ENTRADA**: Valores recebidos
- **SAIDA**: Valores pagos

#### Categorias
- `ORCAMENTO_APROVADO`: Orçamento aceito pelo cliente
- `ORCAMENTO_PENDENTE`: Orçamento aguardando aprovação
- `ORCAMENTO_REJEITADO`: Orçamento rejeitado
- `TAXA_PLATAFORMA`: Taxa de 5% cobrada pela plataforma
- `MOEDAS_USADAS`: Moedas convertidas em ações
- `MOEDAS_COMPRADAS`: Compra de moedas
- `SAQUE`: Saque para conta bancária
- `PAGAMENTO`: Pagamento realizado

#### Status
- `PENDENTE`: Aguardando processamento
- `APROVADO`: Aprovado e processado
- `REJEITADO`: Rejeitado
- `CANCELADO`: Cancelado

#### Filtros
- Por tipo (Entrada/Saída)
- Por status (Pendente/Aprovado/Rejeitado)
- Por data (futuro)
- Por categoria (futuro)

### 6. **Estatísticas**

#### Indicadores
- Total Recebido: Soma de todas as entradas aprovadas
- Total Pago: Soma de todas as saídas aprovadas
- Taxa da Plataforma: Total de taxas pagas (5% sobre transações)
- Orçamentos Aprovados: Contador
- Orçamentos Rejeitados: Contador
- Moedas Compradas: Total histórico
- Moedas Usadas: Total histórico

### 7. **Exportação**
- Botão para exportar extrato (implementação futura)
- Formato PDF/CSV (a definir)

---

## 📁 Arquivos Criados/Modificados

### Frontend
- ✅ `frontend/src/app/financeiro/page.tsx` - Página principal do Financeiro
- ✅ `frontend/src/components/layout/AuthenticatedLayout.tsx` - Adicionado item "Financeiro" no menu

### Backend (Pendente)
- ⏳ Endpoints para contas bancárias
- ⏳ Endpoints para cartões
- ⏳ Endpoints para movimentações
- ⏳ Endpoints para moedas
- ⏳ Endpoints para saldos

---

## 🔌 Integração com Backend (Pendente)

### Endpoints Necessários

#### 1. Contas Bancárias
```
GET    /api/financeiro/contas              - Listar contas
POST   /api/financeiro/contas              - Criar conta
PUT    /api/financeiro/contas/:id          - Atualizar conta
DELETE /api/financeiro/contas/:id          - Remover conta
```

#### 2. Cartões
```
GET    /api/financeiro/cartoes             - Listar cartões
POST   /api/financeiro/cartoes             - Criar cartão
PUT    /api/financeiro/cartoes/:id         - Atualizar cartão
DELETE /api/financeiro/cartoes/:id         - Remover cartão
```

#### 3. Saldos
```
GET    /api/financeiro/saldos              - Obter saldos disponível/pendente
GET    /api/financeiro/moedas              - Obter saldo de moedas
```

#### 4. Movimentações
```
GET    /api/financeiro/movimentacoes       - Listar movimentações
GET    /api/financeiro/movimentacoes/:id   - Detalhes da movimentação
POST   /api/financeiro/movimentacoes      - Criar movimentação manual (admin)
```

#### 5. Moedas
```
POST   /api/financeiro/moedas/comprar      - Comprar moedas
GET    /api/financeiro/moedas/historico    - Histórico de compras
```

#### 6. Estatísticas
```
GET    /api/financeiro/estatisticas        - Obter estatísticas financeiras
```

---

## 🎨 Interface e UX

### Tabs Principais

1. **Visão Geral**
   - Estatísticas resumidas
   - Resumo de moedas
   - Cards informativos

2. **Movimentações**
   - Lista completa de transações
   - Filtros por tipo e status
   - Detalhes de cada movimentação

3. **Contas Bancárias**
   - Lista de contas cadastradas
   - Formulário de cadastro
   - Identificação de conta principal

4. **Cartões**
   - Lista de cartões cadastrados
   - Formulário de cadastro
   - Identificação de cartão principal

5. **Moedas**
   - Saldo atual
   - Informações sobre uso
   - Botão de compra

### Componentes Visuais

- **Cards de Saldo**: Com opção de ocultar/mostrar
- **Badges**: Status de movimentações
- **Ícones**: Tipos de movimentação (setas para cima/baixo)
- **Modal**: Compra de moedas
- **Formulários**: Cadastro de contas e cartões

---

## 🔒 Segurança e Validações

### Validações Frontend (Implementadas)
- [x] Campos obrigatórios
- [x] Formato de CPF/CNPJ
- [x] Validação de valor mínimo para compra de moedas
- [x] Mascaramento de dados sensíveis (CVV, número do cartão)

### Validações Backend (Pendente)
- [ ] Verificação de CPF/CNPJ válido
- [ ] Validação de dados bancários
- [ ] Verificação de cartão válido (Luhn)
- [ ] Criptografia de dados sensíveis
- [ ] Rate limiting para transações

---

## 💡 Regras de Negócio

### Taxa da Plataforma
- **5%** sobre todas as transações aprovadas
- Cobrada automaticamente ao processar pagamento
- Registrada como movimentação de saída

### Moedas ChamadoPro
- **Conversão**: R$ 1,00 = 10 moedas
- **Uso**: 
  - Criar posts (evita taxas)
  - Destacar serviços
  - Impulsionar visibilidade
- **Incentivo**: Negociar dentro da plataforma garante proteção para cliente e prestador

### Orçamentos
- **Aprovado**: Valor entra como "Saldo Pendente" até confirmação
- **Rejeitado**: Movimentação registrada como rejeitada
- **Processado**: Valor transferido para "Saldo Disponível"

### Garantias da Plataforma
- Cliente e prestador têm garantias quando negociam dentro da plataforma
- Pagamentos processados via escrow (depósito garantido)
- Disputas podem ser abertas em caso de problemas

---

## 📊 Estrutura de Dados

### ContaBancaria
```typescript
interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'CORRENTE' | 'POUPANCA';
  titular: string;
  cpf_cnpj: string;
  principal?: boolean;
  data_criacao: string;
}
```

### Cartao
```typescript
interface Cartao {
  id: string;
  numero: string; // Criptografado no backend
  nome_titular: string;
  validade: string;
  cvv: string; // Criptografado no backend
  tipo: 'CREDITO' | 'DEBITO';
  bandeira?: string;
  principal?: boolean;
  data_criacao: string;
}
```

### Movimentacao
```typescript
interface Movimentacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  descricao: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
  data: string;
  categoria: string;
  referencia_id?: string; // ID do orçamento/contrato relacionado
  usuario_id: string;
}
```

---

## 🚀 Próximos Passos

1. **Integração Backend**
   - Criar controllers para financeiro
   - Implementar endpoints de API
   - Conectar com gateway de pagamento

2. **Segurança**
   - Implementar criptografia de dados sensíveis
   - Validar dados bancários
   - Rate limiting

3. **Funcionalidades Adicionais**
   - Saque para conta bancária
   - Transferência entre usuários
   - Histórico detalhado com filtros avançados
   - Gráficos e relatórios
   - Exportação de extrato (PDF/CSV)

4. **Notificações**
   - Notificar ao receber pagamento
   - Notificar quando saldo ficar disponível
   - Notificar sobre movimentações importantes

---

## 📝 Notas Técnicas

### Dados Mockados
Atualmente a página usa dados mockados. Substituir por chamadas reais à API quando disponível.

### Formatação
- Valores monetários: `formatCurrency()` usando Intl.NumberFormat
- Datas: `formatDate()` formatando em pt-BR
- Moedas: Formatação numérica simples

### Responsividade
- Layout adaptado para mobile
- Cards empilham em telas pequenas
- Formulários responsivos

---

## ✅ Checklist de Implementação

- [x] Estrutura HTML/JSX
- [x] Componentes UI
- [x] Estados e hooks
- [x] Formulários de cadastro
- [x] Filtros e busca
- [x] Modal de compra de moedas
- [x] Integração no menu
- [ ] Integração com API
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação de API

---

## 🔗 Referências

- Checklist 12: Pagamento Escrow
- Checklist 15: Criação de Contrato
- Backend: `backend/src/controllers/PagamentoController.ts`

---

**Última atualização**: 30/01/2025  
**Status**: Interface implementada, aguardando integração backend

