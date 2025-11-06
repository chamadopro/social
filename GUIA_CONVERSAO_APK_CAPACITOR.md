# Guia de Conversão para APK Android usando Capacitor

## 📱 Visão Geral

Este documento descreve como converter o projeto ChamadoPro (web) em um aplicativo Android (APK) usando o Capacitor, mantendo o código atual com mínimas alterações.

## 🎯 O que é Capacitor?

**Capacitor** é um framework moderno desenvolvido pela equipe do Ionic que permite converter aplicações web em apps nativos para Android e iOS. Ele mantém seu código React/Next.js e adiciona acesso a funcionalidades nativas do dispositivo.

### Vantagens:
- ✅ Mantém seu código atual (React/Next.js)
- ✅ Acesso a APIs nativas (câmera, notificações, etc.)
- ✅ Gera APK para Android e IPA para iOS
- ✅ Boa integração com backend existente
- ✅ Fácil de configurar e manter

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior) - ✅ Já temos
2. **Android Studio** - Para compilar o APK
   - Download: https://developer.android.com/studio
   - Instale o Android SDK (versão 33 ou superior)
   - Configure as variáveis de ambiente ANDROID_HOME e PATH
3. **Java JDK** (versão 17 ou superior)
   - Normalmente já vem com Android Studio

## 🔧 Passo a Passo de Implementação

### 1. Ajustar Next.js para SPA (Single Page App)

O Capacitor funciona melhor com aplicações SPA. Precisamos ajustar o Next.js:

#### 1.1. Criar arquivo `next.config.js` (se não existir)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Gera arquivos estáticos
  images: {
    unoptimized: true, // Necessário para build estático
  },
  trailingSlash: true,
  // Desabilitar features do Next.js que não funcionam em SPA
  reactStrictMode: true,
}

module.exports = nextConfig
```

**⚠️ IMPORTANTE:** Com `output: 'export'`, as API Routes do Next.js não funcionarão. O backend deve continuar rodando separadamente.

#### 1.2. Ajustar URLs da API

No arquivo `frontend/src/services/api.ts`, garantir que a URL da API seja configurável:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

Criar arquivo `.env.local` no frontend:
```env
NEXT_PUBLIC_API_URL=http://seu-servidor.com/api
```

### 2. Instalar Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 3. Inicializar Capacitor

```bash
npx cap init
```

Durante a inicialização, você será perguntado:
- **App name:** ChamadoPro
- **App ID:** com.chamadopro.app (ou outro ID único)
- **Web dir:** .next (ou out, dependendo do build)

### 4. Configurar Capacitor

O arquivo `capacitor.config.ts` será criado. Ajuste-o:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chamadopro.app',
  appName: 'ChamadoPro',
  webDir: '.next', // ou 'out' se usar export
  server: {
    androidScheme: 'https', // Para produção
    // hostname: 'localhost', // Para desenvolvimento
    // url: 'http://localhost:3000', // Para desenvolvimento
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
```

### 5. Adicionar Plataforma Android

```bash
npx cap add android
```

Isso criará a pasta `android/` no projeto.

### 6. Build do Next.js

```bash
npm run build
```

Isso gerará os arquivos estáticos em `.next/` (ou `out/`, dependendo da configuração).

### 7. Sincronizar com Android

```bash
npx cap sync android
```

Isso copia os arquivos web para o projeto Android.

### 8. Abrir no Android Studio

```bash
npx cap open android
```

Ou abra manualmente a pasta `android/` no Android Studio.

### 9. Configurar Permissões Android

No arquivo `android/app/src/main/AndroidManifest.xml`, adicionar permissões necessárias:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissões existentes -->
    
    <!-- Internet (já deve estar) -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Câmera (para upload de fotos) -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Armazenamento (para fotos) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Notificações -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Localização (se necessário) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- ... resto do manifest ... -->
</manifest>
```

### 10. Configurar Assinatura do APK (Produção)

Para gerar APK assinado para produção:

1. No Android Studio: **Build > Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie uma keystore (se não tiver):
   - **Key store path:** escolha um local seguro
   - **Password:** crie uma senha forte
   - **Key alias:** chamadopro
   - **Validity:** 25 anos (recomendado)
4. Escolha **release** como build variant
5. Clique em **Finish**

O APK será gerado em: `android/app/release/app-release.apk`

## 🔌 Plugins Úteis do Capacitor

### Instalar plugins comuns:

```bash
# Câmera
npm install @capacitor/camera

# Galeria de fotos
npm install @capacitor/photos

# Notificações Push
npm install @capacitor/push-notifications

# Status Bar
npm install @capacitor/status-bar

# Splash Screen
npm install @capacitor/splash-screen

# Storage (localStorage melhorado)
npm install @capacitor/preferences

# Network (verificar conexão)
npm install @capacitor/network

# Geolocalização
npm install @capacitor/geolocation
```

### Exemplo de uso da Câmera:

```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: 'base64',
  });
  
  // Usar a imagem
  return image.base64String;
};
```

## 🌐 Configuração do Backend

### Opções de Hosting:

1. **Servidor próprio:** Deixar o backend rodando em um servidor
2. **Cloud (AWS, Azure, GCP):** Hospedar o backend
3. **Heroku/Railway:** Plataformas simplificadas
4. **API Gateway:** Para escalabilidade

### Configurar CORS:

No backend, garantir que o CORS aceite requisições do app:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:3000',
    'https://seu-dominio.com'
  ],
  credentials: true
}));
```

## 📱 Testando o App

### 1. Emulador Android:

No Android Studio:
- **Tools > Device Manager**
- Criar um dispositivo virtual
- Executar o app: `npx cap run android`

### 2. Dispositivo Físico:

1. Habilitar **Modo Desenvolvedor** no Android
2. Habilitar **Depuração USB**
3. Conectar via USB
4. Executar: `npx cap run android`

### 3. Build de Desenvolvimento:

```bash
# Build do Next.js
npm run build

# Sincronizar
npx cap sync android

# Abrir no Android Studio
npx cap open android

# No Android Studio: Run > Run 'app'
```

## 🚀 Workflow de Desenvolvimento

### 1. Desenvolvimento:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (dev)
cd frontend
npm run dev

# Terminal 3: Capacitor (se necessário)
cd frontend
npx cap sync android
```

### 2. Build para Teste:

```bash
# Build do Next.js
cd frontend
npm run build

# Sincronizar com Android
npx cap sync android

# Abrir no Android Studio e testar
npx cap open android
```

### 3. Build para Produção:

```bash
# 1. Build do Next.js
cd frontend
npm run build

# 2. Sincronizar
npx cap sync android

# 3. Abrir Android Studio
npx cap open android

# 4. No Android Studio:
#    - Build > Generate Signed Bundle / APK
#    - Escolher APK
#    - Assinar com keystore
#    - Gerar APK release
```

## ⚠️ Considerações Importantes

### 1. **API Routes do Next.js:**
- Com `output: 'export'`, as API Routes não funcionam
- O backend deve continuar rodando separadamente
- Use variáveis de ambiente para URLs da API

### 2. **Imagens:**
- Configure `images.unoptimized: true` no Next.js
- Ou use serviços externos (Cloudinary, Imgix, etc.)

### 3. **Rotas:**
- Use `next/router` normalmente
- Garanta que todas as rotas funcionem como SPA

### 4. **Performance:**
- Teste o app em dispositivos reais
- Otimize imagens e assets
- Use lazy loading quando possível

### 5. **Notificações:**
- Configure Firebase Cloud Messaging (FCM) para push notifications
- Use o plugin `@capacitor/push-notifications`

## 📝 Checklist Antes de Gerar APK Final

- [ ] Backend rodando e acessível
- [ ] URLs da API configuradas corretamente
- [ ] Build do Next.js funcionando
- [ ] Capacitor sincronizado
- [ ] Permissões configuradas no AndroidManifest.xml
- [ ] Keystore criado para assinatura
- [ ] Testado em emulador
- [ ] Testado em dispositivo físico
- [ ] CORS configurado no backend
- [ ] Variáveis de ambiente configuradas
- [ ] Imagens otimizadas
- [ ] Performance testada

## 🔗 Recursos Úteis

- **Documentação Capacitor:** https://capacitorjs.com/docs
- **Documentação Next.js Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Android Studio:** https://developer.android.com/studio
- **Firebase Console:** https://console.firebase.google.com (para push notifications)

## 📞 Próximos Passos

1. **Testar tudo na web primeiro** ✅ (já estamos fazendo)
2. **Validar todas as funcionalidades** ✅
3. **Configurar ambiente de produção para backend**
4. **Seguir este guia para gerar APK**
5. **Testar APK em dispositivos reais**
6. **Publicar na Google Play Store** (se desejar)

---

**Nota:** Este guia assume que o projeto web já está completo e testado. Recomenda-se seguir este guia apenas após validação completa da versão web.

