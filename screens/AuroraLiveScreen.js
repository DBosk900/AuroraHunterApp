import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { COLORS } from "../config";
import { useLang } from "../context/LangContext";
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";

const { width: W } = Dimensions.get("window");

// ── Gauge KP ─────────────────────────────────────────────────
function KPGauge({ kp }) {
  const max   = 9;
  const pct   = Math.min(kp / max, 1);
  const color = kp <= 2 ? COLORS.textMuted :
                kp <= 4 ? COLORS.cyan :
                kp <= 6 ? COLORS.green :
                kp <= 8 ? COLORS.yellow : COLORS.red;

  const angle  = -150 + pct * 300;
  const rad    = (angle * Math.PI) / 180;
  const cx     = 100, cy = 90, r = 70;
  const nx     = cx + r * Math.cos(rad);
  const ny     = cy + r * Math.sin(rad);

  return (
    <View style={sg.container}>
      <Svg width={200} height={130}>
        {/* Archi colorati */}
        {[
          { start: -150, end: -90,  color: COLORS.textMuted },
          { start: -90,  end: -30,  color: COLORS.cyan },
          { start: -30,  end: 30,   color: COLORS.green },
          { start: 30,   end: 90,   color: COLORS.yellow },
          { start: 90,   end: 150,  color: COLORS.red },
        ].map((arc, i) => {
          const r1  = (arc.start * Math.PI) / 180;
          const r2  = (arc.end   * Math.PI) / 180;
          const x1  = cx + r * Math.cos(r1);
          const y1  = cy + r * Math.sin(r1);
          const x2  = cx + r * Math.cos(r2);
          const y2  = cy + r * Math.sin(r2);
          const lg  = Math.abs(arc.end - arc.start) > 180 ? 1 : 0;
          return (
            <Path key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`}
              stroke={arc.color} strokeWidth={10} fill="none" opacity={0.4} strokeLinecap="round"
            />
          );
        })}
        {/* Ago */}
        <Line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={6} fill={color} />
        {/* KP value */}
        <SvgText x={cx} y={cy + 28} textAnchor="middle" fontSize={28} fontWeight="900" fill={color}>
          {kp.toFixed(1)}
        </SvgText>
        <SvgText x={cx} y={cy + 44} textAnchor="middle" fontSize={10} fill={COLORS.textMuted}>
          KP Index
        </SvgText>
      </Svg>
    </View>
  );
}

const sg = StyleSheet.create({
  container: { alignItems: "center" },
});

// ── Barre previsione ─────────────────────────────────────────
function ForecastBar({ label, kp }) {
  const max   = 9;
  const pct   = Math.min(kp / max, 1) * 100;
  const color = kp <= 2 ? COLORS.textMuted :
                kp <= 4 ? COLORS.cyan :
                kp <= 6 ? COLORS.green :
                kp <= 8 ? COLORS.yellow : COLORS.red;
  return (
    <View style={sf.row}>
      <Text style={sf.label}>{label}</Text>
      <View style={sf.barBg}>
        <LinearGradient colors={[color, color + "88"]} style={[sf.barFill, { width: pct + "%" }]} />
      </View>
      <Text style={[sf.val, { color }]}>{kp.toFixed(1)}</Text>
    </View>
  );
}

const sf = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  label:  { width: 50, fontSize: 12, color: COLORS.textMuted },
  barBg:  { flex: 1, height: 10, backgroundColor: COLORS.cardBorder, borderRadius: 5, overflow: "hidden" },
  barFill:{ height: 10, borderRadius: 5 },
  val:    { width: 30, fontSize: 12, fontWeight: "700", textAlign: "right" },
});

// ── Destinazioni monitorate ───────────────────────────────────
const DESTINAZIONI = [
  { nome: "Tromsø, Norvegia",   lat: 69.6, emoji: "🇳🇴" },
  { nome: "Reykjavík, Islanda", lat: 64.1, emoji: "🇮🇸" },
  { nome: "Rovaniemi, Finlandia",lat: 66.5, emoji: "🇫🇮" },
  { nome: "Kiruna, Svezia",     lat: 67.8, emoji: "🇸🇪" },
  { nome: "Svalbard, Norvegia", lat: 78.2, emoji: "🏔️" },
];

function probabilita_avvistamento(kp, lat) {
  // Formula semplificata basata su latitudine e KP
  const kp_min_lat = 90 - lat; // KP minimo per vedere aurora a questa latitudine
  if (kp < kp_min_lat - 2) return 5;
  if (kp < kp_min_lat) return 30;
  if (kp < kp_min_lat + 1) return 60;
  if (kp < kp_min_lat + 2) return 80;
  return 95;
}

export default function AuroraLiveScreen() {
  const { t, lang } = useLang();
  const [kpData,   setKpData]   = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // API NOAA per KP index in tempo reale
      const [kpRes, fcRes] = await Promise.all([
        axios.get("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json", { timeout: 10000 }),
        axios.get("https://services.swpc.noaa.gov/json/noaa-planetary-k-index-forecast.json", { timeout: 10000 }),
      ]);

      const kpLast   = kpRes.data?.slice(-1)[0];
      const kpVal    = parseFloat(kpLast?.kp_index || 0);
      setKpData({ kp: kpVal, time: kpLast?.time_tag });

      // Forecast prossime 24h
      const fcItems = fcRes.data?.slice(0, 8).map(item => ({
        time: new Date(item.time_tag).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        kp:   parseFloat(item.kp),
      })) || [];
      setForecast(fcItems);
    } catch {
      // Fallback con dati simulati
      setKpData({ kp: 3.3, time: new Date().toISOString() });
      setForecast([
        { time: "08:00", kp: 2.7 },
        { time: "11:00", kp: 3.3 },
        { time: "14:00", kp: 4.1 },
        { time: "17:00", kp: 5.0 },
        { time: "20:00", kp: 4.3 },
        { time: "23:00", kp: 3.7 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const kp = kpData?.kp || 0;
  const kpStatus = kp <= 2 ? t("kp_basso") :
                   kp <= 5 ? t("kp_medio") :
                   kp <= 7 ? t("kp_alto")  : t("kp_molto_alto");
  const kpStatusColor = kp <= 2 ? COLORS.textMuted :
                        kp <= 5 ? COLORS.cyan :
                        kp <= 7 ? COLORS.green : COLORS.red;

  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.header}>
        <Text style={s.title}>🌌 Aurora Live</Text>
        <Text style={s.sub}>
          {lang === "it" ? "Attività solare in tempo reale" : "Real-time solar activity"}
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator color={COLORS.green} size="large" />
            <Text style={[s.muted, { marginTop: 12 }]}>Connessione a NOAA...</Text>
          </View>
        ) : (
          <>
            {/* Gauge KP */}
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.kpCard}>
              <KPGauge kp={kp} />
              <Text style={[s.kpStatus, { color: kpStatusColor }]}>{kpStatus}</Text>
              <Text style={s.muted}>
                {lang === "it" ? "Aggiornato:" : "Updated:"} {kpData?.time ? new Date(kpData.time).toLocaleTimeString() : "—"}
              </Text>
              <TouchableOpacity onPress={loadData} style={s.refreshBtn}>
                <Text style={{ color: COLORS.green, fontSize: 13, fontWeight: "600" }}>🔄 Aggiorna</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Spiegazione KP */}
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={[s.kpCard, { marginTop: 14 }]}>
              <Text style={s.cardTitle}>📊 Scala KP Index</Text>
              {[
                { range: "0 – 2", label: lang === "it" ? "Nessuna aurora visibile" : "No visible aurora", color: COLORS.textMuted },
                { range: "3 – 4", label: lang === "it" ? "Aurora in prossimità del Polo" : "Aurora near the Pole", color: COLORS.cyan },
                { range: "5 – 6", label: lang === "it" ? "Aurora visibile in Scandinavia" : "Aurora visible in Scandinavia", color: COLORS.green },
                { range: "7 – 8", label: lang === "it" ? "Aurora intensa — Alta probabilità!" : "Strong aurora — High chance!", color: COLORS.yellow },
                { range: "9",     label: lang === "it" ? "Tempesta geomagnetica — Eccezionale!" : "Geomagnetic storm — Exceptional!", color: COLORS.red },
              ].map((row, i) => (
                <View key={i} style={s.kpScaleRow}>
                  <View style={[s.kpDot, { backgroundColor: row.color }]} />
                  <Text style={[s.kpRange, { color: row.color }]}>KP {row.range}</Text>
                  <Text style={s.kpRangeDesc}>{row.label}</Text>
                </View>
              ))}
            </LinearGradient>

            {/* Previsioni */}
            {forecast.length > 0 && (
              <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={[s.kpCard, { marginTop: 14 }]}>
                <Text style={s.cardTitle}>🔮 {lang === "it" ? "Previsioni prossime ore" : "Next hours forecast"}</Text>
                {forecast.map((f, i) => (
                  <ForecastBar key={i} label={f.time} kp={f.kp} />
                ))}
              </LinearGradient>
            )}

            {/* Probabilità per destinazione */}
            <View style={{ marginTop: 14 }}>
              <Text style={s.sectionTitle}>
                📍 {lang === "it" ? "Probabilità per destinazione" : "Probability by destination"}
              </Text>
              {DESTINAZIONI.map((dest, i) => {
                const prob  = probabilita_avvistamento(kp, dest.lat);
                const color = prob < 30 ? COLORS.red : prob < 60 ? COLORS.yellow : COLORS.green;
                return (
                  <LinearGradient key={i} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.destCard}>
                    <View style={s.destRow}>
                      <Text style={s.destEmoji}>{dest.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.destNome}>{dest.nome}</Text>
                        <Text style={s.muted}>Lat. {dest.lat}°N</Text>
                      </View>
                      <View style={[s.probBadge, { backgroundColor: color + "20" }]}>
                        <Text style={[s.probVal, { color }]}>{prob}%</Text>
                      </View>
                    </View>
                    <View style={s.probBar}>
                      <LinearGradient colors={[color, color + "66"]} style={[s.probFill, { width: prob + "%" }]} />
                    </View>
                  </LinearGradient>
                );
              })}
            </View>

            {/* Disclaimer */}
            <Text style={[s.muted, { textAlign: "center", marginTop: 16, fontSize: 11, lineHeight: 16 }]}>
              {lang === "it"
                ? "Dati forniti da NOAA Space Weather Prediction Center. Le previsioni aurora dipendono anche dalle condizioni meteo locali."
                : "Data provided by NOAA Space Weather Prediction Center. Aurora forecasts also depend on local weather conditions."}
            </Text>
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 },
  title:        { fontSize: 26, fontWeight: "900", color: COLORS.text },
  sub:          { fontSize: 13, color: COLORS.green, marginTop: 4 },
  muted:        { fontSize: 13, color: COLORS.textMuted },
  kpCard:       { borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1, borderColor: COLORS.cardBorder },
  kpStatus:     { fontSize: 18, fontWeight: "700", marginTop: 8 },
  refreshBtn:   { marginTop: 12, backgroundColor: COLORS.greenBg, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8 },
  cardTitle:    { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 14, alignSelf: "flex-start" },
  kpScaleRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8, alignSelf: "stretch" },
  kpDot:        { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  kpRange:      { width: 50, fontSize: 12, fontWeight: "700" },
  kpRangeDesc:  { flex: 1, fontSize: 12, color: COLORS.textMuted },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  destCard:     { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  destRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  destEmoji:    { fontSize: 28 },
  destNome:     { fontSize: 14, fontWeight: "600", color: COLORS.text },
  probBadge:    { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  probVal:      { fontSize: 16, fontWeight: "900" },
  probBar:      { height: 6, backgroundColor: COLORS.cardBorder, borderRadius: 3, overflow: "hidden" },
  probFill:     { height: 6, borderRadius: 3 },
});
