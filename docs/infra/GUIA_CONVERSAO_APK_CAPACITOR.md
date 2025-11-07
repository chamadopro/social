# Guia de Conversão para APK Android usando Capacitor

## 📱 Visão Geral
Transforme o ChamadoPro (web) em aplicativo Android sem reescrever o código. O Capacitor reaproveita o projeto Next.js e adiciona camada nativa.

## 🎯 O que é Capacitor?
Framework da equipe Ionic que converte apps web em apps nativos (Android/iOS) mantendo o código React/Next.js.

### Vantagens
- ✅ Reuso total do código atual.
- ✅ Acesso a APIs nativas (câmera, notificações, etc.).
- ✅ Geração de APK (Android) e IPA (iOS).
- ✅ Integração direta com backend existente.

---

## 📋 Pré-requisitos
1. Node.js 18+ (já utilizado).
2. Android Studio + SDK 33+ (configurar `ANDROID_HOME` e `PATH`).
3. Java JDK 17+ (instalado junto com Android Studio).

---

## 🔧 Passo a passo

### 1. Ajustar Next.js para build estático
`next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
```
> Com `output: 'export'`, rotas de API do Next.js deixam de funcionar. O backend continua separado.

Atualize `NEXT_PUBLIC_API_URL` em `frontend/.env.local`.

### 2. Instalar Capacitor
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 3. Inicializar projeto Capacitor
```bash
npx cap init
```
- App name: **ChamadoPro**
- App ID: `com.chamadopro.app`
- Web dir: `.next` (ou `out` se usar `next export`)

### 4. Ajustar `capacitor.config.ts`
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chamadopro.app',
  appName: 'ChamadoPro',
  webDir: '.next',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
```

### 5. Adicionar plataforma Android
```bash
npx cap add android
```

### 6. Build Next.js
```bash
npm run build
```

### 7. Sincronizar arquivos
```bash
npx cap sync android
```

### 8. Abrir projeto no Android Studio
```bash
npx cap open android
```

---

## 🔐 Permissões Android
Em `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 🔏 Gerar APK assinado
1. Android Studio → **Build > Generate Signed Bundle / APK**.
2. Escolher **APK**.
3. Criar keystore (senha forte, validade ≥ 25 anos).
4. Selecionar build variant **release**.
5. APK gerado em `android/app/release/app-release.apk`.

---

## 🔌 Plugins úteis
```bash
npm install @capacitor/camera @capacitor/photos @capacitor/push-notifications \
  @capacitor/status-bar @capacitor/splash-screen @capacitor/preferences \
  @capacitor/network @capacitor/geolocation
```

Exemplo (Câmera):
```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: 'base64',
  });
  return image.base64String;
};
```

---

## 🌐 Backend
Configurar CORS no Express:
```typescript
app.use(cors({
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:3000',
    'https://seu-dominio.com'
  ],
  credentials: true,
}));
```

### Hosting sugerido
- Servidor próprio / VPS.
- Cloud (AWS, Azure, GCP).
- Plataformas gerenciadas (Heroku, Railway).

---

## 📱 Testes
- **Emulador**: `npx cap run android` ou Android Studio → Device Manager.
- **Dispositivo físico**: ativar Modo Desenvolvedor + Depuração USB → `npx cap run android`.
- **Workflow**:
```bash
# Backend
dcd backend
npm run dev

# Frontend
dcd frontend
npm run dev

# Build + sync
npm run build
npx cap sync android
npx cap open android
```

---

## ⚠️ Considerações
1. APIs Next.js: usar backend separado.
2. Imagens: `images.unoptimized = true` ou serviço externo.
3. Rotas: garantir comportamento SPA.
4. Performance: testar em dispositivos reais e otimizar assets.
5. Push notifications: configurar FCM + `@capacitor/push-notifications`.

### Checklist antes do release
- [ ] Backend acessível e CORS configurado.
- [ ] `.env.local` com `NEXT_PUBLIC_API_URL`/`SOCKET_URL` corretos.
- [ ] Build `npm run build` sem erros.
- [ ] `npx cap sync android` executado.
- [ ] Permissões revisadas (`AndroidManifest`).
- [ ] APK testado em emulador e dispositivo físico.
- [ ] Keystore criada e armazenada com segurança.

---

## 🔗 Referências
- https://capacitorjs.com/docs
- https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- https://developer.android.com/studio
- https://console.firebase.google.com

**Próximos passos**: validar versão web, gerar APK, testar em dispositivos reais e preparar publicação na Play Store (se necessário).
