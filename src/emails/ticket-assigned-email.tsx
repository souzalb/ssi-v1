/*
 * Template de email para "Chamado Atribuído".
 * Enviado ao técnico quando ele é designado para um chamado.
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
} from '@react-email/components';
import * as React from 'react';

// Props que o email espera receber
interface TicketAssignedEmailProps {
  technicianName: string;
  requesterName: string; // Quem abriu o chamado
  ticketTitle: string;
  ticketPriority: string;
  ticketUrl: string;
}

export const TicketAssignedEmail = ({
  technicianName,
  requesterName,
  ticketTitle,
  ticketPriority,
  ticketUrl,
}: TicketAssignedEmailProps) => {
  const previewText = `Novo chamado atribuído: ${ticketTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Novo Chamado Atribuído a Você</Heading>

          <Text style={text}>Olá, {technicianName},</Text>

          <Text style={text}>
            Um novo chamado foi atribuído à sua fila de atendimento.
          </Text>

          {/* Card com os detalhes do chamado */}
          <Section style={card}>
            <Text style={cardTitle}>
              <strong>{ticketTitle}</strong>
            </Text>
            <Text style={cardText}>
              <strong>Solicitante:</strong> {requesterName}
            </Text>
            <Text style={cardText}>
              <strong>Prioridade:</strong> {ticketPriority}
            </Text>
          </Section>

          <Text style={text}>
            Por favor, acesse o painel para revisar os detalhes e iniciar o
            atendimento.
          </Text>

          {/* Botão de Ação */}
          <Section style={btnContainer}>
            <Button style={button} href={ticketUrl}>
              Ver Chamado
            </Button>
          </Section>

          <Text style={footer}>Sistema de Chamados Internos</Text>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos (Podemos reutilizar os mesmos estilos do NewTicketEmail
// para manter a consistência da marca)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#484848',
  padding: '0 30px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 30px',
};

const card = {
  backgroundColor: '#f6f9fc',
  borderRadius: '4px',
  padding: '1px 20px',
  margin: '20px 30px',
  border: '1px solid #eee',
};

const cardTitle = {
  ...text,
  padding: '0',
  fontWeight: '600',
};

const cardText = {
  ...text,
  padding: '0',
  fontSize: '14px',
};

const btnContainer = {
  textAlign: 'center' as const,
  paddingTop: '10px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 30px',
  paddingTop: '10px',
};

export default TicketAssignedEmail;
