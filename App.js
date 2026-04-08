import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "./config";
import { LangProvider, useLang } from "./context/LangContext";
import { AuthProvider } from "./context/AuthContext";

import HomeScreen          from "./screens/HomeScreen";
import ViaggiScreen        from "./screens/ViaggiScreen";
import ViaggioDetailScreen from "./screens/ViaggioDetailScreen";
import GalleriaScreen      from "./screens/GalleriaScreen";
import PodcastScreen       from "./screens/PodcastScreen";
import AuroraLiveScreen    from "./screens/AuroraLiveScreen";
import BlogScreen          from "./screens/BlogScreen";
import BlogDetailScreen    from "./screens/BlogDetailScreen";
import ContattiScreen      from "./screens/ContattiScreen";
import AdminLoginScreen    from "./screens/admin/AdminLoginScreen";
import AdminDashboard      from "./screens/admin/AdminDashboard";
import AdminViaggiScreen   from "./screens/admin/AdminViaggiScreen";
import AdminFotoScreen     from "./screens/admin/AdminFotoScreen";
import AdminPodcastScreen  from "./screens/admin/AdminPodcastScreen";
import AdminBlogScreen     from "./screens/admin/AdminBlogScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home:       "\uD83C\uDFE0",
  Viaggi:     "\uD83D\uDDFA\uFE0F",
  Galleria:   "\uD83D\uDCF8",
  Podcast:    "\uD83C\uDF99\uFE0F",
  AuroraLive: "\uD83C\uDF0C",
};

function AuroraTabBar({ state, navigation }) {
  const { t } = useLang();
  const icons = ["\uD83C\uDFE0","\uD83D\uDDFA\uFE0F","\uD83D\uDCF8","\uD83C\uDF99\uFE0F","\uD83C\uDF0C"];
  const labels = [t("home"), t("viaggi"), t("galleria"), t("podcast"), t("aurora_live")];

  return (
    <LinearGradient colors={["#070c1a", "#050914"]} style={s.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={s.tabItem}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isFocused && (
              <View style={s.tabGlow} />
            )}
            <Text style={[s.tabIcon, isFocused && s.tabIconActive]}>
              {icons[index]}
            </Text>
            <Text style={[s.tabLabel, isFocused && s.tabLabelActive]}>
              {labels[index]}
            </Text>
            {isFocused && <View style={s.tabDot} />}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AuroraTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Viaggi"     component={ViaggiScreen} />
      <Tab.Screen name="Galleria"   component={GalleriaScreen} />
      <Tab.Screen name="Podcast"    component={PodcastScreen} />
      <Tab.Screen name="AuroraLive" component={AuroraLiveScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main"           component={MainTabs} />
      <Stack.Screen name="ViaggioDetail"  component={ViaggioDetailScreen} />
      <Stack.Screen name="BlogDetail"     component={BlogDetailScreen} />
      <Stack.Screen name="Blog"           component={BlogScreen} />
      <Stack.Screen name="Contatti"       component={ContattiScreen} />
      <Stack.Screen name="AdminLogin"     component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminViaggi"    component={AdminViaggiScreen} />
      <Stack.Screen name="AdminFoto"      component={AdminFotoScreen} />
      <Stack.Screen name="AdminPodcast"   component={AdminPodcastScreen} />
      <Stack.Screen name="AdminBlog"      component={AdminBlogScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LangProvider>
  );
}

const s = StyleSheet.create({
  tabBar:        { flexDirection: "row", paddingBottom: 28, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  tabItem:       { flex: 1, alignItems: "center", position: "relative" },
  tabGlow:       { position: "absolute", top: -10, width: 60, height: 50, borderRadius: 30, backgroundColor: "rgba(0,255,136,0.08)" },
  tabIcon:       { fontSize: 20, opacity: 0.35 },
  tabIconActive: { opacity: 1 },
  tabLabel:      { fontSize: 9, color: COLORS.textMuted, marginTop: 3, fontWeight: "500" },
  tabLabelActive:{ color: COLORS.green, fontWeight: "700" },
  tabDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.green, marginTop: 3 },
});
