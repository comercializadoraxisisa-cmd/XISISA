// assets/js/contact.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const statusBox = document.querySelector("#contact-status");

  const setStatus = (type, text) => {
    if (!statusBox) return;
    statusBox.textContent = text;
    statusBox.className = "";
    statusBox.classList.add("contact-status", `contact-status--${type}`);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get("name")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      company: formData.get("company")?.toString().trim(),
      city: formData.get("city")?.toString().trim(),
      message: formData.get("message")?.toString().trim(),
    };

    if (!data.name || !data.email || !data.message) {
      setStatus("error", "Por favor llena al menos nombre, correo y mensaje.");
      return;
    }

    setStatus("info", "Enviando mensaje...");

    try {
      const res = await fetch("/.netlify/functions/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    
      const json = await res.json().catch(() => ({}));
    
      if (!res.ok || !json.success) {
        console.error("Error desde función send-contact:", {
          status: res.status,
          body: json,
        });
        setStatus(
          "error",
          "Ocurrió un problema al enviar tu mensaje. Intenta de nuevo."
        );
        return;
      }
    
      setStatus(
        "success",
        "Tu mensaje se envió correctamente. En breve nos pondremos en contacto."
      );
      form.reset();
    } catch (err) {
      console.error("Error de red o JS:", err);
      setStatus(
        "error",
        "No pudimos contactar al servidor. Intenta de nuevo más tarde."
      );
    }

