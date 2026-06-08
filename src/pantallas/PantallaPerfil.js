import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../servicios/supabase';
import { useTheme } from '../contextos/ThemeContext';

export default function PantallaPerfil({ navigation }) {
  const { colors, primaryColor, fontSizeScale, themeMode } = useTheme();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Datos del usuario
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [carreraMeta, setCarreraMeta] = useState('');
  const [universidadMeta, setUniversidadMeta] = useState('');
  const [puntajeMeta, setPuntajeMeta] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCorreo(user.email);

      const { data } = await supabase
        .from('usuarios')
        .select('nombre, carrera_meta, universidad_meta, puntaje_meta')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setNombre(data.nombre || '');
        setCarreraMeta(data.carrera_meta || '');
        setUniversidadMeta(data.universidad_meta || '');
        setPuntajeMeta(data.puntaje_meta ? String(data.puntaje_meta) : '');
      }
    } catch (error) {
      console.log('Error cargando perfil:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          carrera_meta: carreraMeta.trim(),
          universidad_meta: universidadMeta.trim(),
          puntaje_meta: parseInt(puntajeMeta) || 500,
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('¡Guardado!', 'Tu perfil ha sido actualizado exitosamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios. Intenta de nuevo.');
      console.log('Error guardando:', error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#4648d4" />
      </View>
    );
  }

  const inicial = (nombre || correo || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>

          {/* ENCABEZADO */}
          <View style={estilos.encabezado}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botonVolver, { backgroundColor: colors.card, shadowColor: colors.border }]}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[estilos.tituloEncabezado, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Mi Perfil</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* AVATAR */}
          <View style={estilos.contenedorAvatar}>
            <LinearGradient colors={[primaryColor, primaryColor + 'D0']} style={[estilos.avatar, { shadowColor: primaryColor }]}>
              <Text style={estilos.avatarLetra}>{inicial}</Text>
            </LinearGradient>
            <Text style={[estilos.correoTexto, { color: colors.textSecondary }]}>{correo}</Text>
            <View style={estilos.badgeCuenta}>
              <Ionicons name="shield-checkmark" size={12} color="#10B981" />
              <Text style={estilos.textoBadge}> Cuenta verificada</Text>
            </View>
          </View>

          {/* SECCIÓN: INFORMACIÓN PERSONAL */}
          <Text style={[estilos.tituloSeccion, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Información Personal</Text>
          <View style={[estilos.seccion, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[estilos.campoContenedor, { borderBottomColor: colors.border }]}>
              <Text style={[estilos.etiquetaCampo, { color: colors.textSecondary }]}>Nombre completo</Text>
              <View style={[estilos.inputContenedor, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.iconSecondary} style={estilos.inputIcono} />
                <TextInput
                  style={[estilos.input, { color: colors.text }]}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={colors.iconSecondary}
                />
              </View>
            </View>

            <View style={[estilos.campoContenedor, { borderBottomWidth: 0 }]}>
              <Text style={[estilos.etiquetaCampo, { color: colors.textSecondary }]}>Correo electrónico</Text>
              <View style={[estilos.inputContenedor, { backgroundColor: colors.background, borderColor: colors.border, opacity: 0.7 }]}>
                <Ionicons name="mail-outline" size={18} color={colors.iconSecondary} style={estilos.inputIcono} />
                <TextInput
                  style={[estilos.input, { color: colors.textSecondary }]}
                  value={correo}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={14} color={colors.iconSecondary} />
              </View>
              <Text style={[estilos.textoAyuda, { color: colors.iconSecondary }]}>El correo no se puede modificar</Text>
            </View>
          </View>

          {/* SECCIÓN: TUS METAS */}
          <Text style={[estilos.tituloSeccion, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Tus Metas ICFES</Text>
          <View style={[estilos.seccion, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[estilos.campoContenedor, { borderBottomColor: colors.border }]}>
              <Text style={[estilos.etiquetaCampo, { color: colors.textSecondary }]}>Carrera que deseas estudiar</Text>
              <View style={[estilos.inputContenedor, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="school-outline" size={18} color={colors.iconSecondary} style={estilos.inputIcono} />
                <TextInput
                  style={[estilos.input, { color: colors.text }]}
                  value={carreraMeta}
                  onChangeText={setCarreraMeta}
                  placeholder="Ej: Ingeniería de Sistemas"
                  placeholderTextColor={colors.iconSecondary}
                />
              </View>
            </View>

            <View style={[estilos.campoContenedor, { borderBottomColor: colors.border }]}>
              <Text style={[estilos.etiquetaCampo, { color: colors.textSecondary }]}>Universidad de tu sueño</Text>
              <View style={[estilos.inputContenedor, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={18} color={colors.iconSecondary} style={estilos.inputIcono} />
                <TextInput
                  style={[estilos.input, { color: colors.text }]}
                  value={universidadMeta}
                  onChangeText={setUniversidadMeta}
                  placeholder="Ej: Universidad Nacional"
                  placeholderTextColor={colors.iconSecondary}
                />
              </View>
            </View>

            <View style={[estilos.campoContenedor, { borderBottomWidth: 0 }]}>
              <Text style={[estilos.etiquetaCampo, { color: colors.textSecondary }]}>Puntaje ICFES que quieres alcanzar</Text>
              <View style={[estilos.inputContenedor, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="trophy-outline" size={18} color={colors.iconSecondary} style={estilos.inputIcono} />
                <TextInput
                  style={[estilos.input, { color: colors.text }]}
                  value={puntajeMeta}
                  onChangeText={setPuntajeMeta}
                  placeholder="Ej: 380"
                  placeholderTextColor={colors.iconSecondary}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={[estilos.sufijo, { color: colors.iconSecondary }]}>/ 500</Text>
              </View>
            </View>
          </View>

          {/* BOTÓN GUARDAR */}
          <TouchableOpacity
            style={[estilos.botonGuardar, { shadowColor: primaryColor }, guardando && estilos.botonGuardando]}
            onPress={guardarCambios}
            disabled={guardando}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[primaryColor, primaryColor + 'D0']} style={estilos.gradienteBoton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {guardando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={[estilos.textoBotonGuardar, { fontSize: 16 * fontSizeScale }]}>  Guardar Cambios</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },
  pantallaCarga: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Encabezado
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  botonVolver: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tituloEncabezado: { fontSize: 20, fontWeight: '800', color: '#0F172A' },

  // Avatar
  contenedorAvatar: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  avatarLetra: { fontSize: 38, fontWeight: '900', color: '#FFF' },
  correoTexto: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 8 },
  badgeCuenta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  textoBadge: { fontSize: 12, color: '#065F46', fontWeight: '700' },

  // Secciones
  tituloSeccion: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  seccion: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 20, marginBottom: 24, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },

  // Campos
  campoContenedor: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  etiquetaCampo: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContenedor: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  inputDeshabilitado: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  inputIcono: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  sufijo: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  textoAyuda: { fontSize: 11, color: '#CBD5E1', marginTop: 6, marginLeft: 4 },

  // Botón guardar
  botonGuardar: { borderRadius: 18, overflow: 'hidden', shadowColor: '#4648d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  botonGuardando: { opacity: 0.7 },
  gradienteBoton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  textoBotonGuardar: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
