import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, WHATSAPP_NUMBER, INSTAGRAM } from "../config";
import { useLang } from "../context/LangContext";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { Linking } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

// ── Aurora SVG animata ───────────────────────────────────────
function AuroraBackground() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width={W} height={H * 0.55}>
        <Ellipse cx={W * 0.3} cy={80} rx={W * 0.6} ry={120} fill="#00ff8820" />
        <Ellipse cx={W * 0.7} cy={130} rx={W * 0.5} ry={90}  fill="#7c3aed18" />
        <Ellipse cx={W * 0.5} cy={200} rx={W * 0.7} ry={100} fill="#06b6d415" />
        <Ellipse cx={W * 0.2} cy={250} rx={W * 0.4} ry={80}  fill="#00ff8812" />
      </Svg>
    </Animated.View>
  );
}

// ── Countdown ────────────────────────────────────────────────
function Countdown({ dataPartenza }) {
  const { t } = useLang();
  const giorni = Math.max(0, Math.ceil(
    (new Date(dataPartenza) - new Date()) / (1000 * 60 * 60 * 24)
  ));
  return (
    <View style={s.countdownBox}>
      <Text style={s.countdownNum}>{giorni}</Text>
      <Text style={s.countdownLabel}>{t("countdown_days")}</Text>
    </View>
  );
}

// ── Card viaggio ─────────────────────────────────────────────
function ViaggioCard({ viaggio, onPress }) {
  const { t, lang } = useLang();
  const titolo = lang === "en" ? (viaggio.titolo_en || viaggio.titolo) : viaggio.titolo;
  const dest   = lang === "en" ? (viaggio.destinazione_en || viaggio.destinazione) : viaggio.destinazione;
  return (
    <TouchableOpacity onPress={onPress} style={s.viaggioCard} activeOpacity={0.85}>
      <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.viaggioCardInner}>
        {viaggio.foto && (
          <Image source={{ uri: viaggio.foto }} style={s.viaggioImg} resizeMode="cover" />
        )}
        <LinearGradient colors={["transparent", COLORS.background]} style={s.viaggioImgOverlay} />
        <View style={s.viaggioInfo}>
          <View style={s.destPill}>
            <Text style={s.destText}>📍 {dest}</Text>
          </View>
          <Text style={s.viaggioTitolo}>{titolo}</Text>
          <View style={s.viaggioMeta}>
            <Text style={s.viaggioData}>
              {new Date(viaggio.dataPartenza).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
              {" — "}
              {new Date(viaggio.dataRitorno).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
            <View style={s.prezzoBox}>
              <Text style={s.prezzoLabel}>{t("da")}</Text>
              <Text style={s.prezzoVal}>€{viaggio.prezzo}</Text>
            </View>
          </View>
          <View style={s.postiRow}>
            <View style={[s.postiBadge, { backgroundColor: viaggio.postiDisponibili <= 3 ? COLORS.redBg : COLORS.greenBg }]}>
              <Text style={[s.postiText, { color: viaggio.postiDisponibili <= 3 ? COLORS.red : COLORS.green }]}>
                {viaggio.postiDisponibili} {t("posto_disp")}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t, lang, toggleLang } = useLang();
  const [viaggi,  setViaggi]  = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadViaggi();
  }, []);

  const loadViaggi = async () => {
    try {
      const q   = query(collection(db, "viaggi"), orderBy("dataPartenza", "asc"), limit(5));
      const snap= await getDocs(q);
      setViaggi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      // Dati demo se Firebase non è ancora configurato
      setViaggi([
        {
          id: "demo1",
          titolo: "Aurora in Norvegia — Tromsø",
          titolo_en: "Northern Lights in Norway — Tromsø",
          destinazione: "Tromsø, Norvegia",
          destinazione_en: "Tromsø, Norway",
          dataPartenza: "2026-01-15",
          dataRitorno: "2026-01-22",
          prezzo: 2490,
          postiDisponibili: 6,
          postiTotali: 12,
          foto: null,
        },
        {
          id: "demo2",
          titolo: "Islanda — Ring Road & Aurora",
          titolo_en: "Iceland — Ring Road & Aurora",
          destinazione: "Islanda",
          destinazione_en: "Iceland",
          dataPartenza: "2026-02-08",
          dataRitorno: "2026-02-15",
          prezzo: 2890,
          postiDisponibili: 2,
          postiTotali: 10,
          foto: null,
        },
      ]);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  };

  const prossimo = viaggi[0];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <AuroraBackground />
          <LinearGradient colors={[COLORS.background, "transparent", COLORS.background]} style={StyleSheet.absoluteFill} />

          {/* Header */}
          <View style={s.headerRow}>
            <View>
              <Text style={s.logoTop}>🌌</Text>
              <Text style={s.logoName}>Cacciatori</Text>
              <Text style={s.logoSub}>Aurora Boreale</Text>
            </View>
            <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
              <Text style={s.langTxt}>{lang === "it" ? "🇮🇹 IT" : "🇬🇧 EN"}</Text>
            </TouchableOpacity>
          </View>

          {/* Tagline */}
          <View style={s.taglineContainer}>
            <Text style={s.tagline}>
              {lang === "it"
                ? "Il più grande spettacolo\ndella natura ti aspetta"
                : "The greatest show on earth\nis waiting for you"}
            </Text>
            {prossimo && <Countdown dataPartenza={prossimo.dataPartenza} />}
          </View>

          {/* Stelle animate */}
          <View style={s.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Text key={i} style={[s.star, { opacity: 0.3 + i * 0.15 }]}>✦</Text>
            ))}
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Prossimi viaggi */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>🗺️ {t("prossimi")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Viaggi")}>
                <Text style={s.seeAll}>Tutti →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
              {viaggi.map(v => (
                <ViaggioCard
                  key={v.id}
                  viaggio={v}
                  onPress={() => navigation.navigate("ViaggioDetail", { viaggio: v })}
                />
              ))}
            </ScrollView>
          </View>

          {/* Chi siamo */}
          <View style={s.section}>
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.chisiamo}>
              <Text style={s.chiTitolo}>
                {lang === "it" ? "Chi sono" : "About me"}
              </Text>
              <Text style={s.chiTesto}>
                {lang === "it"
                  ? "Sono Gianluca, Travel Designer certificato specializzato nei viaggi verso il Nord Europa. Ho percorso migliaia di km alla ricerca dell'aurora boreale e ora accompagno altri a vivere questa magia indimenticabile."
                  : "I'm Gianluca, a certified Travel Designer specializing in Northern Europe. I've traveled thousands of km chasing the northern lights and now I guide others to live this unforgettable experience."}
              </Text>
              <View style={s.chiActions}>
                <TouchableOpacity
                  style={s.chiBtn}
                  onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP_NUMBER)}
                >
                  <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={s.chiBtnGrad}>
                    <Text style={s.chiBtnTxt}>💬 WhatsApp</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.chiBtn}
                  onPress={() => Linking.openURL(INSTAGRAM)}
                >
                  <LinearGradient colors={[COLORS.violet, "#5b21b6"]} style={s.chiBtnGrad}>
                    <Text style={s.chiBtnTxt}>📸 Instagram</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Quick links */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              {lang === "it" ? "✨ Esplora" : "✨ Explore"}
            </Text>
            <View style={s.quickGrid}>
              {[
                { icon: "🎙️", label: t("podcast"), screen: "Podcast" },
                { icon: "🌌", label: "Aurora Live", screen: "AuroraLive" },
                { icon: "📖", label: t("blog"), screen: "Blog" },
                { icon: "📬", label: t("contattaci"), screen: "Contatti" },
              ].map(({ icon, label, screen }) => (
                <TouchableOpacity
                  key={screen}
                  onPress={() => navigation.navigate(screen)}
                  style={s.quickCard}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.quickInner}>
                    <Text style={s.quickIcon}>{icon}</Text>
                    <Text style={s.quickLabel}>{label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Admin nascosto */}
          <TouchableOpacity
            onPress={() => navigation.navigate("AdminLogin")}
            style={s.adminLink}
          >
            <Text style={s.adminLinkTxt}>⚙️ Area Admin</Text>
          </TouchableOpacity>

        </Animated.View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  hero:            { height: H * 0.5, justifyContent: "space-between", paddingTop: 55, overflow: "hidden" },
  headerRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20 },
  logoTop:         { fontSize: 32 },
  logoName:        { fontSize: 22, fontWeight: "900", color: COLORS.text, marginTop: 4 },
  logoSub:         { fontSize: 14, color: COLORS.green, fontWeight: "600" },
  langBtn:         { backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
  langTxt:         { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  taglineContainer:{ paddingHorizontal: 20, paddingBottom: 20 },
  tagline:         { fontSize: 26, fontWeight: "800", color: COLORS.text, lineHeight: 34 },
  countdownBox:    { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 16 },
  countdownNum:    { fontSize: 48, fontWeight: "900", color: COLORS.green },
  countdownLabel:  { fontSize: 16, color: COLORS.textSoft },
  starsRow:        { flexDirection: "row", gap: 16, paddingHorizontal: 20, paddingBottom: 16 },
  star:            { fontSize: 18, color: COLORS.green },
  section:         { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle:    { fontSize: 18, fontWeight: "700", color: COLORS.text },
  seeAll:          { fontSize: 14, color: COLORS.green },
  horizontalScroll:{ marginHorizontal: -16, paddingHorizontal: 16 },
  viaggioCard:     { width: W * 0.75, marginRight: 14, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: COLORS.cardBorder },
  viaggioCardInner:{ },
  viaggioImg:      { width: "100%", height: 180 },
  viaggioImgOverlay:{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  viaggioInfo:     { padding: 16 },
  destPill:        { backgroundColor: COLORS.violetBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 },
  destText:        { fontSize: 11, color: COLORS.violetLight, fontWeight: "600" },
  viaggioTitolo:   { fontSize: 16, fontWeight: "700", color: COLORS.text, lineHeight: 22 },
  viaggioMeta:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  viaggioData:     { fontSize: 12, color: COLORS.textMuted },
  prezzoBox:       { flexDirection: "row", alignItems: "baseline", gap: 4 },
  prezzoLabel:     { fontSize: 11, color: COLORS.textMuted },
  prezzoVal:       { fontSize: 18, fontWeight: "800", color: COLORS.green },
  postiRow:        { marginTop: 10 },
  postiBadge:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  postiText:       { fontSize: 12, fontWeight: "600" },
  chisiamo:        { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  chiTitolo:       { fontSize: 20, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  chiTesto:        { fontSize: 14, color: COLORS.textSoft, lineHeight: 22 },
  chiActions:      { flexDirection: "row", gap: 10, marginTop: 16 },
  chiBtn:          { flex: 1, borderRadius: 14, overflow: "hidden" },
  chiBtnGrad:      { padding: 13, alignItems: "center" },
  chiBtnTxt:       { color: "#fff", fontWeight: "700", fontSize: 14 },
  quickGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard:       { width: (W - 52) / 2, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: COLORS.cardBorder },
  quickInner:      { padding: 20, alignItems: "center" },
  quickIcon:       { fontSize: 32 },
  quickLabel:      { fontSize: 13, color: COLORS.textSoft, fontWeight: "600", marginTop: 10 },
  adminLink:       { alignItems: "center", marginTop: 10 },
  adminLinkTxt:    { fontSize: 11, color: COLORS.textMuted },
});
