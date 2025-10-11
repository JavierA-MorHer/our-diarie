import emailjs from '@emailjs/browser';

// Configuración de EmailJS
// Necesitarás obtener estos valores de tu cuenta de EmailJS (https://www.emailjs.com/)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

export interface InvitationEmailData {
  to_email: string;
  diary_title: string;
  inviter_name: string;
  invitation_link: string;
  role: string;
  expires_date: string;
}

export class EmailService {
  static async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      // Verificar que las credenciales estén configuradas
      if (EMAILJS_SERVICE_ID === 'your_service_id' || 
          EMAILJS_TEMPLATE_ID === 'your_template_id' || 
          EMAILJS_PUBLIC_KEY === 'your_public_key') {
        console.warn('EmailJS no está configurado. Configura las variables de entorno REACT_APP_EMAILJS_*');
        return false;
      }

      // Inicializar EmailJS
      emailjs.init(EMAILJS_PUBLIC_KEY);

      // Enviar email
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: data.to_email,
          diary_title: data.diary_title,
          inviter_name: data.inviter_name,
          invitation_link: data.invitation_link,
          role: data.role,
          expires_date: data.expires_date,
        }
      );

      console.log('Email enviado exitosamente:', result);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  // Método alternativo usando fetch para un backend personalizado
  static async sendInvitationEmailBackend(data: InvitationEmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Email enviado exitosamente via backend');
        return true;
      } else {
        console.error('Error del servidor:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error enviando email via backend:', error);
      return false;
    }
  }
}