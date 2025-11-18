/*
 * Template de email para "Atualização de Status" modernizado
 */

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
import { Status } from '@prisma/client';

interface TicketStatusUpdateEmailProps {
  requesterName: string;
  updaterName: string;
  ticketTitle: string;
  oldStatus: Status;
  newStatus: Status;
  ticketUrl: string;
  ticketId?: string;
  updatedAt?: Date;
}

const statusConfig: Record<
  Status,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  OPEN: {
    label: 'Aberto',
    emoji: '📋',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#93c5fd',
  },
  ASSIGNED: {
    label: 'Atribuído',
    emoji: '👤',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    emoji: '⚙️',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
  },
  ON_HOLD: {
    label: 'Em Espera',
    emoji: '⏸️',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fdba74',
  },
  RESOLVED: {
    label: 'Resolvido',
    emoji: '✅',
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#86efac',
  },
  CLOSED: {
    label: 'Fechado',
    emoji: '🔒',
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#d1d5db',
  },
  CANCELLED: {
    label: 'Cancelado',
    emoji: '❌',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fca5a5',
  },
};

export const TicketStatusUpdateEmail = ({
  requesterName,
  updaterName,
  ticketTitle,
  oldStatus,
  newStatus,
  ticketUrl,
  ticketId,
  updatedAt,
}: TicketStatusUpdateEmailProps) => {
  const previewText = `🔄 Status atualizado: ${statusConfig[newStatus].label}`;
  const oldStatusInfo = statusConfig[oldStatus];
  const newStatusInfo = statusConfig[newStatus];

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <Text style={iconText}>🔔</Text>

            <Heading style={heading}>Status Atualizado</Heading>
            <Text style={subheading}>
              Seu chamado teve uma mudança de status
            </Text>
          </Section>

          {/* Conteúdo principal */}
          <Section style={content}>
            {/* Saudação */}
            <Text style={greeting}>
              Olá <strong style={strongText}>{requesterName}</strong> 👋
            </Text>

            <Text style={descriptionText}>
              <strong style={strongText}>{updaterName}</strong> atualizou o
              status do seu chamado.
            </Text>

            {/* Card do Ticket */}
            <Section style={ticketCard}>
              <Text style={ticketLabel}>Chamado</Text>
              <Text style={ticketTitleStyle}>{ticketTitle}</Text>
              {ticketId && (
                <Text style={ticketIdStyle}>
                  <span style={ticketIdLabel}>ID:</span> {ticketId}
                </Text>
              )}
            </Section>

            {/* Comparação de Status */}
            <Section style={statusComparisonSection}>
              {/* Status Anterior */}
              <Section style={statusCardWrapper}>
                <Text style={statusCardLabel}>Status Anterior</Text>
                <div
                  style={{
                    ...statusBadge,
                    backgroundColor: oldStatusInfo.bg,
                    borderColor: oldStatusInfo.border,
                    opacity: 0.6,
                  }}
                >
                  <Text
                    style={{
                      ...statusText,
                      color: oldStatusInfo.color,
                      textDecoration: 'line-through',
                    }}
                  >
                    {oldStatusInfo.emoji} {oldStatusInfo.label}
                  </Text>
                </div>
              </Section>

              {/* Seta de transição */}
              <Section style={arrowSection}>
                <Text style={arrowIcon}>↓</Text>
              </Section>

              {/* Novo Status */}
              <Section style={statusCardWrapper}>
                <Text style={statusCardLabel}>Novo Status</Text>
                <div
                  style={{
                    ...statusBadge,
                    backgroundColor: newStatusInfo.bg,
                    borderColor: newStatusInfo.border,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <Text
                    style={{
                      ...statusText,
                      color: newStatusInfo.color,
                    }}
                  >
                    {newStatusInfo.emoji} {newStatusInfo.label}
                  </Text>
                </div>
              </Section>
            </Section>

            {/* Info adicional - Data */}
            {updatedAt && (
              <Section style={infoCard}>
                <Text style={infoIcon}>📅</Text>
                <Text style={infoLabel}>Atualizado em</Text>
                <Text style={infoValue}>
                  {updatedAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Section>
            )}

            {/* Mensagem de ação */}
            <Text style={actionText}>
              Acesse o sistema para visualizar todos os detalhes e histórico do
              chamado.
            </Text>

            {/* Botão de ação */}
            <Section style={btnContainer}>
              <Button style={button} href={ticketUrl}>
                <Text style={buttonText}>Visualizar Chamado →</Text>
              </Button>
            </Section>

            {/* Link alternativo */}
            <Text style={helpText}>
              Ou copie e cole este link no navegador:
              <br />
              <a href={ticketUrl} style={linkStyle}>
                {ticketUrl}
              </a>
            </Text>
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
            <Text style={footerNote}>
              Este é um email automático. Por favor, não responda diretamente a
              esta mensagem.
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
   ESTILOS MODERNOS
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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
};

const iconBadge = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  border: '2px solid rgba(255,255,255,0.3)',
  textAlign: 'center' as const,
  lineHeight: '64px',
};

const iconText = {
  fontSize: '32px',
  margin: '0',
  lineHeight: '64px',
  display: 'inline-block',
  verticalAlign: 'middle' as const,
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

const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  color: '#475569',
  margin: '0 0 12px',
  fontWeight: 600,
};

const strongText = {
  color: '#1e293b',
  fontWeight: 700,
};

const descriptionText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#64748b',
  margin: '0 0 24px',
};

/* ==== CARD DO TICKET ==== */
const ticketCard = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
};

const ticketLabel = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
  display: 'block',
};

const ticketTitleStyle = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#1e293b',
  margin: '0 0 8px',
  lineHeight: '28px',
};

const ticketIdStyle = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
  fontFamily: 'monospace',
};

const ticketIdLabel = {
  fontWeight: 600,
  color: '#475569',
};

/* ==== COMPARAÇÃO DE STATUS ==== */
const statusComparisonSection = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
};

const statusCardWrapper = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const statusCardLabel = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  display: 'block',
};

const statusBadge = {
  display: 'inline-block',
  padding: '12px 24px',
  borderRadius: '24px',
  border: '2px solid',
  marginBottom: '8px',
};

const statusText = {
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.3px',
  margin: '0',
};

const arrowSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const arrowIcon = {
  fontSize: '32px',
  color: '#10b981',
  margin: '0',
  fontWeight: 700,
};

/* ==== CARD DE INFO ==== */
const infoCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const infoIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
  display: 'block',
};

const infoLabel = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
  display: 'block',
};

const infoValue = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#1e293b',
  margin: '0',
  display: 'block',
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
  marginBottom: '20px',
};

const button = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '16px',
  display: 'inline-block',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
  border: 'none',
};

const buttonText = {
  margin: '0',
  color: '#ffffff',
};

const helpText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#94a3b8',
  margin: '0',
  textAlign: 'center' as const,
};

const linkStyle = {
  color: '#10b981',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
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

const footerNote = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
  fontStyle: 'italic' as const,
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

export default TicketStatusUpdateEmail;
