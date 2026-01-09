export const sendNotifications = async (saleData: any) => {
  const { clientName, amount, service, clientEmail, clientPhone } = saleData;

  // 1. Send Email via an API route
  const emailRes = await fetch("/api/send-email", {
    method: "POST",
    body: JSON.stringify({
      to: clientEmail,
      subject: `Receipt: ${service} - Opolo CBT Resort`,
      html: `<p>Hello ${clientName}, thank you for your payment of ₦${amount} for ${service}.</p>`,
    }),
  });

  // 2. Send WhatsApp/SMS via Twilio (Placeholder Logic)
  // This requires a Twilio Account SID and Auth Token
  const messageBody = `Hello ${clientName}, Opolo CBT Resort has received your payment of N${amount} for ${service}. Thank you!`;
  
  const smsRes = await fetch("/api/send-sms", {
    method: "POST",
    body: JSON.stringify({
      to: clientPhone,
      message: messageBody,
    }),
  });

  return { emailRes, smsRes };
};