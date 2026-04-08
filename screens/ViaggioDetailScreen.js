import React, { useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Image, Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, WHATSAPP_NUMBER } from "../config";
import { useLang } from "../context/LangContext";

const { width: W } = Dimensions.get("window");

export default function ViaggioDetailScreen({ route, navigation }) {
  const { t, lang } = useLang();
  const { viaggio }  = route.params;

  const titolo      = lang === "en" ? (viaggio.titolo_en      || viaggio.titolo)      : viaggio.titolo;
  const descrizione = lang === "en" ? (viaggio.descrizione_en || viaggio.descrizione) : viaggio.descrizione;
  const destinazione= lang === "en" ? (viaggio.destinazione_en|| viaggio.destinazione): viaggio.destinazione;
  const incluso     = lang === "en" ? (viaggio.incluso_en     || viaggio.incluso)     : viaggio.incluso;

  const dataP = new Date(viaggio.dataPartenza).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const dataR = new Date(viaggio.dataRitorno).toLocaleDateString("it-IT",  { day: "numeric", month: "long", year: "numeric" });

  const prenota = () => {
    const msg = encodeURIComponent(
      lang === "it"
        ? `Ciao Gianluca! Sono interessato al viaggio "${titolo}" (${dataP} - ${dataR}). Prezzo: €${viaggio.prezzo}. Vorrei saperne di più!`
        : `Hi Gianluca! I'm interested in the trip "${titolo}" (${dataP} - ${dataR}). Price: €${viaggio.prezzo}. I'd like to know more!`
    );
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
  };

  const disponPct = viaggio.postiTotali > 0
    ? ((viaggio.postiTotali - viaggio.postiDisponibili) / viaggio.postiTotali) * 100
    : 0;

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero foto */}
        <View style={s.hero}>
          {viaggio.foto
            ? <Image source={{ uri: viaggio.foto }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : (
              <LinearGradient colors={[COLORS.violet, COLORS.background, "#00ff8820"]} style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ fontSize: 80 }}>🌌</Text>
                </View>
              </LinearGradient>
            )
          }
          <LinearGradient colors={["transparent", COLORS.background]} style={s.heroOverlay} />

          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>‹ Indietro</Text>
          </TouchableOpacity>

          {/* Titolo hero */}
          <View style={s.heroInfo}>
            <View style={s.destPill}>
              <Text style={s.destTxt}>📍 {destinazione}</Text>
            </View>
            <Text style={s.heroTitolo}>{titolo}</Text>
          </View>
        </View>

        {/* KPI */}
        <View style={s.kpiRow}>
          {[
            { icon: "📅", label: t("partenza"), val: dataP },
            { icon: "🏁", label: t("al"),       val: dataR },
            { icon: "💶", label: t("prezzo"),    val: "€" + viaggio.prezzo },
          ].map(({ icon, label, val }) => (
            <LinearGradient key={label} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.kpiBox}>
              <Text style={s.kpiIcon}>{icon}</Text>
              <Text style={s.kpiLabel}>{label}</Text>
              <Text style={s.kpiVal} numberOfLines={2}>{val}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Posti disponibili */}
        <View style={s.section}>
          <View style={s.postiHeader}>
            <Text style={s.postiTitle}>{t("posti_tot")}: {viaggio.postiTotali}</Text>
            <View style={[s.postiBadge, { backgroundColor: viaggio.postiDisponibili <= 3 ? COLORS.redBg : COLORS.greenBg }]}>
              <Text style={[s.postiTxt, { color: viaggio.postiDisponibili <= 3 ? COLORS.red : COLORS.green }]}>
                {viaggio.postiDisponibili} {t("posto_disp")}
              </Text>
            </View>
          </View>
          <View style={s.progressBar}>
            <LinearGradient
              colors={[COLORS.green, COLORS.cyan]}
              style={[s.progressFill, { width: disponPct + "%" }]}
            />
          </View>
        </View>

        {/* Descrizione */}
        {descrizione && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📝 Descrizione</Text>
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.textCard}>
              <Text style={s.bodyText}>{descrizione}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Cosa è incluso */}
        {incluso && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>✅ {t("incluso")}</Text>
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.textCard}>
              {(Array.isArray(incluso) ? incluso : incluso.split("\n")).map((item, i) => (
                <View key={i} style={s.inclusoRow}>
                  <Text style={{ color: COLORS.green, marginRight: 8 }}>✓</Text>
                  <Text style={s.bodyText}>{item.replace(/^-\s*/, "")}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        )}

        {/* Programma */}
        {viaggio.programma && viaggio.programma.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🗓️ {t("programma")}</Text>
            {viaggio.programma.map((giorno, i) => (
              <LinearGradient key={i} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.giornoCard}>
                <View style={s.giornoHeader}>
                  <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={s.giornoBadge}>
                    <Text style={{ color: "#000", fontWeight: "800", fontSize: 12 }}>
                      {lang === "it" ? "Giorno" : "Day"} {i + 1}
                    </Text>
                  </LinearGradient>
                  <Text style={s.giornoTitolo}>
                    {lang === "en" ? (giorno.titolo_en || giorno.titolo) : giorno.titolo}
                  </Text>
                </View>
                <Text style={[s.bodyText, { marginTop: 8 }]}>
                  {lang === "en" ? (giorno.desc_en || giorno.desc) : giorno.desc}
                </Text>
              </LinearGradient>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA fisso in basso */}
      <LinearGradient colors={["transparent", COLORS.background, COLORS.background]} style={s.ctaContainer}>
        <TouchableOpacity onPress={prenota} style={s.ctaBtn}>
          <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={s.ctaGrad}>
            <Text style={s.ctaTxt}>💬 {t("prenota_via_wa")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  hero:         { height: 320, position: "relative" },
  heroOverlay:  { position: "absolute", bottom: 0, left: 0, right: 0, height: 180 },
  backBtn:      { position: "absolute", top: 55, left: 16, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backTxt:      { color: COLORS.green, fontSize: 16 },
  heroInfo:     { position: "absolute", bottom: 20, left: 16, right: 16 },
  destPill:     { backgroundColor: COLORS.violetBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8, borderWidth: 1, borderColor: COLORS.violet + "40" },
  destTxt:      { fontSize: 12, color: COLORS.violetLight, fontWeight: "600" },
  heroTitolo:   { fontSize: 24, fontWeight: "900", color: COLORS.text, lineHeight: 30 },
  kpiRow:       { flexDirection: "row", gap: 8, padding: 16 },
  kpiBox:       { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.cardBorder },
  kpiIcon:      { fontSize: 20 },
  kpiLabel:     { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  kpiVal:       { fontSize: 12, fontWeight: "700", color: COLORS.text, marginTop: 4, textAlign: "center" },
  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  postiHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  postiTitle:   { fontSize: 14, color: COLORS.textSoft },
  postiBadge:   { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  postiTxt:     { fontSize: 13, fontWeight: "700" },
  progressBar:  { height: 8, backgroundColor: COLORS.cardBorder, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  textCard:     { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
  bodyText:     { fontSize: 14, color: COLORS.textSoft, lineHeight: 22, flex: 1 },
  inclusoRow:   { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  giornoCard:   { borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  giornoHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  giornoBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  giornoTitolo: { fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 },
  ctaContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 36, paddingTop: 24 },
  ctaBtn:       { borderRadius: 18, overflow: "hidden" },
  ctaGrad:      { padding: 18, alignItems: "center" },
  ctaTxt:       { color: "#000", fontWeight: "800", fontSize: 17 },
});
