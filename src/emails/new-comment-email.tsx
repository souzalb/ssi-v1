/*
 * Template de email para "Novo Comentário".
 * Enviado ao solicitante quando há uma nova atualização (não interna) no seu chamado.
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
  Hr, // Vamos adicionar um separador
} from '@react-email/components';
import * as React from 'react';

// Props que o email espera receber
interface NewCommentEmailProps {
  requesterName: string; // Nome do solicitante (quem recebe)
  commenterName: string; // Nome de quem comentou (técnico/gestor)
  ticketTitle: string;
  commentText: string; // O texto do comentário
  ticketUrl: string;
}

export const NewCommentEmail = ({
  requesterName,
  commenterName,
  ticketTitle,
  commentText,
  ticketUrl,
}: NewCommentEmailProps) => {
  const previewText = `Novo comentário no seu chamado: ${ticketTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Atualização no seu Chamado: {ticketTitle}
          </Heading>

          <Text style={text}>Olá, {requesterName},</Text>

          <Text style={text}>
            <strong>{commenterName}</strong> adicionou um novo comentário ao seu
            chamado:
          </Text>

          {/* Card com o comentário */}
          <Section style={commentSection}>
            <Text style={commentTextStyle}>{commentText}</Text>
          </Section>

          <Text style={text}>
            Por favor, acesse o painel para ver o histórico completo ou para
            responder.
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

// Estilo para a caixa do comentário
const commentSection = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #eee',
  borderRadius: '4px',
  padding: '1px 20px',
  margin: '20px 30px',
};

const commentTextStyle = {
  ...text,
  padding: '0',
  fontStyle: 'italic',
  color: '#333',
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

export default NewCommentEmail;
