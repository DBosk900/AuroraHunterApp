import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../config";

export default function AdminDashboard({ navigation }) {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState({ viaggi: 0, foto: 0, podcast: 0, blog: 0 });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [v, f, p, b] = await Promise.all([
        getDocs(collection(db, "viaggi")),
        getDocs(collection(db, "galleria")),
        getDocs(collection(db, "podcast")),
        getDocs(collection(db, "blog")),
      ]);
      setStats({ viaggi: v.size, foto: f.size, podcast: p.size, blog: b.size });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Vuoi uscire dall'area admin?", [
      { text: "Annulla", style: "cancel" },
      { text: "Esci", style: "destructive", onPress: async () => {
        await logout();
        navigation.replace("Main");
      }},
    ]);
  };

  const moduli = [
    { icon: "🗺️", titolo: "Viaggi",          desc: `${stats.viaggi} viaggi pubblicati`,   screen: "AdminViaggi",  color: COLORS.green },
    { icon: "📸", titolo: "Galleria Foto",    desc: `${stats.foto} foto caricate`,          screen: "AdminFoto",    color: COLORS.cyan },
    { icon: "🎙️", titolo: "Podcast",          desc: `${stats.podcast} episodi pubblicati`,  screen: "AdminPodcast", color: COLORS.violet },
    { icon: "📝", titolo: "Blog & Storie",    desc: `${stats.blog} articoli pubblicati`,    screen: "AdminBlog",    color: COLORS.pink },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>⚙️ Admin Panel</Text>
            <Text style={s.sub}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
            <Text style={s.logoutTxt}>Esci</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Viaggi",  val: stats.viaggi,  color: COLORS.green },
            { label: "Foto",    val: stats.foto,    color: COLORS.cyan },
            { label: "Podcast", val: stats.podcast, color: COLORS.violet },
            { label: "Blog",    val: stats.blog,    color: COLORS.pink },
          ].map(({ label, val, color }) => (
            <LinearGradient key={label} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.statBox}>
              <Text style={[s.statVal, { color }]}>{val}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Moduli */}
        <Text style={s.sectionTitle}>Gestisci contenuti</Text>
        {moduli.map(({ icon, titolo, desc, screen, color }) => (
          <TouchableOpacity key={screen} onPress={() => navigation.navigate(screen)} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={[s.moduloCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
              <Text style={s.moduloIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.moduloTitolo}>{titolo}</Text>
                <Text style={s.moduloDesc}>{desc}</Text>
              </View>
              <Text style={[s.moduloArrow, { color }]}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Torna all'app */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Main")}
          style={s.backBtn}
        >
          <Text style={s.backTxt}>← Torna all'app</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title:        { fontSize: 24, fontWeight: "900", color: COLORS.text },
  sub:          { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  logoutBtn:    { backgroundColor: COLORS.redBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.red + "40" },
  logoutTxt:    { color: COLORS.red, fontWeight: "600" },
  statsRow:     { flexDirection: "row", gap: 8, marginBottom: 24 },
  statBox:      { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.cardBorder },
  statVal:      { fontSize: 22, fontWeight: "900" },
  statLabel:    { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  moduloCard:   { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  moduloIcon:   { fontSize: 32 },
  moduloTitolo: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  moduloDesc:   { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  moduloArrow:  { fontSize: 24 },
  backBtn:      { alignItems: "center", marginTop: 24 },
  backTxt:      { color: COLORS.textMuted, fontSize: 14 },
});
