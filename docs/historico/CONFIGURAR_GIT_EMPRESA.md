# Configurar Git com Email Corporativo

**Email padrão**: `trova.assessoria@gmail.com`  
**Empresa**: A.C Trova Acessoria LTDA

---

## 1. Configurar identidade global
```bash
git config --global user.name "Alexandro Trova"
git config --global user.email "trova.assessoria@gmail.com"
```

Verificar:
```bash
git config --global user.name
git config --global user.email
```
> Saída esperada:
```
Alexandro Trova
trova.assessoria@gmail.com
```

---

## 2. Adicionar email ao GitHub (necessário para vincular commits)
1. Acesse https://github.com/settings/emails
2. Clique em **Add email address**
3. Informe `trova.assessoria@gmail.com`
4. Verifique o e-mail recebido (link ou código)
5. Confirme – a conta passa a reconhecer o endereço

---

## 3. Fluxo completo de commit
```bash
# Navegar até o projeto
dcd /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro

# Inicializar repositório (se necessário)
git init
git branch -M main

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"

# Adicionar remoto
git remote add origin https://github.com/chamadopro/social.git
git remote -v

# Enviar
git push -u origin main
```

---

## 4. Opcional: usar nome da empresa
```bash
git config --global user.name "A.C Trova Acessoria LTDA"
git config --global user.email "trova.assessoria@gmail.com"
```
> Use apenas se desejar que os commits apareçam com o nome da empresa; caso contrário mantenha seu nome pessoal.

---

## 5. Resumo
- Configure: `git config --global user.email "trova.assessoria@gmail.com"`
- Adicione o email na conta GitHub.
- Faça commits normalmente; o autor aparecerá como `Alexandro Trova <trova.assessoria@gmail.com>`.

**Última atualização:** 06/11/2025
