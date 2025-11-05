/*
 * Template de email para "Atualização de Status".
 * Enviado ao solicitante sempre que o status do seu chamado muda.
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
import { Status } from '@prisma/client'; // Importa o enum Status

// Props que o email espera receber
interface TicketStatusUpdateEmailProps {
  requesterName: string; // Nome do solicitante (quem recebe)
  updaterName: string; // Nome de quem atualizou (técnico/gestor)
  ticketTitle: string;
  oldStatus: Status; // O status antigo
  newStatus: Status; // O novo status
  ticketUrl: string;
}

export const TicketStatusUpdateEmail = ({
  requesterName,
  updaterName,
  ticketTitle,
  oldStatus,
  newStatus,
  ticketUrl,
}: TicketStatusUpdateEmailProps) => {
  const previewText = `O status do seu chamado mudou para ${newStatus}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            O status do seu chamado foi atualizado
          </Heading>

          <Text style={text}>Olá, {requesterName},</Text>

          <Text style={text}>
            <strong>{updaterName}</strong> atualizou o status do seu chamado:
            &ldquo;
            {ticketTitle}&rdquo;.
          </Text>

          {/* Card com a mudança de status */}
          <Section style={statusChangeSection}>
            <Text style={statusChangeText}>
              De: <span style={statusOld}>{oldStatus}</span>
            </Text>
            <Text style={statusChangeText}>
              Para: <span style={statusNew}>{newStatus}</span>
            </Text>
          </Section>

          <Text style={text}>
            Por favor, acesse o painel para ver o histórico completo.
          </Text>

          {/* Botão de Ação */}
          <Section style={btnContainer}>
            <Button style={button} href={ticketUrl}>
              Ver Chamado
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Sistema de Chamados Internos</Text>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos (Reutilizando a maior parte dos estilos anteriores)

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

// Estilo para a caixa de mudança de status
const statusChangeSection = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #eee',
  borderRadius: '4px',
  padding: '10px 20px',
  margin: '20px 30px',
};

const statusChangeText = {
  ...text,
  padding: '0',
  lineHeight: '1.5',
  fontSize: '16px',
};

const statusOld = {
  textDecoration: 'line-through',
  color: '#777',
};

const statusNew = {
  fontWeight: '600',
  color: '#000',
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

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 30px',
};

export default TicketStatusUpdateEmail;
