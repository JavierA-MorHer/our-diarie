# Firebase Configuration

Este directorio contiene toda la configuración y utilidades para Firebase en la aplicación "Nuestro Diario".

## Estructura

```
src/firebase/
├── config.ts      # Configuración principal de Firebase
├── index.ts       # Exportaciones centralizadas
├── utils.ts       # Utilidades y servicios para Firebase
└── README.md      # Esta documentación
```

## Configuración

### Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Servicios Configurados

- **Authentication**: Para autenticación de usuarios
- **Firestore**: Base de datos para entradas del diario
- **Storage**: Para almacenar fotos y archivos
- **Analytics**: Para métricas de uso (solo en navegador)

## Uso

### Importación Básica

```typescript
import { auth, db, storage } from '../firebase';
```

### Usando los Servicios

```typescript
import { FirestoreService, AuthService, StorageService } from '../firebase';

// Crear una entrada del diario
const entryId = await FirestoreService.createDiaryEntry({
  title: 'Mi día',
  content: 'Hoy fue un gran día...',
  date: new Date(),
  userId: 'user123'
});

// Subir una foto
const { url } = await StorageService.uploadDiaryPhoto(
  file, 
  'user123', 
  entryId
);

// Autenticar usuario
await AuthService.signIn('email@example.com', 'password');
```

### Test de Conexión

```typescript
import { testFirebaseConnection } from '../firebase';

// Verificar que Firebase esté funcionando
const isConnected = await testFirebaseConnection();
console.log('Firebase connected:', isConnected);
```

## Reglas de Seguridad

### Firestore Rules

Las reglas están configuradas para que los usuarios solo puedan acceder a sus propios datos:

- Entradas del diario: Solo el propietario puede leer/escribir
- Fotos: Solo el propietario puede acceder
- Perfiles de usuario: Solo el propietario puede modificar

### Storage Rules

Similar a Firestore, los usuarios solo pueden acceder a sus propios archivos.

## Manejo de Errores

La configuración incluye validación de variables de entorno y manejo de errores robusto:

- Validación de variables de entorno al inicializar
- Logs detallados para debugging
- Manejo de errores en todas las operaciones

## Testing

Usa el componente `FirebaseTest` para verificar que la configuración esté funcionando correctamente:

```tsx
import FirebaseTest from '../components/FirebaseTest';

<FirebaseTest onTestComplete={(success) => {
  console.log('Firebase test result:', success);
}} />
```

## Desarrollo

### Agregar Nuevos Servicios

1. Importa el servicio en `config.ts`
2. Inicialízalo con manejo de errores
3. Exporta el servicio
4. Agrega utilidades en `utils.ts` si es necesario

### Agregar Nuevas Operaciones

1. Agrega métodos a las clases de servicio en `utils.ts`
2. Incluye manejo de errores apropiado
3. Documenta el uso en este README

## Troubleshooting

### Error: "Missing required Firebase environment variables"

Verifica que todas las variables estén en `.env.local` y que el archivo esté en la raíz del proyecto.

### Error: "Firebase initialization failed"

1. Verifica que las credenciales sean correctas
2. Asegúrate de que el proyecto Firebase esté activo
3. Revisa la consola para más detalles del error

### Error de permisos en Firestore/Storage

1. Verifica que las reglas de seguridad estén desplegadas
2. Asegúrate de que el usuario esté autenticado
3. Revisa que las reglas coincidan con la estructura de datos