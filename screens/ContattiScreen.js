import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, WHATSAPP_NUMBER, EMAIL, INSTAGRAM, WEBSITE } from "../config";
import { useLang } from "../context/LangContext";

export default function ContattiScreen({ navigation }) {
  const { lang } = useLang();

  const contatti = [
    {
      icon: "💬", label: "WhatsApp",
      sub: "+39 329 715 9865",
      action: () => Linking.openURL("https://wa.me/" + WHATSAPP_NUMBER),
      color: COLORS.green,
    },
    {
      icon: "📸", label: "Instagram",
      sub: "@cacciatoriauroraboreale",
      action: () => Linking.openURL(INSTAGRAM),
      color: COLORS.violet,
    },
    {
      icon: "📧", label: "Email",
      sub: EMAIL,
      action: () => Linking.openURL("mailto:" + EMAIL),
      color: COLORS.cyan,
    },
    {
      icon: "🌐", label: "Website",
      sub: "cacciatoriauroraboreale.it",
      action: () => Linking.openURL(WEBSITE),
      color: COLORS.pink,
    },
  ];

  const msgWA = encodeURIComponent(
    lang === "it"
      ? "Ciao Gianluca! Sono interessato a uno dei tuoi viaggi. Puoi darmi più informazioni?"
      : "Hi Gianluca! I'm interested in one of your trips. Can you give me more information?"
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 14 }}>
          <Text style={{ color: COLORS.green, fontSize: 17 }}>‹ Indietro</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>
          📬 {lang === "it" ? "Contatti" : "Contact"}
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>
          {lang === "it"
            ? "Contatta Gianluca per info sui viaggi"
            : "Contact Gianluca for trip information"}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Profilo */}
        <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 20, padding: 20, marginBottom: 20, alignItems: "center", borderWidth: 1, borderColor: COLORS.cardBorder }}>
          <Text style={{ fontSize: 60 }}>🌌</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text, marginTop: 12 }}>Gianluca Vitiello</Text>
          <Text style={{ fontSize: 14, color: COLORS.green, marginTop: 4 }}>
            {lang === "it" ? "Travel Designer | Cacciatore di Aurora" : "Travel Designer | Aurora Hunter"}
          </Text>
        </LinearGradient>

        {/* Bottoni contatto */}
        {contatti.map(({ icon, label, sub, action, color }) => (
          <TouchableOpacity key={label} onPress={action} activeOpacity={0.8} style={{ marginBottom: 10 }}>
            <LinearGradient
              colors={[COLORS.card, COLORS.backgroundAlt]}
              style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder, borderLeftColor: color, borderLeftWidth: 4 }}
            >
              <Text style={{ fontSize: 32 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>{label}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 3 }}>{sub}</Text>
              </View>
              <Text style={{ color, fontSize: 20 }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* CTA WhatsApp */}
        <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 20, padding: 20, marginTop: 10, borderWidth: 1, borderColor: COLORS.cardBorder }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 14 }}>
            {lang === "it" ? "✍️ Scrivi un messaggio" : "✍️ Send a message"}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + msgWA)}>
            <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={{ borderRadius: 14, padding: 16, alignItems: "center" }}>
              <Text style={{ color: "#000", fontWeight: "800", fontSize: 16 }}>
                💬 {lang === "it" ? "Inizia su WhatsApp" : "Start on WhatsApp"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
