/*
 * Template de email modernizado para notificação de novo chamado
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

interface NewTicketEmailProps {
  managerName: string;
  requesterName: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketUrl: string;
  ticketId?: string;
  areaName?: string;
  createdAt?: Date;
}

// Mapeamento de prioridades
const priorityConfig: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  URGENT: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fca5a5',
    label: '🔴 Urgente',
  },
  HIGH: {
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fdba74',
    label: '🟠 Alta',
  },
  MEDIUM: {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fcd34d',
    label: '🟡 Média',
  },
  LOW: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
    label: '⚪ Baixa',
  },
};

export const NewTicketEmail = ({
  managerName,
  requesterName,
  ticketTitle,
  ticketPriority,
  ticketUrl,
  ticketId,
  areaName,
  createdAt,
}: NewTicketEmailProps) => {
  const previewText = `Novo chamado: ${ticketTitle}`;
  const priority = priorityConfig[ticketPriority] || priorityConfig.MEDIUM;

  function renderDetailRow(
    icon: string,
    label: string,
    value: string | undefined | null,
  ) {
    if (!value) return null;

    return (
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          marginBottom: '14px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0', // borda suave
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)', // sombra leve estilo card
        }}
      >
        <tbody>
          <tr>
            {/* Ícone */}
            <td
              width="56"
              style={{
                verticalAlign: 'middle',
                padding: '12px',
                borderTopLeftRadius: '12px',
                borderBottomLeftRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'inline-block',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  textAlign: 'center',
                  lineHeight: '36px',
                  fontSize: '18px',
                  color: '#1f2937',
                  fontFamily: 'sans-serif',
                }}
              >
                {icon}
              </div>
            </td>

            {/* Conteúdo */}
            <td
              style={{
                verticalAlign: 'middle',
                padding: '12px',
                borderTopRightRadius: '12px',
                borderBottomRightRadius: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginTop: '6px',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {value}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente vibrante */}
          <Section style={header}>
            <div style={headerGradient} />
            <div style={headerContent}>
              <Heading style={heading}>🎫 Novo Chamado Recebido</Heading>
              <Text style={headerSubtext}>Ação necessária na sua área</Text>
            </div>
          </Section>

          {/* Saudação personalizada */}
          <Section style={greetingSection}>
            <Text style={greetingText}>
              Olá, <span style={boldText}>{managerName}</span> 👋
            </Text>
            <Text style={descriptionText}>
              Um novo chamado foi registrado no sistema e aguarda sua análise
              para atribuição de técnico.
            </Text>
          </Section>

          {/* Card principal - Informações do ticket */}
          <Section style={mainCard}>
            {/* Badge de prioridade */}
            <div
              style={{
                ...priorityBadge,
                backgroundColor: priority.bg,
                borderColor: priority.border,
              }}
            >
              <span
                style={{
                  ...priorityText,
                  color: priority.text,
                }}
              >
                {priority.label}
              </span>
            </div>

            {/* Título do chamado */}
            <Heading style={ticketTitleStyle}>{ticketTitle}</Heading>

            {/* Grid de detalhes */}
            <div style={{ width: '100%', marginTop: 0 }}>
              {renderDetailRow('👤', 'Solicitante', requesterName)}
              {areaName && renderDetailRow('🏢', 'Área Responsável', areaName)}
              {ticketId && renderDetailRow('🔖', 'ID do Chamado', ticketId)}
              {createdAt &&
                renderDetailRow(
                  '📅',
                  'Data de Abertura',
                  createdAt.toLocaleDateString(),
                )}
            </div>
          </Section>

          {/* Call to action */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Por favor, acesse o sistema para visualizar os detalhes completos
              e atribuir um técnico ao chamado.
            </Text>

            <div style={btnWrapper}>
              <Button style={button} href={ticketUrl}>
                <span style={buttonIcon}>✨</span>
                <span style={buttonText}>Visualizar Chamado</span>
              </Button>
            </div>

            <Text style={helpText}>
              Ou copie e cole este link no navegador:
              <br />
              <a href={ticketUrl} style={linkStyle}>
                {ticketUrl}
              </a>
            </Text>
          </Section>

          {/* Divider elegante */}
          <Hr style={divider} />

          {/* Footer informativo */}
          <Section style={footerSection}>
            <Text style={footerTitle}>Sistema de Chamados Internos</Text>
            <Text style={footerText}>
              Este é um email automático. Por favor, não responda diretamente a
              esta mensagem.
            </Text>
            <Text style={footerSubtext}>
              Para suporte técnico, entre em contato com a equipe de TI.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ==================== ESTILOS ====================

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow:
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

const header = {
  position: 'relative' as const,
  backgroundColor: '#ffffff',
};

const headerGradient = {
  height: '5px',
  background:
    'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 33%, #ec4899 66%, #f59e0b 100%)',
};

const headerContent = {
  padding: '40px 40px 32px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.2',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px',
};

const headerSubtext = {
  fontSize: '15px',
  color: '#64748b',
  margin: '0',
  fontWeight: '500',
};

const greetingSection = {
  padding: '0 40px 24px',
};

const greetingText = {
  fontSize: '20px',
  lineHeight: '28px',
  color: '#1e293b',
  margin: '0 0 12px 0',
  fontWeight: '600',
};

const boldText = {
  fontWeight: '700',
  color: '#0f172a',
};

const descriptionText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#64748b',
  margin: '0',
};

const mainCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '28px 32px',
  margin: '0 auto 28px',
  width: '85%',
  border: '2px solid #e2e8f0',
  boxSizing: 'border-box' as const,
};

const priorityBadge = {
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '24px',
  border: '2px solid',
  marginBottom: '20px',
};

const priorityText = {
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '0.3px',
  margin: '0',
};

const ticketTitleStyle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#0f172a',
  lineHeight: '32px',
  margin: '0 0 24px 0',
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '14px',
};

const detailCard = {
  backgroundColor: '#ffffff',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  minHeight: '60px',
  boxSizing: 'border-box' as const,
};

const detailIcon = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  backgroundColor: '#f1f5f9',
  fontSize: '20px',
  lineHeight: '1',
  flexShrink: 0,
};
const detailContent = {
  flex: '1',
};

const detailLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#64748b',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0',
};

const ctaSection = {
  padding: '0 40px 40px',
  textAlign: 'center' as const,
};

const ctaText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0 0 24px 0',
};

const btnWrapper = {
  marginBottom: '20px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '16px 32px',
  display: 'inline-block',
  boxShadow:
    '0 4px 6px -1px rgba(59, 130, 246, 0.4), 0 2px 4px -1px rgba(59, 130, 246, 0.3)',
};

const buttonIcon = {
  marginRight: '8px',
};

const buttonText = {
  letterSpacing: '0.3px',
};

const helpText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#94a3b8',
  margin: '0',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '40px',
};

const footerSection = {
  padding: '0 40px 40px',
  textAlign: 'center' as const,
};

const footerTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#475569',
  margin: '0 0 8px 0',
};

const footerText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#64748b',
  margin: '0 0 8px 0',
};

const footerSubtext = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#94a3b8',
  margin: '0',
  fontStyle: 'italic' as const,
};

export default NewTicketEmail;
