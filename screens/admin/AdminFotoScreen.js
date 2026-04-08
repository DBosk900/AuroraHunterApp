import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, Image, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { COLORS } from "../../config";

const CATEGORIE = ["Norvegia","Islanda","Finlandia","Svezia","Svalbard","Altra destinazione"];

export default function AdminFotoScreen({ navigation }) {
  const [foto,    setFoto]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [caption,  setCaption]  = useState("");
  const [captionEn,setCaptionEn]= useState("");
  const [categoria,setCategoria]= useState("Norvegia");

  useEffect(() => { loadFoto(); }, []);

  const loadFoto = async () => {
    try {
      const snap = await getDocs(collection(db, "galleria"));
      setFoto(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
    setLoading(false);
  };

  const scegliFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permesso negato", "Abilita l'accesso alla galleria nelle impostazioni.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,   // qualità massima (HD)
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImg(result.assets[0]);
      setModal(true);
    }
  };

  const carica = async () => {
    if (!selectedImg) return;
    setUploading(true);
    try {
      // Upload su Firebase Storage
      const resp     = await fetch(selectedImg.uri);
      const blob     = await resp.blob();
      const fileName = `galleria/${Date.now()}.jpg`;
      const storRef  = ref(storage, fileName);

      await uploadBytes(storRef, blob);
      const url = await getDownloadURL(storRef);

      // Salva su Firestore
      await addDoc(collection(db, "galleria"), {
        url,
        caption,
        caption_en:  captionEn,
        categoria,
        width:       selectedImg.width,
        height:      selectedImg.height,
        createdAt:   serverTimestamp(),
      });

      setModal(false);
      setCaption(""); setCaptionEn(""); setSelectedImg(null);
      await loadFoto();
      Alert.alert("✅", "Foto caricata con successo!");
    } catch (e) {
      Alert.alert("Errore upload", e.message);
    } finally {
      setUploading(false);
    }
  };

  const eliminaFoto = (foto) => {
    Alert.alert("Elimina", "Eliminare questa foto?", [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "galleria", foto.id));
        await loadFoto();
      }},
    ]);
  };

  const COLS = 3;
  const fotoWidth = (350 - 32 - 8) / COLS;

  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.green, fontSize: 17, marginBottom: 14 }}>‹ Dashboard</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.title}>📸 Galleria</Text>
          <TouchableOpacity onPress={scegliFoto}>
            <LinearGradient colors={[COLORS.cyan, "#0891b2"]} style={s.addBtn}>
              <Text style={s.addTxt}>+ Carica HD</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={s.sub}>{foto.length} foto caricate • Qualità originale (HD)</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {foto.length === 0 && (
            <TouchableOpacity onPress={scegliFoto} style={s.emptyBox}>
              <Text style={{ fontSize: 48 }}>📷</Text>
              <Text style={s.emptyTxt}>Carica la prima foto!</Text>
            </TouchableOpacity>
          )}
          <View style={s.grid}>
            {foto.map(f => (
              <TouchableOpacity
                key={f.id}
                onLongPress={() => eliminaFoto(f)}
                style={[s.gridItem, { width: fotoWidth }]}
              >
                <Image source={{ uri: f.url }} style={[s.thumb, { width: fotoWidth, height: fotoWidth }]} resizeMode="cover" />
                {f.caption ? (
                  <Text style={s.thumbCaption} numberOfLines={1}>{f.caption}</Text>
                ) : null}
                <Text style={s.thumbCat}>{f.categoria}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.hint}>Tieni premuta una foto per eliminarla</Text>
        </ScrollView>
      )}

      {/* Modal upload */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={s.overlay}>
          <LinearGradient colors={[COLORS.card, COLORS.background]} style={s.sheet}>
            <Text style={s.sheetTitle}>📸 Pubblica nella Galleria</Text>

            {selectedImg && (
              <Image
                source={{ uri: selectedImg.uri }}
                style={s.preview}
                resizeMode="cover"
              />
            )}

            <Text style={s.label}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {CATEGORIE.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategoria(c)}
                  style={[s.catChip, categoria === c && s.catChipActive]}
                >
                  <Text style={[s.catTxt, categoria === c && { color: COLORS.cyan, fontWeight: "700" }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>Didascalia 🇮🇹</Text>
            <TextInput style={s.input} value={caption} onChangeText={setCaption} placeholder="Aurora meravigliosa..." placeholderTextColor={COLORS.textMuted} />

            <Text style={s.label}>Caption 🇬🇧</Text>
            <TextInput style={s.input} value={captionEn} onChangeText={setCaptionEn} placeholder="Amazing aurora..." placeholderTextColor={COLORS.textMuted} />

            <TouchableOpacity onPress={carica} disabled={uploading}>
              <LinearGradient colors={uploading ? [COLORS.cardBorder, COLORS.cardBorder] : [COLORS.cyan, "#0891b2"]} style={s.uploadBtn}>
                {uploading
                  ? <><ActivityIndicator color="#fff" /><Text style={s.uploadTxt}> Caricamento...</Text></>
                  : <Text style={s.uploadTxt}>☁️ Carica in HD</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModal(false); setSelectedImg(null); }} style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={{ color: COLORS.textMuted }}>Annulla</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title:        { fontSize: 24, fontWeight: "900", color: COLORS.text },
  sub:          { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  addBtn:       { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  addTxt:       { color: "#fff", fontWeight: "700" },
  emptyBox:     { alignItems: "center", marginTop: 60, gap: 16 },
  emptyTxt:     { fontSize: 16, color: COLORS.textMuted },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  gridItem:     { borderRadius: 8, overflow: "hidden", marginBottom: 4 },
  thumb:        { borderRadius: 8 },
  thumbCaption: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, paddingHorizontal: 2 },
  thumbCat:     { fontSize: 9, color: COLORS.cyan, paddingHorizontal: 2 },
  hint:         { textAlign: "center", color: COLORS.textMuted, fontSize: 11, marginTop: 16 },
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetTitle:   { fontSize: 19, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  preview:      { width: "100%", height: 200, borderRadius: 14, marginBottom: 16 },
  label:        { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, fontWeight: "600" },
  input:        { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 14 },
  catChip:      { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.background, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
  catChipActive:{ borderColor: COLORS.cyan, backgroundColor: COLORS.cyanBg },
  catTxt:       { fontSize: 13, color: COLORS.textMuted },
  uploadBtn:    { borderRadius: 14, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  uploadTxt:    { color: "#fff", fontWeight: "700", fontSize: 16 },
});
