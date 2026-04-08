import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { COLORS } from "../../config";

const TAGS = ["Aurora","Fotografia","Consigli","Islanda","Norvegia","Finlandia","Svezia","Attrezzatura","Storie"];

const VUOTO = { titolo: "", titolo_en: "", contenuto: "", contenuto_en: "", tag: [], copertina: "" };

export default function AdminBlogScreen({ navigation }) {
  const [articoli, setArticoli] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(VUOTO);

  useEffect(() => { loadArticoli(); }, []);

  const loadArticoli = async () => {
    try {
      const q    = query(collection(db, "blog"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setArticoli(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
    setLoading(false);
  };

  const apriNuovo = () => { setForm(VUOTO); setEditing(null); setModal(true); };

  const apriModifica = (a) => {
    setForm({
      titolo:     a.titolo || "",
      titolo_en:  a.titolo_en || "",
      contenuto:  a.contenuto || "",
      contenuto_en: a.contenuto_en || "",
      tag:        a.tag || [],
      copertina:  a.copertina || "",
    });
    setEditing(a.id); setModal(true);
  };

  const toggleTag = (t) => {
    setForm(f => ({
      ...f,
      tag: f.tag.includes(t) ? f.tag.filter(x => x !== t) : [...f.tag, t],
    }));
  };

  const salva = async () => {
    if (!form.titolo || !form.contenuto) {
      Alert.alert("Errore", "Titolo e contenuto sono obbligatori.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titolo:       form.titolo,
        titolo_en:    form.titolo_en,
        contenuto:    form.contenuto,
        contenuto_en: form.contenuto_en,
        tag:          form.tag,
        copertina:    form.copertina,
        updatedAt:    serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, "blog", editing), payload);
      } else {
        await addDoc(collection(db, "blog"), { ...payload, createdAt: serverTimestamp() });
      }
      setModal(false);
      await loadArticoli();
      Alert.alert("✅", editing ? "Articolo aggiornato!" : "Articolo pubblicato!");
    } catch (e) {
      Alert.alert("Errore", e.message);
    } finally {
      setSaving(false);
    }
  };

  const elimina = (a) => {
    Alert.alert("Elimina", `Eliminare "${a.titolo}"?`, [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "blog", a.id));
        await loadArticoli();
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
          <Text style={s.title}>📝 Blog</Text>
          <TouchableOpacity onPress={apriNuovo}>
            <LinearGradient colors={[COLORS.pink, "#db2777"]} style={s.addBtn}>
              <Text style={s.addTxt}>+ Articolo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={s.sub}>{articoli.length} articoli pubblicati</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {articoli.length === 0 && (
            <TouchableOpacity onPress={apriNuovo} style={s.emptyBox}>
              <Text style={{ fontSize: 48 }}>✍️</Text>
              <Text style={s.emptyTxt}>Scrivi il primo articolo!</Text>
            </TouchableOpacity>
          )}
          {articoli.map(a => (
            <LinearGradient key={a.id} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.card}>
              <Text style={s.cardTitolo}>{a.titolo}</Text>
              <Text style={s.cardPreview} numberOfLines={2}>{a.contenuto}</Text>
              {a.tag?.length > 0 && (
                <View style={s.tagRow}>
                  {a.tag.map(t => (
                    <View key={t} style={s.tagChip}>
                      <Text style={s.tagTxt}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => apriModifica(a)} style={[s.cardBtn, { borderColor: COLORS.cyan }]}>
                  <Text style={{ color: COLORS.cyan, fontWeight: "600", fontSize: 13 }}>✏️ Modifica</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => elimina(a)} style={[s.cardBtn, { borderColor: COLORS.red }]}>
                  <Text style={{ color: COLORS.red, fontWeight: "600", fontSize: 13 }}>🗑️ Elimina</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>
      )}

      <Modal visible={modal} animationType="slide">
        <View style={s.modalContainer}>
          <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.modalHeader}>
            <Text style={s.modalTitle}>{editing ? "Modifica Articolo" : "Nuovo Articolo"}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ color: COLORS.red, fontSize: 16 }}>✕ Chiudi</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={s.groupLabel}>🇮🇹 ITALIANO</Text>
            <Text style={s.label}>Titolo *</Text>
            <TextInput style={s.input} value={form.titolo} onChangeText={upd("titolo")} placeholder="Aurora boreale in Islanda..." placeholderTextColor={COLORS.textMuted} />
            <Text style={s.label}>Contenuto *</Text>
            <TextInput style={[s.input, { height: 200, textAlignVertical: "top" }]} value={form.contenuto} onChangeText={upd("contenuto")} multiline placeholder="Racconta la tua storia..." placeholderTextColor={COLORS.textMuted} />

            <Text style={[s.groupLabel, { marginTop: 8 }]}>🇬🇧 ENGLISH</Text>
            <Text style={s.label}>Title</Text>
            <TextInput style={s.input} value={form.titolo_en} onChangeText={upd("titolo_en")} placeholderTextColor={COLORS.textMuted} />
            <Text style={s.label}>Content</Text>
            <TextInput style={[s.input, { height: 200, textAlignVertical: "top" }]} value={form.contenuto_en} onChangeText={upd("contenuto_en")} multiline placeholderTextColor={COLORS.textMuted} />

            <Text style={[s.groupLabel, { marginTop: 8 }]}>🏷️ TAG</Text>
            <View style={s.tagGrid}>
              {TAGS.map(t => (
                <TouchableOpacity key={t} onPress={() => toggleTag(t)} style={[s.tagChipSel, form.tag.includes(t) && s.tagChipSelActive]}>
                  <Text style={[{ fontSize: 13, color: COLORS.textMuted }, form.tag.includes(t) && { color: COLORS.pink, fontWeight: "700" }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.groupLabel, { marginTop: 8 }]}>📸 COPERTINA</Text>
            <TextInput style={s.input} value={form.copertina} onChangeText={upd("copertina")} placeholder="https://..." placeholderTextColor={COLORS.textMuted} />

            <TouchableOpacity onPress={salva} disabled={saving} style={{ marginTop: 16 }}>
              <LinearGradient colors={saving ? [COLORS.cardBorder,COLORS.cardBorder] : [COLORS.pink,"#db2777"]} style={s.saveBtn}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveTxt}>💾 Pubblica Articolo</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title:         { fontSize: 24, fontWeight: "900", color: COLORS.text },
  sub:           { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  addBtn:        { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  addTxt:        { color: "#fff", fontWeight: "700" },
  emptyBox:      { alignItems: "center", marginTop: 60, gap: 16 },
  emptyTxt:      { fontSize: 16, color: COLORS.textMuted },
  card:          { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardTitolo:    { fontSize: 16, fontWeight: "700", color: COLORS.text },
  cardPreview:   { fontSize: 13, color: COLORS.textMuted, marginTop: 6, lineHeight: 18 },
  tagRow:        { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tagChip:       { backgroundColor: COLORS.violetBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagTxt:        { fontSize: 11, color: COLORS.violetLight },
  cardActions:   { flexDirection: "row", gap: 10, marginTop: 12 },
  cardBtn:       { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center", borderWidth: 1 },
  modalContainer:{ flex: 1, backgroundColor: COLORS.background },
  modalHeader:   { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle:    { fontSize: 20, fontWeight: "700", color: COLORS.text },
  groupLabel:    { fontSize: 12, color: COLORS.pink, fontWeight: "700", marginBottom: 12, letterSpacing: 1 },
  label:         { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, marginTop: 8, fontWeight: "600" },
  input:         { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1, borderColor: COLORS.cardBorder },
  tagGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChipSel:    { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: COLORS.background },
  tagChipSelActive: { borderColor: COLORS.pink, backgroundColor: "rgba(244,114,182,0.1)" },
  saveBtn:       { borderRadius: 14, padding: 17, alignItems: "center" },
  saveTxt:       { color: "#fff", fontWeight: "800", fontSize: 16 },
});
