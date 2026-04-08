import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Slider } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS } from "../config";
import { useLang } from "../context/LangContext";

export default function PodcastScreen() {
  const { lang } = useLang();
  const [episodi,  setEpisodi]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [current,  setCurrent]  = useState(null);
  const [playing,  setPlaying]  = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const soundRef = useRef(null);

  useEffect(() => {
    loadEpisodi();
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const loadEpisodi = async () => {
    try {
      const snap = await getDocs(query(collection(db, "podcast"), orderBy("createdAt", "desc")));
      setEpisodi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setEpisodi([
        { id: "1", titolo: "Come fotografare l'aurora boreale", titolo_en: "How to photograph the aurora", stagione: 1, numero: 3, durata: 45, descrizione: "Tutti i segreti per scattare foto mozzafiato all'aurora.", descrizione_en: "All the secrets to capture stunning aurora photos." },
        { id: "2", titolo: "Il mio primo avvistamento in Norvegia", titolo_en: "My first aurora sighting in Norway", stagione: 1, numero: 2, durata: 38, descrizione: "Racconto della mia prima notte a caccia di aurora.", descrizione_en: "The story of my first night aurora hunting." },
        { id: "3", titolo: "Come scegliere il viaggio giusto", titolo_en: "How to choose the right trip", stagione: 1, numero: 1, durata: 32, descrizione: "Guida per pianificare il viaggio perfetto.", descrizione_en: "Guide to planning the perfect aurora trip." },
      ]);
    }
    setLoading(false);
  };

  const play = async (ep) => {
    if (soundRef.current) { await soundRef.current.unloadAsync(); }
    if (!ep.audioUrl) {
      setCurrent(ep); setPlaying(false); return;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: ep.audioUrl },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 1);
          if (status.didJustFinish) { setPlaying(false); }
        }
      }
    );
    soundRef.current = sound;
    setCurrent(ep); setPlaying(true);
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;
    if (playing) { await soundRef.current.pauseAsync(); setPlaying(false); }
    else         { await soundRef.current.playAsync();  setPlaying(true); }
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.backgroundAlt, COLORS.background]} style={{ paddingTop: 55, paddingHorizontal: 16, paddingBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.text }}>🎙️ Podcast</Text>
        <Text style={{ fontSize: 14, color: COLORS.violet, marginTop: 4 }}>{lang === "it" ? "Storie e consigli dall'Artico" : "Stories and tips from the Arctic"}</Text>
      </LinearGradient>

      {/* Mini player se c'è un episodio selezionato */}
      {current && (
        <LinearGradient colors={[COLORS.violet + "30", COLORS.card]} style={{ margin: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.violet + "50" }}>
          <Text style={{ fontSize: 13, color: COLORS.violetLight, fontWeight: "600" }} numberOfLines={1}>
            S{current.stagione}E{current.numero} — {lang === "en" ? (current.titolo_en || current.titolo) : current.titolo}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 }}>
            <TouchableOpacity onPress={togglePlay} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.violet, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 20 }}>{playing ? "⏸" : "▶️"}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={{ height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, overflow: "hidden" }}>
                <View style={{ height: 4, backgroundColor: COLORS.violetLight, width: `${(position / duration) * 100}%`, borderRadius: 2 }} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{formatTime(position)}</Text>
                <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
          {!current.audioUrl && (
            <Text style={{ fontSize: 11, color: COLORS.yellow, marginTop: 8 }}>
              {lang === "it" ? "⚠️ Audio non ancora caricato (demo)" : "⚠️ Audio not yet uploaded (demo)"}
            </Text>
          )}
        </LinearGradient>
      )}

      {loading
        ? <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
        : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {episodi.map(ep => {
              const titolo = lang === "en" ? (ep.titolo_en || ep.titolo) : ep.titolo;
              const desc   = lang === "en" ? (ep.descrizione_en || ep.descrizione) : ep.descrizione;
              const isPlaying = current?.id === ep.id && playing;
              return (
                <TouchableOpacity key={ep.id} onPress={() => play(ep)} activeOpacity={0.85} style={{ marginBottom: 12 }}>
                  <LinearGradient colors={[current?.id === ep.id ? COLORS.violet + "25" : COLORS.card, COLORS.backgroundAlt]} style={{ borderRadius: 18, padding: 16, borderWidth: 1, borderColor: current?.id === ep.id ? COLORS.violet + "60" : COLORS.cardBorder }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <LinearGradient colors={[COLORS.violet, "#5b21b6"]} style={{ width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 22 }}>{isPlaying ? "⏸" : "▶️"}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <View style={{ backgroundColor: COLORS.violetBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, color: COLORS.violetLight, fontWeight: "700" }}>S{ep.stagione}E{ep.numero}</Text>
                          </View>
                          <Text style={{ fontSize: 11, color: COLORS.textMuted }}>⏱️ {ep.durata} {lang === "it" ? "min" : "min"}</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }} numberOfLines={2}>{titolo}</Text>
                        {desc && <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }} numberOfLines={2}>{desc}</Text>}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 24 }} />
          </ScrollView>
        )
      }
    </View>
  );
}
