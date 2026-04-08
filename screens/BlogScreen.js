import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, WHATSAPP_NUMBER, EMAIL, INSTAGRAM, WEBSITE } from "../config";
import { useLang } from "../context/LangContext";

// ════════════════════════════════════════════════════════════
//  BLOG SCREEN
// ════════════════════════════════════════════════════════════
export function BlogScreen({ navigation }) {
  const { lang } = useLang();
  const [articoli, setArticoli] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, "blog"), orderBy("createdAt", "desc")));
      setArticoli(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setArticoli([
        { id: "1", titolo: "Come fotografare l'aurora boreale", titolo_en: "How to photograph the northern lights", contenuto: "La fotografia dell'aurora richiede pazienza e la giusta attrezzatura...", tag: ["Fotografia","Consigli"], copertina: null },
        { id: "2", titolo: "I 5 migliori posti per vedere l'aurora", titolo_en: "Top 5 places to see the aurora", contenuto: "Dall'Islanda alle Svalbard, ecco i luoghi più magici...", tag: ["Aurora","Norvegia"], copertina: null },
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>📖 {lang === "it" ? "Blog" : "Blog"}</Text>
        <Text style={{ fontSize: 14, color: COLORS.pink, marginTop: 4 }}>{lang === "it" ? "Storie, consigli e guide" : "Stories, tips and guides"}</Text>
      </LinearGradient>
      {loading ? <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {articoli.map(a => {
            const titolo = lang === "en" ? (a.titolo_en || a.titolo) : a.titolo;
            const testo  = lang === "en" ? (a.contenuto_en || a.contenuto) : a.contenuto;
            return (
              <TouchableOpacity key={a.id} onPress={() => navigation.navigate("BlogDetail", { articolo: a })} activeOpacity={0.85} style={{ marginBottom: 14 }}>
                <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: COLORS.cardBorder }}>
                  {a.copertina && <Image source={{ uri: a.copertina }} style={{ width: "100%", height: 160 }} resizeMode="cover" />}
                  <View style={{ padding: 16 }}>
                    {a.tag?.length > 0 && (
                      <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
                        {a.tag.slice(0, 2).map(t => (
                          <View key={t} style={{ backgroundColor: "rgba(244,114,182,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontSize: 10, color: COLORS.pink, fontWeight: "600" }}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Text style={{ fontSize: 17, fontWeight: "700", color: COLORS.text }}>{titolo}</Text>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 19 }} numberOfLines={3}>{testo}</Text>
                    <Text style={{ color: COLORS.pink, marginTop: 12, fontWeight: "600" }}>{lang === "it" ? "Leggi di più →" : "Read more →"}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  BLOG DETAIL SCREEN
// ════════════════════════════════════════════════════════════
export function BlogDetailScreen({ route, navigation }) {
  const { lang } = useLang();
  const { articolo } = route.params;
  const titolo  = lang === "en" ? (articolo.titolo_en  || articolo.titolo)   : articolo.titolo;
  const testo   = lang === "en" ? (articolo.contenuto_en || articolo.contenuto) : articolo.contenuto;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView>
        {articolo.copertina && <Image source={{ uri: articolo.copertina }} style={{ width: "100%", height: 260 }} resizeMode="cover" />}
        <LinearGradient colors={["transparent", COLORS.background]} style={{ position: "absolute", top: articolo.copertina ? 160 : 0, left: 0, right: 0, height: 100 }} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: "absolute", top: 55, left: 16, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: COLORS.green, fontSize: 16 }}>‹ Indietro</Text>
        </TouchableOpacity>
        <View style={{ padding: 20 }}>
          {articolo.tag?.length > 0 && (
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
              {articolo.tag.map(t => (
                <View key={t} style={{ backgroundColor: "rgba(244,114,182,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, color: COLORS.pink, fontWeight: "600" }}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={{ fontSize: 26, fontWeight: "900", color: COLORS.text, lineHeight: 34, marginBottom: 20 }}>{titolo}</Text>
          <Text style={{ fontSize: 16, color: COLORS.textSoft, lineHeight: 26 }}>{testo}</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  CONTATTI SCREEN
// ════════════════════════════════════════════════════════════
export function ContattiScreen({ navigation }) {
  const { lang } = useLang();
  const contatti = [
    { icon: "💬", label: "WhatsApp",  sub: "+39 329 715 9865", action: () => Linking.openURL("https://wa.me/" + WHATSAPP_NUMBER), color: COLORS.green },
    { icon: "📸", label: "Instagram", sub: "@cacciatoriauroraboreale", action: () => Linking.openURL(INSTAGRAM), color: COLORS.violet },
    { icon: "📧", label: "Email",     sub: EMAIL, action: () => Linking.openURL("mailto:" + EMAIL), color: COLORS.cyan },
    { icon: "🌐", label: "Website",   sub: "cacciatoriauroraboreale.it", action: () => Linking.openURL(WEBSITE), color: COLORS.pink },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 14 }}>
          <Text style={{ color: COLORS.green, fontSize: 17 }}>‹ Indietro</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>📬 {lang === "it" ? "Contatti" : "Contact"}</Text>
        <Text style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>
          {lang === "it" ? "Contatta Gianluca per info sui viaggi" : "Contact Gianluca for trip information"}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {contatti.map(({ icon, label, sub, action, color }) => (
          <TouchableOpacity key={label} onPress={action} activeOpacity={0.8} style={{ marginBottom: 12 }}>
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder, borderLeftColor: color, borderLeftWidth: 4 }}>
              <Text style={{ fontSize: 32 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>{label}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 3 }}>{sub}</Text>
              </View>
              <Text style={{ color, fontSize: 20 }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 20, padding: 20, marginTop: 8, borderWidth: 1, borderColor: COLORS.cardBorder }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>
            {lang === "it" ? "✍️ Scrivi un messaggio" : "✍️ Send a message"}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lang === "it" ? "Ciao Gianluca! Sono interessato a uno dei tuoi viaggi. Puoi darmi più informazioni?" : "Hi Gianluca! I'm interested in one of your trips. Can you give me more information?"))}>
            <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={{ borderRadius: 14, padding: 16, alignItems: "center" }}>
              <Text style={{ color: "#000", fontWeight: "800", fontSize: 16 }}>
                💬 {lang === "it" ? "Inizia conversazione su WhatsApp" : "Start WhatsApp conversation"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export default BlogScreen;
