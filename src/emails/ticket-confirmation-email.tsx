/*
 * Template de email para "Confirmação de Solicitação" modernizado
 * Enviado ao usuário quando ele cria um novo chamado
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

interface TicketConfirmationEmailProps {
  requesterName: string;
  ticketTitle: string;
  ticketDescription: string;
  ticketPriority: string;
  ticketUrl: string;
  ticketId: string;
  areaName?: string;
  location?: string;
  equipment?: string;
  createdAt: Date;
}

const priorityConfig: Record<
  string,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  URGENT: {
    label: 'Urgente',
    emoji: '🔴',
    color: '#991b1b',
    bg: '#fef2f2',
    border: '#fca5a5',
  },
  HIGH: {
    label: 'Alta',
    emoji: '🟠',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fdba74',
  },
  MEDIUM: {
    label: 'Média',
    emoji: '🟡',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
  },
  LOW: {
    label: 'Baixa',
    emoji: '⚪',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
  },
};

export const TicketConfirmationEmail = ({
  requesterName,
  ticketTitle,
  ticketDescription,
  ticketPriority,
  ticketUrl,
  ticketId,
  areaName,
  location,
  equipment,
  createdAt,
}: TicketConfirmationEmailProps) => {
  const previewText = `✅ Chamado criado com sucesso: ${ticketTitle}`;
  const priority = priorityConfig[ticketPriority] || priorityConfig.MEDIUM;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <Text style={iconText}>✅</Text>

            <Heading style={heading}>Solicitação Confirmada</Heading>
            <Text style={subheading}>
              Seu chamado foi registrado com sucesso
            </Text>
          </Section>

          {/* Conteúdo principal */}
          <Section style={content}>
            {/* Saudação */}
            <Text style={greeting}>
              Olá <strong style={strongText}>{requesterName}</strong> 👋
            </Text>

            <Text style={descriptionText}>
              Recebemos sua solicitação e ela já foi registrada em nosso
              sistema. Nossa equipe será notificada e em breve iniciará o
              atendimento.
            </Text>

            {/* Card de Sucesso */}
            <Section style={successCard}>
              <Text style={successIcon}>🎉</Text>
              <Text style={successTitle}>Chamado Criado!</Text>
              <Text style={successText}>
                Você receberá notificações por email sobre todas as atualizações
                deste chamado.
              </Text>
            </Section>

            {/* Card do Ticket */}
            <Section style={ticketCard}>
              <Text style={ticketLabel}>Título do Chamado</Text>
              <Text style={ticketTitleStyle}>{ticketTitle}</Text>
              <Text style={ticketIdStyle}>
                <span style={ticketIdLabel}>ID:</span> {ticketId}
              </Text>
            </Section>

            {/* Badge de Prioridade */}
            <Section style={prioritySection}>
              <Text style={priorityLabel}>Prioridade Definida</Text>
              <div
                style={{
                  ...priorityBadge,
                  backgroundColor: priority.bg,
                  borderColor: priority.border,
                }}
              >
                <Text
                  style={{
                    ...priorityText,
                    color: priority.color,
                  }}
                >
                  {priority.emoji} {priority.label}
                </Text>
              </div>
            </Section>

            {/* Descrição */}
            <Section style={descriptionCard}>
              <Text style={descriptionLabel}>Descrição</Text>
              <Text style={descriptionValue}>{ticketDescription}</Text>
            </Section>

            {/* Grid de Detalhes */}
            <Section style={detailsGrid}>
              {/* Área */}
              {areaName && (
                <Section style={detailCard}>
                  <Text style={detailIcon}>🏢</Text>
                  <Text style={detailLabel}>Área</Text>
                  <Text style={detailValue}>{areaName}</Text>
                </Section>
              )}

              {/* Localização */}
              {location && (
                <Section style={detailCard}>
                  <Text style={detailIcon}>📍</Text>
                  <Text style={detailLabel}>Localização</Text>
                  <Text style={detailValue}>{location}</Text>
                </Section>
              )}

              {/* Equipamento */}
              {equipment && (
                <Section style={detailCard}>
                  <Text style={detailIcon}>🔧</Text>
                  <Text style={detailLabel}>Equipamento</Text>
                  <Text style={detailValue}>{equipment}</Text>
                </Section>
              )}

              {/* Data de Criação */}
              <Section style={detailCard}>
                <Text style={detailIcon}>📅</Text>
                <Text style={detailLabel}>Criado em</Text>
                <Text style={detailValue}>
                  {createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Section>
            </Section>

            {/* Próximos Passos */}
            <Section style={nextStepsCard}>
              <Text style={nextStepsTitle}>📋 Próximos Passos</Text>
              <Section style={stepItem}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepText}>
                  Nossa equipe analisará sua solicitação
                </Text>
              </Section>
              <Section style={stepItem}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepText}>
                  Um técnico será atribuído ao chamado
                </Text>
              </Section>
              <Section style={stepItem}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepText}>
                  Você receberá atualizações por email
                </Text>
              </Section>
            </Section>

            {/* Mensagem de ação */}
            <Text style={actionText}>
              Você pode acompanhar o andamento do seu chamado a qualquer momento
              através do painel.
            </Text>

            {/* Botão de ação */}
            <Section style={btnContainer}>
              <Button style={button} href={ticketUrl}>
                <Text style={buttonText}>Acompanhar Chamado →</Text>
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
  background: 'green',
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

/* ==== CARD DE SUCESSO ==== */
const successCard = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
  display: 'block',
};

const successTitle = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#15803d',
  margin: '0 0 8px',
};

const successText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#16a34a',
  margin: '0',
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

/* ==== PRIORIDADE ==== */
const prioritySection = {
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const priorityLabel = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px',
  display: 'block',
};

const priorityBadge = {
  display: 'inline-block',
  padding: '10px 20px',
  borderRadius: '24px',
  border: '2px solid',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const priorityText = {
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.3px',
  margin: '0',
};

/* ==== DESCRIÇÃO ==== */
const descriptionCard = {
  backgroundColor: '#fffbeb',
  border: '2px solid #fcd34d',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
};

const descriptionLabel = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#92400e',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
  display: 'block',
};

const descriptionValue = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#78350f',
  margin: '0',
  fontStyle: 'italic',
};

/* ==== GRID DE DETALHES ==== */
const detailsGrid = {
  marginBottom: '24px',
};

const detailCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  textAlign: 'center' as const,
};

const detailIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
  display: 'block',
};

const detailLabel = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
  display: 'block',
};

const detailValue = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#1e293b',
  margin: '0',
  display: 'block',
};

/* ==== PRÓXIMOS PASSOS ==== */
const nextStepsCard = {
  backgroundColor: '#eff6ff',
  border: '2px solid #93c5fd',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
};

const nextStepsTitle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1e40af',
  margin: '0 0 16px',
  display: 'block',
};

const stepItem = {
  marginBottom: '12px',
  display: 'table',
  width: '100%',
};

const stepNumber = {
  display: 'table-cell',
  width: '32px',
  height: '32px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '32px',
  fontSize: '14px',
  fontWeight: 700,
  verticalAlign: 'top',
};

const stepText = {
  display: 'table-cell',
  paddingLeft: '12px',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#1e40af',
  margin: '0',
  verticalAlign: 'middle' as const,
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
  background: 'green',
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

export default TicketConfirmationEmail;
