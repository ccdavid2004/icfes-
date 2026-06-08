import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import RachaFlotante from '../componentes/RachaFlotante';
import { useTheme } from '../contextos/ThemeContext';

export default function PantallaAjustes({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();

  const manejarCierreSesion = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: colors.text, fontSize: 32 * fontSizeScale }]}>Ajustes</Text>
          <Text style={[estilos.subtitulo, { color: colors.textSecondary, fontSize: 16 * fontSizeScale }]}>Configura tu experiencia de aprendizaje.</Text>
        </View>

        {/* SECCIONES DE AJUSTES */}
        <View style={[estilos.seccionAjustes, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[estilos.itemAjuste, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('PantallaPerfil')}>
            <View style={[estilos.iconoAjuste, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="person-outline" size={22} color={primaryColor} />
            </View>
            <Text style={[estilos.textoAjuste, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.itemAjuste, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('PantallaNotificaciones')}>
            <View style={[estilos.iconoAjuste, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="notifications-outline" size={22} color={primaryColor} />
            </View>
            <Text style={[estilos.textoAjuste, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.itemAjuste, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('PantallaApariencia')}>
            <View style={[estilos.iconoAjuste, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="color-palette-outline" size={22} color={primaryColor} />
            </View>
            <Text style={[estilos.textoAjuste, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Apariencia</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.itemAjuste, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('PantallaAyudaSoporte')}>
            <View style={[estilos.iconoAjuste, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="help-circle-outline" size={22} color={primaryColor} />
            </View>
            <Text style={[estilos.textoAjuste, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Ayuda y Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.itemAjuste, estilos.itemCerrarSesion]} onPress={manejarCierreSesion}>
            <View style={[estilos.iconoAjuste, { backgroundColor: colors.dangerBg }]}>
              <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            </View>
            <Text style={[estilos.textoCerrarSesion, { color: colors.danger, fontSize: 16 * fontSizeScale }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <View style={[estilos.barraNavegacion, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaPrincipal')}>
          <Ionicons name="home-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaProgreso')}>
          <Ionicons name="trending-up-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Progreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaSimulacros')}>
          <Ionicons name="book-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Simulacros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNavActivo}>
          <View style={[estilos.circuloNavActivo, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <Ionicons name="settings" size={22} color="#FFF" />
          </View>
          <Text style={[estilos.textoNavActivo, { color: primaryColor }]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
      <RachaFlotante racha={7} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  
  encabezado: { marginBottom: 32 },
  titulo: { fontWeight: '900', letterSpacing: -0.5 },
  subtitulo: { marginTop: 4 },

  seccionAjustes: { borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemAjuste: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  iconoAjuste: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textoAjuste: { flex: 1, fontWeight: '600' },
  
  itemCerrarSesion: { borderBottomWidth: 0, marginTop: 8 },
  textoCerrarSesion: { flex: 1, fontWeight: '700' },

  barraNavegacion: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 26 : 12, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15 },
  itemNavActivo: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  circuloNavActivo: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginBottom: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  textoNavActivo: { fontSize: 11, fontWeight: '700' },
  itemNav: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  textoNav: { fontSize: 11, marginTop: 4, fontWeight: '500' }
});
