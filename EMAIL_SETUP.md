# Configuración de Envío de Emails

Este proyecto incluye funcionalidad para enviar invitaciones por email a colaboradores de diarios compartidos. Hay varias opciones para implementar esta funcionalidad:

## Opción 1: EmailJS (Recomendada para desarrollo)

EmailJS es un servicio que permite enviar emails directamente desde el frontend sin necesidad de un backend.

### Pasos para configurar EmailJS:

1. **Crear cuenta en EmailJS:**
   - Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
   - Crea una cuenta gratuita

2. **Configurar un servicio de email:**
   - En el dashboard, ve a "Email Services"
   - Conecta tu proveedor de email (Gmail, Outlook, etc.)
   - Anota el Service ID

3. **Crear una plantilla de email:**
   - Ve a "Email Templates"
   - Crea una nueva plantilla con estos campos:
     - `{{to_email}}` - Email del destinatario
     - `{{diary_title}}` - Título del diario
     - `{{inviter_name}}` - Nombre del que invita
     - `{{invitation_link}}` - Enlace de invitación
     - `{{role}}` - Rol (Editor/Visualizador)
     - `{{expires_date}}` - Fecha de expiración

4. **Configurar las variables de entorno:**
   - Copia `.env.example` a `.env`
   - Completa los valores:
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key
   ```

### Ejemplo de plantilla de email:

```
Asunto: Invitación a colaborar en "{{diary_title}}"

Hola,

{{inviter_name}} te ha invitado a colaborar en el diario compartido "{{diary_title}}".

Tu rol será: {{role}}

Para aceptar la invitación, haz clic en el siguiente enlace:
{{invitation_link}}

Esta invitación expira el {{expires_date}}.

¡Esperamos verte pronto en nuestro diario!

Saludos,
El equipo de Nuestro Diario
```

## Opción 2: Backend personalizado

Si prefieres usar un backend personalizado, puedes implementar el método `sendInvitationEmailBackend` en el `EmailService`.

### Ejemplo con Node.js + Nodemailer:

```javascript
// server.js
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-invitation', async (req, res) => {
  const { to_email, diary_title, inviter_name, invitation_link, role, expires_date } = req.body;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to_email,
    subject: `Invitación a colaborar en "${diary_title}"`,
    html: `
      <h2>Invitación a colaborar</h2>
      <p>Hola,</p>
      <p>${inviter_name} te ha invitado a colaborar en el diario compartido "${diary_title}".</p>
      <p>Tu rol será: ${role}</p>
      <p>Para aceptar la invitación, haz clic en el siguiente enlace:</p>
      <a href="${invitation_link}">Aceptar invitación</a>
      <p>Esta invitación expira el ${expires_date}.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Opción 3: Firebase Functions (Para producción)

Para un entorno de producción, puedes usar Firebase Functions:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendInvitationEmail = functions.firestore
  .document('diaryInvitations/{invitationId}')
  .onCreate(async (snap, context) => {
    const invitation = snap.data();
    
    // Configurar transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: functions.config().email.user,
        pass: functions.config().email.pass
      }
    });
    
    // Enviar email
    await transporter.sendMail({
      from: functions.config().email.user,
      to: invitation.invitedEmail,
      subject: `Invitación a colaborar en "${invitation.diaryTitle}"`,
      html: `...` // Tu plantilla HTML
    });
  });
```

## Verificación

Una vez configurado, puedes verificar que funciona:

1. Crea un diario compartido
2. Invita a un colaborador
3. Revisa la consola del navegador para mensajes de confirmación
4. Verifica que el email llegue al destinatario

## Notas importantes

- **Límites de EmailJS:** La versión gratuita tiene límites de 200 emails/mes
- **Seguridad:** Nunca expongas las claves privadas en el frontend
- **Spam:** Considera implementar validación de emails y límites de invitaciones
- **Fallback:** El sistema guarda la invitación aunque falle el envío del email