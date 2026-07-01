import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AdminMessageTemplateProps {
  message: string;
  subject: string;
}

export const AdminMessageTemplate: React.FC<Readonly<AdminMessageTemplateProps>> = ({
  message,
  subject,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Geomining.id</Heading>
          
          <Text style={text}>Halo,</Text>
          <Section style={messageContainer}>
            {/* Split the message by newlines to render multiple paragraphs correctly */}
            {message.split('\n').map((paragraph, index) => (
              <Text key={index} style={text}>
                {paragraph}
              </Text>
            ))}
          </Section>
          
          <Text style={footer}>
            Terima kasih,
            <br />
            Tim Geomining
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  padding: "30px 0",
  margin: "0",
  borderBottom: "1px solid #e6ebf1",
};

const messageContainer = {
  padding: "24px 48px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "0 0 12px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 48px",
};
