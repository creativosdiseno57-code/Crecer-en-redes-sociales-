const $ = (id) => document.getElementById(id);

function slugify(text) {
  return (text || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9s]/g, " ")
    .trim()
    .replace(/s+/g, " ");
}

function toHashtag(word) {
  const clean = slugify(word).split(" ").filter(Boolean);
  if (!clean.length) return "";
  const camel = clean.map((w, i) =>
    i === 0 ? w.toLowerCase() : (w[0].toUpperCase() + w.slice(1).toLowerCase())
  ).join("");
  return "#" + camel;
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function buildHashtags({ topic, intent, network, location, count }) {
  const baseTopic = slugify(topic);
  const baseLoc = slugify(location);

  const intentMap = {
    tutorial: ["como hacer", "paso a paso", "guia", "tutorial", "aprende"],
    tips: ["tips", "consejos", "trucos", "hack", "rapido"],
    errores: ["errores", "no lo hagas", "aprendizaje", "mejoras"],
    caso: ["caso real", "resultados", "antes y despues", "experiencia"],
    ventas: ["emprendimiento", "negocio", "ventas", "cliente", "oferta"]
  };

  const networkTags =
    network === "tiktok" ? ["tiktok", "tiktokcolombia", "parati", "fyp"] :
    network === "facebook" ? ["facebook", "facebookreels", "reels", "comunidad"] :
    ["tiktok", "facebook", "reels", "creadores"];

  const genericGrowth = [
    "crecimiento organico", "marketing digital", "creadores de contenido",
    "estrategia", "contenido", "viral", "alcance", "engagement",
    "2026"
  ];

  const pieces = [];

  pieces.push(toHashtag(baseTopic));
  pieces.push(toHashtag(baseTopic + " 2026"));

  const words = baseTopic.split(" ").filter(Boolean);
  if (words.length >= 2) {
    pieces.push(toHashtag(words.slice(0, 1).join(" ")));
    pieces.push(toHashtag(words.slice(0, 2).join(" ")));
  }

  (intentMap[intent] || []).forEach(k => {
    pieces.push(toHashtag(baseTopic + " " + k));
    pieces.push(toHashtag(k));
  });

  networkTags.forEach(k => pieces.push(toHashtag(k)));
  genericGrowth.forEach(k => pieces.push(toHashtag(k)));

  if (baseLoc) {
    pieces.push(toHashtag(baseLoc));
    pieces.push(toHashtag(baseTopic + " " + baseLoc));
    pieces.push(toHashtag("colombia"));
  }

  return unique(pieces).slice(0, count).join(" ");
}

// Como usas defer, el DOM ya está listo cuando corre este JS:
const topic = $("topic");
const intent = $("intent");
const network = $("network");
const location = $("location");
const count = $("count");
const output = $("output");
const status = $("status");
const generate = $("generate");
const copy = $("copy");

function setStatus(msg) { if (status) status.textContent = msg || ""; }

if (!topic || !generate || !output) {
  // Si esto pasa, es porque el JS se cargó en otra página o los IDs no coinciden
  setStatus("Error: faltan elementos (revisa IDs o que estés en hashtags.html).");
} else {
  generate.addEventListener("click", () => {
    const t = (topic.value || "").trim();
    if (!t) {
      output.value = "";
      if (copy) copy.disabled = true;
      setStatus("Escribe un tema principal para generar hashtags.");
      topic.focus();
      return;
    }

    const tags = buildHashtags({
      topic: t,
      intent: intent ? intent.value : "tips",
      network: network ? network.value : "ambas",
      location: (location ? location.value : "").trim(),
      count: Math.max(10, Math.min(40, Number(count ? count.value : 25)))
    });

    output.value = tags;
    if (copy) copy.disabled = !tags;
    setStatus("Listo. Ajusta tema/ubicación para más precisión.");
  });

  if (copy) {
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output.value);
        setStatus("Copiado al portapapeles.");
      } catch {
        setStatus("No se pudo copiar automático. Selecciona el texto y copia manual.");
        output.focus();
        output.select();
      }
    });
  }
}
