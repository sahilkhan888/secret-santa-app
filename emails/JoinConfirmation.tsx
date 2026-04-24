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

interface JoinConfirmationProps {
  name: string;
  eventName: string;
  magicLinkUrl: string;
  revealAtFormatted: string;
}

export default function JoinConfirmation({
  name = 'Friend',
  eventName = 'Holiday 2026',
  magicLinkUrl = 'https://example.com/auth/callback',
  revealAtFormatted = 'Wednesday, 24 December',
}: JoinConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>You&rsquo;re in for {eventName}. Reveal opens on {revealAtFormatted}.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={wordmark}>Santa</Text>
          <Heading style={heading}>Welcome, {name}.</Heading>
          <Text style={paragraph}>
            You&rsquo;re signed up for {eventName}. Reveal opens on{' '}
            <strong>{revealAtFormatted}</strong>.
          </Text>
          <Section style={{ marginTop: 24, marginBottom: 24 }}>
            <Button style={button} href={magicLinkUrl}>
              View your dashboard
            </Button>
          </Section>
          <Text style={small}>
            This link signs you in without a password. If you didn&rsquo;t sign up, you can safely
            ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#FAF3E0',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: 480,
  margin: '0 auto',
  padding: '48px 24px',
};

const wordmark: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: 20,
  color: '#0F3D2E',
  letterSpacing: 0.5,
  margin: 0,
};

const heading: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: 32,
  lineHeight: 1.2,
  color: '#0F3D2E',
  marginTop: 32,
  marginBottom: 16,
};

const paragraph: React.CSSProperties = {
  color: '#0F3D2E',
  fontSize: 15,
  lineHeight: 1.6,
  margin: 0,
};

const button: React.CSSProperties = {
  backgroundColor: '#D4A574',
  color: '#0F3D2E',
  padding: '14px 28px',
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};

const small: React.CSSProperties = {
  color: 'rgba(15, 61, 46, 0.6)',
  fontSize: 12,
  marginTop: 32,
};
