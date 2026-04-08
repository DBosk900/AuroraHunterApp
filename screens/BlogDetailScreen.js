import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../config";
import { useLang } from "../context/LangContext";

export default function BlogDetailScreen({ route, navigation }) {
  const { lang } = useLang();
  const { articolo } = route.params;

  const titolo = lang === "en" ? (articolo.titolo_en || articolo.titolo) : articolo.titolo;
  const testo  = lang === "en" ? (articolo.contenuto_en || articolo.contenuto) : articolo.contenuto;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Copertina */}
        {articolo.copertina
          ? <Image source={{ uri: articolo.copertina }} style={{ width: "100%", height: 280 }} resizeMode="cover" />
          : <LinearGradient colors={[COLORS.violet + "40", COLORS.background]} style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 80 }}>🌌</Text>
            </LinearGradient>
        }

        {/* Overlay sfumatura */}
        <LinearGradient
          colors={["transparent", COLORS.background]}
          style={{ position: "absolute", top: articolo.copertina ? 160 : 100, left: 0, right: 0, height: 120 }}
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", top: 55, left: 16, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <Text style={{ color: COLORS.green, fontSize: 16 }}>‹ Indietro</Text>
        </TouchableOpacity>

        <View style={{ padding: 20, paddingTop: 16 }}>
          {/* Tags */}
          {articolo.tag?.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {articolo.tag.map(t => (
                <View key={t} style={{ backgroundColor: "rgba(244,114,182,0.12)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.pink + "40" }}>
                  <Text style={{ fontSize: 11, color: COLORS.pink, fontWeight: "600" }}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Titolo */}
          <Text style={{ fontSize: 26, fontWeight: "900", color: COLORS.text, lineHeight: 34, marginBottom: 20 }}>
            {titolo}
          </Text>

          {/* Divisore aurora */}
          <LinearGradient colors={[COLORS.green, COLORS.violet, COLORS.cyan]} style={{ height: 3, borderRadius: 2, marginBottom: 24 }} />

          {/* Contenuto */}
          <Text style={{ fontSize: 16, color: COLORS.textSoft, lineHeight: 28 }}>
            {testo}
          </Text>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}
