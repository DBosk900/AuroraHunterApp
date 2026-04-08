import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { COLORS } from "../../config";

const VUOTO = {
  titolo: "", titolo_en: "",
  destinazione: "", destinazione_en: "",
  descrizione: "", descrizione_en: "",
  dataPartenza: "", dataRitorno: "",
  prezzo: "", postiTotali: "", postiDisponibili: "",
  incluso: "", incluso_en: "",
  foto: "",
};

function Field({ label, value, onChange, multiline, keyboard, placeholder }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, multiline && { height: 90, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboard || "default"}
        multiline={!!multiline}
      />
    </View>
  );
}

const f = StyleSheet.create({
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1, borderColor: COLORS.cardBorder },
});

export default function AdminViaggiScreen({ navigation }) {
  const [viaggi,  setViaggi]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null); // null = nuovo, id = modifica
  const [form,    setForm]    = useState(VUOTO);

  useEffect(() => { loadViaggi(); }, []);

  const loadViaggi = async () => {
    try {
      const q    = query(collection(db, "viaggi"), orderBy("dataPartenza", "asc"));
      const snap = await getDocs(q);
      setViaggi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const apriNuovo = () => {
    setForm(VUOTO); setEditing(null); setModal(true);
  };

  const apriModifica = (v) => {
    setForm({
      titolo:           v.titolo || "",
      titolo_en:        v.titolo_en || "",
      destinazione:     v.destinazione || "",
      destinazione_en:  v.destinazione_en || "",
      descrizione:      v.descrizione || "",
      descrizione_en:   v.descrizione_en || "",
      dataPartenza:     v.dataPartenza || "",
      dataRitorno:      v.dataRitorno || "",
      prezzo:           String(v.prezzo || ""),
      postiTotali:      String(v.postiTotali || ""),
      postiDisponibili: String(v.postiDisponibili || ""),
      incluso:          Array.isArray(v.incluso) ? v.incluso.join("\n") : (v.incluso || ""),
      incluso_en:       Array.isArray(v.incluso_en) ? v.incluso_en.join("\n") : (v.incluso_en || ""),
      foto:             v.foto || "",
    });
    setEditing(v.id);
    setModal(true);
  };

  const salva = async () => {
    if (!form.titolo || !form.dataPartenza || !form.prezzo) {
      Alert.alert("Errore", "Compila almeno Titolo, Data partenza e Prezzo.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titolo:           form.titolo,
        titolo_en:        form.titolo_en,
        destinazione:     form.destinazione,
        destinazione_en:  form.destinazione_en,
        descrizione:      form.descrizione,
        descrizione_en:   form.descrizione_en,
        dataPartenza:     form.dataPartenza,
        dataRitorno:      form.dataRitorno,
        prezzo:           parseFloat(form.prezzo) || 0,
        postiTotali:      parseInt(form.postiTotali) || 0,
        postiDisponibili: parseInt(form.postiDisponibili) || 0,
        incluso:          form.incluso.split("\n").filter(Boolean),
        incluso_en:       form.incluso_en.split("\n").filter(Boolean),
        foto:             form.foto,
        updatedAt:        serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, "viaggi", editing), payload);
      } else {
        await addDoc(collection(db, "viaggi"), { ...payload, createdAt: serverTimestamp() });
      }
      setModal(false);
      await loadViaggi();
      Alert.alert("✅", editing ? "Viaggio aggiornato!" : "Viaggio pubblicato!");
    } catch (e) {
      Alert.alert("Errore", e.message);
    } finally {
      setSaving(false);
    }
  };

  const elimina = (v) => {
    Alert.alert("Elimina", `Eliminare "${v.titolo}"?`, [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "viaggi", v.id));
        await loadViaggi();
      }},
    ]);
  };

  const upd = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.green, fontSize: 17, marginBottom: 14 }}>‹ Dashboard</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.title}>🗺️ Viaggi</Text>
          <TouchableOpacity onPress={apriNuovo}>
            <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={s.addBtn}>
              <Text style={s.addTxt}>+ Nuovo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {viaggi.length === 0 && (
            <Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 40 }}>
              Nessun viaggio. Creane uno!
            </Text>
          )}
          {viaggi.map(v => (
            <LinearGradient key={v.id} colors={[COLORS.card, COLORS.backgroundAlt]} style={s.card}>
              <Text style={s.cardTitolo}>{v.titolo}</Text>
              <Text style={s.cardMeta}>
                📍 {v.destinazione} • 📅 {v.dataPartenza} • 💶 €{v.prezzo}
              </Text>
              <Text style={s.cardMeta}>
                👥 {v.postiDisponibili}/{v.postiTotali} posti disponibili
              </Text>
              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => apriModifica(v)} style={[s.cardBtn, { borderColor: COLORS.cyan }]}>
                  <Text style={{ color: COLORS.cyan, fontWeight: "600", fontSize: 13 }}>✏️ Modifica</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => elimina(v)} style={[s.cardBtn, { borderColor: COLORS.red }]}>
                  <Text style={{ color: COLORS.red, fontWeight: "600", fontSize: 13 }}>🗑️ Elimina</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>
      )}

      {/* Modal form */}
      <Modal visible={modal} animationType="slide">
        <View style={s.modalContainer}>
          <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.modalHeader}>
            <Text style={s.modalTitle}>{editing ? "Modifica Viaggio" : "Nuovo Viaggio"}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ color: COLORS.red, fontSize: 16 }}>✕ Chiudi</Text>
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={s.groupLabel}>🇮🇹 ITALIANO</Text>
            <Field label="Titolo *"      value={form.titolo}       onChange={upd("titolo")} />
            <Field label="Destinazione"  value={form.destinazione} onChange={upd("destinazione")} />
            <Field label="Descrizione"   value={form.descrizione}  onChange={upd("descrizione")} multiline />
            <Field label="Incluso (una per riga)" value={form.incluso} onChange={upd("incluso")} multiline />

            <Text style={[s.groupLabel, { marginTop: 8 }]}>🇬🇧 ENGLISH</Text>
            <Field label="Title"         value={form.titolo_en}      onChange={upd("titolo_en")} />
            <Field label="Destination"   value={form.destinazione_en} onChange={upd("destinazione_en")} />
            <Field label="Description"   value={form.descrizione_en}  onChange={upd("descrizione_en")} multiline />
            <Field label="Included (one per line)" value={form.incluso_en} onChange={upd("incluso_en")} multiline />

            <Text style={[s.groupLabel, { marginTop: 8 }]}>📅 DATE & PREZZI</Text>
            <Field label="Data Partenza (YYYY-MM-DD) *" value={form.dataPartenza} onChange={upd("dataPartenza")} placeholder="2026-01-15" />
            <Field label="Data Ritorno (YYYY-MM-DD)"    value={form.dataRitorno}  onChange={upd("dataRitorno")}  placeholder="2026-01-22" />
            <Field label="Prezzo € *"          value={form.prezzo}           onChange={upd("prezzo")}           keyboard="numeric" />
            <Field label="Posti Totali"        value={form.postiTotali}      onChange={upd("postiTotali")}      keyboard="numeric" />
            <Field label="Posti Disponibili"   value={form.postiDisponibili} onChange={upd("postiDisponibili")} keyboard="numeric" />

            <Text style={[s.groupLabel, { marginTop: 8 }]}>📸 FOTO</Text>
            <Field label="URL Foto copertina" value={form.foto} onChange={upd("foto")} placeholder="https://..." />

            <TouchableOpacity onPress={salva} disabled={saving} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={saving ? [COLORS.cardBorder, COLORS.cardBorder] : [COLORS.green, COLORS.greenDark]}
                style={s.saveBtn}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveTxt}>💾 Salva Viaggio</Text>}
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
  addBtn:        { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  addTxt:        { color: "#000", fontWeight: "700" },
  card:          { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardTitolo:    { fontSize: 16, fontWeight: "700", color: COLORS.text },
  cardMeta:      { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  cardActions:   { flexDirection: "row", gap: 10, marginTop: 12 },
  cardBtn:       { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center", borderWidth: 1 },
  modalContainer:{ flex: 1, backgroundColor: COLORS.background },
  modalHeader:   { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle:    { fontSize: 20, fontWeight: "700", color: COLORS.text },
  groupLabel:    { fontSize: 12, color: COLORS.green, fontWeight: "700", marginBottom: 12, letterSpacing: 1 },
  saveBtn:       { borderRadius: 14, padding: 17, alignItems: "center" },
  saveTxt:       { color: "#000", fontWeight: "800", fontSize: 16 },
});
