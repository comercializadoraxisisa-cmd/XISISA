// assets/js/contact.js

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (!form) {
    console.warn("No se encontró el formulario con id 'contact-form'.");
    return;
  }

  var statusBox = document.getElementById("contact-status");

  function setStatus(type, text) {
    if (!statusBox) return;
    statusBox.textContent = text;
    statusBox.className = ""; // limpia clases anteriores
    statusBox.classList.add("contact-status", "contact-status--" + type);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // IMPORTANTÍSIMO: evita el submit tradicional

    var formData = new FormData(form);
    var data = {
      name: (formData.get("name") || "").trim(),
      email: (formData.get("email") || "").trim(),
      phone: (formData.get("phone") || "").trim(),
      company: (formData.get("company") || "").trim(),
      city: (formData.get("city") || "").trim(),
      message: (formData.get("message") || "").trim()
    };

    if (!data.name || !data.email || !data.message) {
      setStatus("error", "Por favor llena al menos nombre, correo y mensaje.");
      return;
    }

    setStatus("info", "Enviando mensaje...");

    fetch("/.netlify/functions/send-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (json) {
          return { res: res, json: json };
        });
      })
      .then(function (payload) {
        var res = payload.res;
        var json = payload.json;

        if (!res.ok || !json.success) {
          console.error("Error desde función send-contact:", {
            status: res.status,
            body: json
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
      })
      .catch(function (err) {
        console.error("Error de red o JS:", err);
        setStatus(
          "error",
          "No pudimos contactar al servidor. Intenta de nuevo más tarde."
        );
      });
  });
});
