# 🏦 NovoBanco — Simulador Bancario

Aplicación bancaria fullstack construida con **Next.js 14**, **Firebase** y **EmailJS**. Lista para desplegar en Vercel.

---

## ✨ Funcionalidades

- 🔐 Autenticación (registro e inicio de sesión) con Firebase Auth
- 💰 Depósito, retiro y transferencias entre usuarios
- 📊 Dashboard con gráficos (evolución del saldo, resumen mensual)
- 📋 Historial completo de transacciones con filtros
- 💳 Tarjeta virtual única por usuario (VISA o Mastercard)
- 📧 Notificaciones por email en cada operación (EmailJS, gratis)
- 🌙 Diseño dark mode estilo fintech moderno

---

## 🚀 Configuración paso a paso

### 1. Firebase

1. Ve a https://console.firebase.google.com
2. Crea un nuevo proyecto
3. Activa **Authentication → Email/Password**
4. Activa **Firestore Database** (modo producción)
5. Ve a **Configuración del proyecto → Tus aplicaciones → Web**
6. Copia las credenciales

**Reglas de Firestore** — copia el contenido de `firestore.rules` en la consola de Firebase:
Firestore → Reglas → Pegar contenido → Publicar

### 2. EmailJS (gratis — 200 emails/mes)

1. Crea cuenta en https://www.emailjs.com
2. Ve a **Email Services** → conecta Gmail o cualquier proveedor
3. Ve a **Email Templates** → crea una plantilla con estas variables:
   - To: {{to_email}}
   - Subject: {{subject}}
   - Body: Hola {{to_name}}, {{message}}
4. Copia: **Service ID**, **Template ID** y **Public Key**

### 3. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx
NEXT_PUBLIC_EMAILJS_USER_ID=xxxxx
```

### 4. Ejecutar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000

---

## 🌐 Despliegue en Vercel

1. Sube tu proyecto a GitHub
2. Ve a https://vercel.com → New Project → importa el repositorio
3. En **Environment Variables**, añade todas las variables de `.env.local`
4. Haz clic en **Deploy** ✅

---

## 📁 Estructura del proyecto

```
banco-sim/
├── app/
│   ├── page.tsx                    # Login / Registro
│   ├── layout.tsx
│   ├── globals.css
│   └── dashboard/
│       ├── page.tsx                # Inicio / Dashboard
│       ├── depositar/page.tsx
│       ├── retirar/page.tsx
│       ├── transferir/page.tsx
│       ├── historial/page.tsx
│       ├── tarjeta/page.tsx
│       └── components/
│           ├── Sidebar.tsx
│           └── TransactionForm.tsx
├── context/AuthContext.tsx
├── lib/
│   ├── firebase.ts
│   ├── email.ts
│   ├── card.ts
│   └── types.ts
├── middleware.ts
└── firestore.rules
```

---

## 🔒 Seguridad

- Contraseñas gestionadas 100% por Firebase Auth
- Cada usuario solo accede a sus propios datos
- Middleware Next.js protege todas las rutas del dashboard
- Saldo inicial: €1.000 (configurable en `context/AuthContext.tsx`)
