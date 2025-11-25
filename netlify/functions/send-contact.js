// netlify/functions/send-contact.js

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { name, email, phone, company, message } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Nombre, correo y mensaje son obligatorios." }),
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || "comercializadora.xisisa@gmail.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || "notificaciones@tudominio.com";

    if (!apiKey) {
      console.error("RESEND_API_KEY no está definida");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error de configuración del servidor." }),
      };
    }

    const subject = `Nuevo mensaje de contacto - ${name}`;
    const html = `
      <h2>Nuevo mensaje desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ""}
      ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ""}
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `COMERCIALIZADORA XISISA <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error de Resend:", errorText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "No se pudo enviar el correo." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Error en send-contact:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor." }),
    };
  }
};
