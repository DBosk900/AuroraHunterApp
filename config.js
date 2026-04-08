// ════════════════════════════════════════════════════════════
//  AURORA HUNTER — Config
// ════════════════════════════════════════════════════════════

// Firebase — sostituisci con i tuoi valori dal Firebase Console
export const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Contatti Gianluca
export const WHATSAPP_NUMBER = "393297159865"; // +39 329 715 9865
export const EMAIL            = "gianluca.vit85@gmail.com";
export const INSTAGRAM        = "https://www.instagram.com/cacciatoriauroraboreale/";
export const WEBSITE          = "https://cacciatoriauroraboreale.it";

// Lingua default
export const DEFAULT_LANG = "it"; // "it" | "en"

// ════════════════════════════════════════════════════════════
//  COLORI — Palette Aurora Boreale
// ════════════════════════════════════════════════════════════

export const COLORS = {
  // Sfondi
  background:    "#050914",
  backgroundAlt: "#0a0f1e",
  card:          "#0d1528",
  cardBorder:    "#1a2540",

  // Aurora
  green:         "#00ff88",
  greenDark:     "#00cc6a",
  greenBg:       "rgba(0,255,136,0.1)",
  violet:        "#7c3aed",
  violetLight:   "#a78bfa",
  violetBg:      "rgba(124,58,237,0.12)",
  cyan:          "#06b6d4",
  cyanBg:        "rgba(6,182,212,0.1)",
  pink:          "#f472b6",

  // Status
  red:           "#ef4444",
  redBg:         "rgba(239,68,68,0.1)",
  yellow:        "#fbbf24",
  yellowBg:      "rgba(251,191,36,0.1)",
  blue:          "#3b82f6",

  // Testo
  text:          "#f8fafc",
  textSoft:      "#cbd5e1",
  textMuted:     "#64748b",
};

// ════════════════════════════════════════════════════════════
//  TRADUZIONI
// ════════════════════════════════════════════════════════════

export const T = {
  it: {
    home:           "Home",
    viaggi:         "Viaggi",
    galleria:       "Galleria",
    podcast:        "Podcast",
    aurora_live:    "Aurora Live",
    blog:           "Blog",
    prenota:        "Prenota",
    contattaci:     "Contattaci",
    prossimi:       "Prossimi Viaggi",
    scopri:         "Scopri",
    posto_disp:     "posti disponibili",
    da:             "da",
    al:             "al",
    partenza:       "Partenza",
    posti_tot:      "Posti totali",
    prezzo:         "Prezzo",
    incluso:        "Cosa è incluso",
    programma:      "Programma",
    prenota_via_wa: "Prenota via WhatsApp",
    contatta:       "Contatta Gianluca",
    kp_index:       "Indice KP",
    attivita_solare:"Attività Solare",
    probabilita:    "Probabilità avvistamento",
    ascolta:        "Ascolta",
    episodi:        "Episodi",
    leggi:          "Leggi",
    min:            "min",
    admin:          "Area Admin",
    login:          "Accedi",
    password:       "Password",
    logout:         "Esci",
    nuovo_viaggio:  "Nuovo Viaggio",
    nuova_foto:     "Carica Foto",
    nuovo_podcast:  "Nuovo Episodio",
    nuovo_blog:     "Nuovo Articolo",
    salva:          "Salva",
    elimina:        "Elimina",
    modifica:       "Modifica",
    annulla:        "Annulla",
    caricamento:    "Caricamento...",
    nessun_dato:    "Nessun contenuto disponibile",
    countdown_days: "giorni all'aurora",
    altitude:       "Latitudine",
    kp_basso:       "Bassa attività",
    kp_medio:       "Attività moderata",
    kp_alto:        "Alta attività — Ottima probabilità!",
    kp_molto_alto:  "Tempesta geomagnetica — Aurora eccezionale!",
  },
  en: {
    home:           "Home",
    viaggi:         "Trips",
    galleria:       "Gallery",
    podcast:        "Podcast",
    aurora_live:    "Aurora Live",
    blog:           "Blog",
    prenota:        "Book",
    contattaci:     "Contact us",
    prossimi:       "Upcoming Trips",
    scopri:         "Discover",
    posto_disp:     "spots available",
    da:             "from",
    al:             "to",
    partenza:       "Departure",
    posti_tot:      "Total spots",
    prezzo:         "Price",
    incluso:        "What's included",
    programma:      "Program",
    prenota_via_wa: "Book via WhatsApp",
    contatta:       "Contact Gianluca",
    kp_index:       "KP Index",
    attivita_solare:"Solar Activity",
    probabilita:    "Viewing probability",
    ascolta:        "Listen",
    episodi:        "Episodes",
    leggi:          "Read",
    min:            "min",
    admin:          "Admin Area",
    login:          "Login",
    password:       "Password",
    logout:         "Logout",
    nuovo_viaggio:  "New Trip",
    nuova_foto:     "Upload Photo",
    nuovo_podcast:  "New Episode",
    nuovo_blog:     "New Article",
    salva:          "Save",
    elimina:        "Delete",
    modifica:       "Edit",
    annulla:        "Cancel",
    caricamento:    "Loading...",
    nessun_dato:    "No content available",
    countdown_days: "days to the aurora",
    altitude:       "Latitude",
    kp_basso:       "Low activity",
    kp_medio:       "Moderate activity",
    kp_alto:        "High activity — Great chance!",
    kp_molto_alto:  "Geomagnetic storm — Exceptional aurora!",
  },
};
