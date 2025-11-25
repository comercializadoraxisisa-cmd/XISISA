const RESEND_ENDPOINT = "https://api.resend.com/emails";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("JSON parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  const { name, email, phone, company, city, message } = body;

  if (!name || !email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Nombre, correo y mensaje son obligatorios.",
      }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;

  // AQUÍ: siempre enviamos al Gmail
  const toEmail = "comercializadora.xisisa@gmail.com";

  // AQUÍ: usamos un remitente permitido por Resend
  // (cuando verifiques tu dominio, cambiamos esto)
  const fromEmail = "onboarding@resend.dev";

  if (!apiKey) {
    console.error("RESEND_API_KEY no está definida en Netlify.");
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error de configuración del servidor (API Key).",
      }),
    };
  }

  const subject = `Nuevo mensaje de contacto - ${name}`;
  const html = `
    <h2>Nuevo mensaje desde el sitio web</h2>
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Correo:</strong> ${email}</p>
    ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ""}
    ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ""}
    ${city ? `<p><strong>Ciudad:</strong> ${city}</p>` : ""}
    <p><strong>Mensaje:</strong></p>
    <p>${(message || "").replace(/\n/g, "<br>")}</p>
  `;

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
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

    const text = await resendResponse.text();

    console.log("Resend status:", resendResponse.status);
    console.log("Resend body:", text);

    if (!resendResponse.ok) {
      return {
        statusCode: resendResponse.status,
        body: JSON.stringify({
          error: "RESEND_ERROR",
          detail: text,
        }),
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
      body: JSON.stringify({
        error: "Error interno del servidor.",
        detail: String(err),
      }),
    };
  }
};
