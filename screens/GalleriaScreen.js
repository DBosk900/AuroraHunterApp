import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS } from "../config";
import { useLang } from "../context/LangContext";

const { width: W } = Dimensions.get("window");
const COL = 3;
const THUMB = (W - 32 - 8) / COL;

const CATEGORIE_FILTER = ["Tutte", "Norvegia", "Islanda", "Finlandia", "Svezia", "Svalbard"];

export default function GalleriaScreen() {
  const { lang } = useLang();
  const [foto,      setFoto]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState("Tutte");
  const [selected,  setSelected]  = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, "galleria"), orderBy("createdAt", "desc")));
      setFoto(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      // Demo
      setFoto([
        { id: "1", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", categoria: "Norvegia", caption: "Aurora a Tromsø", caption_en: "Aurora in Tromsø" },
        { id: "2", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", categoria: "Islanda", caption: "Notte in Islanda", caption_en: "Night in Iceland" },
        { id: "3", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", categoria: "Finlandia", caption: "Lapponia", caption_en: "Lapland" },
      ]);
    }
    setLoading(false);
  };

  const filtered = filtro === "Tutte" ? foto : foto.filter(f => f.categoria === filtro);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>📸 {lang === "it" ? "Galleria" : "Gallery"}</Text>
        <Text style={{ fontSize: 13, color: COLORS.cyan, marginTop: 4 }}>{foto.length} {lang === "it" ? "foto in alta definizione" : "high definition photos"}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          {CATEGORIE_FILTER.map(c => (
            <TouchableOpacity key={c} onPress={() => setFiltro(c)} style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder }, filtro === c && { borderColor: COLORS.cyan, backgroundColor: COLORS.cyanBg }]}>
              <Text style={[{ fontSize: 13, color: COLORS.textMuted }, filtro === c && { color: COLORS.cyan, fontWeight: "700" }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {loading
        ? <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
        : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {filtered.map(f => (
                <TouchableOpacity key={f.id} onPress={() => setSelected(f)}>
                  <Image source={{ uri: f.url }} style={{ width: THUMB, height: THUMB, borderRadius: 8 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        )
      }

      {/* Foto fullscreen */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" }} onPress={() => setSelected(null)}>
          {selected && (
            <>
              <Image source={{ uri: selected.url }} style={{ width: W, height: W * 1.2 }} resizeMode="contain" />
              {selected.caption && (
                <View style={{ position: "absolute", bottom: 60, left: 16, right: 16 }}>
                  <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "600" }}>
                    {lang === "en" ? (selected.caption_en || selected.caption) : selected.caption}
                  </Text>
                  <Text style={{ color: COLORS.cyan, fontSize: 13, textAlign: "center", marginTop: 4 }}>{selected.categoria}</Text>
                </View>
              )}
              <Text style={{ position: "absolute", top: 60, right: 20, color: "#fff", fontSize: 28 }}>✕</Text>
            </>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
