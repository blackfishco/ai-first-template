import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ContactMessageEmailProps {
  name: string;
  email: string;
  message: string;
}

/** Notification sent to the site owner when a visitor submits the contact form. */
export function ContactMessageEmail({
  name,
  email,
  message,
}: ContactMessageEmailProps) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>Nová zpráva z webu od {name}</Preview>
      <Body style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#111" }}>
        <Container style={{ maxWidth: "560px", padding: "24px" }}>
          <Heading as="h1" style={{ fontSize: "20px" }}>
            Nová zpráva z kontaktního formuláře
          </Heading>
          <Text>
            <strong>Jméno:</strong> {name}
            <br />
            <strong>E-mail:</strong> {email}
          </Text>
          <Hr />
          <Text style={{ whiteSpace: "pre-wrap" }}>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
