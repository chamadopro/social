# CHECKLIST - CADASTRO DO CLIENTE

## Data: 30/01/2025

---

## ✅ O QUE JÁ TEM (Implementado)

### **Frontend - Formulário de Registro**

#### **1. Tipo de Usuário**
- ✅ Radio buttons para escolher CLIENTE ou PRESTADOR
- ✅ Visual diferenciado (azul quando selecionado)
- ✅ Ícone de usuário
- ✅ Descrição breve de cada tipo

#### **2. Dados Pessoais**
- ✅ Campo Nome completo (obrigatório)
  - Mínimo 2 caracteres
  - Máximo 100 caracteres
- ✅ Campo Email (obrigatório)
  - Validação de formato
  - Campo único
- ✅ Campo Senha (obrigatório)
  - Visualização de senha (checkbox)
  - Indicador de força da senha
  - Mínimo 8 caracteres
  - Requisitos: 1 minúscula, 1 maiúscula, 1 número, 1 símbolo
- ✅ Campo Confirmar Senha (obrigatório)
  - Validação de igualdade com senha
- ✅ Campo Telefone (obrigatório)
  - Aceita 10-11 dígitos (sem formatação)
  - Validação no frontend
- ✅ Campo CPF/CNPJ (obrigatório)
  - Label dinâmico (CPF para CLIENTE, CNPJ para PRESTADOR)
  - Placeholder dinâmico
- ✅ Campo Data de Nascimento (obrigatório)
  - Input tipo "date"
  - Validação de data no passado

#### **3. Endereço**
- ✅ Campo CEP (obrigatório)
  - Placeholder formatado
- ✅ Campo Rua (obrigatório)
- ✅ Campo Número (obrigatório)
- ✅ Campo Bairro (obrigatório)
- ✅ Campo Cidade (obrigatório)
- ✅ Campo Estado (obrigatório)
  - Placeholder "SP"
- ⚠️ Campos Latitude/Longitude (não preenchidos automaticamente)

#### **4. Interface**
- ✅ Layout responsivo (mobile e desktop)
- ✅ Grid de 2 colunas em desktop
- ✅ Botão "Voltar" no topo
- ✅ Logo ChamadoPro (C laranja)
- ✅ Link para login ("Ou entre na sua conta existente")
- ✅ Mensagens de erro por campo
- ✅ Botão "Criar Conta" com loading state
- ✅ Card com sombra e borda
- ✅ Espaçamento consistente

#### **5. Validação**
- ✅ Validação de nome (obrigatório, min 2 caracteres)
- ✅ Validação de email (formato, obrigatório)
- ✅ Validação de senha (complexidade)
- ✅ Validação de confirmação de senha (igualdade)
- ✅ Validação de telefone (10-11 dígitos)
- ✅ Validação de CPF/CNPJ (obrigatório)
- ✅ Validação de data de nascimento (obrigatório)
- ✅ Validação de todos os campos de endereço (obrigatórios)

#### **6. Funcionalidade**
- ✅ Estado gerenciado com React hooks
- ✅ Limpeza de erros ao digitar
- ✅ Submit prevent default
- ✅ Toast de sucesso após registro
- ✅ Redirecionamento para /verify após cadastro
- ✅ Tratamento de erros do backend
- ✅ Loading state durante requisição

### **Backend - Validação e Processamento**

#### **1. Validação (Joi)**
- ✅ Tipo de usuário (CLIENTE ou PRESTADOR)
- ✅ Nome (min 2, max 100)
- ✅ Email (formato válido)
- ✅ Senha (complexidade rigorosa)
- ✅ Telefone (10-11 dígitos)
- ✅ CPF/CNPJ (validação de documento)
- ✅ Data de nascimento (data válida no passado)
- ✅ Endereço completo (CEP, rua, número, bairro, cidade, estado)
- ✅ Latitude/Longitude (obrigatórias)

#### **2. Processamento**
- ✅ Hash de senha com bcrypt
- ✅ Geração de tokens JWT e refresh token
- ✅ Geração de token de verificação de email
- ✅ Armazenamento no banco de dados (PostgreSQL)
- ✅ Envio de email de verificação
- ✅ Logs de auditoria
- ✅ Verificação de email/CPF duplicado

#### **3. Serviços Auxiliares**
- ✅ EmailService (envio de emails)
- ✅ TokenService (geração de tokens)
- ✅ LoginAttemptService (controle de tentativas)
- ✅ DocumentValidator (validação CPF/CNPJ)
- ✅ PhoneValidator (validação telefone)
- ✅ PasswordValidator (validação senha)
- ✅ CEPValidator (validação CEP)

---

## ⚠️ O QUE FALTA (Pendente)

### **Frontend - Melhorias de UX**

#### **1. Validação em Tempo Real**
- ⚠️ Validação de CPF/CNPJ com máscara automática
  - Formatar enquanto digita
  - Validar dígitos verificadores
- ⚠️ Validação de telefone com máscara automática
  - (00) 00000-0000 para celular
  - (00) 0000-0000 para fixo
- ⚠️ Validação de CEP com busca automática
  - ViaCEP API
  - Preenchimento automático de endereço
- ⚠️ Validação de data de nascimento
  - Verificar idade mínima (18 anos)
  - Verificar formato
- ⚠️ Feedback visual durante validação
  - Ícone de check quando válido
  - Ícone de erro quando inválido

#### **2. Captura de Localização**
- ⚠️ Solicitar permissão de GPS
- ⚠️ Captura automática de latitude/longitude
- ⚠️ Exibição de mapa para confirmação
- ⚠️ Fallback para CEP se GPS não disponível

#### **3. Upload de Foto**
- ⚠️ Campo opcional para foto de perfil
- ⚠️ Preview da imagem
- ⚠️ Crop/redimensionamento
- ⚠️ Upload de arquivo

#### **4. Feedback do Usuário**
- ⚠️ Indicador de progresso (Passo 1 de 3)
- ⚠️ Mensagens de ajuda em cada campo
- ⚠️ Exemplos de senha forte
- ⚠️ Termos de uso e privacidade (checkbox obrigatório)
- ⚠️ ReCAPTCHA ou similar (prevenção de bots)

#### **5. Acessibilidade**
- ⚠️ Labels com aria-describedby
- ⚠️ Focus trap em modal
- ⚠️ Navegação por teclado
- ⚠️ Alto contraste
- ⚠️ Screen reader support

### **Backend - Funcionalidades Adicionais**

#### **1. Integração com APIs Externas**
- ⚠️ ViaCEP para busca de endereço por CEP
- ⚠️ Google Maps Geocoding para coordenadas
- ⚠️ Validação de CPF/CNPJ com ReceitaWS (opcional)
- ⚠️ Envio de SMS para verificação de telefone (opcional)

#### **2. Upload e Armazenamento**
- ⚠️ Upload de foto para S3 ou armazenamento local
- ⚠️ Redimensionamento automático de imagens
- ⚠️ Compressão de imagens
- ⚠️ Validação de formato e tamanho

#### **3. Segurança Avançada**
- ⚠️ Rate limiting específico por IP
- ⚠️ CAPTCHA no backend
- ⚠️ Blacklist de emails/telefones
- ⚠️ Detecção de cadastros em lote (bot)

#### **4. Recuperação e Verificação**
- ⚠️ Link de recuperação de senha funcional
- ⚠️ Reenvio de email de verificação
- ⚠️ Verificação de telefone por SMS

---

## 🎯 MELHORIAS PRIORITÁRIAS

### **Prioridade ALTA (Essencial para UX)**

1. **Busca automática de CEP (ViaCEP)**
   - Preencher endereço automaticamente
   - Economia de tempo do usuário
   - Reduz erros de digitação

2. **Validação e formatação de CPF/CNPJ**
   - Máscara automática
   - Validação de dígitos verificadores
   - Feedback visual

3. **Captura automática de GPS**
   - Modal de solicitação de permissão
   - Fallback para CEP
   - Validação de coordenadas

4. **Termos de uso e privacidade**
   - Checkbox obrigatório
   - Links para leitura
   - Conformidade LGPD

### **Prioridade MÉDIA (Melhora significativa)**

5. **Upload de foto de perfil**
   - Campo opcional
   - Preview e crop
   - Validação de tamanho/formato

6. **Validação em tempo real com feedback visual**
   - Ícones de check/erro
   - Mensagens contextuais
   - Animações suaves

7. **Indicador de progresso**
   - Passos: Dados Pessoais → Endereço → Confirmação
   - Melhora percepção de completude
   - Reduz abandono

8. **Feedback de força de senha**
   - Barra de progresso colorida
   - Critérios visíveis
   - Sugestões de melhoria

### **Prioridade BAIXA (Nice to have)**

9. **ReCAPTCHA**
   - Prevenção de bots
   - Proteção contra spam

10. **Validação adicional de idade mínima**
    - 18 anos para prestador
    - 16 anos para cliente

11. **Acessibilidade completa**
    - WCAG 2.1 AA compliance
    - Navegação por teclado

---

## 📊 ESTIMATIVA DE IMPLEMENTAÇÃO

| Funcionalidade | Esforço | Prioridade |
|---------------|---------|------------|
| Busca automática de CEP | 4h | ALTA |
| Validação/Formatação CPF/CNPJ | 4h | ALTA |
| Captura automática GPS | 6h | ALTA |
| Termos de uso | 2h | ALTA |
| Upload foto de perfil | 8h | MÉDIA |
| Validação em tempo real | 6h | MÉDIA |
| Indicador de progresso | 4h | MÉDIA |
| Feedback de força de senha | 2h | MÉDIA |
| ReCAPTCHA | 4h | BAIXA |
| Acessibilidade completa | 12h | BAIXA |
| **TOTAL** | **52h** | ~2 semanas |

---

## 🎨 MELHORIAS VISUAIS SUGERIDAS

### **Layout**
- [ ] Agrupar campos relacionados em seções colapsáveis
- [ ] Adicionar ícones aos labels
- [ ] Melhorar espaçamento entre seções
- [ ] Adicionar animações suaves

### **Feedback**
- [ ] Loading skeleton durante validação
- [ ] Toast mais informativo
- [ ] Mensagens de erro mais amigáveis
- [ ] Sugestões contextuais

### **Responsividade**
- [ ] Otimizar para mobile (scroll suave)
- [ ] Adicionar botão "Próximo Passo" em mobile
- [ ] Melhorar grid em telas pequenas

---

## 🐛 BUGS CONHECIDOS

Nenhum bug crítico identificado no cadastro atual.

---

## 📝 NOTAS

- O cadastro atual está funcional e pronto para uso
- As melhorias sugeridas são para elevar a experiência do usuário
- Priorizar as funcionalidades de prioridade ALTA primeiro
- Testar em múltiplos navegadores e dispositivos
- Considerar A/B testing para novas funcionalidades

---

*Última atualização: 30/01/2025*








