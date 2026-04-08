import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../config";
import { useAuth } from "../../context/AuthContext";
import Svg, { Ellipse } from "react-native-svg";

export default function AdminLoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Errore", "Inserisci email e password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.replace("AdminDashboard");
    } catch {
      Alert.alert("Accesso negato", "Email o password errati.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Aurora di sfondo */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Ellipse cx="50%" cy="20%" rx="60%" ry="25%" fill="#00ff8815" />
          <Ellipse cx="30%" cy="40%" rx="50%" ry="20%" fill="#7c3aed12" />
        </Svg>
      </View>

      <View style={s.inner}>
        <Text style={s.logo}>🌌</Text>
        <Text style={s.title}>Area Admin</Text>
        <Text style={s.sub}>Cacciatori Aurora Boreale</Text>

        <LinearGradient colors={[COLORS.card, COLORS.backgroundAlt]} style={s.card}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="gianluca@example.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={loading ? [COLORS.cardBorder, COLORS.cardBorder] : [COLORS.green, COLORS.greenDark]}
              style={s.loginBtn}
            >
              <Text style={s.loginTxt}>{loading ? "Accesso..." : "🔐 Accedi"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={s.backTxt}>‹ Torna all'app</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: "center" },
  inner:     { padding: 24, alignItems: "center" },
  logo:      { fontSize: 60 },
  title:     { fontSize: 28, fontWeight: "900", color: COLORS.text, marginTop: 12 },
  sub:       { fontSize: 14, color: COLORS.green, marginTop: 4, marginBottom: 32 },
  card:      { width: "100%", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.cardBorder },
  label:     { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, marginTop: 12 },
  input:     { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 15, fontSize: 15, borderWidth: 1, borderColor: COLORS.cardBorder },
  loginBtn:  { borderRadius: 14, padding: 17, alignItems: "center", marginTop: 24 },
  loginTxt:  { color: "#000", fontWeight: "800", fontSize: 17 },
  backTxt:   { color: COLORS.textMuted, fontSize: 14 },
});
