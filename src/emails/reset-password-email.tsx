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

interface ResetPasswordEmailProps {
  userFirstname: string;
  resetPasswordLink: string;
}

export const ResetPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Redefinição de senha do Portal de Chamados</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <div style={iconContainer}>
              <div style={iconCircle}>🔐</div>
            </div>
          </Section>
          {/* Conteúdo principal */}
          <Section style={content}>
            <Heading style={heading}>Redefinir a sua senha</Heading>

            <Text style={greeting}>Olá, {userFirstname}! 👋</Text>

            <Text style={text}>
              Recebemos um pedido para redefinir a senha da sua conta no{' '}
              <strong style={brandText}>SSI 1.06</strong>.
            </Text>

            <Text style={text}>
              Clique no botão abaixo para criar uma nova senha segura:
            </Text>

            {/* Botão de ação */}
            <Section style={btnContainer}>
              <Button style={button} href={resetPasswordLink}>
                Redefinir Senha Agora
              </Button>
            </Section>

            {/* Link alternativo */}
            <Text style={linkText}>
              Ou copie e cole este link no seu navegador:
            </Text>
            <Section style={linkContainer}>
              <Text style={link}>{resetPasswordLink}</Text>
            </Section>

            {/* Aviso de expiração */}
            <Section style={warningBox}>
              <Text style={warningText}>
                ⏱️ Este link expira em <strong>1 hora</strong> por segurança.
              </Text>
            </Section>

            {/* Aviso de segurança */}
            <Section style={securityBox}>
              <Text style={securityTitle}>
                🛡️ Não solicitou esta alteração?
              </Text>
              <Text style={securityText}>
                Se você não solicitou a redefinição de senha, ignore este email.
                Sua senha permanecerá inalterada e sua conta está segura.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Dicas de segurança */}
            <Section style={tipsBox}>
              <Text style={tipsTitle}>💡 Dicas de Segurança:</Text>
              <Text style={tipItem}>
                • Use uma senha forte com letras, números e símbolos
              </Text>
              <Text style={tipItem}>
                • Não compartilhe sua senha com ninguém
              </Text>
              <Text style={tipItem}>
                • Evite usar a mesma senha em outros sites
              </Text>
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
            <Text style={footerNote}>
              Este é um email automático. Por favor, não responda diretamente a
              esta mensagem.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos modernizados
const main = {
  backgroundColor: '#f0f4f8',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const header = {
  background: 'green',
  padding: '40px 0',
  textAlign: 'center' as const,
};

const iconContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const iconCircle = {
  borderRadius: '50%',
  width: '80px',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '40px',
  backdropFilter: 'blur(10px)',
  border: '3px solid rgba(255, 255, 255, 0.3)',
};

const content = {
  padding: '40px 30px',
};

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a202c',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const greeting = {
  fontSize: '18px',
  color: '#2d3748',
  margin: '0 0 16px 0',
  fontWeight: '600',
};

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
};

const brandText = {
  color: '#667eea',
  fontWeight: '600',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const button = {
  background: 'green',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '16px 40px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
};

const linkText = {
  color: '#718096',
  fontSize: '14px',
  margin: '24px 0 8px 0',
  textAlign: 'center' as const,
};

const linkContainer = {
  backgroundColor: '#f7fafc',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '8px 0 24px 0',
  border: '1px solid #e2e8f0',
};

const link = {
  color: '#667eea',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  margin: '0',
};

const warningBox = {
  backgroundColor: '#fef5e7',
  borderLeft: '4px solid #f39c12',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '24px 0',
};

const warningText = {
  color: '#7d6608',
  fontSize: '15px',
  margin: '0',
  lineHeight: '22px',
};

const securityBox = {
  backgroundColor: '#ebf8ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #bee3f8',
};

const securityTitle = {
  color: '#2c5282',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const securityText = {
  color: '#2d3748',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const tipsBox = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0 0 0',
};

const tipsTitle = {
  color: '#2d3748',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const tipItem = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
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

export default ResetPasswordEmail;
