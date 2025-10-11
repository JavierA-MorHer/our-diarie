# Configuración de Autenticación con Google

Esta guía te ayudará a configurar completamente la autenticación con Google en tu aplicación "Nuestro Diario".

## ✅ Pasos Completados

### 1. Configuración de Firebase
- [x] Firebase instalado y configurado
- [x] Variables de entorno configuradas
- [x] Servicios de Firebase inicializados
- [x] Manejo de errores implementado

### 2. Autenticación con Google
- [x] GoogleAuthProvider configurado
- [x] Método `signInWithGoogle()` implementado
- [x] Componente WelcomeScreen actualizado
- [x] Componente UserProfile creado
- [x] Estado de autenticación manejado en App.tsx

### 3. Reglas de Seguridad
- [x] Reglas de Firestore configuradas
- [x] Reglas de Storage configuradas
- [x] Validación de usuarios autenticados

## 🔧 Pasos Pendientes en Firebase Console

### 1. Habilitar Google Auth
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "nuestro-diario-app"
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Google** como proveedor de autenticación
5. Configura el **Project support email**

### 2. Configurar Dominios Autorizados
1. En **Authentication** > **Settings** > **Authorized domains**
2. Agrega tu dominio de desarrollo:
   - `localhost` (para desarrollo local)
   - Tu dominio de producción cuando lo despliegues

### 3. Configurar OAuth Consent Screen (Opcional)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **OAuth consent screen**
4. Configura la pantalla de consentimiento si es necesario

## 🧪 Probar la Configuración

### 1. Ejecutar la Aplicación
```bash
npm run dev
```

### 2. Verificar el Flujo
1. Abre la aplicación en tu navegador
2. Deberías ver la pantalla de bienvenida con el botón "Continuar con Google"
3. Haz clic en el botón para iniciar sesión
4. Se abrirá una ventana emergente de Google
5. Selecciona tu cuenta de Google
6. Deberías ser redirigido de vuelta a la aplicación

### 3. Verificar Funcionalidades
- [ ] El botón de Google aparece en WelcomeScreen
- [ ] El popup de Google se abre correctamente
- [ ] La autenticación funciona sin errores
- [ ] El usuario aparece en la esquina superior derecha
- [ ] El botón de cerrar sesión funciona
- [ ] Al cerrar sesión, regresa a WelcomeScreen

## 🐛 Solución de Problemas

### Error: "This app is not verified"
- **Causa**: La aplicación no está verificada por Google
- **Solución**: En la pantalla de consentimiento, haz clic en "Advanced" y luego "Go to [app name] (unsafe)"

### Error: "popup_blocked"
- **Causa**: El navegador bloqueó la ventana emergente
- **Solución**: Permite ventanas emergentes para tu dominio

### Error: "auth/unauthorized-domain"
- **Causa**: El dominio no está autorizado
- **Solución**: Agrega tu dominio a la lista de dominios autorizados en Firebase Console

### Error: "auth/operation-not-allowed"
- **Causa**: Google Auth no está habilitado
- **Solución**: Habilita Google como proveedor de autenticación en Firebase Console

## 📱 Funcionalidades Implementadas

### WelcomeScreen
- Muestra pantalla de bienvenida
- Requiere autenticación para continuar
- Botón de "Continuar con Google"
- Estados de carga y error
- Mensaje de confirmación al autenticarse

### UserProfile
- Muestra información del usuario autenticado
- Foto de perfil de Google
- Nombre y email
- Botón de cerrar sesión
- Posicionado en esquina superior derecha

### App.tsx
- Manejo global del estado de autenticación
- Redirección automática según estado de auth
- Integración con todos los componentes

## 🔒 Seguridad

### Reglas de Firestore
- Solo usuarios autenticados pueden acceder a datos
- Cada usuario solo puede acceder a sus propios datos
- Validación de ownership en todas las operaciones

### Reglas de Storage
- Solo usuarios autenticados pueden subir archivos
- Archivos organizados por userId
- Acceso restringido a archivos propios

## 🚀 Próximos Pasos

1. **Probar en diferentes navegadores**
2. **Configurar dominios de producción**
3. **Implementar manejo de errores más robusto**
4. **Agregar más proveedores de autenticación (opcional)**
5. **Implementar persistencia de sesión**

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador para errores
2. Verifica la configuración en Firebase Console
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Revisa que las reglas de seguridad estén desplegadas