# CHECKLIST - CADASTRO DE PRESTADOR

## Comparação: Documentação vs Implementado

### **Dados Obrigatórios (conforme Documento v3.2)**

#### ✅ **IMPLEMENTADO**

| Campo | Documento | Status | Observações |
|-------|-----------|--------|-------------|
| Nome completo/Razão social | ✅ | ✅ | Campo "nome" genérico |
| Email (único) | ✅ | ✅ | Com validação em tempo real |
| Senha (mín 8 chars) | ✅ | ✅ | Com validação forte e visualização |
| Telefone/WhatsApp | ✅ | ✅ | Com máscara automática |
| CPF/CNPJ | ✅ | ✅ | Com validação correta de CNPJ e máscara |
| Data nascimento/abertura | ✅ | ✅ | Com validação de idade (18+) |
| Endereço completo | ✅ | ✅ | Com CEP automático |
| - CEP | ✅ | ✅ | Com busca ViaCEP |
| - Rua | ✅ | ✅ | |
| - Número | ✅ | ✅ | |
| - Complemento | ✅ | ✅ | |
| - Bairro | ✅ | ✅ | |
| - Cidade | ✅ | ✅ | |
| - Estado | ✅ | ✅ | |
| Foto de perfil | ✅ | ✅ | Obrigatória com captura de câmera |
| Localização GPS | ⚠️ | ⚠️ | **CAMPOS EXISTEM (latitude/longitude), MAS NÃO SÃO CAPTURADOS** |

**Total Implementado: 14/16 campos obrigatórios (87.5%)**

---

#### ❌ **NÃO IMPLEMENTADO** (Faltando)

| Campo | Documento | Status | Prioridade |
|-------|-----------|--------|------------|
| Áreas de atuação (categorias) | ✅ | ❌ | **ALTA** |
| Descrição profissional | ✅ | ❌ | **ALTA** |
| Portfolio (fotos/videos) | ✅ | ❌ | **MÉDIA** |
| GPS (latitude/longitude) | ✅ | ⚠️ | **MÉDIA** |

---

### **Dados Opcionais (conforme Documento v3.2)**

| Campo | Documento | Status | Prioridade |
|-------|-----------|--------|------------|
| Certificações | ✅ | ❌ | **BAIXA** |
| Experiência profissional | ✅ | ❌ | **BAIXA** |
| Disponibilidade | ✅ | ✅ | Existe no modelo Post, mas não no cadastro |
| Preço por hora/serviço | ✅ | ✅ | Existe no modelo Post |
| Avaliações recebidas | ✅ | ✅ | Sistema já implementado |

---

## **ANÁLISE DETALHADA**

### **✅ CAMPOS IMPLEMENTADOS (14 itens)**

1. ✅ **Nome completo/Razão social**
   - Campo genérico "nome" funciona para ambos
   - Funcional

2. ✅ **Email único**
   - Validado no frontend
   - **NOVO**: Validação em tempo real via `/api/users/check-email`
   - Funcional

3. ✅ **Senha forte**
   - Mínimo 8 caracteres
   - 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
   - Visualização ativável
   - Funcional

4. ✅ **Telefone/WhatsApp**
   - Máscara automática `(00) 00000-0000`
   - Aceita 10-11 dígitos apenas numéricos
   - Validação em tempo real
   - Funcional

5. ✅ **CPF/CNPJ**
   - Máscara automática por tipo
   - **CORRIGIDO**: Validação de CNPJ agora correta
   - Validação em tempo real via `/api/users/check-document`
   - Funcional

6. ✅ **Data de nascimento/abertura**
   - Campo data implementado
   - **NOVO**: Validação automática de idade mínima (18 anos)
   - Funcional

7. ✅ **Endereço completo**
   - CEP, Rua, Número, Complemento, Bairro, Cidade, Estado
   - **NOVO**: Campo complemento adicionado
   - Busca automática ViaCEP
   - Funcional

8. ✅ **Foto de perfil**
   - **OBRIGATÓRIA** para segurança
   - Upload de arquivo
   - Captura de câmera (webcam/mobile)
   - Preview circular
   - Funcional

---

### **❌ CAMPOS FALTANDO (2 obrigatórios + 4 opcionais)**

#### **ALTA PRIORIDADE**

1. ❌ **Áreas de atuação (categorias)** - OBRIGATÓRIO
   - **O que falta**: Campo para o prestador selecionar categorias de atuação
   - **Sugestão**: Dropdown multi-seleção com categorias do sistema
   - **Exemplos**: Encanamento, Elétrica, Construção, Limpeza, etc.

2. ❌ **Descrição profissional** - OBRIGATÓRIO
   - **O que falta**: Campo de texto para o prestador descrever seus serviços
   - **Sugestão**: Textarea (200-500 caracteres)
   - **Exemplo**: "Encanador experiente, 10 anos de experiência..."

#### **MÉDIA PRIORIDADE**

3. ❌ **Portfolio (fotos/vídeos)** - OBRIGATÓRIO
   - **O que falta**: Upload de múltiplas fotos/vídeos de trabalhos anteriores
   - **Sugestão**: Sistema de upload com preview múltiplo
   - **Limite**: 3-10 fotos/vídeos

4. ⚠️ **GPS (latitude/longitude)** - OBRIGATÓRIO
   - **Status**: Campos existem no schema, mas não são capturados
   - **Sugestão**: Solicitar permissão de localização ou pegar do CEP

#### **BAIXA PRIORIDADE**

5. ❌ **Certificações**
6. ❌ **Experiência profissional**

---

## **RESUMO EXECUTIVO**

### **Status Geral**
- **Implementado**: 14/16 campos obrigatórios (87.5%)
- **Faltando**: 2 campos obrigatórios críticos
- **Bloqueando**: Não bloqueia cadastro, mas prestador fica sem informações essenciais

### **O que funciona**
✅ Cadastro básico funciona  
✅ Todos os dados pessoais estão implementados  
✅ Validações em tempo real funcionando  
✅ Foto obrigatória implementada  
✅ Aceite de termos integrado com declaração de veracidade  

### **O que precisa ser implementado**

#### **IMPLEMENTAÇÃO CRÍTICA (Antes de produção)**
1. **Áreas de atuação (categorias)**
   - Tipo: Dropdown multi-seleção ou checkboxes
   - Obrigatório
   - Exibir no perfil e nos filtros

2. **Descrição profissional**
   - Tipo: Textarea (200-500 caracteres)
   - Obrigatório
   - Exibir no perfil

#### **IMPLEMENTAÇÃO IMPORTANTE (Melhorias)**
3. **Portfolio (fotos/vídeos)**
   - Upload múltiplo com preview
   - Mínimo 3, máximo 10

4. **GPS (localização)**
   - Solicitar permissão de localização
   - Fallback para geocodificação via CEP

#### **IMPLEMENTAÇÃO OPCIONAL (Futuro)**
5. **Certificações**
6. **Experiência profissional**

---

## **PRÓXIMOS PASSOS RECOMENDADOS**

### **Urgente**
1. Implementar **Áreas de atuação**
2. Implementar **Descrição profissional**

### **Importante**
3. Implementar **Portfolio** (fotos/vídeos)
4. Implementar captura automática de **GPS**

### **Opcional**
5. Adicionar campos de **Certificações**
6. Adicionar campo de **Experiência profissional**

---

## **NOTAS**

- O formulário atual funciona, mas o prestador cadastrado ficará **incompleto** sem áreas de atuação e descrição profissional
- Sem esses campos, o prestador **não consegue** ser encontrado pelos clientes adequadamente
- Recomenda-se implementar pelo menos os 2 campos críticos antes de produção

---

**Última atualização**: 27/01/2025  
**Status**: ⚠️ **Formulário funcional mas incompleto**

