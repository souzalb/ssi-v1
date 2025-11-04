import { Resend } from 'resend';

// Pega a chave do .env
export const resend = new Resend(process.env.RESEND_API_KEY);

// Pega o email de remetente do .env
export const fromEmail = process.env.EMAIL_FROM;

if (!process.env.RESEND_API_KEY) {
  console.warn(
    'AVISO: RESEND_API_KEY não está definida. Os emails não serão enviados.',
  );
}
if (!process.env.EMAIL_FROM) {
  console.warn(
    'AVISO: EMAIL_FROM não está definido. Os emails não serão enviados.',
  );
}
