const nodemailer = require('nodemailer');

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email de confirmação de agendamento
async function sendAppointmentConfirmation(to, data) {
  const { service, date, time, appointmentId } = data;
  
  // Formata a data para exibição
  const formattedDate = new Date(date).toLocaleDateString('pt-BR');
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: '✅ Beauty Clinic - Agendamento Confirmado!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9b59b6, #6c3483); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Beauty Clinic</h1>
          <p style="color: #f0e6ff; margin: 5px 0 0;">Especialista em remoção de tatuagens</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #6c3483;">✅ Agendamento Confirmado!</h2>
          
          <p>Olá, seu agendamento foi realizado com sucesso. Confira os detalhes abaixo:</p>
          
          <div style="background: #f9f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💆‍♀️ Serviço:</strong> ${service}</p>
            <p><strong>📅 Data:</strong> ${formattedDate}</p>
            <p><strong>⏰ Horário:</strong> ${time}</p>
            <p><strong>🆔 Código do agendamento:</strong> ${appointmentId}</p>
          </div>
          
          <p><strong>📌 Importante:</strong></p>
          <ul>
            <li>Chegue com 10 minutos de antecedência</li>
            <li>Traga um documento de identificação</li>
            <li>Em caso de atraso acima de 15 minutos, seu horário será remanejado</li>
            <li>Cancelamentos devem ser feitos com 24h de antecedência</li>
          </ul>
          
          <div style="background: #6c3483; padding: 12px; text-align: center; border-radius: 8px; margin-top: 20px;">
            <p style="color: white; margin: 0;">📍 Rua da Beleza, 123 - Centro</p>
            <p style="color: #f0e6ff; margin: 5px 0 0;">📞 (11) 99999-9999</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>Este é um email automático, por favor não responder.</p>
          <p>Beauty Clinic - Transformando vidas com tecnologia 💜</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

// Email de boas-vindas
async function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: '💜 Bem-vinda à Beauty Clinic!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9b59b6, #6c3483); padding: 20px; text-align: center;">
          <h1 style="color: white;">Bem-vinda, ${name}!</h1>
        </div>
        <div style="background: white; padding: 30px;">
          <p>Que bom ter você conosco! 💜</p>
          <p>Na Beauty Clinic, você encontra os melhores tratamentos para realçar sua beleza com segurança e tecnologia de ponta.</p>
          <p>Explore nossos serviços e agende sua primeira consulta!</p>
          <a href="https://beautyclinic.com.br" style="background: #9b59b6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Conhecer serviços</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendAppointmentConfirmation, sendWelcomeEmail };