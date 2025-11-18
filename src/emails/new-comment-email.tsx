import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface NewCommentEmailProps {
  requesterName: string;
  commenterName: string;
  ticketTitle: string;
  commentText: string;
  ticketUrl: string;
}

export const NewCommentEmail = ({
  requesterName,
  commenterName,
  ticketTitle,
  commentText,
  ticketUrl,
}: NewCommentEmailProps) => {
  const previewText = `💬 ${commenterName} comentou no chamado: ${ticketTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <Text style={iconText}>💬</Text>

            <Heading style={heading}>Nova Atualização</Heading>
            <Text style={subheading}>
              Um novo comentário foi adicionado ao seu chamado
            </Text>
          </Section>

          {/* Conteúdo principal */}
          <Section style={content}>
            {/* Card do ticket */}
            <Section style={ticketCard}>
              <Text style={ticketLabel}>Chamado</Text>
              <Text style={ticketTitleStyle}>{ticketTitle}</Text>
            </Section>

            {/* Saudação */}
            <Text style={greeting}>
              Olá <strong style={strongText}>{requesterName}</strong> 👋
            </Text>

            {/* Info do comentador */}
            <Section style={commentatorSection}>
              <Section style={commentatorName}>
                <Section style={avatarCircle}>
                  <Text style={avatarText}>
                    {commenterName.charAt(0).toUpperCase()}
                  </Text>
                </Section>
                <Section style={commentatorInfo}>
                  <Text style={commentatorName}>{commenterName}</Text>
                  <Text style={commentatorAction}>
                    adicionou um novo comentário
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Card do comentário */}
            <Section style={commentCard}>
              <Section style={commentHeader}>
                <Text style={commentBadge}>💬 Comentário</Text>
              </Section>
              <Text style={commentTextStyle}>{commentText}</Text>
            </Section>

            {/* Mensagem de ação */}
            <Text style={actionText}>
              Acesse o painel para visualizar todas as atualizações e responder
              ao comentário.
            </Text>

            {/* Botão de ação */}
            <Section style={btnContainer}>
              <Button style={button} href={ticketUrl}>
                <Text style={buttonText}>Ver Chamado Completo →</Text>
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <strong>SSI 1.06</strong>
            </Text>
            <Text style={footerSubtext}>
              Gerenciamento Inteligente de Chamados
            </Text>
            <Text style={footerCopyright}>
              © 2024 Sistema de Tickets. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>

        {/* Badge de segurança */}
        <Section style={securityBadge}>
          <Text style={securityText}>🔒 Email seguro e criptografado</Text>
        </Section>
      </Body>
    </Html>
  );
};

/* ============================
   ESTILOS MODERNOS E VIBRANTES
   ============================ */

const main = {
  backgroundColor: '#f1f5f9',
  padding: '40px 20px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
};

/* ==== HEADER COM GRADIENTE ==== */
const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
};

const iconText = {
  fontSize: '32px',
  margin: '0',
  lineHeight: '64px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 8px',
  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const subheading = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.9)',
  margin: '0',
  fontWeight: 400,
};

/* ==== CONTEÚDO ==== */
const content = {
  padding: '32px',
};

const ticketCard = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const ticketLabel = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const ticketTitleStyle = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#1e293b',
  margin: '0',
};

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0 0 24px',
};

const strongText = {
  color: '#1e293b',
  fontWeight: 600,
};

/* ==== SEÇÃO DO COMENTADOR ==== */
const commentatorSection = {
  marginBottom: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  padding: '20px',
  border: '2px solid #e2e8f0',
};

const avatarCircle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  margin: '0 auto 16px',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  border: '3px solid #ffffff',
  textAlign: 'center' as const,
};

const avatarText = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0',
  lineHeight: '50px',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const commentatorInfo = {
  textAlign: 'center' as const,
};

const commentatorName = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1e293b',
  margin: '0 0 4px',
};

const commentatorAction = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  fontWeight: 500,
};

/* ==== CARD DO COMENTÁRIO ==== */
const commentCard = {
  backgroundColor: '#fefce8',
  border: '2px solid #fde047',
  borderRadius: '16px',
  padding: '0',
  marginBottom: '24px',
  overflow: 'hidden',
};

const commentHeader = {
  backgroundColor: '#fef9c3',
  padding: '12px 20px',
  borderBottom: '1px solid #fde047',
};

const commentBadge = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#854d0e',
  margin: '0',
};

const commentTextStyle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#713f12',
  margin: '0',
  padding: '20px',
  fontStyle: 'italic',
};

const actionText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#64748b',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

/* ==== BOTÃO ==== */
const btnContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '16px',
  display: 'inline-block',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  border: 'none',
};

const buttonText = {
  margin: '0',
  color: '#ffffff',
};

/* ==== FOOTER ==== */
const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footer = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const footerText = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0 0 4px',
  fontWeight: 700,
};

const footerSubtext = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 16px',
};

const footerCopyright = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: '0',
};

/* ==== BADGE DE SEGURANÇA ==== */
const securityBadge = {
  textAlign: 'center' as const,
  marginTop: '20px',
};

const securityText = {
  fontSize: '12px',
  color: '#64748b',
  backgroundColor: '#f1f5f9',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0',
};

export default NewCommentEmail;
