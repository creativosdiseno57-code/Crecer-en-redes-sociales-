// hashtags.js (GitHub Pages - sin backend)

const $ = (id) => document.getElementById(id);

function slugify(text) {
  return (text || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9s]/g, " ")
    .trim()
    .replace(/s+/g, " ");
}

function toHashtag(phrase) {
  const parts = slugify(phrase).split(" ").filter(Boolean);
  if (!parts.length) return "";
  const camel = parts
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : (w[0].toUpperCase() + w.slice(1).toLowerCase())
    )
    .join("");
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
    ventas: ["emprendimiento", "negocio", "ventas", "clientes", "oferta"]
  };

  const networkTags =
    network === "tiktok"
      ? ["tiktok", "parati", "fyp", "tiktokcolombia"]
      : network === "facebook"
      ? ["facebook", "facebookreels", "reels", "comunidad"]
      : ["tiktok", "facebook", "reels", "creadoresdecontenido"];

  const genericGrowth = [
    "crecimiento organico",
    "estrategia",
    "contenido",
    "alcance",
    "engagement",
    "marketingdigital",
    "2026"
  ];

  const pieces = [];

  // Tema base
  pieces.push(toHashtag(baseTopic));
  pieces.push(toHashtag(baseTopic + " 2026"));

  // Variaciones del tema
  const words = baseTopic.split(" ").filter(Boolean);
  if (words.length >= 2) {
    pieces.push(toHashtag(words[0]));
    pieces.push(toHashtag(words.slice(0, 2).join(" ")));
  }
  if (words.length >= 3) {
    pieces.push(toHashtag(words.slice(0, 3).join(" ")));
  }

  // Intención
  (intentMap[intent] || []).forEach((k) => {
    pieces.push(toHashtag(k));
    pieces.push(toHashtag(baseTopic + " " + k));
  });

  // Red
  networkTags.forEach((k) => pieces.push(toHashtag(k)));

  // Genéricos de crecimiento
  genericGrowth.forEach((k) => pieces.push(toHashtag(k)));

  // Ubicación (opcional)
  if (baseLoc) {
    pieces.push(toHashtag(baseLoc));
    pieces.push(toHashtag(baseTopic + " " + baseLoc));
    pieces.push(toHashtag("colombia"));
  }

  return unique(pieces).slice(0, count).join(" ");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ready(fn) {
  // Si el script se carga con defer, normalmente esto ya está listo.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

ready(() => {
  const topic = $("topic");
  const intent = $("intent");
  const network = $("network");
  const location = $("location");
  const count = $("count");
  const output = $("output");
  const status = $("status");
  const generate = $("generate");
  const copy = $("copy");

  // Si falta algo, mostramos aviso y no rompemos la página
  const required = { topic, intent, network, location, count, output, status, generate, copy };
  const missing = Object.entries(required).filter(([, el]) => !el).map(([k]) => k);

  function setStatus(msg) {
    if (status) status.textContent = msg || "";
  }

  if (missing.length) {
    // Esto pasa si estás en otra página o si tu HTML no tiene esos IDs
    setStatus("Faltan elementos en la página: " + missing.join(", ") + ". Revisa los IDs.");
    return;
  }

  generate.addEventListener("click", () => {
    const t = (topic.value || "").trim();
    if (!t) {
      output.value = "";
      copy.disabled = true;
      setStatus("Escribe un tema principal (ej: 'barbería', 'comida rápida', 'marketing').");
      topic.focus();
      return;
    }

    const c = clamp(Number(count.value || 25), 10, 40);

    const tags = buildHashtags({
      topic: t,
      intent: intent.value,
      network: network.value,
      location: (location.value || "").trim(),
      count: c
    });

    output.value = tags;
    copy.disabled = !tags;
    setStatus("Hashtags generados: " + tags.split(" ").length + " (puedes editar el tema y regenerar).");
  });

  copy.addEventListener("click", async () => {
    const text = output.value || "";
    if (!text) {
      setStatus("No hay hashtags para copiar.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copiado al portapapeles.");
    } catch (e) {
      // En algunos móviles el portapapeles puede fallar si no es un gesto permitido
      output.focus();
      output.select();
      setStatus("No se pudo copiar automático. Selecciona el texto y copia manual.");
    }
  });

  // Genera una primera vez si ya hay tema escrito
  if ((topic.value || "").trim()) generate.click();
});
