import React, { useState, useEffect, useRef } from "react";
import { Home, MessageCircle, Gamepad2, BookOpen, Award, Flame, Star, Volume2, Heart, ArrowRight, Check, X, RefreshCw, Send, Sparkles, ChevronLeft, Zap } from "lucide-react";

// Vokabeldaten, passend für 7. Klasse
const VOCAB = {
  familia: {
    title: "La familia",
    emoji: "👨‍👩‍👧‍👦",
    color: "#E8A838",
    words: [
      { es: "la madre", de: "die Mutter" },
      { es: "el padre", de: "der Vater" },
      { es: "el hermano", de: "der Bruder" },
      { es: "la hermana", de: "die Schwester" },
      { es: "la abuela", de: "die Oma" },
      { es: "el abuelo", de: "der Opa" },
      { es: "el primo", de: "der Cousin" },
      { es: "la prima", de: "die Cousine" },
      { es: "el tío", de: "der Onkel" },
      { es: "la tía", de: "die Tante" },
    ],
  },
  escuela: {
    title: "La escuela",
    emoji: "🎒",
    color: "#1F4E5F",
    words: [
      { es: "el profesor", de: "der Lehrer" },
      { es: "la profesora", de: "die Lehrerin" },
      { es: "el libro", de: "das Buch" },
      { es: "el cuaderno", de: "das Heft" },
      { es: "el lápiz", de: "der Bleistift" },
      { es: "el bolígrafo", de: "der Kugelschreiber" },
      { es: "la mochila", de: "der Rucksack" },
      { es: "la clase", de: "die Klasse" },
      { es: "el examen", de: "die Prüfung" },
      { es: "la tarea", de: "die Hausaufgabe" },
    ],
  },
  pasatiempos: {
    title: "Los pasatiempos",
    emoji: "⚽",
    color: "#C85A3E",
    words: [
      { es: "bailar", de: "tanzen" },
      { es: "cantar", de: "singen" },
      { es: "leer", de: "lesen" },
      { es: "nadar", de: "schwimmen" },
      { es: "correr", de: "rennen" },
      { es: "dibujar", de: "zeichnen" },
      { es: "jugar al fútbol", de: "Fußball spielen" },
      { es: "ver películas", de: "Filme schauen" },
      { es: "escuchar música", de: "Musik hören" },
      { es: "tocar la guitarra", de: "Gitarre spielen" },
    ],
  },
  comida: {
    title: "La comida",
    emoji: "🍎",
    color: "#D4572C",
    words: [
      { es: "el pan", de: "das Brot" },
      { es: "el queso", de: "der Käse" },
      { es: "la manzana", de: "der Apfel" },
      { es: "el plátano", de: "die Banane" },
      { es: "el agua", de: "das Wasser" },
      { es: "la leche", de: "die Milch" },
      { es: "el zumo", de: "der Saft" },
      { es: "la carne", de: "das Fleisch" },
      { es: "el pescado", de: "der Fisch" },
      { es: "las verduras", de: "das Gemüse" },
    ],
  },
  animales: {
    title: "Los animales",
    emoji: "🐶",
    color: "#6B8F47",
    words: [
      { es: "el perro", de: "der Hund" },
      { es: "el gato", de: "die Katze" },
      { es: "el pájaro", de: "der Vogel" },
      { es: "el caballo", de: "das Pferd" },
      { es: "el conejo", de: "das Kaninchen" },
      { es: "el pez", de: "der Fisch (Tier)" },
      { es: "la tortuga", de: "die Schildkröte" },
      { es: "el ratón", de: "die Maus" },
    ],
  },
  colores: {
    title: "Los colores",
    emoji: "🎨",
    color: "#7A4E8B",
    words: [
      { es: "rojo", de: "rot" },
      { es: "azul", de: "blau" },
      { es: "verde", de: "grün" },
      { es: "amarillo", de: "gelb" },
      { es: "blanco", de: "weiß" },
      { es: "negro", de: "schwarz" },
      { es: "rosa", de: "rosa" },
      { es: "naranja", de: "orange" },
      { es: "morado", de: "lila" },
      { es: "gris", de: "grau" },
    ],
  },
};

const STORAGE_KEY = "sofia-progress-v1";

const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 0,
  lastPlayed: null,
  wordStats: {}, // { "la madre": { seen: 3, correct: 2 } }
  chatHistory: [],
};

// --- Helpers ---
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const speak = (text) => {
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
};

const saveProgress = async (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Save failed", e);
  }
};

const loadProgress = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
};

// --- Header ---
const Header = ({ progress, view, onBack }) => (
  <header className="sticky top-0 z-20 bg-[#FAF3E7]/95 backdrop-blur-sm border-b border-[#C85A3E]/10">
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {view !== "home" ? (
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition">
            <ChevronLeft size={20} className="text-[#2B2420]" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C85A3E] to-[#E8A838] flex items-center justify-center shadow-md">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
        )}
        {view === "home" && (
          <div>
            <div className="font-display text-lg font-bold text-[#2B2420] leading-none">Sofía</div>
            <div className="text-[10px] text-[#2B2420]/60 tracking-widest uppercase">Tu amiga española</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm">
          <Flame size={14} className="text-[#C85A3E]" fill="#C85A3E" />
          <span className="font-bold text-sm text-[#2B2420]">{progress.streak}</span>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm">
          <Star size={14} className="text-[#E8A838]" fill="#E8A838" />
          <span className="font-bold text-sm text-[#2B2420]">{progress.xp}</span>
        </div>
      </div>
    </div>
  </header>
);

// --- Home View ---
const HomeView = ({ progress, onNavigate }) => {
  const wordsLearned = Object.keys(progress.wordStats || {}).length;
  const greeting = ["¡Hola!", "¡Buenos días!", "¡Qué tal!", "¡Hola guapa!"][new Date().getHours() % 4];

  return (
    <div className="p-5 pb-28">
      {/* Sofía begrüßt */}
      <div className="relative bg-gradient-to-br from-[#C85A3E] to-[#D4572C] rounded-3xl p-6 mb-6 shadow-lg overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E8A838]/30" />
        <div className="absolute bottom-4 right-4 text-6xl opacity-20">☀️</div>
        <div className="relative">
          <div className="text-[#FAF3E7]/80 text-xs tracking-widest uppercase mb-1">Sofía dice</div>
          <div className="font-display text-2xl font-bold text-white leading-tight">{greeting}<br />¿Aprendemos juntas?</div>
          <div className="text-[#FAF3E7]/80 text-sm mt-2 italic">"Lernen wir zusammen?"</div>
        </div>
      </div>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <ActionCard
          icon={<MessageCircle size={22} />}
          title="Mit Sofía chatten"
          subtitle="Einfach quatschen"
          color="#1F4E5F"
          onClick={() => onNavigate("chat")}
        />
        <ActionCard
          icon={<Gamepad2 size={22} />}
          title="Vokabelspiele"
          subtitle="3 Minispiele"
          color="#C85A3E"
          onClick={() => onNavigate("games")}
        />
        <ActionCard
          icon={<Zap size={22} />}
          title="Grammatik"
          subtitle="Verben & Possessiv"
          color="#7A4E8B"
          onClick={() => onNavigate("grammar")}
        />
        <ActionCard
          icon={<BookOpen size={22} />}
          title="Geschichte"
          subtitle="Kleines Abenteuer"
          color="#6B8F47"
          onClick={() => onNavigate("story")}
        />
        <ActionCard
          icon={<Award size={22} />}
          title="Fortschritt"
          subtitle={`${wordsLearned} Wörter`}
          color="#E8A838"
          onClick={() => onNavigate("progress")}
        />
      </div>

      {/* Tipp des Tages */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#C85A3E]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-[#E8A838]" />
          <span className="text-xs tracking-widest uppercase text-[#2B2420]/60 font-semibold">Lerntipp</span>
        </div>
        <p className="text-[#2B2420] text-sm leading-relaxed">
          Sprich die Wörter laut aus! Wenn du tippst <span className="inline-block"><Volume2 size={12} className="inline text-[#C85A3E]" /></span> hörst du, wie Spanier sie sagen.
        </p>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, subtitle, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl p-4 shadow-sm border border-[#C85A3E]/10 text-left active:scale-[0.97] transition-transform"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}15`, color }}>
      {icon}
    </div>
    <div className="font-display font-bold text-[#2B2420] leading-tight">{title}</div>
    <div className="text-xs text-[#2B2420]/60 mt-0.5">{subtitle}</div>
  </button>
);

// --- Chat View: Rollenspiele ---
// Jede Szene: Sofía spielt eine Rolle, Spielerin antwortet via Multiple-Choice.
// Steps: { sofia: spanischer Satz, de: dt. Übersetzung, options: [{es, de, correct}] }
const ROLEPLAYS = {
  cafe: {
    title: "Im Café",
    emoji: "☕",
    color: "#1F4E5F",
    description: "Sofía ist Kellnerin. Du bestellst ein Getränk und etwas zu essen.",
    setting: "Du gehst in ein kleines Café in Sevilla. Die Kellnerin kommt zu dir.",
    steps: [
      {
        sofia: "¡Hola! Buenos días. ¿Qué quieres tomar?",
        de: "Hallo! Guten Morgen. Was möchtest du trinken?",
        options: [
          { es: "Quiero un zumo de naranja, por favor.", de: "Einen Orangensaft, bitte.", correct: true },
          { es: "Me llamo María.", de: "Ich heiße María.", correct: false, why: "Sie hat dich gefragt, was du trinken willst, nicht deinen Namen!" },
          { es: "Tengo doce años.", de: "Ich bin zwölf.", correct: false, why: "Das ist dein Alter – sie fragt nach dem Getränk." },
        ],
      },
      {
        sofia: "Perfecto. ¿Y para comer? Tenemos tostadas, cruasanes y tortilla.",
        de: "Perfekt. Und zu essen? Wir haben Toast, Croissants und Tortilla.",
        options: [
          { es: "Un cruasán, por favor.", de: "Ein Croissant, bitte.", correct: true },
          { es: "No tengo hambre.", de: "Ich habe keinen Hunger.", correct: true, alt: true },
          { es: "Hace mucho calor.", de: "Es ist sehr heiß.", correct: false, why: "Sie fragt nach dem Essen, nicht nach dem Wetter." },
        ],
      },
      {
        sofia: "Muy bien. ¿Algo más?",
        de: "Sehr gut. Sonst noch etwas?",
        options: [
          { es: "No, gracias. Eso es todo.", de: "Nein, danke. Das ist alles.", correct: true },
          { es: "Sí, también un agua, por favor.", de: "Ja, auch ein Wasser, bitte.", correct: true, alt: true },
          { es: "¿Dónde está el baño?", de: "Wo ist die Toilette?", correct: false, why: "Antworte erst auf ihre Frage – das kannst du nachher fragen!" },
        ],
      },
      {
        sofia: "¡Aquí tienes! Son cuatro euros, por favor.",
        de: "Hier bitte! Das macht vier Euro.",
        options: [
          { es: "Aquí tiene. Muchas gracias.", de: "Hier bitte. Vielen Dank.", correct: true },
          { es: "Me gusta mucho.", de: "Es gefällt mir sehr.", correct: false, why: "Sie will Geld, nicht eine Meinung!" },
          { es: "Hasta luego.", de: "Bis später.", correct: false, why: "Erst zahlen, dann verabschieden." },
        ],
      },
      {
        sofia: "¡Gracias a ti! Que tengas un buen día. ¡Hasta luego!",
        de: "Danke dir! Schönen Tag noch. Tschüss!",
        options: [
          { es: "¡Hasta luego! Adiós.", de: "Tschüss! Auf Wiedersehen.", correct: true },
          { es: "¡Igualmente! Adiós.", de: "Dir auch! Tschüss.", correct: true, alt: true },
          { es: "Tengo un perro.", de: "Ich habe einen Hund.", correct: false, why: "Verabschiede dich passend!" },
        ],
      },
    ],
  },
  restaurant: {
    title: "Im Restaurant",
    emoji: "🍽️",
    color: "#C85A3E",
    description: "Sofía ist Kellnerin. Du bestellst ein Mittagessen.",
    setting: "Es ist Mittag. Du bist mit deiner Familie in einem Restaurant in Madrid.",
    steps: [
      {
        sofia: "¡Buenas tardes! Bienvenida. ¿Para cuántas personas?",
        de: "Guten Tag! Willkommen. Für wie viele Personen?",
        options: [
          { es: "Somos cuatro personas.", de: "Wir sind vier Personen.", correct: true },
          { es: "Tengo hambre.", de: "Ich habe Hunger.", correct: false, why: "Sie fragt, wie viele ihr seid – nicht ob du Hunger hast." },
          { es: "Vivo en Berlín.", de: "Ich wohne in Berlin.", correct: false, why: "Das ist nicht die Frage." },
        ],
      },
      {
        sofia: "Perfecto. Aquí tienen la carta. ¿Quieren algo de beber primero?",
        de: "Perfekt. Hier ist die Karte. Möchtet ihr zuerst etwas zu trinken?",
        options: [
          { es: "Sí, una botella de agua, por favor.", de: "Ja, eine Flasche Wasser, bitte.", correct: true },
          { es: "Quiero una limonada.", de: "Ich möchte eine Limonade.", correct: true, alt: true },
          { es: "¿Cómo te llamas?", de: "Wie heißt du?", correct: false, why: "Eine Kellnerin frägt man nicht nach ihrem Namen 😄" },
        ],
      },
      {
        sofia: "Muy bien. ¿Y de comer? El plato del día es paella.",
        de: "Sehr gut. Und zum Essen? Das Tagesgericht ist Paella.",
        options: [
          { es: "Quiero la paella, por favor.", de: "Ich nehme die Paella, bitte.", correct: true },
          { es: "Para mí, una ensalada y pollo.", de: "Für mich, einen Salat und Hähnchen.", correct: true, alt: true },
          { es: "Mi color favorito es azul.", de: "Meine Lieblingsfarbe ist blau.", correct: false, why: "Bestelle Essen, keine Farben! 🎨" },
        ],
      },
      {
        sofia: "Excelente elección. ¿Algún postre? Tenemos helado y flan.",
        de: "Ausgezeichnete Wahl. Ein Dessert? Wir haben Eis und Flan.",
        options: [
          { es: "Un helado de chocolate, por favor.", de: "Ein Schoko-Eis, bitte.", correct: true },
          { es: "No, gracias. Estoy llena.", de: "Nein, danke. Ich bin satt.", correct: true, alt: true },
          { es: "Tengo trece años.", de: "Ich bin dreizehn.", correct: false, why: "Sie fragt nach Dessert – sag ja oder nein!" },
        ],
      },
      {
        sofia: "Aquí está la cuenta. Son veinticinco euros.",
        de: "Hier ist die Rechnung. Das macht 25 Euro.",
        options: [
          { es: "Gracias. ¿Puedo pagar con tarjeta?", de: "Danke. Kann ich mit Karte zahlen?", correct: true },
          { es: "Aquí tiene, gracias.", de: "Hier bitte, danke.", correct: true, alt: true },
          { es: "¡Adiós!", de: "Tschüss!", correct: false, why: "Erst zahlen, dann gehen." },
        ],
      },
    ],
  },
  hotel: {
    title: "Im Hotel",
    emoji: "🏨",
    color: "#7A4E8B",
    description: "Sofía ist Rezeptionistin. Du checkst in einem Hotel ein.",
    setting: "Du kommst nach einer langen Reise im Hotel an. Die Rezeptionistin grüßt dich.",
    steps: [
      {
        sofia: "¡Buenas tardes! ¿Tiene una reserva?",
        de: "Guten Tag! Haben Sie eine Reservierung?",
        options: [
          { es: "Sí, a nombre de Schmidt.", de: "Ja, auf den Namen Schmidt.", correct: true },
          { es: "No, no tengo perro.", de: "Nein, ich habe keinen Hund.", correct: false, why: "'Reserva' heißt Reservierung, nicht Hund!" },
          { es: "Vivo en Hamburgo.", de: "Ich wohne in Hamburg.", correct: false, why: "Wo du wohnst, will sie nicht wissen." },
        ],
      },
      {
        sofia: "Perfecto. Una habitación doble para tres noches, ¿verdad?",
        de: "Perfekt. Ein Doppelzimmer für drei Nächte, richtig?",
        options: [
          { es: "Sí, exacto.", de: "Ja, genau.", correct: true },
          { es: "Sí, es correcto.", de: "Ja, das ist richtig.", correct: true, alt: true },
          { es: "No me gusta el café.", de: "Ich mag keinen Kaffee.", correct: false, why: "Antwort auf die Reservierungsfrage, nicht über Kaffee!" },
        ],
      },
      {
        sofia: "¿Me puede dar su pasaporte, por favor?",
        de: "Können Sie mir bitte Ihren Pass geben?",
        options: [
          { es: "Sí, aquí tiene.", de: "Ja, hier bitte.", correct: true },
          { es: "Un momento, por favor.", de: "Einen Moment, bitte.", correct: true, alt: true },
          { es: "Tengo hambre.", de: "Ich habe Hunger.", correct: false, why: "Sie will den Pass, nicht über Hunger reden." },
        ],
      },
      {
        sofia: "Su habitación es la 204, en la segunda planta. ¿A qué hora quiere desayunar?",
        de: "Ihr Zimmer ist die 204, im 2. Stock. Wann möchten Sie frühstücken?",
        options: [
          { es: "A las ocho, por favor.", de: "Um acht, bitte.", correct: true },
          { es: "A las nueve y media.", de: "Um halb zehn.", correct: true, alt: true },
          { es: "Soy alemana.", de: "Ich bin Deutsche.", correct: false, why: "Sie fragt nach der Uhrzeit für Frühstück!" },
        ],
      },
      {
        sofia: "Muy bien. Aquí tiene la llave. ¡Que tenga una buena estancia!",
        de: "Sehr gut. Hier ist Ihr Schlüssel. Schönen Aufenthalt!",
        options: [
          { es: "Muchas gracias. ¡Hasta luego!", de: "Vielen Dank. Bis später!", correct: true },
          { es: "Gracias, igualmente.", de: "Danke, dir auch.", correct: true, alt: true },
          { es: "Quiero pizza.", de: "Ich will Pizza.", correct: false, why: "Sei höflich, du gehst aufs Zimmer!" },
        ],
      },
    ],
  },
  mercado: {
    title: "Auf dem Markt",
    emoji: "🍅",
    color: "#6B8F47",
    description: "Sofía verkauft Obst und Gemüse. Du kaufst ein.",
    setting: "Samstagvormittag, du bist auf dem Wochenmarkt und gehst zu einem Obststand.",
    steps: [
      {
        sofia: "¡Hola! ¿Qué quieres hoy?",
        de: "Hallo! Was hättest du gerne heute?",
        options: [
          { es: "Quiero un kilo de manzanas, por favor.", de: "Ein Kilo Äpfel, bitte.", correct: true },
          { es: "Quiero una falda azul.", de: "Ich möchte einen blauen Rock.", correct: false, why: "Auf einem Obstmarkt gibt's keine Kleidung!" },
          { es: "Tengo dos hermanos.", de: "Ich habe zwei Brüder.", correct: false, why: "Sag, was du kaufen willst!" },
        ],
      },
      {
        sofia: "¡Aquí tienes! ¿Algo más?",
        de: "Hier bitte! Sonst noch etwas?",
        options: [
          { es: "Sí, también medio kilo de tomates.", de: "Ja, auch ein halbes Kilo Tomaten.", correct: true },
          { es: "Sí, tres plátanos, por favor.", de: "Ja, drei Bananen, bitte.", correct: true, alt: true },
          { es: "Hace frío hoy.", de: "Heute ist es kalt.", correct: false, why: "Sie fragt nach mehr Einkäufen, nicht nach dem Wetter." },
        ],
      },
      {
        sofia: "Perfecto. ¿Quieres una bolsa?",
        de: "Perfekt. Möchtest du eine Tüte?",
        options: [
          { es: "Sí, por favor.", de: "Ja, bitte.", correct: true },
          { es: "No, gracias. Tengo una.", de: "Nein, danke. Ich habe eine.", correct: true, alt: true },
          { es: "Me llamo Sasha.", de: "Ich heiße Sasha.", correct: false, why: "Antworte mit Ja oder Nein!" },
        ],
      },
      {
        sofia: "Son tres euros con cincuenta.",
        de: "Das macht drei Euro fünfzig.",
        options: [
          { es: "Aquí tiene.", de: "Hier bitte.", correct: true },
          { es: "¿Acepta tarjeta?", de: "Akzeptieren Sie Karten?", correct: true, alt: true },
          { es: "El cielo es azul.", de: "Der Himmel ist blau.", correct: false, why: "Es geht ums Bezahlen!" },
        ],
      },
      {
        sofia: "¡Muchas gracias! ¡Hasta la próxima!",
        de: "Vielen Dank! Bis zum nächsten Mal!",
        options: [
          { es: "¡Hasta luego!", de: "Bis später!", correct: true },
          { es: "¡Adiós, gracias!", de: "Tschüss, danke!", correct: true, alt: true },
          { es: "Tengo sed.", de: "Ich habe Durst.", correct: false, why: "Verabschiede dich freundlich!" },
        ],
      },
    ],
  },
  escuela: {
    title: "Auf dem Schulhof",
    emoji: "🎒",
    color: "#E8A838",
    description: "Sofía ist eine neue Klassenkameradin. Lernt euch kennen.",
    setting: "Eine neue Schülerin steht in der Pause allein auf dem Schulhof. Du gehst zu ihr.",
    steps: [
      {
        sofia: "¡Hola! Soy nueva aquí. Me llamo Sofía. ¿Y tú?",
        de: "Hallo! Ich bin neu hier. Ich heiße Sofía. Und du?",
        options: [
          { es: "Hola, me llamo Anna. ¡Bienvenida!", de: "Hallo, ich heiße Anna. Willkommen!", correct: true },
          { es: "Tengo doce años.", de: "Ich bin zwölf.", correct: false, why: "Erst Name, dann andere Sachen!" },
          { es: "Me gusta el chocolate.", de: "Ich mag Schokolade.", correct: false, why: "Stell dich erst vor!" },
        ],
      },
      {
        sofia: "Encantada, Anna. ¿De dónde eres?",
        de: "Freut mich, Anna. Woher kommst du?",
        options: [
          { es: "Soy de Alemania.", de: "Ich komme aus Deutschland.", correct: true },
          { es: "Soy de aquí, de esta escuela.", de: "Ich komme von hier, von dieser Schule.", correct: true, alt: true },
          { es: "Tengo un gato negro.", de: "Ich habe eine schwarze Katze.", correct: false, why: "Sie fragt, woher du kommst." },
        ],
      },
      {
        sofia: "¡Qué interesante! ¿Cuál es tu asignatura favorita?",
        de: "Wie interessant! Was ist dein Lieblingsfach?",
        options: [
          { es: "Mi asignatura favorita es el arte.", de: "Mein Lieblingsfach ist Kunst.", correct: true },
          { es: "Me gustan las matemáticas.", de: "Ich mag Mathe.", correct: true, alt: true },
          { es: "Vivo en una casa grande.", de: "Ich wohne in einem großen Haus.", correct: false, why: "Das ist nicht die Frage." },
        ],
      },
      {
        sofia: "¡A mí también! ¿Quieres comer juntas en el recreo?",
        de: "Ich auch! Wollen wir in der Pause zusammen essen?",
        options: [
          { es: "¡Sí, claro! Me encantaría.", de: "Ja, klar! Sehr gerne.", correct: true },
          { es: "¡Vale! Vamos.", de: "Okay! Lass uns gehen.", correct: true, alt: true },
          { es: "No tengo bicicleta.", de: "Ich hab kein Fahrrad.", correct: false, why: "Sie lädt dich zum Essen ein!" },
        ],
      },
      {
        sofia: "¡Genial! ¿Tienes WhatsApp? Podemos intercambiar números.",
        de: "Super! Hast du WhatsApp? Wir können Nummern austauschen.",
        options: [
          { es: "Sí, mi número es siete-cuatro-dos...", de: "Ja, meine Nummer ist 7-4-2...", correct: true },
          { es: "Claro, dame tu teléfono.", de: "Klar, gib mir dein Handy.", correct: true, alt: true },
          { es: "Mi madre cocina paella.", de: "Meine Mutter kocht Paella.", correct: false, why: "Antworte auf die WhatsApp-Frage!" },
        ],
      },
    ],
  },
};

// --- Roleplay Picker (Auswahl der Szene) ---
const RoleplayPicker = ({ onPick }) => (
  <div className="p-5 pb-28">
    <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-1">Rollenspiele</h2>
    <p className="text-sm text-[#2B2420]/60 mb-5">In welcher Situation willst du Spanisch üben?</p>
    <div className="space-y-3">
      {Object.entries(ROLEPLAYS).map(([key, rp]) => (
        <button
          key={key}
          onClick={() => onPick(key)}
          style={{ borderColor: `${rp.color}40` }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 flex items-center gap-4 active:scale-[0.98] transition text-left"
        >
          <div className="text-4xl">{rp.emoji}</div>
          <div className="flex-1">
            <div className="font-display font-bold text-[#2B2420] text-lg">{rp.title}</div>
            <div className="text-xs text-[#2B2420]/60 mt-0.5 leading-snug">{rp.description}</div>
          </div>
          <ArrowRight size={20} style={{ color: rp.color }} />
        </button>
      ))}
    </div>
  </div>
);

// --- Roleplay Scene ---
const RoleplayScene = ({ scenarioKey, onBack, progress, setProgress }) => {
  const scenario = ROLEPLAYS[scenarioKey];
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]); // [{role, content, ...}]
  const [feedback, setFeedback] = useState(null); // { correct, why? }
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef(null);

  // Set initial Sofía message at scene start
  useEffect(() => {
    const first = scenario.steps[0];
    setHistory([{ role: "assistant", es: first.sofia, de: first.de }]);
  }, [scenarioKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, feedback]);

  const currentStep = scenario.steps[step];

  const choose = (opt) => {
    if (feedback) return;
    setHistory((prev) => [...prev, { role: "user", es: opt.es, de: opt.de, correct: opt.correct }]);
    setFeedback({ correct: opt.correct, why: opt.why });
    if (opt.correct) setScore(score + 1);
    const updated = { ...progress, xp: progress.xp + (opt.correct ? 5 : 1) };
    setProgress(updated);
    saveProgress(updated);
  };

  const advance = () => {
    setFeedback(null);
    setShowTranslation(false);
    if (step + 1 >= scenario.steps.length) {
      setDone(true);
    } else {
      const nextIdx = step + 1;
      const nextStep = scenario.steps[nextIdx];
      setHistory((prev) => [...prev, { role: "assistant", es: nextStep.sofia, de: nextStep.de }]);
      setStep(nextIdx);
    }
  };

  const restart = () => {
    setStep(0);
    setFeedback(null);
    setShowTranslation(false);
    setScore(0);
    setDone(false);
    const first = scenario.steps[0];
    setHistory([{ role: "assistant", es: first.sofia, de: first.de }]);
  };

  if (done) {
    const pct = Math.round((score / scenario.steps.length) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "💪" : "📚";
    const msg = pct === 100 ? "¡Perfecto! Du hast alles richtig gemacht!" : pct >= 80 ? "¡Muy bien! Fast perfekt!" : pct >= 60 ? "¡Bien! Mit etwas Übung wird's noch besser." : "Probier die Szene nochmal – du schaffst das!";
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{emoji}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{score} / {scenario.steps.length}</h3>
        <p className="text-[#2B2420]/70 mb-2 text-center">{msg}</p>
        <p className="text-xs text-[#2B2420]/50 mb-8">Szene: {scenario.title}</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button onClick={restart} className="w-full py-3 rounded-2xl bg-white text-[#1F4E5F] font-semibold border border-[#1F4E5F]/20 active:scale-[0.98] transition flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Szene wiederholen
          </button>
          <button onClick={onBack} style={{ background: scenario.color, color: "#FFFFFF" }} className="w-full py-4 rounded-2xl font-semibold active:scale-[0.98] transition">
            <span style={{ color: "#FFFFFF" }}>Andere Szene</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="px-5 pt-2 pb-3 flex justify-between items-center bg-[#FAF3E7] border-b border-[#C85A3E]/10">
        <button onClick={onBack} className="text-xs text-[#C85A3E] font-semibold flex items-center gap-1">
          <ChevronLeft size={14} /> Andere Szene
        </button>
        <div className="text-[10px] text-[#2B2420]/50 tracking-widest uppercase">
          {scenario.emoji} {scenario.title} · {step + 1}/{scenario.steps.length}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-4 pb-2 space-y-3">
        {step === 0 && (
          <div className="bg-[#FAF3E7] border border-[#C85A3E]/20 rounded-xl p-3 text-xs text-[#2B2420]/80 italic mb-2">
            {scenario.setting}
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-sm flex-shrink-0 mt-1" style={{ background: `linear-gradient(135deg, ${scenario.color}, ${scenario.color}cc)` }}>
                <span className="text-white font-display font-bold text-xs" style={{ color: "#FFFFFF" }}>S</span>
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? (m.correct ? "bg-[#6B8F47]" : "bg-[#C85A3E]") + " text-white rounded-br-sm" : "bg-white text-[#2B2420] rounded-bl-sm shadow-sm"}`} style={m.role === "user" ? { color: "#FFFFFF" } : {}}>
              <div className="text-sm leading-relaxed font-medium" style={m.role === "user" ? { color: "#FFFFFF" } : {}}>{m.es}</div>
              {m.de && (
                <div className={`text-xs mt-1 italic ${m.role === "user" ? "" : "text-[#2B2420]/50"}`} style={m.role === "user" ? { color: "rgba(255,255,255,0.75)" } : {}}>
                  {m.de}
                </div>
              )}
              {m.role === "assistant" && (
                <button onClick={() => speak(m.es.replace(/[¡¿]/g, ""))} className="mt-1.5 text-[#C85A3E]/70 active:scale-90 transition">
                  <Volume2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Antwortbereich */}
      <div className="bg-[#FAF3E7] border-t border-[#C85A3E]/10 p-4 max-h-[55vh] overflow-y-auto">
        {!feedback ? (
          <>
            <div className="text-[10px] tracking-widest uppercase text-[#2B2420]/50 font-semibold mb-2 text-center">
              Wie antwortest du?
            </div>
            <div className="space-y-2">
              {currentStep.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(opt)}
                  className="w-full bg-white rounded-2xl px-4 py-3 text-left shadow-sm border border-[#C85A3E]/10 active:scale-[0.98] transition"
                >
                  <div className="font-medium text-sm text-[#2B2420] leading-snug">{opt.es}</div>
                  {showTranslation && (
                    <div className="text-xs text-[#2B2420]/50 italic mt-1">{opt.de}</div>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTranslation(!showTranslation)} className="w-full mt-3 text-xs text-[#1F4E5F] underline">
              {showTranslation ? "Übersetzungen ausblenden" : "Was bedeuten die Antworten?"}
            </button>
          </>
        ) : (
          <div className={`rounded-2xl p-4 ${feedback.correct ? "bg-[#6B8F47]/10 border border-[#6B8F47]/30" : "bg-[#C85A3E]/10 border border-[#C85A3E]/30"}`}>
            <div className={`flex items-center gap-2 font-display font-bold mb-2 ${feedback.correct ? "text-[#6B8F47]" : "text-[#C85A3E]"}`}>
              {feedback.correct ? <><Check size={18} /> ¡Muy bien!</> : <><X size={18} /> Hmm...</>}
            </div>
            {feedback.why && (
              <div className="text-sm text-[#2B2420]/80 mb-3">{feedback.why}</div>
            )}
            <button
              onClick={advance}
              style={{ background: scenario.color, color: "#FFFFFF" }}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <span style={{ color: "#FFFFFF" }}>{step + 1 >= scenario.steps.length ? "Ergebnis" : "Weiter"}</span>
              <ArrowRight size={16} color="#FFFFFF" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatView = ({ progress, setProgress }) => {
  const [scenarioKey, setScenarioKey] = useState(null);
  if (!scenarioKey) return <RoleplayPicker onPick={setScenarioKey} />;
  return <RoleplayScene scenarioKey={scenarioKey} onBack={() => setScenarioKey(null)} progress={progress} setProgress={setProgress} />;
};


// --- Topic Picker ---
const TopicPicker = ({ onPick, title }) => (
  <div className="p-5 pb-28">
    <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-1">{title}</h2>
    <p className="text-sm text-[#2B2420]/60 mb-5">Wähl ein Thema</p>
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(VOCAB).map(([key, topic]) => (
        <button
          key={key}
          onClick={() => onPick(key)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-[#C85A3E]/10 text-left active:scale-[0.97] transition"
          style={{ borderColor: `${topic.color}30` }}
        >
          <div className="text-3xl mb-2">{topic.emoji}</div>
          <div className="font-display font-bold text-[#2B2420]">{topic.title}</div>
          <div className="text-xs text-[#2B2420]/60 mt-0.5">{topic.words.length} Wörter</div>
        </button>
      ))}
    </div>
  </div>
);

// --- Games Hub ---
const GamesView = ({ progress, setProgress }) => {
  const [mode, setMode] = useState(null); // matching | flashcards | quiz
  const [topic, setTopic] = useState(null);
  const [direction, setDirection] = useState(null); // "es-de" | "de-es"

  const reset = () => { setTopic(null); setDirection(null); };

  if (!mode) {
    return (
      <div className="p-5 pb-28">
        <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-1">Vokabelspiele</h2>
        <p className="text-sm text-[#2B2420]/60 mb-5">Such dir ein Spiel aus</p>
        <div className="space-y-3">
          <GameCard title="Paare finden" desc="Deutsch ↔ Spanisch zusammenklicken" color="#C85A3E" emoji="🎯" onClick={() => setMode("matching")} />
          <GameCard title="Karteikarten" desc="Umdrehen, wissen oder nochmal üben" color="#1F4E5F" emoji="🃏" onClick={() => setMode("flashcards")} />
          <GameCard title="Blitzquiz" desc="Multiple-Choice-Fragen" color="#6B8F47" emoji="⚡" onClick={() => setMode("quiz")} />
        </div>
      </div>
    );
  }

  if (!topic) {
    return <TopicPicker title={mode === "matching" ? "Paare finden" : mode === "flashcards" ? "Karteikarten" : "Blitzquiz"} onPick={setTopic} />;
  }

  // Matching braucht keine Richtung – immer beidseitig
  if (mode === "matching") return <MatchingGame topic={topic} onBack={reset} progress={progress} setProgress={setProgress} />;

  // Bei Karteikarten und Quiz: Richtung wählen
  if (!direction) {
    return (
      <div className="p-5 pb-28">
        <button onClick={() => setTopic(null)} className="text-sm text-[#C85A3E] font-semibold mb-4 flex items-center gap-1">
          <ChevronLeft size={16} /> Anderes Thema
        </button>
        <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-1">In welche Richtung?</h2>
        <p className="text-sm text-[#2B2420]/60 mb-5">Was siehst du, was sollst du wissen?</p>
        <div className="space-y-3">
          <button onClick={() => setDirection("es-de")} className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#C85A3E]/10 text-left active:scale-[0.98] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🇪🇸</div>
              <ArrowRight size={16} className="text-[#2B2420]/40" />
              <div className="text-2xl">🇩🇪</div>
            </div>
            <div className="font-display font-bold text-[#2B2420]">Spanisch → Deutsch</div>
            <div className="text-xs text-[#2B2420]/60 mt-0.5">Du siehst „la madre", sagst „die Mutter". <span className="text-[#6B8F47] font-semibold">Einfacher.</span></div>
          </button>
          <button onClick={() => setDirection("de-es")} className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#C85A3E]/10 text-left active:scale-[0.98] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🇩🇪</div>
              <ArrowRight size={16} className="text-[#2B2420]/40" />
              <div className="text-2xl">🇪🇸</div>
            </div>
            <div className="font-display font-bold text-[#2B2420]">Deutsch → Spanisch</div>
            <div className="text-xs text-[#2B2420]/60 mt-0.5">Du siehst „die Mutter", sagst „la madre". <span className="text-[#C85A3E] font-semibold">Schwerer, lerneffektiver.</span></div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "flashcards") return <FlashcardsGame topic={topic} direction={direction} onBack={reset} progress={progress} setProgress={setProgress} />;
  if (mode === "quiz") return <QuizGame topic={topic} direction={direction} onBack={reset} progress={progress} setProgress={setProgress} />;
};

const GameCard = ({ title, desc, color, emoji, onClick }) => (
  <button onClick={onClick} className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#C85A3E]/10 flex items-center gap-4 active:scale-[0.98] transition text-left">
    <div className="text-4xl">{emoji}</div>
    <div className="flex-1">
      <div className="font-display font-bold text-[#2B2420] text-lg">{title}</div>
      <div className="text-sm text-[#2B2420]/60">{desc}</div>
    </div>
    <ArrowRight size={20} style={{ color }} />
  </button>
);

// --- Matching Game ---
const MatchingGame = ({ topic, onBack, progress, setProgress }) => {
  const topicData = VOCAB[topic];
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);

  const init = () => {
    const sample = shuffle(topicData.words).slice(0, 5);
    const cards = shuffle([
      ...sample.map((w) => ({ id: `es-${w.es}`, text: w.es, lang: "es", pair: w.es })),
      ...sample.map((w) => ({ id: `de-${w.es}`, text: w.de, lang: "de", pair: w.es })),
    ]);
    setPairs(cards);
    setMatched([]);
    setSelected(null);
    setWrong([]);
    setDone(false);
  };

  useEffect(() => { init(); }, [topic]);

  const handleTap = (card) => {
    if (matched.includes(card.id) || wrong.length > 0) return;
    if (card.lang === "es") speak(card.text);
    if (!selected) {
      setSelected(card);
      return;
    }
    if (selected.id === card.id) return;
    if (selected.pair === card.pair && selected.lang !== card.lang) {
      const newMatched = [...matched, selected.id, card.id];
      setMatched(newMatched);
      setSelected(null);
      // stats
      const ws = { ...(progress.wordStats || {}) };
      ws[card.pair] = { seen: (ws[card.pair]?.seen || 0) + 1, correct: (ws[card.pair]?.correct || 0) + 1 };
      const updated = { ...progress, wordStats: ws, xp: progress.xp + 5 };
      setProgress(updated);
      saveProgress(updated);
      if (newMatched.length === pairs.length) setTimeout(() => setDone(true), 500);
    } else {
      setWrong([selected.id, card.id]);
      setTimeout(() => {
        setSelected(null);
        setWrong([]);
      }, 700);
    }
  };

  if (done) {
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">🎉</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">¡Muy bien!</h3>
        <p className="text-[#2B2420]/70 mb-6">+25 XP verdient</p>
        <div className="flex gap-3">
          <button onClick={init} className="px-6 py-3 bg-[#C85A3E] text-white rounded-full font-semibold flex items-center gap-2">
            <RefreshCw size={16} /> Nochmal
          </button>
          <button onClick={onBack} className="px-6 py-3 bg-white text-[#2B2420] rounded-full font-semibold border border-[#2B2420]/10">
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-[#2B2420]">{topicData.emoji} {topicData.title}</h3>
        <div className="text-sm text-[#2B2420]/60">{matched.length / 2} / {pairs.length / 2}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {pairs.map((card) => {
          const isMatched = matched.includes(card.id);
          const isSelected = selected?.id === card.id;
          const isWrong = wrong.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleTap(card)}
              disabled={isMatched}
              className={`aspect-[5/3] rounded-2xl p-3 flex items-center justify-center text-center font-semibold text-sm transition-all ${
                isMatched ? "bg-[#6B8F47]/20 text-[#6B8F47] scale-95" :
                isWrong ? "bg-[#C85A3E] text-white" :
                isSelected ? "bg-[#1F4E5F] text-white scale-105" :
                "bg-white text-[#2B2420] shadow-sm border border-[#C85A3E]/10"
              }`}
            >
              {card.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Flashcards ---
const FlashcardsGame = ({ topic, direction, onBack, progress, setProgress }) => {
  const topicData = VOCAB[topic];
  const [deck, setDeck] = useState(shuffle(topicData.words));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const current = deck[idx];
  // Was steht vorne, was hinten?
  const frontIsSpanish = direction === "es-de";
  const front = frontIsSpanish ? current.es : current.de;
  const back = frontIsSpanish ? current.de : current.es;
  const frontLabel = frontIsSpanish ? "Español" : "Deutsch";
  const backLabel = frontIsSpanish ? "Deutsch" : "Español";

  const mark = (known) => {
    const ws = { ...(progress.wordStats || {}) };
    ws[current.es] = {
      seen: (ws[current.es]?.seen || 0) + 1,
      correct: (ws[current.es]?.correct || 0) + (known ? 1 : 0),
    };
    const updated = { ...progress, wordStats: ws, xp: progress.xp + (known ? 3 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setFlipped(false);
    if (idx + 1 >= deck.length) setDone(true);
    else setIdx(idx + 1);
  };

  if (done) {
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">🌟</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">Fertig!</h3>
        <p className="text-[#2B2420]/70 mb-6">{deck.length} Karten durch</p>
        <button onClick={onBack} className="px-6 py-3 bg-[#C85A3E] text-white rounded-full font-semibold">Zurück</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-[#2B2420]">{topicData.emoji} {topicData.title}</h3>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {deck.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-6">
        <div className="h-full bg-[#C85A3E] transition-all" style={{ width: `${((idx) / deck.length) * 100}%` }} />
      </div>
      <button
        onClick={() => {
          // Beim Aufdecken Spanisch vorlesen, egal wo's grade steht
          if (!flipped && frontIsSpanish) speak(front);
          if (!flipped && !frontIsSpanish) speak(back);
          setFlipped(!flipped);
        }}
        className="w-full aspect-[4/3] rounded-3xl shadow-lg flex flex-col items-center justify-center p-6 mb-6 transition-all"
        style={{ backgroundColor: flipped ? "#1F4E5F" : "#FFFFFF", color: flipped ? "#FAF3E7" : "#2B2420" }}
      >
        <div className="text-xs tracking-widest uppercase opacity-60 mb-2">{flipped ? backLabel : frontLabel}</div>
        <div className="font-display text-3xl font-bold text-center">{flipped ? back : front}</div>
        <div className="text-xs mt-4 opacity-60">{flipped ? "Wusstest du es?" : "Tippen zum Umdrehen"}</div>
      </button>
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => mark(false)} className="py-4 rounded-2xl bg-white border-2 border-[#C85A3E]/30 text-[#C85A3E] font-semibold flex items-center justify-center gap-2 active:scale-95 transition">
            <X size={18} /> Nochmal
          </button>
          <button onClick={() => mark(true)} className="py-4 rounded-2xl bg-[#6B8F47] text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition">
            <Check size={18} /> Wusste ich!
          </button>
        </div>
      )}
    </div>
  );
};

// --- Quiz ---
const QuizGame = ({ topic, direction, onBack, progress, setProgress }) => {
  const topicData = VOCAB[topic];
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // Was wird gefragt, was wird angeklickt?
  const promptIsSpanish = direction === "es-de"; // Frage auf Spanisch, Antwort Deutsch
  const promptKey = promptIsSpanish ? "es" : "de";
  const answerKey = promptIsSpanish ? "de" : "es";
  const promptLabel = promptIsSpanish ? "Was heißt auf Deutsch?" : "Was heißt auf Spanisch?";

  useEffect(() => {
    const pool = shuffle(topicData.words).slice(0, 8);
    const qs = pool.map((w) => {
      const wrongs = shuffle(topicData.words.filter((x) => x.es !== w.es)).slice(0, 3);
      return { word: w, options: shuffle([w, ...wrongs]) };
    });
    setQuestions(qs);
  }, [topic, direction]);

  if (questions.length === 0) return null;
  const q = questions[idx];

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt);
    const isRight = opt.es === q.word.es;
    if (isRight) setCorrect(correct + 1);
    const ws = { ...(progress.wordStats || {}) };
    ws[q.word.es] = {
      seen: (ws[q.word.es]?.seen || 0) + 1,
      correct: (ws[q.word.es]?.correct || 0) + (isRight ? 1 : 0),
    };
    const updated = { ...progress, wordStats: ws, xp: progress.xp + (isRight ? 4 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setTimeout(() => {
      setSelected(null);
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx(idx + 1);
    }, 1000);
  };

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{correct} / {questions.length}</h3>
        <p className="text-[#2B2420]/70 mb-6">{pct >= 80 ? "Spitze!" : pct >= 50 ? "Gut gemacht!" : "Nochmal üben lohnt sich!"}</p>
        <button onClick={onBack} className="px-6 py-3 bg-[#C85A3E] text-white rounded-full font-semibold">Zurück</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-[#2B2420]">{topicData.emoji} {topicData.title}</h3>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {questions.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-8">
        <div className="h-full bg-[#6B8F47] transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm text-center">
        <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 mb-2">{promptLabel}</div>
        <div className="flex items-center justify-center gap-2">
          <div className="font-display text-3xl font-bold text-[#2B2420]">{q.word[promptKey]}</div>
          {promptIsSpanish && (
            <button onClick={() => speak(q.word.es)} className="text-[#C85A3E]"><Volume2 size={20} /></button>
          )}
        </div>
      </div>
      <div className="space-y-2.5">
        {q.options.map((opt) => {
          const isSelected = selected?.es === opt.es;
          const isRight = selected && opt.es === q.word.es;
          return (
            <button
              key={opt.es}
              onClick={() => choose(opt)}
              disabled={!!selected}
              className={`w-full py-4 px-5 rounded-2xl font-semibold text-left transition-all ${
                !selected ? "bg-white text-[#2B2420] shadow-sm active:scale-[0.98]" :
                isRight ? "bg-[#6B8F47] text-white" :
                isSelected ? "bg-[#C85A3E] text-white" :
                "bg-white text-[#2B2420]/40"
              }`}
            >
              {opt[answerKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Story (offline, vorgeschrieben) ---
// Jede Geschichte hat jetzt: längeren Text, Vokabeln und 3-4 Verständnisfragen
// Fragetypen: 'mc' (multiple choice), 'tf' (true/false), 'open' (kurze Antwort mit smart matching)
const STORIES = {
  familia: [
    {
      story_es: "Mi hermana Ana tiene diez años. Es muy alegre y le gusta cantar. Todos los sábados por la mañana, ella canta con mi madre en la cocina. Mi padre y yo escuchamos desde el sofá. A veces mi padre baila un poco, pero canta muy mal. ¡Es muy gracioso!",
      story_de: "Meine Schwester Ana ist zehn Jahre alt. Sie ist sehr fröhlich und singt gern. Jeden Samstagmorgen singt sie mit meiner Mutter in der Küche. Mein Vater und ich hören vom Sofa aus zu. Manchmal tanzt mein Vater ein bisschen, aber er singt sehr schlecht. Es ist sehr lustig!",
      vocab: [
        { es: "alegre", de: "fröhlich" },
        { es: "sábado", de: "Samstag" },
        { es: "cocina", de: "Küche" },
        { es: "sofá", de: "Sofa" },
        { es: "gracioso", de: "lustig" },
      ],
      questions: [
        { type: "mc", q: "¿Cuántos años tiene Ana?", options: ["8", "10", "12", "16"], answer: 1 },
        { type: "tf", q: "Ana canta los domingos.", answer: false, hint: "Sie singt samstags." },
        { type: "tf", q: "El padre canta muy bien.", answer: false, hint: "Er singt sehr schlecht." },
        { type: "open", q: "¿Dónde cantan Ana y su madre?", accept: ["cocina", "en la cocina", "la cocina"], hint: "In der Küche." },
      ],
    },
    {
      story_es: "Mi abuela Carmen vive en Madrid, en un piso pequeño cerca del parque. Tiene setenta años y es muy simpática. Los domingos cocina paella para toda la familia. Sus paellas son las mejores del mundo. Después de comer, jugamos a las cartas y bebemos café. ¡Adoro visitar a mi abuela!",
      story_de: "Meine Oma Carmen wohnt in Madrid, in einer kleinen Wohnung in der Nähe des Parks. Sie ist siebzig Jahre alt und sehr nett. Sonntags kocht sie Paella für die ganze Familie. Ihre Paellas sind die besten der Welt. Nach dem Essen spielen wir Karten und trinken Kaffee. Ich liebe es, meine Oma zu besuchen!",
      vocab: [
        { es: "abuela", de: "Oma" },
        { es: "piso", de: "Wohnung" },
        { es: "cerca", de: "in der Nähe" },
        { es: "domingo", de: "Sonntag" },
        { es: "cartas", de: "Karten" },
      ],
      questions: [
        { type: "open", q: "¿Cómo se llama la abuela?", accept: ["carmen"], hint: "Sie heißt Carmen." },
        { type: "mc", q: "¿Dónde vive la abuela?", options: ["Sevilla", "Barcelona", "Madrid", "Valencia"], answer: 2 },
        { type: "mc", q: "¿Qué cocina los domingos?", options: ["pizza", "tortilla", "paella", "pasta"], answer: 2 },
        { type: "tf", q: "Después de comer juegan al fútbol.", answer: false, hint: "Sie spielen Karten." },
      ],
    },
  ],
  escuela: [
    {
      story_es: "Hoy es lunes y tengo examen de matemáticas. En mi mochila tengo un libro, un cuaderno, dos lápices y un bolígrafo azul. La profesora se llama señora García y es muy simpática. El examen empieza a las nueve. Estoy un poco nerviosa, pero he estudiado mucho. ¡Espero sacar una buena nota!",
      story_de: "Heute ist Montag und ich habe eine Mathematikprüfung. In meinem Rucksack habe ich ein Buch, ein Heft, zwei Bleistifte und einen blauen Kugelschreiber. Die Lehrerin heißt Frau García und ist sehr nett. Die Prüfung beginnt um neun. Ich bin etwas nervös, aber ich habe viel gelernt. Ich hoffe, eine gute Note zu bekommen!",
      vocab: [
        { es: "lunes", de: "Montag" },
        { es: "examen", de: "Prüfung" },
        { es: "mochila", de: "Rucksack" },
        { es: "bolígrafo", de: "Kugelschreiber" },
        { es: "nota", de: "Note" },
      ],
      questions: [
        { type: "mc", q: "¿Qué día es hoy?", options: ["lunes", "martes", "viernes", "domingo"], answer: 0 },
        { type: "open", q: "¿Cuántos lápices hay en la mochila?", accept: ["dos", "2"], hint: "Zwei Bleistifte." },
        { type: "tf", q: "El examen empieza a las diez.", answer: false, hint: "Um neun Uhr." },
        { type: "tf", q: "La estudiante ha estudiado mucho.", answer: true },
      ],
    },
    {
      story_es: "Mi asignatura favorita es el arte. Tres veces por semana voy a la clase de pintura. La profesora se llama Lola y siempre nos dice cosas bonitas. Mi mejor amiga, Sara, dibuja animales fantásticos. Yo prefiero pintar paisajes con muchos colores. Después de clase, vamos a la cafetería y bebemos chocolate caliente.",
      story_de: "Mein Lieblingsfach ist Kunst. Dreimal pro Woche gehe ich in den Malunterricht. Die Lehrerin heißt Lola und sagt uns immer nette Sachen. Meine beste Freundin Sara zeichnet fantastische Tiere. Ich male lieber Landschaften mit vielen Farben. Nach dem Unterricht gehen wir in die Cafeteria und trinken heiße Schokolade.",
      vocab: [
        { es: "asignatura", de: "Schulfach" },
        { es: "pintura", de: "Malerei" },
        { es: "amiga", de: "Freundin" },
        { es: "paisaje", de: "Landschaft" },
        { es: "caliente", de: "heiß" },
      ],
      questions: [
        { type: "open", q: "¿Cómo se llama la profesora?", accept: ["lola"], hint: "Sie heißt Lola." },
        { type: "mc", q: "¿Qué dibuja Sara?", options: ["paisajes", "personas", "animales", "casas"], answer: 2 },
        { type: "mc", q: "¿Qué prefiere pintar la narradora?", options: ["animales", "paisajes", "personas", "flores"], answer: 1 },
        { type: "tf", q: "Después de clase beben café.", answer: false, hint: "Sie trinken heiße Schokolade." },
      ],
    },
  ],
  pasatiempos: [
    {
      story_es: "Los sábados por la tarde, mi mejor amigo Pablo y yo vamos al parque. Llevamos un balón de fútbol y jugamos durante dos horas. A veces vienen otros chicos del barrio. Cuando hace mucho calor, descansamos bajo un árbol grande y bebemos agua fría. Después, vamos a la heladería. ¡Mi helado favorito es de chocolate!",
      story_de: "Samstagnachmittags gehen mein bester Freund Pablo und ich in den Park. Wir nehmen einen Fußball mit und spielen zwei Stunden lang. Manchmal kommen andere Jungs aus der Nachbarschaft. Wenn es sehr heiß ist, ruhen wir uns unter einem großen Baum aus und trinken kaltes Wasser. Danach gehen wir in die Eisdiele. Mein Lieblingseis ist Schokolade!",
      vocab: [
        { es: "amigo", de: "Freund" },
        { es: "balón", de: "Ball" },
        { es: "barrio", de: "Nachbarschaft" },
        { es: "árbol", de: "Baum" },
        { es: "helado", de: "Eis" },
      ],
      questions: [
        { type: "open", q: "¿Cómo se llama el mejor amigo?", accept: ["pablo"], hint: "Er heißt Pablo." },
        { type: "mc", q: "¿Cuántas horas juegan al fútbol?", options: ["una", "dos", "tres", "cuatro"], answer: 1 },
        { type: "mc", q: "¿Qué sabor de helado prefiere?", options: ["fresa", "vainilla", "chocolate", "limón"], answer: 2 },
        { type: "tf", q: "Cuando hace calor, juegan más fútbol.", answer: false, hint: "Sie ruhen sich unter einem Baum aus." },
      ],
    },
    {
      story_es: "Por las tardes, después de los deberes, escucho música en mi habitación. Mi cantante favorita es Rosalía. También toco la guitarra, pero solo un poco. Los jueves voy a clase de baile flamenco con mi prima Lucía. Ella baila muy bien, yo todavía aprendo. ¡Pero me divierto mucho!",
      story_de: "Nachmittags, nach den Hausaufgaben, höre ich Musik in meinem Zimmer. Meine Lieblingssängerin ist Rosalía. Ich spiele auch Gitarre, aber nur ein bisschen. Donnerstags gehe ich zum Flamenco-Tanzkurs mit meiner Cousine Lucía. Sie tanzt sehr gut, ich lerne noch. Aber es macht mir viel Spaß!",
      vocab: [
        { es: "deberes", de: "Hausaufgaben" },
        { es: "habitación", de: "Zimmer" },
        { es: "cantante", de: "Sänger/in" },
        { es: "jueves", de: "Donnerstag" },
        { es: "prima", de: "Cousine" },
      ],
      questions: [
        { type: "mc", q: "¿Cuándo escucha música?", options: ["por la mañana", "por la tarde", "por la noche", "los domingos"], answer: 1 },
        { type: "open", q: "¿Cómo se llama la prima?", accept: ["lucia", "lucía"], hint: "Sie heißt Lucía." },
        { type: "tf", q: "Toca la guitarra muy bien.", answer: false, hint: "Sie spielt nur ein bisschen Gitarre." },
        { type: "mc", q: "¿Qué baila los jueves?", options: ["salsa", "flamenco", "tango", "ballet"], answer: 1 },
      ],
    },
  ],
  comida: [
    {
      story_es: "Por la mañana desayuno en la cocina con mi familia. Yo como pan tostado con mantequilla y mermelada de fresa. Bebo un vaso de leche caliente con cacao. Mi padre prefiere café negro y un cruasán. Mi hermano pequeño come cereales con plátano. ¡Y mi madre solo bebe té verde y come una manzana!",
      story_de: "Morgens frühstücke ich in der Küche mit meiner Familie. Ich esse Toast mit Butter und Erdbeermarmelade. Ich trinke ein Glas heiße Milch mit Kakao. Mein Vater bevorzugt schwarzen Kaffee und ein Croissant. Mein kleiner Bruder isst Cerealien mit Banane. Und meine Mutter trinkt nur grünen Tee und isst einen Apfel!",
      vocab: [
        { es: "desayunar", de: "frühstücken" },
        { es: "mantequilla", de: "Butter" },
        { es: "mermelada", de: "Marmelade" },
        { es: "leche", de: "Milch" },
        { es: "manzana", de: "Apfel" },
      ],
      questions: [
        { type: "mc", q: "¿Qué bebe la narradora?", options: ["café", "té", "leche con cacao", "zumo"], answer: 2 },
        { type: "mc", q: "¿Qué come el padre?", options: ["pan tostado", "cereales", "una manzana", "un cruasán"], answer: 3 },
        { type: "open", q: "¿Qué fruta come el hermano?", accept: ["plátano", "platano", "banana"], hint: "Eine Banane." },
        { type: "tf", q: "La madre bebe café negro.", answer: false, hint: "Sie trinkt grünen Tee." },
      ],
    },
    {
      story_es: "El sábado fui al mercado con mi madre. Hay mucha gente y muchos colores. Compramos manzanas rojas, naranjas grandes y un kilo de tomates. La señora del puesto de fruta es muy amable y me regala una manzana extra. Después compramos pan fresco en la panadería. ¡El pan huele muy bien!",
      story_de: "Am Samstag bin ich mit meiner Mutter zum Markt gegangen. Es sind viele Leute und viele Farben da. Wir kaufen rote Äpfel, große Orangen und ein Kilo Tomaten. Die Frau am Obststand ist sehr freundlich und schenkt mir einen Apfel extra. Danach kaufen wir frisches Brot in der Bäckerei. Das Brot riecht sehr gut!",
      vocab: [
        { es: "mercado", de: "Markt" },
        { es: "gente", de: "Leute" },
        { es: "amable", de: "freundlich" },
        { es: "panadería", de: "Bäckerei" },
        { es: "fresco", de: "frisch" },
      ],
      questions: [
        { type: "mc", q: "¿Cuándo van al mercado?", options: ["el lunes", "el viernes", "el sábado", "el domingo"], answer: 2 },
        { type: "open", q: "¿Cuántos kilos de tomates compran?", accept: ["uno", "un", "1"], hint: "Ein Kilo." },
        { type: "tf", q: "La señora del puesto es antipática.", answer: false, hint: "Sie ist sehr freundlich." },
        { type: "tf", q: "Compran pan en la panadería.", answer: true },
      ],
    },
  ],
  animales: [
    {
      story_es: "Tengo una gata que se llama Luna. Es blanca con manchas negras y tiene los ojos verdes. Luna duerme casi todo el día encima de mi cama. Por la noche está muy activa: corre por toda la casa y juega con un ratón de juguete. Como mucho atún. Cuando come pescado, es la gata más feliz del mundo.",
      story_de: "Ich habe eine Katze, die Luna heißt. Sie ist weiß mit schwarzen Flecken und hat grüne Augen. Luna schläft fast den ganzen Tag auf meinem Bett. Nachts ist sie sehr aktiv: Sie rennt durchs ganze Haus und spielt mit einer Spielzeugmaus. Sie isst viel Thunfisch. Wenn sie Fisch isst, ist sie die glücklichste Katze der Welt.",
      vocab: [
        { es: "gata", de: "Katze (weibl.)" },
        { es: "manchas", de: "Flecken" },
        { es: "cama", de: "Bett" },
        { es: "ratón", de: "Maus" },
        { es: "pescado", de: "Fisch" },
      ],
      questions: [
        { type: "open", q: "¿Cómo se llama la gata?", accept: ["luna"], hint: "Sie heißt Luna." },
        { type: "mc", q: "¿De qué color son sus ojos?", options: ["azules", "verdes", "marrones", "amarillos"], answer: 1 },
        { type: "tf", q: "Luna duerme por la noche.", answer: false, hint: "Sie schläft tagsüber, nachts ist sie aktiv." },
        { type: "mc", q: "¿Qué le gusta comer?", options: ["pollo", "carne", "atún", "verduras"], answer: 2 },
      ],
    },
    {
      story_es: "El domingo fui al zoo con mi familia. Vi muchos animales fascinantes. Mi favorito es el elefante porque es enorme y muy inteligente. Mi hermana pequeña se enamoró de los pingüinos. Comen pescado y nadan súper rápido. También vimos jirafas, leones y un tigre que dormía. ¡Fue un día perfecto!",
      story_de: "Am Sonntag bin ich mit meiner Familie in den Zoo gegangen. Ich habe viele faszinierende Tiere gesehen. Mein Lieblingstier ist der Elefant, weil er riesig und sehr intelligent ist. Meine kleine Schwester hat sich in die Pinguine verliebt. Sie essen Fisch und schwimmen super schnell. Wir haben auch Giraffen, Löwen und einen Tiger gesehen, der geschlafen hat. Es war ein perfekter Tag!",
      vocab: [
        { es: "zoo", de: "Zoo" },
        { es: "elefante", de: "Elefant" },
        { es: "enorme", de: "riesig" },
        { es: "nadar", de: "schwimmen" },
        { es: "perfecto", de: "perfekt" },
      ],
      questions: [
        { type: "mc", q: "¿Cuál es el animal favorito de la narradora?", options: ["el león", "el tigre", "el elefante", "el pingüino"], answer: 2 },
        { type: "open", q: "¿Qué animales le gustan a la hermana?", accept: ["pingüinos", "pinguinos", "los pingüinos"], hint: "Die Pinguine." },
        { type: "tf", q: "El tigre estaba muy activo.", answer: false, hint: "Der Tiger hat geschlafen." },
        { type: "mc", q: "¿Qué comen los pingüinos?", options: ["fruta", "carne", "pescado", "pan"], answer: 2 },
      ],
    },
  ],
  colores: [
    {
      story_es: "Hoy llevo mi ropa favorita: una camiseta amarilla, pantalones negros y zapatillas blancas. Mi mochila es roja con estrellas azules. Mi madre dice que parezco un arcoíris. Mi hermano lleva un suéter verde y un gorro naranja. ¡Somos la familia más colorida del barrio!",
      story_de: "Heute trage ich meine Lieblingskleidung: ein gelbes T-Shirt, eine schwarze Hose und weiße Sneaker. Mein Rucksack ist rot mit blauen Sternen. Meine Mutter sagt, ich sehe aus wie ein Regenbogen. Mein Bruder trägt einen grünen Pullover und eine orange Mütze. Wir sind die bunteste Familie der Nachbarschaft!",
      vocab: [
        { es: "ropa", de: "Kleidung" },
        { es: "zapatillas", de: "Sneaker" },
        { es: "estrellas", de: "Sterne" },
        { es: "arcoíris", de: "Regenbogen" },
        { es: "gorro", de: "Mütze" },
      ],
      questions: [
        { type: "mc", q: "¿De qué color es la camiseta?", options: ["roja", "amarilla", "verde", "azul"], answer: 1 },
        { type: "open", q: "¿De qué color son los pantalones?", accept: ["negros", "negro"], hint: "Schwarz." },
        { type: "tf", q: "El hermano lleva un gorro verde.", answer: false, hint: "Der Hut ist orange, der Pulli grün." },
        { type: "mc", q: "¿Cómo es la mochila?", options: ["azul con estrellas rojas", "roja con estrellas azules", "amarilla con flores", "blanca y negra"], answer: 1 },
      ],
    },
    {
      story_es: "Esta mañana el cielo está perfecto. Es azul y no hay nubes. El sol brilla muy fuerte y todo se ve más bonito. En el jardín, las flores son de muchos colores: rojas, amarillas, rosas y blancas. La hierba está muy verde después de la lluvia de ayer. ¡Qué día más bonito para pasear!",
      story_de: "Heute Morgen ist der Himmel perfekt. Er ist blau und es gibt keine Wolken. Die Sonne scheint sehr stark und alles sieht schöner aus. Im Garten sind die Blumen in vielen Farben: rot, gelb, rosa und weiß. Das Gras ist nach dem Regen von gestern sehr grün. Was für ein schöner Tag zum Spazieren!",
      vocab: [
        { es: "cielo", de: "Himmel" },
        { es: "nubes", de: "Wolken" },
        { es: "brilla", de: "scheint" },
        { es: "hierba", de: "Gras" },
        { es: "ayer", de: "gestern" },
      ],
      questions: [
        { type: "tf", q: "Hay muchas nubes en el cielo.", answer: false, hint: "Es gibt keine Wolken." },
        { type: "mc", q: "¿Cómo está la hierba?", options: ["amarilla", "marrón", "verde", "seca"], answer: 2 },
        { type: "open", q: "¿Cuándo llovió?", accept: ["ayer"], hint: "Gestern." },
        { type: "tf", q: "Las flores son de muchos colores.", answer: true },
      ],
    },
  ],
};

// --- Smart answer matching for open questions ---
// Akzeptiert Akzent-Varianten, Groß-/Kleinschreibung, führende Artikel, etc.
const normalizeAnswer = (s) =>
  s.toLowerCase()
    .trim()
    .replace(/[¿?¡!.,;]/g, "")
    .replace(/[áéíóúñü]/g, (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u" })[c])
    .replace(/\s+/g, " ");

const checkOpenAnswer = (userAnswer, accepted) => {
  const u = normalizeAnswer(userAnswer);
  return accepted.some((a) => {
    const norm = normalizeAnswer(a);
    return u === norm || u === norm.replace(/^(el|la|los|las|un|una) /, "");
  });
};

const StoryView = ({ progress, setProgress }) => {
  const [topic, setTopic] = useState(null);
  const [storyIdx, setStoryIdx] = useState(0);
  const [mode, setMode] = useState("read"); // "read" | "quiz" | "results"
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState({}); // { qIdx: { value, correct } }
  const [openInputs, setOpenInputs] = useState({}); // { qIdx: string }

  const pickTopic = (t) => {
    setTopic(t);
    setStoryIdx(Math.floor(Math.random() * STORIES[t].length));
    setMode("read");
    setShowTranslation(false);
    setAnswers({});
    setOpenInputs({});
    const updated = { ...progress, xp: progress.xp + 5 };
    setProgress(updated);
    saveProgress(updated);
  };

  const nextStory = () => {
    const stories = STORIES[topic];
    setStoryIdx((storyIdx + 1) % stories.length);
    setMode("read");
    setShowTranslation(false);
    setAnswers({});
    setOpenInputs({});
    const updated = { ...progress, xp: progress.xp + 5 };
    setProgress(updated);
    saveProgress(updated);
  };

  if (!topic) return <TopicPicker title="Kleine Geschichte" onPick={pickTopic} />;

  const story = STORIES[topic][storyIdx];

  // === LESEMODUS ===
  if (mode === "read") {
    return (
      <div className="p-5 pb-28">
        <div className="bg-gradient-to-br from-[#FAF3E7] to-white rounded-3xl p-6 shadow-sm border border-[#C85A3E]/10 mb-5">
          <div className="text-xs tracking-widest uppercase text-[#C85A3E] font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={14} /> Historia · {VOCAB[topic].title}
          </div>
          <p className="font-display text-lg text-[#2B2420] leading-relaxed mb-4">{story.story_es}</p>
          <button onClick={() => speak(story.story_es)} className="flex items-center gap-2 text-[#C85A3E] text-sm font-semibold mb-3">
            <Volume2 size={16} /> Vorlesen
          </button>
          <button onClick={() => setShowTranslation(!showTranslation)} className="text-sm text-[#1F4E5F] underline block">
            {showTranslation ? "Übersetzung ausblenden" : "Auf Deutsch zeigen"}
          </button>
          {showTranslation && (
            <p className="mt-3 text-[#2B2420]/70 italic text-sm leading-relaxed">{story.story_de}</p>
          )}
        </div>

        {story.questions?.length > 0 && (
          <button
            onClick={() => setMode("quiz")}
            style={{ background: "linear-gradient(135deg, #C85A3E, #D4572C)", color: "#FFFFFF" }}
            className="w-full py-5 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition mb-4 shadow-lg"
          >
            <Sparkles size={20} color="#FFFFFF" />
            <span style={{ color: "#FFFFFF" }}>{story.questions.length} Verständnisfragen</span>
            <ArrowRight size={18} color="#FFFFFF" />
          </button>
        )}

        {story.vocab?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 font-semibold mb-3">Schlüsselwörter</div>
            <div className="space-y-2">
              {story.vocab.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2B2420]/5 last:border-0">
                  <div>
                    <span className="font-display font-semibold text-[#2B2420]">{v.es}</span>
                    <span className="text-[#2B2420]/60 text-sm ml-2">— {v.de}</span>
                  </div>
                  <button onClick={() => speak(v.es)} className="text-[#C85A3E]"><Volume2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={nextStory} className="w-full py-3 rounded-2xl bg-white text-[#1F4E5F] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition border border-[#1F4E5F]/20">
          <RefreshCw size={14} /> Andere Geschichte
        </button>
      </div>
    );
  }

  // === QUIZMODUS ===
  if (mode === "quiz") {
    const allAnswered = story.questions.every((_, i) => answers[i]);

    const answerMC = (qIdx, optIdx) => {
      if (answers[qIdx]) return;
      const correct = optIdx === story.questions[qIdx].answer;
      setAnswers({ ...answers, [qIdx]: { value: optIdx, correct } });
      const updated = { ...progress, xp: progress.xp + (correct ? 4 : 1) };
      setProgress(updated);
      saveProgress(updated);
    };

    const answerTF = (qIdx, val) => {
      if (answers[qIdx]) return;
      const correct = val === story.questions[qIdx].answer;
      setAnswers({ ...answers, [qIdx]: { value: val, correct } });
      const updated = { ...progress, xp: progress.xp + (correct ? 4 : 1) };
      setProgress(updated);
      saveProgress(updated);
    };

    const submitOpen = (qIdx) => {
      const userAns = openInputs[qIdx]?.trim();
      if (!userAns || answers[qIdx]) return;
      const correct = checkOpenAnswer(userAns, story.questions[qIdx].accept);
      setAnswers({ ...answers, [qIdx]: { value: userAns, correct } });
      const updated = { ...progress, xp: progress.xp + (correct ? 5 : 1) };
      setProgress(updated);
      saveProgress(updated);
    };

    return (
      <div className="p-5 pb-28">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMode("read")} className="text-sm text-[#C85A3E] font-semibold flex items-center gap-1">
            <ChevronLeft size={16} /> Zur Geschichte
          </button>
          <div className="text-xs text-[#2B2420]/60">
            {Object.keys(answers).length} / {story.questions.length}
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold text-[#2B2420] mb-1">Verständnisfragen</h3>
        <p className="text-sm text-[#2B2420]/60 mb-5">Beantworte alle Fragen zur Geschichte</p>

        <div className="space-y-4 mb-5">
          {story.questions.map((q, qIdx) => {
            const ans = answers[qIdx];
            return (
              <div key={qIdx} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#FAF3E7] flex items-center justify-center text-xs font-bold text-[#C85A3E] flex-shrink-0 mt-0.5">
                    {qIdx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-semibold text-[#2B2420] leading-snug">{q.q}</div>
                    <div className="text-[10px] tracking-widest uppercase text-[#2B2420]/40 mt-1">
                      {q.type === "mc" ? "Multiple Choice" : q.type === "tf" ? "Richtig oder falsch" : "Kurze Antwort"}
                    </div>
                  </div>
                </div>

                {q.type === "mc" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isThisAnswer = ans?.value === oIdx;
                      const isCorrectOption = oIdx === q.answer;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => answerMC(qIdx, oIdx)}
                          disabled={!!ans}
                          className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition ${
                            !ans ? "bg-[#FAF3E7] text-[#2B2420] active:scale-[0.98]" :
                            isCorrectOption ? "bg-[#6B8F47] text-white" :
                            isThisAnswer ? "bg-[#C85A3E] text-white" :
                            "bg-[#FAF3E7] text-[#2B2420]/40"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "tf" && (
                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map((val) => {
                      const isThisAnswer = ans?.value === val;
                      const isCorrectOption = val === q.answer;
                      return (
                        <button
                          key={String(val)}
                          onClick={() => answerTF(qIdx, val)}
                          disabled={!!ans}
                          className={`py-3 rounded-xl font-semibold text-sm transition ${
                            !ans ? "bg-[#FAF3E7] text-[#2B2420] active:scale-95" :
                            isCorrectOption ? "bg-[#6B8F47] text-white" :
                            isThisAnswer ? "bg-[#C85A3E] text-white" :
                            "bg-[#FAF3E7] text-[#2B2420]/40"
                          }`}
                        >
                          {val ? "✓ Richtig (Verdadero)" : "✗ Falsch (Falso)"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "open" && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={openInputs[qIdx] || ""}
                        onChange={(e) => setOpenInputs({ ...openInputs, [qIdx]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && submitOpen(qIdx)}
                        disabled={!!ans}
                        placeholder="Auf Spanisch antworten..."
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition ${
                          !ans ? "bg-[#FAF3E7] text-[#2B2420]" :
                          ans.correct ? "bg-[#6B8F47] text-white" : "bg-[#C85A3E] text-white"
                        }`}
                      />
                      {!ans && (
                        <button onClick={() => submitOpen(qIdx)} disabled={!openInputs[qIdx]?.trim()} className="px-4 rounded-xl bg-[#1F4E5F] text-white font-semibold disabled:opacity-30 active:scale-95 transition">
                          OK
                        </button>
                      )}
                    </div>
                    {ans && !ans.correct && (
                      <div className="mt-2 text-xs text-[#2B2420]/70">
                        Richtige Antwort: <span className="font-bold text-[#2B2420]">{q.accept[0]}</span>
                      </div>
                    )}
                  </div>
                )}

                {ans && (
                  <div className={`mt-3 text-xs flex items-start gap-2 ${ans.correct ? "text-[#6B8F47]" : "text-[#C85A3E]"}`}>
                    {ans.correct ? <Check size={14} className="flex-shrink-0 mt-0.5" /> : <X size={14} className="flex-shrink-0 mt-0.5" />}
                    <span>
                      {ans.correct ? "¡Correcto!" : "No del todo."} {q.hint && <span className="text-[#2B2420]/60 italic">{q.hint}</span>}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allAnswered && (
          <button onClick={() => setMode("results")} className="w-full py-4 rounded-2xl bg-[#C85A3E] text-white font-semibold active:scale-[0.98] transition">
            Ergebnis anzeigen
          </button>
        )}
      </div>
    );
  }

  // === ERGEBNISMODUS ===
  const total = story.questions.length;
  const correct = Object.values(answers).filter((a) => a.correct).length;
  const pct = Math.round((correct / total) * 100);
  const emoji = pct === 100 ? "🏆" : pct >= 75 ? "🌟" : pct >= 50 ? "💪" : "📚";
  const msg = pct === 100 ? "¡Perfecto! Du hast alles verstanden!" : pct >= 75 ? "¡Muy bien! Fast alles richtig!" : pct >= 50 ? "Gut gemacht! Nochmal lesen hilft!" : "Schau dir die Geschichte nochmal an, dann probier nochmal!";

  return (
    <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-7xl mb-4">{emoji}</div>
      <h3 className="font-display text-4xl font-bold text-[#2B2420] mb-2">{correct} / {total}</h3>
      <p className="text-[#2B2420]/70 mb-2 text-center">{msg}</p>
      <p className="text-xs text-[#2B2420]/50 mb-8">+{Object.values(answers).reduce((s, a) => s + (a.correct ? 4 : 1), 0)} XP</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => { setMode("quiz"); setAnswers({}); setOpenInputs({}); }} className="w-full py-3 rounded-2xl bg-white text-[#1F4E5F] font-semibold border border-[#1F4E5F]/20 active:scale-[0.98] transition">
          Fragen wiederholen
        </button>
        <button onClick={() => setMode("read")} className="w-full py-3 rounded-2xl bg-white text-[#2B2420] font-semibold border border-[#2B2420]/10 active:scale-[0.98] transition">
          Zur Geschichte
        </button>
        <button onClick={nextStory} className="w-full py-4 rounded-2xl bg-[#C85A3E] text-white font-semibold active:scale-[0.98] transition flex items-center justify-center gap-2">
          <RefreshCw size={14} /> Nächste Geschichte
        </button>
      </div>
    </div>
  );
};


// --- Progress ---
const ProgressView = ({ progress }) => {
  const stats = progress.wordStats || {};
  const words = Object.entries(stats).map(([es, s]) => ({ es, ...s, rate: s.seen > 0 ? s.correct / s.seen : 0 }));
  const mastered = words.filter((w) => w.rate >= 0.7 && w.seen >= 2).length;
  const practicing = words.length - mastered;

  return (
    <div className="p-5 pb-28">
      <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-5">Dein Fortschritt</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox label="XP" value={progress.xp} color="#E8A838" />
        <StatBox label="Wörter" value={words.length} color="#1F4E5F" />
        <StatBox label="Sicher" value={mastered} color="#6B8F47" />
      </div>
      {words.length > 0 ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 font-semibold mb-3">Deine Wörter</div>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {words.sort((a, b) => b.rate - a.rate).map((w) => (
              <div key={w.es} className="flex items-center justify-between py-2 border-b border-[#2B2420]/5 last:border-0">
                <div className="font-display font-semibold text-[#2B2420] text-sm">{w.es}</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-[#2B2420]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6B8F47]" style={{ width: `${w.rate * 100}%` }} />
                  </div>
                  <div className="text-xs text-[#2B2420]/60 w-10 text-right">{w.correct}/{w.seen}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-[#2B2420]/60">Spiele dein erstes Spiel, um Wörter zu sammeln!</p>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
    <div className="font-display text-2xl font-bold" style={{ color }}>{value}</div>
    <div className="text-xs text-[#2B2420]/60 tracking-wider uppercase mt-1">{label}</div>
  </div>
);

// --- GRAMMAR: Verb conjugation ---
const PRONOUNS = [
  { key: "yo", de: "ich" },
  { key: "tú", de: "du" },
  { key: "él/ella", de: "er/sie" },
  { key: "nosotros", de: "wir" },
  { key: "vosotros", de: "ihr" },
  { key: "ellos/ellas", de: "sie (Pl.)" },
];

const VERBS = {
  // Regelmäßige -ar, -er, -ir
  hablar: { inf: "hablar", de: "sprechen", type: "-ar (regelmäßig)", stem: "habl", endings: ["o", "as", "a", "amos", "áis", "an"] },
  cantar: { inf: "cantar", de: "singen", type: "-ar (regelmäßig)", stem: "cant", endings: ["o", "as", "a", "amos", "áis", "an"] },
  bailar: { inf: "bailar", de: "tanzen", type: "-ar (regelmäßig)", stem: "bail", endings: ["o", "as", "a", "amos", "áis", "an"] },
  estudiar: { inf: "estudiar", de: "lernen", type: "-ar (regelmäßig)", stem: "estudi", endings: ["o", "as", "a", "amos", "áis", "an"] },
  comer: { inf: "comer", de: "essen", type: "-er (regelmäßig)", stem: "com", endings: ["o", "es", "e", "emos", "éis", "en"] },
  beber: { inf: "beber", de: "trinken", type: "-er (regelmäßig)", stem: "beb", endings: ["o", "es", "e", "emos", "éis", "en"] },
  aprender: { inf: "aprender", de: "lernen", type: "-er (regelmäßig)", stem: "aprend", endings: ["o", "es", "e", "emos", "éis", "en"] },
  vivir: { inf: "vivir", de: "leben/wohnen", type: "-ir (regelmäßig)", stem: "viv", endings: ["o", "es", "e", "imos", "ís", "en"] },
  escribir: { inf: "escribir", de: "schreiben", type: "-ir (regelmäßig)", stem: "escrib", endings: ["o", "es", "e", "imos", "ís", "en"] },
  // Unregelmäßige (wichtigste für Klasse 7)
  ser: { inf: "ser", de: "sein", type: "unregelmäßig", forms: ["soy", "eres", "es", "somos", "sois", "son"] },
  estar: { inf: "estar", de: "sein (Zustand/Ort)", type: "unregelmäßig", forms: ["estoy", "estás", "está", "estamos", "estáis", "están"] },
  tener: { inf: "tener", de: "haben", type: "unregelmäßig", forms: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"] },
  ir: { inf: "ir", de: "gehen", type: "unregelmäßig", forms: ["voy", "vas", "va", "vamos", "vais", "van"] },
  hacer: { inf: "hacer", de: "machen", type: "unregelmäßig", forms: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"] },
  querer: { inf: "querer", de: "wollen/mögen", type: "unregelmäßig", forms: ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"] },
  poder: { inf: "poder", de: "können", type: "unregelmäßig", forms: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"] },
};

const conjugate = (verb) => {
  if (verb.forms) return verb.forms;
  return verb.endings.map((e) => verb.stem + e);
};

// --- GRAMMAR: Possessives ---
// Deutsche Entsprechungen: mein/dein/sein/unser/euer/ihr
// Besonderheit: nuestro/vuestro passen sich an Genus UND Numerus an
const POSSESSIVES = [
  { person: "yo", de: "mein", sg: "mi", pl: "mis", note: "Nur Numerus: mi libro, mis libros" },
  { person: "tú", de: "dein", sg: "tu", pl: "tus", note: "Nur Numerus: tu casa, tus casas" },
  { person: "él/ella", de: "sein/ihr", sg: "su", pl: "sus", note: "Nur Numerus: su perro, sus perros" },
  { person: "nosotros", de: "unser", sg_m: "nuestro", sg_f: "nuestra", pl_m: "nuestros", pl_f: "nuestras", note: "Genus + Numerus!" },
  { person: "vosotros", de: "euer", sg_m: "vuestro", sg_f: "vuestra", pl_m: "vuestros", pl_f: "vuestras", note: "Genus + Numerus!" },
  { person: "ellos/ellas", de: "ihr (Pl.)", sg: "su", pl: "sus", note: "Nur Numerus: su amigo, sus amigos" },
];

// Übungsbeispiele für Possessiv-Drill: [deutsch, nomen, genus, numerus, richtige_form]
const POSSESSIVE_DRILLS = [
  { de: "mein Buch", noun: "libro", genus: "m", num: "sg", person: "yo", answer: "mi libro" },
  { de: "meine Bücher", noun: "libros", genus: "m", num: "pl", person: "yo", answer: "mis libros" },
  { de: "meine Schwester", noun: "hermana", genus: "f", num: "sg", person: "yo", answer: "mi hermana" },
  { de: "deine Katze", noun: "gato", genus: "m", num: "sg", person: "tú", answer: "tu gato" },
  { de: "deine Freunde", noun: "amigos", genus: "m", num: "pl", person: "tú", answer: "tus amigos" },
  { de: "sein Hund", noun: "perro", genus: "m", num: "sg", person: "él/ella", answer: "su perro" },
  { de: "ihre Mutter", noun: "madre", genus: "f", num: "sg", person: "él/ella", answer: "su madre" },
  { de: "unser Haus", noun: "casa", genus: "f", num: "sg", person: "nosotros", answer: "nuestra casa" },
  { de: "unsere Schule", noun: "escuela", genus: "f", num: "sg", person: "nosotros", answer: "nuestra escuela" },
  { de: "unser Lehrer", noun: "profesor", genus: "m", num: "sg", person: "nosotros", answer: "nuestro profesor" },
  { de: "unsere Eltern", noun: "padres", genus: "m", num: "pl", person: "nosotros", answer: "nuestros padres" },
  { de: "unsere Freundinnen", noun: "amigas", genus: "f", num: "pl", person: "nosotros", answer: "nuestras amigas" },
  { de: "euer Auto", noun: "coche", genus: "m", num: "sg", person: "vosotros", answer: "vuestro coche" },
  { de: "eure Katze", noun: "gata", genus: "f", num: "sg", person: "vosotros", answer: "vuestra gata" },
  { de: "eure Hunde", noun: "perros", genus: "m", num: "pl", person: "vosotros", answer: "vuestros perros" },
  { de: "eure Schwestern", noun: "hermanas", genus: "f", num: "pl", person: "vosotros", answer: "vuestras hermanas" },
  { de: "ihr Vater (sie, Pl.)", noun: "padre", genus: "m", num: "sg", person: "ellos/ellas", answer: "su padre" },
  { de: "ihre Kinder (sie, Pl.)", noun: "hijos", genus: "m", num: "pl", person: "ellos/ellas", answer: "sus hijos" },
];

// --- Grammar Hub ---
const GrammarView = ({ progress, setProgress }) => {
  // route: { type: 'verbs-table' | 'verbs-drill' | 'poss-table' | 'poss-drill' | 'constr-overview' | 'constr-gaps' | 'constr-translate', topic? }
  const [route, setRoute] = useState(null);

  if (!route) {
    return (
      <div className="p-5 pb-28">
        <h2 className="font-display text-2xl font-bold text-[#2B2420] mb-1">Grammatik</h2>
        <p className="text-sm text-[#2B2420]/60 mb-6">Was willst du üben?</p>

        {/* Verben */}
        <SectionHeader emoji="⚡" title="Verben im Präsens" subtitle="Konjugieren" color="#1F4E5F" />
        <div className="space-y-2 mb-5">
          <ExerciseCard label="Tabellen anschauen" icon="📋" color="#1F4E5F" onClick={() => setRoute({ type: "verbs-table" })} />
          <ExerciseCard label="Konjugations-Drill" icon="✏️" color="#1F4E5F" onClick={() => setRoute({ type: "verbs-drill" })} />
        </div>

        {/* Possessivbegleiter */}
        <SectionHeader emoji="🔑" title="Possessivbegleiter" subtitle="mi, tu, nuestro…" color="#7A4E8B" />
        <div className="space-y-2 mb-5">
          <ExerciseCard label="Übersicht" icon="📋" color="#7A4E8B" onClick={() => setRoute({ type: "poss-table" })} />
          <ExerciseCard label="Übung" icon="🎯" color="#7A4E8B" onClick={() => setRoute({ type: "poss-drill" })} />
        </div>

        {/* Konstruktionen */}
        <SectionHeader emoji="🛠️" title="Konstruktionen" subtitle="tener que, querer, gustar…" color="#C85A3E" />
        <div className="space-y-2">
          {Object.values(CONSTRUCTIONS).map((c) => (
            <div key={c.key} className="bg-white rounded-2xl shadow-sm border border-[#C85A3E]/10 overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: `${c.color}10` }}>
                <span className="text-xl">{c.emoji}</span>
                <div className="flex-1">
                  <div className="font-display font-bold text-sm text-[#2B2420]">{c.title}</div>
                  <div className="text-[11px] text-[#2B2420]/60">„{c.short}"</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px bg-[#2B2420]/5">
                <button onClick={() => setRoute({ type: "constr-overview", topic: c.key })} className="bg-white py-3 text-xs font-semibold text-[#2B2420] active:bg-[#FAF3E7] transition flex flex-col items-center gap-0.5">
                  <span className="text-base">📖</span>
                  Erklärung
                </button>
                <button onClick={() => setRoute({ type: "constr-gaps", topic: c.key })} className="bg-white py-3 text-xs font-semibold text-[#2B2420] active:bg-[#FAF3E7] transition flex flex-col items-center gap-0.5">
                  <span className="text-base">✏️</span>
                  Lücken
                </button>
                <button onClick={() => setRoute({ type: "constr-translate", topic: c.key })} className="bg-white py-3 text-xs font-semibold text-[#2B2420] active:bg-[#FAF3E7] transition flex flex-col items-center gap-0.5">
                  <span className="text-base">🇩🇪→🇪🇸</span>
                  Sätze
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const back = () => setRoute(null);

  if (route.type === "verbs-table") return <VerbsTableView onBack={back} />;
  if (route.type === "verbs-drill") return <VerbDrill onBack={back} progress={progress} setProgress={setProgress} />;
  if (route.type === "poss-table") return <PossessivesTableView onBack={back} />;
  if (route.type === "poss-drill") return <PossessiveDrill onBack={back} progress={progress} setProgress={setProgress} />;
  if (route.type === "constr-overview") return <ConstructionOverview construction={CONSTRUCTIONS[route.topic]} onBack={back} onGoGaps={() => setRoute({ type: "constr-gaps", topic: route.topic })} onGoTranslate={() => setRoute({ type: "constr-translate", topic: route.topic })} />;
  if (route.type === "constr-gaps") return <GapDrill construction={CONSTRUCTIONS[route.topic]} onBack={back} progress={progress} setProgress={setProgress} />;
  if (route.type === "constr-translate") return <TranslationDrill construction={CONSTRUCTIONS[route.topic]} onBack={back} progress={progress} setProgress={setProgress} />;
};

const SectionHeader = ({ emoji, title, subtitle, color }) => (
  <div className="flex items-center gap-2 mb-2 mt-1">
    <span className="text-xl">{emoji}</span>
    <div className="flex-1">
      <div className="font-display font-bold text-[#2B2420]">{title}</div>
      <div className="text-[11px] text-[#2B2420]/50">{subtitle}</div>
    </div>
    <div className="h-px flex-1" style={{ background: `${color}40` }} />
  </div>
);

const ExerciseCard = ({ label, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border flex items-center gap-3 active:scale-[0.98] transition text-left"
    style={{ borderColor: `${color}25` }}
  >
    <span className="text-xl">{icon}</span>
    <span className="flex-1 font-semibold text-sm text-[#2B2420]">{label}</span>
    <ArrowRight size={16} style={{ color }} />
  </button>
);

// Standalone view for verb tables (extracted from VerbsModule)
const VerbsTableView = ({ onBack }) => {
  const [selectedVerb, setSelectedVerb] = useState(null);

  if (!selectedVerb) {
    return (
      <div className="p-5 pb-28">
        <button onClick={onBack} className="text-sm text-[#C85A3E] font-semibold mb-4 flex items-center gap-1">
          <ChevronLeft size={16} /> Zurück
        </button>
        <h3 className="font-display text-xl font-bold text-[#2B2420] mb-4">Wähl ein Verb</h3>
        <div className="space-y-2">
          {Object.entries(VERBS).map(([key, v]) => (
            <button key={key} onClick={() => setSelectedVerb(key)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#C85A3E]/10 flex items-center justify-between active:scale-[0.98] transition">
              <div className="text-left">
                <div className="font-display font-bold text-[#2B2420]">{v.inf}</div>
                <div className="text-xs text-[#2B2420]/60">{v.de} · {v.type}</div>
              </div>
              <ArrowRight size={16} className="text-[#C85A3E]" />
            </button>
          ))}
        </div>
      </div>
    );
  }
  const v = VERBS[selectedVerb];
  const forms = conjugate(v);
  const isIrregular = v.type === "unregelmäßig";
  return (
    <div className="p-5 pb-28">
      <button onClick={() => setSelectedVerb(null)} className="text-sm text-[#C85A3E] font-semibold mb-4 flex items-center gap-1">
        <ChevronLeft size={16} /> Andere Verben
      </button>
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="text-xs tracking-widest uppercase text-[#C85A3E] font-semibold mb-1">{v.type}</div>
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="font-display text-3xl font-bold text-[#2B2420]">{v.inf}</h3>
          <button onClick={() => speak(v.inf)} className="text-[#C85A3E]"><Volume2 size={18} /></button>
        </div>
        <div className="text-[#2B2420]/60 mb-5 italic">{v.de}</div>
        <div className="space-y-2">
          {PRONOUNS.map((p, i) => (
            <div key={p.key} className="flex items-center justify-between py-2.5 border-b border-[#2B2420]/5 last:border-0">
              <div className="flex-1">
                <div className="text-xs text-[#2B2420]/50">{p.key} <span className="text-[#2B2420]/40">({p.de})</span></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold text-[#1F4E5F]">
                  {!isIrregular && <span className="text-[#2B2420]/40">{v.stem}</span>}
                  <span className={isIrregular ? "" : "text-[#C85A3E]"}>{isIrregular ? forms[i] : v.endings[i]}</span>
                </span>
                <button onClick={() => speak(forms[i])} className="text-[#C85A3E]/70"><Volume2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        {!isIrregular && (
          <div className="mt-5 p-3 bg-[#FAF3E7] rounded-xl text-xs text-[#2B2420]/70 leading-relaxed">
            💡 Stamm <span className="font-bold text-[#2B2420]">{v.stem}</span> bleibt gleich. Nur die Endung ändert sich je nach Person.
          </div>
        )}
      </div>
    </div>
  );
};

// Standalone view for possessives table
const PossessivesTableView = ({ onBack }) => (
  <div className="p-5 pb-28">
    <button onClick={onBack} className="text-sm text-[#C85A3E] font-semibold mb-4 flex items-center gap-1">
      <ChevronLeft size={16} /> Zurück
    </button>
    <h3 className="font-display text-xl font-bold text-[#2B2420] mb-4">Possessivbegleiter</h3>
    <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="text-xs tracking-widest uppercase text-[#C85A3E] font-semibold mb-3">💡 Wichtig</div>
      <p className="text-sm text-[#2B2420]/80 leading-relaxed">
        <span className="font-bold">mi, tu, su</span> ändern sich nur im <span className="font-bold">Numerus</span> (Einzahl/Mehrzahl).{" "}
        <span className="font-bold">nuestro</span> und <span className="font-bold">vuestro</span> ändern sich auch im <span className="font-bold">Genus</span> (männlich/weiblich)!
      </p>
    </div>
    <div className="space-y-3">
      {POSSESSIVES.map((p) => (
        <div key={p.person} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="font-display font-bold text-[#2B2420]">{p.person}</div>
              <div className="text-xs text-[#2B2420]/60 italic">{p.de}</div>
            </div>
          </div>
          {p.sg ? (
            <div className="grid grid-cols-2 gap-2">
              <FormBox label="Einzahl" value={p.sg} />
              <FormBox label="Mehrzahl" value={p.pl} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <FormBox label="Sg. männl." value={p.sg_m} />
              <FormBox label="Sg. weibl." value={p.sg_f} />
              <FormBox label="Pl. männl." value={p.pl_m} />
              <FormBox label="Pl. weibl." value={p.pl_f} />
            </div>
          )}
          <div className="mt-3 text-xs text-[#2B2420]/60 italic">{p.note}</div>
        </div>
      ))}
    </div>
  </div>
);

// Standalone Construction overview (extracted)
const ConstructionOverview = ({ construction, onBack, onGoGaps, onGoTranslate }) => (
  <div className="p-5 pb-28">
    <button onClick={onBack} className="text-sm text-[#C85A3E] font-semibold mb-4 flex items-center gap-1">
      <ChevronLeft size={16} /> Zurück
    </button>
    <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-4xl">{construction.emoji}</div>
        <div>
          <h3 className="font-display text-2xl font-bold text-[#2B2420]">{construction.title}</h3>
          <div className="text-sm text-[#2B2420]/60">„{construction.short}"</div>
        </div>
      </div>
      <div className="bg-[#FAF3E7] rounded-xl p-4 text-sm text-[#2B2420]/80 leading-relaxed mt-4">
        💡 {construction.explanation}
      </div>
    </div>
    <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 font-semibold mb-3">Beispiele</div>
      <div className="space-y-2">
        {construction.forms.map((f, i) => (
          <div key={i} className="py-2.5 border-b border-[#2B2420]/5 last:border-0">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-xs text-[#2B2420]/50">{f.person}</span>
              <span className="font-display font-bold text-sm" style={{ color: construction.color }}>{f.form}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-[#2B2420] text-sm">{f.example}</div>
              <button onClick={() => speak(f.example.replace(/[¡¿?.,]/g, ""))} className="text-[#C85A3E]/70 flex-shrink-0"><Volume2 size={14} /></button>
            </div>
            <div className="text-xs text-[#2B2420]/60 italic">{f.de}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={onGoGaps} className="py-3 rounded-2xl bg-[#1F4E5F] font-semibold text-sm active:scale-95 transition" style={{ color: "#FFFFFF" }}>
        <span style={{ color: "#FFFFFF" }}>✏️ Lücken üben</span>
      </button>
      <button onClick={onGoTranslate} style={{ background: construction.color, color: "#FFFFFF" }} className="py-3 rounded-2xl font-semibold text-sm active:scale-95 transition">
        <span style={{ color: "#FFFFFF" }}>🇩🇪→🇪🇸 Sätze</span>
      </button>
    </div>
  </div>
);

// --- Verbs Module: browse table OR drill ---
// --- Verb Drill ---
const VerbDrill = ({ onBack, progress, setProgress }) => {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const verbKeys = Object.keys(VERBS);
    const qs = [];
    for (let i = 0; i < 10; i++) {
      const vKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
      const pIdx = Math.floor(Math.random() * PRONOUNS.length);
      const verb = VERBS[vKey];
      const forms = conjugate(verb);
      qs.push({ verb, pronoun: PRONOUNS[pIdx], pIdx, answer: forms[pIdx] });
    }
    setQuestions(qs);
  }, []);

  if (questions.length === 0) return null;
  const q = questions[idx];

  const check = () => {
    if (!answer.trim() || feedback) return;
    const clean = answer.trim().toLowerCase().replace(/[áéíóú]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"})[c]);
    const target = q.answer.toLowerCase().replace(/[áéíóú]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"})[c]);
    const correct = clean === target;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(score + 1);
    const updated = { ...progress, xp: progress.xp + (correct ? 4 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx(idx + 1);
    }, 1400);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{score} / {questions.length}</h3>
        <p className="text-[#2B2420]/70 mb-6">{pct >= 80 ? "Großartig!" : pct >= 50 ? "Gut!" : "Nochmal üben!"}</p>
        <button onClick={onBack} className="px-6 py-3 bg-[#C85A3E] text-white rounded-full font-semibold">Zurück</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-[#2B2420]">Verb-Drill</h3>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {questions.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-6">
        <div className="h-full bg-[#1F4E5F] transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm">
        <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 mb-2">Konjugiere</div>
        <div className="font-display text-2xl font-bold text-[#2B2420] mb-1">
          {q.pronoun.key} <span className="text-[#C85A3E]">___</span> <span className="text-[#2B2420]/50">({q.verb.inf})</span>
        </div>
        <div className="text-sm text-[#2B2420]/60 italic">{q.pronoun.de} {q.verb.de}</div>
        {q.verb.type === "unregelmäßig" && (
          <div className="mt-2 text-xs text-[#C85A3E]">⚠️ unregelmäßig</div>
        )}
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        disabled={!!feedback}
        placeholder="Antwort eingeben..."
        autoFocus
        className={`w-full px-5 py-4 rounded-2xl text-lg font-display font-semibold text-center focus:outline-none transition ${
          feedback === "correct" ? "bg-[#6B8F47] text-white" :
          feedback === "wrong" ? "bg-[#C85A3E] text-white" :
          "bg-white text-[#2B2420] shadow-sm"
        }`}
      />
      {feedback === "wrong" && (
        <div className="mt-3 text-center text-sm text-[#2B2420]/70">
          Richtig: <span className="font-bold text-[#2B2420]">{q.answer}</span>
        </div>
      )}
      {!feedback && (
        <button onClick={check} disabled={!answer.trim()} className="w-full mt-4 py-4 rounded-2xl bg-[#1F4E5F] text-white font-semibold disabled:opacity-30 active:scale-[0.98] transition">
          Prüfen
        </button>
      )}
    </div>
  );
};

// --- Possessives Module ---
const FormBox = ({ label, value }) => (
  <div className="bg-[#FAF3E7] rounded-xl p-3 text-center">
    <div className="text-[10px] text-[#2B2420]/50 tracking-wider uppercase mb-1">{label}</div>
    <div className="font-display font-bold text-[#7A4E8B]">{value}</div>
  </div>
);

// --- Possessive Drill ---
const PossessiveDrill = ({ onBack, progress, setProgress }) => {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestions(shuffle(POSSESSIVE_DRILLS).slice(0, 10));
  }, []);

  if (questions.length === 0) return null;
  const q = questions[idx];

  const check = () => {
    if (!answer.trim() || feedback) return;
    const clean = answer.trim().toLowerCase();
    const correct = clean === q.answer.toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(score + 1);
    const updated = { ...progress, xp: progress.xp + (correct ? 4 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx(idx + 1);
    }, 1600);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{score} / {questions.length}</h3>
        <p className="text-[#2B2420]/70 mb-6">{pct >= 80 ? "Super!" : pct >= 50 ? "Gut!" : "Schau dir die Tabelle nochmal an!"}</p>
        <button onClick={onBack} className="px-6 py-3 bg-[#C85A3E] text-white rounded-full font-semibold">Zurück</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-[#2B2420]">Possessiv-Drill</h3>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {questions.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-6">
        <div className="h-full bg-[#7A4E8B] transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm">
        <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 mb-2">Übersetze</div>
        <div className="font-display text-2xl font-bold text-[#2B2420] mb-3">{q.de}</div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Tag>{q.person}</Tag>
          <Tag>{q.noun}</Tag>
          <Tag>{q.genus === "m" ? "männl." : "weibl."}</Tag>
          <Tag>{q.num === "sg" ? "Singular" : "Plural"}</Tag>
        </div>
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        disabled={!!feedback}
        placeholder="z.B. mi libro"
        autoFocus
        className={`w-full px-5 py-4 rounded-2xl text-lg font-display font-semibold text-center focus:outline-none transition ${
          feedback === "correct" ? "bg-[#6B8F47] text-white" :
          feedback === "wrong" ? "bg-[#C85A3E] text-white" :
          "bg-white text-[#2B2420] shadow-sm"
        }`}
      />
      {feedback === "wrong" && (
        <div className="mt-3 text-center text-sm text-[#2B2420]/70">
          Richtig: <span className="font-bold text-[#2B2420]">{q.answer}</span>
        </div>
      )}
      {!feedback && (
        <button onClick={check} disabled={!answer.trim()} className="w-full mt-4 py-4 rounded-2xl bg-[#7A4E8B] text-white font-semibold disabled:opacity-30 active:scale-[0.98] transition">
          Prüfen
        </button>
      )}
    </div>
  );
};

const Tag = ({ children }) => (
  <span className="px-2.5 py-1 bg-[#FAF3E7] text-[#2B2420]/70 rounded-full text-xs font-semibold">{children}</span>
);

// =====================================================================
// CONSTRUCTIONS MODULE: tener que, querer, poder, ir a, gustar, hay que
// =====================================================================

const CONSTRUCTIONS = {
  tener_que: {
    key: "tener_que",
    title: "tener que + Infinitiv",
    short: "müssen",
    emoji: "💪",
    color: "#C85A3E",
    explanation: "„tener que + Verb" heißt „müssen". Du konjugierst „tener" wie immer, dann kommt „que" und das Verb im Infinitiv (also unverändert).",
    forms: [
      { person: "yo", form: "tengo que", example: "Yo tengo que estudiar.", de: "Ich muss lernen." },
      { person: "tú", form: "tienes que", example: "Tú tienes que comer.", de: "Du musst essen." },
      { person: "él/ella", form: "tiene que", example: "Ella tiene que trabajar.", de: "Sie muss arbeiten." },
      { person: "nosotros", form: "tenemos que", example: "Nosotros tenemos que ir.", de: "Wir müssen gehen." },
      { person: "vosotros", form: "tenéis que", example: "Vosotros tenéis que escuchar.", de: "Ihr müsst zuhören." },
      { person: "ellos/ellas", form: "tienen que", example: "Ellos tienen que ayudar.", de: "Sie müssen helfen." },
    ],
    pattern: { type: "conjugated_plus", verb: "tener", connector: "que" },
  },
  querer: {
    key: "querer",
    title: "querer + Infinitiv",
    short: "wollen",
    emoji: "✨",
    color: "#7A4E8B",
    explanation: "„querer + Verb" heißt „wollen". Achtung: querer ist UNREGELMÄSSIG (e → ie). Danach kommt das Verb direkt im Infinitiv, kein „que"!",
    forms: [
      { person: "yo", form: "quiero", example: "Yo quiero bailar.", de: "Ich will tanzen." },
      { person: "tú", form: "quieres", example: "Tú quieres comer.", de: "Du willst essen." },
      { person: "él/ella", form: "quiere", example: "Él quiere jugar.", de: "Er will spielen." },
      { person: "nosotros", form: "queremos", example: "Nosotros queremos viajar.", de: "Wir wollen reisen." },
      { person: "vosotros", form: "queréis", example: "Vosotros queréis cantar.", de: "Ihr wollt singen." },
      { person: "ellos/ellas", form: "quieren", example: "Ellas quieren aprender.", de: "Sie wollen lernen." },
    ],
    pattern: { type: "conjugated", verb: "querer" },
  },
  poder: {
    key: "poder",
    title: "poder + Infinitiv",
    short: "können",
    emoji: "🦾",
    color: "#1F4E5F",
    explanation: "„poder + Verb" heißt „können". Auch unregelmäßig (o → ue). Danach kommt das Verb direkt im Infinitiv.",
    forms: [
      { person: "yo", form: "puedo", example: "Yo puedo nadar.", de: "Ich kann schwimmen." },
      { person: "tú", form: "puedes", example: "Tú puedes ayudar.", de: "Du kannst helfen." },
      { person: "él/ella", form: "puede", example: "Ella puede correr.", de: "Sie kann rennen." },
      { person: "nosotros", form: "podemos", example: "Nosotros podemos ir.", de: "Wir können gehen." },
      { person: "vosotros", form: "podéis", example: "Vosotros podéis cantar.", de: "Ihr könnt singen." },
      { person: "ellos/ellas", form: "pueden", example: "Ellos pueden venir.", de: "Sie können kommen." },
    ],
    pattern: { type: "conjugated", verb: "poder" },
  },
  ir_a: {
    key: "ir_a",
    title: "ir a + Infinitiv",
    short: "werden / vorhaben",
    emoji: "🚀",
    color: "#6B8F47",
    explanation: "„ir a + Verb" heißt „werden / vorhaben zu". Drückt die nahe Zukunft aus. „ir" ist unregelmäßig, dann kommt „a" und der Infinitiv.",
    forms: [
      { person: "yo", form: "voy a", example: "Yo voy a estudiar.", de: "Ich werde lernen." },
      { person: "tú", form: "vas a", example: "Tú vas a comer.", de: "Du wirst essen." },
      { person: "él/ella", form: "va a", example: "Él va a viajar.", de: "Er wird reisen." },
      { person: "nosotros", form: "vamos a", example: "Nosotros vamos a bailar.", de: "Wir werden tanzen." },
      { person: "vosotros", form: "vais a", example: "Vosotros vais a leer.", de: "Ihr werdet lesen." },
      { person: "ellos/ellas", form: "van a", example: "Ellas van a venir.", de: "Sie werden kommen." },
    ],
    pattern: { type: "conjugated_plus", verb: "ir", connector: "a" },
  },
  gustar: {
    key: "gustar",
    title: "gustar (mögen)",
    short: "(mir) gefällt",
    emoji: "❤️",
    color: "#D4572C",
    explanation: "„gustar" funktioniert ANDERS als im Deutschen! Wörtlich: „mir gefällt etwas". Du brauchst ein Pronomen vorne (me, te, le…). Bei einem Ding: „gusta", bei mehreren Dingen: „gustan".",
    forms: [
      { person: "yo", form: "me gusta(n)", example: "Me gusta el chocolate.", de: "Mir gefällt Schokolade. (Ich mag Schoko.)" },
      { person: "tú", form: "te gusta(n)", example: "Te gustan los perros.", de: "Dir gefallen Hunde. (Du magst Hunde.)" },
      { person: "él/ella", form: "le gusta(n)", example: "Le gusta bailar.", de: "Ihm/ihr gefällt es zu tanzen." },
      { person: "nosotros", form: "nos gusta(n)", example: "Nos gusta la pizza.", de: "Uns gefällt Pizza." },
      { person: "vosotros", form: "os gusta(n)", example: "Os gustan las películas.", de: "Euch gefallen Filme." },
      { person: "ellos/ellas", form: "les gusta(n)", example: "Les gusta el fútbol.", de: "Ihnen gefällt Fußball." },
    ],
    pattern: { type: "gustar" },
  },
  hay_que: {
    key: "hay_que",
    title: "hay que + Infinitiv",
    short: "man muss",
    emoji: "📋",
    color: "#E8A838",
    explanation: "„hay que + Verb" heißt „man muss" – ganz allgemein, nicht auf eine bestimmte Person bezogen. UNVERÄNDERLICH: immer „hay que", egal wer gemeint ist!",
    forms: [
      { person: "(immer gleich)", form: "hay que", example: "Hay que estudiar mucho.", de: "Man muss viel lernen." },
      { person: "Beispiel 1", form: "hay que", example: "Hay que comer verduras.", de: "Man muss Gemüse essen." },
      { person: "Beispiel 2", form: "hay que", example: "Hay que escuchar al profesor.", de: "Man muss dem Lehrer zuhören." },
      { person: "Beispiel 3", form: "hay que", example: "Hay que ser puntual.", de: "Man muss pünktlich sein." },
    ],
    pattern: { type: "fixed", form: "hay que" },
  },
};

// === Drill items: Lückentext (gap fill) ===
// { construction, sentence (mit ___ und Infinitiv in Klammern), answer, hint }
const GAP_DRILLS = {
  tener_que: [
    { sentence: "Yo ___ que estudiar para el examen.", answer: "tengo", hint: "yo + tener" },
    { sentence: "Mi hermana ___ que ir al médico.", answer: "tiene", hint: "ella + tener" },
    { sentence: "Nosotros ___ que comer más fruta.", answer: "tenemos", hint: "nosotros + tener" },
    { sentence: "¿Tú ___ que trabajar mañana?", answer: "tienes", hint: "tú + tener" },
    { sentence: "Mis padres ___ que viajar a Madrid.", answer: "tienen", hint: "ellos + tener" },
    { sentence: "Vosotros ___ que escuchar bien.", answer: "tenéis", alts: ["teneis"], hint: "vosotros + tener" },
  ],
  querer: [
    { sentence: "Yo ___ bailar flamenco.", answer: "quiero", hint: "yo + querer (e→ie)" },
    { sentence: "¿Tú ___ un helado?", answer: "quieres", hint: "tú + querer" },
    { sentence: "Mi amiga ___ aprender alemán.", answer: "quiere", hint: "ella + querer" },
    { sentence: "Nosotros ___ ir al cine.", answer: "queremos", hint: "nosotros + querer (KEIN ie!)" },
    { sentence: "Los niños ___ jugar fuera.", answer: "quieren", hint: "ellos + querer" },
    { sentence: "Vosotros ___ comer pizza.", answer: "queréis", alts: ["quereis"], hint: "vosotros + querer" },
  ],
  poder: [
    { sentence: "Yo ___ ayudarte con la tarea.", answer: "puedo", hint: "yo + poder (o→ue)" },
    { sentence: "¿Tú ___ venir a mi fiesta?", answer: "puedes", hint: "tú + poder" },
    { sentence: "Mi padre ___ cocinar muy bien.", answer: "puede", hint: "él + poder" },
    { sentence: "Nosotros ___ jugar al fútbol hoy.", answer: "podemos", hint: "nosotros + poder (KEIN ue!)" },
    { sentence: "Los gatos ___ dormir todo el día.", answer: "pueden", hint: "ellos + poder" },
    { sentence: "Vosotros ___ entrar ahora.", answer: "podéis", alts: ["podeis"], hint: "vosotros + poder" },
  ],
  ir_a: [
    { sentence: "Yo ___ a estudiar esta tarde.", answer: "voy", hint: "yo + ir" },
    { sentence: "Tú ___ a viajar a España.", answer: "vas", hint: "tú + ir" },
    { sentence: "Mi hermano ___ a comprar pan.", answer: "va", hint: "él + ir" },
    { sentence: "Nosotros ___ a bailar esta noche.", answer: "vamos", hint: "nosotros + ir" },
    { sentence: "Mis amigos ___ a venir mañana.", answer: "van", hint: "ellos + ir" },
    { sentence: "Vosotros ___ a leer un libro.", answer: "vais", hint: "vosotros + ir" },
  ],
  gustar: [
    { sentence: "A mí me ___ el chocolate.", answer: "gusta", hint: "ein Ding (Singular) → gusta" },
    { sentence: "A ti te ___ los perros.", answer: "gustan", hint: "viele Dinge (Plural) → gustan" },
    { sentence: "A mi hermana le ___ bailar.", answer: "gusta", hint: "ein Verb → gusta" },
    { sentence: "A nosotros nos ___ las películas.", answer: "gustan", hint: "viele Dinge → gustan" },
    { sentence: "A los niños les ___ el fútbol.", answer: "gusta", hint: "ein Ding → gusta" },
    { sentence: "A vosotros os ___ las pizzas italianas.", answer: "gustan", hint: "viele Dinge → gustan" },
  ],
  hay_que: [
    { sentence: "___ que estudiar para aprobar.", answer: "hay", hint: "Immer „hay" – egal wer!" },
    { sentence: "En la clase ___ que escuchar.", answer: "hay", hint: "Immer „hay"" },
    { sentence: "Para estar sano, ___ que comer bien.", answer: "hay", hint: "Immer „hay"" },
    { sentence: "Antes del examen ___ que repasar.", answer: "hay", hint: "Immer „hay"" },
  ],
};

// === Drill items: ganze Sätze übersetzen ===
const TRANSLATION_DRILLS = {
  tener_que: [
    { de: "Ich muss lernen.", accept: ["tengo que estudiar"] },
    { de: "Du musst essen.", accept: ["tienes que comer"] },
    { de: "Wir müssen gehen.", accept: ["tenemos que ir"] },
    { de: "Sie (Einzahl) muss arbeiten.", accept: ["tiene que trabajar", "ella tiene que trabajar"] },
    { de: "Ihr müsst zuhören.", accept: ["teneis que escuchar", "tenéis que escuchar"] },
    { de: "Sie (Mehrzahl) müssen helfen.", accept: ["tienen que ayudar", "ellos tienen que ayudar", "ellas tienen que ayudar"] },
  ],
  querer: [
    { de: "Ich will tanzen.", accept: ["quiero bailar"] },
    { de: "Willst du essen?", accept: ["quieres comer", "quieres comer?", "¿quieres comer?"] },
    { de: "Wir wollen reisen.", accept: ["queremos viajar"] },
    { de: "Er will spielen.", accept: ["quiere jugar", "él quiere jugar"] },
    { de: "Ihr wollt singen.", accept: ["quereis cantar", "queréis cantar"] },
    { de: "Sie (Mehrzahl) wollen lernen.", accept: ["quieren aprender", "ellos quieren aprender", "ellas quieren aprender"] },
  ],
  poder: [
    { de: "Ich kann schwimmen.", accept: ["puedo nadar"] },
    { de: "Kannst du helfen?", accept: ["puedes ayudar", "puedes ayudar?", "¿puedes ayudar?"] },
    { de: "Wir können gehen.", accept: ["podemos ir"] },
    { de: "Sie (Einzahl) kann rennen.", accept: ["puede correr", "ella puede correr"] },
    { de: "Ihr könnt singen.", accept: ["podeis cantar", "podéis cantar"] },
    { de: "Sie (Mehrzahl) können kommen.", accept: ["pueden venir", "ellos pueden venir", "ellas pueden venir"] },
  ],
  ir_a: [
    { de: "Ich werde lernen.", accept: ["voy a estudiar", "voy a aprender"] },
    { de: "Du wirst essen.", accept: ["vas a comer"] },
    { de: "Wir werden tanzen.", accept: ["vamos a bailar"] },
    { de: "Er wird reisen.", accept: ["va a viajar", "él va a viajar"] },
    { de: "Ihr werdet lesen.", accept: ["vais a leer"] },
    { de: "Sie (Mehrzahl) werden kommen.", accept: ["van a venir", "ellos van a venir", "ellas van a venir"] },
  ],
  gustar: [
    { de: "Mir gefällt Schokolade.", accept: ["me gusta el chocolate", "me gusta chocolate"] },
    { de: "Dir gefallen Hunde.", accept: ["te gustan los perros", "te gustan perros"] },
    { de: "Uns gefällt Pizza.", accept: ["nos gusta la pizza", "nos gusta pizza"] },
    { de: "Ihm/ihr gefällt es zu tanzen.", accept: ["le gusta bailar"] },
    { de: "Euch gefallen Filme.", accept: ["os gustan las peliculas", "os gustan las películas", "os gustan peliculas"] },
    { de: "Ihnen gefällt Fußball.", accept: ["les gusta el futbol", "les gusta el fútbol", "les gusta futbol"] },
  ],
  hay_que: [
    { de: "Man muss lernen.", accept: ["hay que estudiar", "hay que aprender"] },
    { de: "Man muss Gemüse essen.", accept: ["hay que comer verduras", "hay que comer las verduras"] },
    { de: "Man muss pünktlich sein.", accept: ["hay que ser puntual"] },
    { de: "Man muss dem Lehrer zuhören.", accept: ["hay que escuchar al profesor"] },
    { de: "Man muss viel arbeiten.", accept: ["hay que trabajar mucho"] },
    { de: "Man muss früh aufstehen.", accept: ["hay que levantarse temprano"] },
  ],
};

// === Lückentext-Drill ===
const GapDrill = ({ construction, onBack, progress, setProgress }) => {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setItems(shuffle(GAP_DRILLS[construction.key]));
  }, [construction.key]);

  if (items.length === 0) return null;
  const q = items[idx];

  const check = () => {
    if (!answer.trim() || feedback) return;
    const norm = answer.trim().toLowerCase().replace(/[áéíóú]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"})[c]);
    const target = q.answer.toLowerCase().replace(/[áéíóú]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"})[c]);
    const altMatches = (q.alts || []).some((a) => a.toLowerCase() === answer.trim().toLowerCase());
    const correct = norm === target || altMatches;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(score + 1);
    const updated = { ...progress, xp: progress.xp + (correct ? 4 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      if (idx + 1 >= items.length) setDone(true);
      else setIdx(idx + 1);
    }, 1500);
  };

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{score} / {items.length}</h3>
        <p className="text-[#2B2420]/70 mb-6 text-center">{pct >= 80 ? "Großartig!" : pct >= 50 ? "Bald perfekt!" : "Schau dir die Erklärung nochmal an!"}</p>
        <button onClick={onBack} style={{ background: construction.color, color: "#FFFFFF" }} className="px-6 py-3 rounded-full font-semibold">
          <span style={{ color: "#FFFFFF" }}>Zurück</span>
        </button>
      </div>
    );
  }

  // Satz mit visueller Lücke
  const parts = q.sentence.split("___");

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-sm text-[#C85A3E] font-semibold flex items-center gap-1">
          <ChevronLeft size={16} /> Zurück
        </button>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {items.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-6">
        <div className="h-full transition-all" style={{ width: `${(idx / items.length) * 100}%`, background: construction.color }} />
      </div>
      <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
        <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 mb-3">Setze ein:</div>
        <div className="font-display text-xl text-[#2B2420] leading-relaxed">
          {parts[0]}
          <span className="inline-block px-3 py-1 mx-1 rounded-lg bg-[#FAF3E7] border-2 border-dashed" style={{ borderColor: construction.color, color: construction.color }}>
            ___
          </span>
          {parts[1]}
        </div>
        {q.hint && (
          <div className="mt-3 text-xs italic" style={{ color: construction.color }}>💡 {q.hint}</div>
        )}
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        disabled={!!feedback}
        placeholder="Dein Antwort..."
        autoFocus
        className={`w-full px-5 py-4 rounded-2xl text-lg font-display font-semibold text-center focus:outline-none transition ${
          feedback === "correct" ? "bg-[#6B8F47] text-white" :
          feedback === "wrong" ? "bg-[#C85A3E] text-white" :
          "bg-white text-[#2B2420] shadow-sm"
        }`}
        style={feedback ? { color: "#FFFFFF" } : {}}
      />
      {feedback === "wrong" && (
        <div className="mt-3 text-center text-sm text-[#2B2420]/70">
          Richtig: <span className="font-bold text-[#2B2420]">{q.answer}</span>
        </div>
      )}
      {!feedback && (
        <button
          onClick={check}
          disabled={!answer.trim()}
          style={{ background: construction.color, color: "#FFFFFF" }}
          className="w-full mt-4 py-4 rounded-2xl font-semibold disabled:opacity-30 active:scale-[0.98] transition"
        >
          <span style={{ color: "#FFFFFF" }}>Prüfen</span>
        </button>
      )}
    </div>
  );
};

// === Übersetzungs-Drill: ganzer Satz DE → ES ===
const TranslationDrill = ({ construction, onBack, progress, setProgress }) => {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setItems(shuffle(TRANSLATION_DRILLS[construction.key]));
  }, [construction.key]);

  if (items.length === 0) return null;
  const q = items[idx];

  const check = () => {
    if (!answer.trim() || feedback) return;
    // Großzügige Normalisierung: kleinschreiben, Akzente weg, mehrfache Spaces zu einem, Satzzeichen weg
    const norm = (s) => s.toLowerCase().trim()
      .replace(/[áéíóúñü¿¡?!.,;:]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u",ñ:"n",ü:"u"})[c] || "")
      .replace(/\s+/g, " ");
    const userNorm = norm(answer);
    const correct = q.accept.some((acc) => norm(acc) === userNorm);
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(score + 1);
    const updated = { ...progress, xp: progress.xp + (correct ? 6 : 1) };
    setProgress(updated);
    saveProgress(updated);
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      if (idx + 1 >= items.length) setDone(true);
      else setIdx(idx + 1);
    }, 2000);
  };

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <h3 className="font-display text-3xl font-bold text-[#2B2420] mb-2">{score} / {items.length}</h3>
        <p className="text-[#2B2420]/70 mb-6 text-center">{pct >= 80 ? "Wahnsinn, fast alle richtig!" : pct >= 50 ? "Solide! Übung macht den Meister." : "Schau dir die Beispiele nochmal an, dann probier nochmal!"}</p>
        <button onClick={onBack} style={{ background: construction.color, color: "#FFFFFF" }} className="px-6 py-3 rounded-full font-semibold">
          <span style={{ color: "#FFFFFF" }}>Zurück</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-sm text-[#C85A3E] font-semibold flex items-center gap-1">
          <ChevronLeft size={16} /> Zurück
        </button>
        <div className="text-sm text-[#2B2420]/60">{idx + 1} / {items.length}</div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-6">
        <div className="h-full transition-all" style={{ width: `${(idx / items.length) * 100}%`, background: construction.color }} />
      </div>
      <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm text-center">
        <div className="text-xs tracking-widest uppercase text-[#2B2420]/50 mb-3">Auf Spanisch:</div>
        <div className="font-display text-2xl font-bold text-[#2B2420]">{q.de}</div>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${construction.color}15`, color: construction.color }}>
          {construction.emoji} {construction.title}
        </div>
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); check(); } }}
        disabled={!!feedback}
        placeholder="Spanischen Satz tippen..."
        rows={2}
        autoFocus
        className={`w-full px-5 py-4 rounded-2xl text-lg font-display font-semibold text-center focus:outline-none transition resize-none ${
          feedback === "correct" ? "bg-[#6B8F47] text-white" :
          feedback === "wrong" ? "bg-[#C85A3E] text-white" :
          "bg-white text-[#2B2420] shadow-sm"
        }`}
        style={feedback ? { color: "#FFFFFF" } : {}}
      />
      {feedback === "wrong" && (
        <div className="mt-3 text-center text-sm text-[#2B2420]/70">
          Mögliche Antwort: <span className="font-bold text-[#2B2420]">{q.accept[0]}</span>
        </div>
      )}
      {feedback === "correct" && (
        <div className="mt-3 text-center text-sm text-[#6B8F47] font-semibold">
          ¡Perfecto! 🎉
        </div>
      )}
      {!feedback && (
        <button
          onClick={check}
          disabled={!answer.trim()}
          style={{ background: construction.color, color: "#FFFFFF" }}
          className="w-full mt-4 py-4 rounded-2xl font-semibold disabled:opacity-30 active:scale-[0.98] transition"
        >
          <span style={{ color: "#FFFFFF" }}>Prüfen</span>
        </button>
      )}
    </div>
  );
};

// --- Bottom Nav ---
const BottomNav = ({ view, onNavigate }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Start" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "games", icon: Gamepad2, label: "Vokabeln" },
    { id: "grammar", icon: Zap, label: "Grammatik" },
    { id: "story", icon: BookOpen, label: "Historia" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FAF3E7]/95 backdrop-blur-md border-t border-[#C85A3E]/10 z-20">
      <div className="flex justify-around items-center py-2 px-2 safe-area">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <button key={t.id} onClick={() => onNavigate(t.id)} className="flex flex-col items-center gap-0.5 px-3 py-2 active:scale-95 transition">
              <Icon size={20} className={active ? "text-[#C85A3E]" : "text-[#2B2420]/40"} />
              <span className={`text-[10px] font-semibold ${active ? "text-[#C85A3E]" : "text-[#2B2420]/40"}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Main ---
export default function SofiaApp() {
  const [view, setView] = useState("home");
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProgress().then((p) => {
      // streak update
      const today = new Date().toDateString();
      if (p.lastPlayed !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        const newStreak = p.lastPlayed === y.toDateString() ? (p.streak || 0) + 1 : 1;
        const updated = { ...p, streak: newStreak, lastPlayed: today };
        setProgress(updated);
        saveProgress(updated);
      } else {
        setProgress(p);
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FAF3E7] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C85A3E]/20 border-t-[#C85A3E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        body, .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
      `}</style>
      <Header progress={progress} view={view} onBack={() => setView("home")} />
      {view === "home" && <HomeView progress={progress} onNavigate={setView} />}
      {view === "chat" && <ChatView progress={progress} setProgress={setProgress} />}
      {view === "games" && <GamesView progress={progress} setProgress={setProgress} />}
      {view === "grammar" && <GrammarView progress={progress} setProgress={setProgress} />}
      {view === "story" && <StoryView progress={progress} setProgress={setProgress} />}
      {view === "progress" && <ProgressView progress={progress} />}
      <BottomNav view={view} onNavigate={setView} />
    </div>
  );
}
