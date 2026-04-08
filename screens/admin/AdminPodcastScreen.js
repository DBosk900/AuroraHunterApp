import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// expo-document-picker rimosso - usa URL audio diretti
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { COLORS } from "../../config";

export default function AdminPodcastScreen({ navigation }) {
  const [episodi,  setEpisodi]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [uploading,setUploading]= useState(false);
  const [audioFile,setAudioFile]= useState(null);
  const [form, setForm] = useState({
    titolo: "", titolo_en: "",
    descrizione: "", descrizione_en: "",
    durata: "", stagione: "1", numero: "",
    copertina: "", audioUrl: "",
  });

  useEffect(() => { loadEpisodi(); }, []);

  const loadEpisodi = async () => {
    try {
      const q = query(collection(db, "podcast"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setEpisodi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
    setLoading(false);
  };

  const scegli = () => {
    setAudioFile({ name: "Nuovo episodio", size: 0 });
    setModal(true);
  };

  const pubblica = async () => {
    if (!form.titolo || !audioFile) {
      Alert.alert("Errore", "Inserisci il titolo e scegli un file audio.");
      return;
    }
    setUploading(true);
    try {
      // Audio URL inserito manualmente nel campo apposito
      const audioUrl = form.audioUrl || "";

      await addDoc(collection(db, "podcast"), {
        titolo:      form.titolo,
        titolo_en:   form.titolo_en,
        descrizione: form.descrizione,
        descrizione_en: form.descrizione_en,
        durata:      form.durata,
        stagione:    parseInt(form.stagione) || 1,
        numero:      parseInt(form.numero) || episodi.length + 1,
        copertina:   form.copertina,
        audioUrl,
        fileSize:    audioFile.size,
        createdAt:   serverTimestamp(),
      });

      setModal(false);
      setAudioFile(null);
      setForm({ titolo: "", titolo_en: "", descrizione: "", descrizione_en: "", durata: "", stagione: "1", numero: "", copertina: "" });
      await loadEpisodi();
      Alert.alert("✅", "Episodio pubblicato!");
    } catch (e) {
      Alert.alert("Errore", e.message);
    } finally {
      setUploading(false);
    }
  };

  const elimina = (ep) => {
    Alert.alert("Elimina", `Eliminare "${ep.titolo}"?`, [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "podcast", ep.id));
        await loadEpisodi();
      }},
    ]);
  };

  const upd = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.green, fontSize: 17, marginBottom: 14 }}>‹ Dashboard</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.title}>🎙️ Podcast</Text>
          <TouchableOpacity onPress={scegli}>
            <LinearGradient colors={[COLORS.violet, "#5b21b6"]} style={s.addBtn}>
              <Text style={s.addTxt}>+ Episodio</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={s.sub}>{episodi.length} episodi pubblicati</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {episodi.length === 0 && (
            <TouchableOpacity onPress={scegli} style={s.emptyBox}>
              <Text style={{ fontSize: 48 }}>🎙️</Text>
              <Text style={s.emptyTxt}>Pubblica il primo episodio!</Text>
            </TouchableOpacity>
          )}
          {episodi.map(ep => (
            <LinearGradient key={ep.id} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.card}>
              <View style={s.epHeader}>
                <LinearGradient colors={[COLORS.violet, "#5b21b6"]} style={s.epBadge}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}>S{ep.stagione}E{ep.numero}</Text>
                </LinearGradient>
                <Text style={s.epTitolo} numberOfLines={2}>{ep.titolo}</Text>
              </View>
              {ep.descrizione && <Text style={s.epDesc} numberOfLines={2}>{ep.descrizione}</Text>}
              <View style={s.epMeta}>
                <Text style={s.muted}>⏱️ {ep.durata || "—"} min</Text>
                <Text style={s.muted}>📁 {ep.fileSize ? (ep.fileSize / 1024 / 1024).toFixed(1) + " MB" : "—"}</Text>
              </View>
              <TouchableOpacity onPress={() => elimina(ep)} style={s.elimBtn}>
                <Text style={{ color: COLORS.red, fontSize: 13, fontWeight: "600" }}>🗑️ Elimina episodio</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={s.overlay}>
          <LinearGradient colors={[COLORS.card, COLORS.background]} style={s.sheet}>
            <Text style={s.sheetTitle}>🎙️ Nuovo Episodio</Text>

            {audioFile && (
              <View style={s.audioInfo}>
                <Text style={{ fontSize: 32 }}>🎵</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.text, fontWeight: "600", fontSize: 13 }} numberOfLines={1}>{audioFile.name}</Text>
                  <Text style={s.muted}>{audioFile.size ? (audioFile.size / 1024 / 1024).toFixed(1) + " MB" : ""}</Text>
                </View>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Titolo 🇮🇹 *</Text>
              <TextInput style={s.input} value={form.titolo} onChangeText={upd("titolo")} placeholderTextColor={COLORS.textMuted} placeholder="Caccia all'aurora in Norvegia..." />

              <Text style={s.label}>Title 🇬🇧</Text>
              <TextInput style={s.input} value={form.titolo_en} onChangeText={upd("titolo_en")} placeholderTextColor={COLORS.textMuted} placeholder="Aurora hunting in Norway..." />

              <Text style={s.label}>Descrizione 🇮🇹</Text>
              <TextInput style={[s.input, { height: 80 }]} value={form.descrizione} onChangeText={upd("descrizione")} multiline placeholderTextColor={COLORS.textMuted} />

              <Text style={s.label}>Description 🇬🇧</Text>
              <TextInput style={[s.input, { height: 80 }]} value={form.descrizione_en} onChangeText={upd("descrizione_en")} multiline placeholderTextColor={COLORS.textMuted} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Stagione</Text>
                  <TextInput style={s.input} value={form.stagione} onChangeText={upd("stagione")} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>N° Episodio</Text>
                  <TextInput style={s.input} value={form.numero} onChangeText={upd("numero")} keyboardType="numeric" placeholder={String(episodi.length + 1)} placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Durata (min)</Text>
                  <TextInput style={s.input} value={form.durata} onChangeText={upd("durata")} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>

              <Text style={s.label}>URL Copertina</Text>
              <TextInput style={s.input} value={form.copertina} onChangeText={upd("copertina")} placeholder="https://..." placeholderTextColor={COLORS.textMuted} />

              <TouchableOpacity onPress={pubblica} disabled={uploading}>
                <LinearGradient colors={uploading ? [COLORS.cardBorder,COLORS.cardBorder] : [COLORS.violet,"#5b21b6"]} style={s.publishBtn}>
                  {uploading
                    ? <><ActivityIndicator color="#fff" /><Text style={s.publishTxt}> Caricamento audio...</Text></>
                    : <Text style={s.publishTxt}>🚀 Pubblica Episodio</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal(false)} style={{ alignItems: "center", marginTop: 14, marginBottom: 20 }}>
                <Text style={{ color: COLORS.textMuted }}>Annulla</Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  header:     { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title:      { fontSize: 24, fontWeight: "900", color: COLORS.text },
  sub:        { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  addBtn:     { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  addTxt:     { color: "#fff", fontWeight: "700" },
  emptyBox:   { alignItems: "center", marginTop: 60, gap: 16 },
  emptyTxt:   { fontSize: 16, color: COLORS.textMuted },
  card:       { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  epHeader:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  epBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  epTitolo:   { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.text },
  epDesc:     { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  epMeta:     { flexDirection: "row", gap: 16, marginTop: 10 },
  muted:      { fontSize: 12, color: COLORS.textMuted },
  elimBtn:    { marginTop: 12, alignItems: "center" },
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  sheetTitle: { fontSize: 19, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  audioInfo:  { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.violetBg, borderRadius: 12, padding: 12, marginBottom: 16 },
  label:      { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, marginTop: 12, fontWeight: "600" },
  input:      { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1, borderColor: COLORS.cardBorder },
  publishBtn: { borderRadius: 14, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 },
  publishTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
