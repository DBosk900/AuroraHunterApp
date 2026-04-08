// ════════════════════════════════════════════════════════════
//  VIAGGI SCREEN
// ════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS } from "../config";
import { useLang } from "../context/LangContext";

const { width: W } = Dimensions.get("window");

export default function ViaggiScreen({ navigation }) {
  const { t, lang } = useLang();
  const [viaggi,    setViaggi]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const q = query(collection(db, "viaggi"), orderBy("dataPartenza", "asc"));
      const snap = await getDocs(q);
      setViaggi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      // Demo data
      setViaggi([
        { id: "1", titolo: "Aurora in Norvegia — Tromsø", titolo_en: "Northern Lights in Norway", destinazione: "Tromsø", destinazione_en: "Tromsø, Norway", dataPartenza: "2026-01-15", dataRitorno: "2026-01-22", prezzo: 2490, postiDisponibili: 6, postiTotali: 12, foto: null },
        { id: "2", titolo: "Islanda Ring Road & Aurora", titolo_en: "Iceland Ring Road & Aurora", destinazione: "Islanda", destinazione_en: "Iceland", dataPartenza: "2026-02-08", dataRitorno: "2026-02-15", prezzo: 2890, postiDisponibili: 2, postiTotali: 10, foto: null },
        { id: "3", titolo: "Lapponia Finlandese", titolo_en: "Finnish Lapland", destinazione: "Rovaniemi, Finlandia", destinazione_en: "Rovaniemi, Finland", dataPartenza: "2026-03-01", dataRitorno: "2026-03-08", prezzo: 2190, postiDisponibili: 8, postiTotali: 12, foto: null },
      ]);
    } finally { setLoading(false); setRefreshing(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>🗺️ {t("prossimi")}</Text>
        <Text style={{ fontSize: 14, color: COLORS.green, marginTop: 4 }}>{viaggi.length} {lang === "it" ? "viaggi disponibili" : "trips available"}</Text>
      </LinearGradient>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />} contentContainerStyle={{ padding: 16 }}>
        {loading && <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />}
        {viaggi.map(v => {
          const titolo = lang === "en" ? (v.titolo_en || v.titolo) : v.titolo;
          const dest   = lang === "en" ? (v.destinazione_en || v.destinazione) : v.destinazione;
          const up     = v.postiDisponibili > 0;
          return (
            <TouchableOpacity key={v.id} onPress={() => navigation.navigate("ViaggioDetail", { viaggio: v })} activeOpacity={0.85} style={{ marginBottom: 16 }}>
              <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: COLORS.cardBorder }}>
                {v.foto
                  ? <Image source={{ uri: v.foto }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
                  : <LinearGradient colors={[COLORS.violet + "40", COLORS.background]} style={{ height: 140, justifyContent: "center", alignItems: "center" }}><Text style={{ fontSize: 60 }}>🌌</Text></LinearGradient>
                }
                <View style={{ padding: 16 }}>
                  <View style={{ backgroundColor: COLORS.violetBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, color: COLORS.violetLight, fontWeight: "600" }}>📍 {dest}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>{titolo}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
                      {new Date(v.dataPartenza).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} — {new Date(v.dataRitorno).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                    <Text style={{ fontSize: 22, fontWeight: "900", color: COLORS.green }}>€{v.prezzo}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <View style={{ backgroundColor: up ? COLORS.greenBg : COLORS.redBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: up ? COLORS.green : COLORS.red }}>
                        {up ? `${v.postiDisponibili} ${t("posto_disp")}` : (lang === "it" ? "Esaurito" : "Sold out")}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.greenBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                      <Text style={{ color: COLORS.green, fontWeight: "700" }}>{t("scopri")} →</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
