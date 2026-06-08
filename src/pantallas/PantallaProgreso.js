import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, ActivityIndicator, Platform, Modal, Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import { colores } from '../tema/colores';
import RachaFlotante from '../componentes/RachaFlotante';
import { useTheme } from '../contextos/ThemeContext';

export default function PantallaProgreso({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();

  const [nombre, setNombre] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [puntajeMeta, setPuntajeMeta] = useState(500);
  const [cargando, setCargando] = useState(true);
  
  const [historial, setHistorial] = useState([]);
  const [puntajePromedio, setPuntajePromedio] = useState(0);
  
  const [modalRevision, setModalRevision] = useState(false);
  const [simulacroSeleccionado, setSimulacroSeleccionado] = useState(null);

  const barraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    obtenerDatosYHistorial();
  }, []);

  useEffect(() => {
    if (!cargando && puntajePromedio > 0) {
      const progreso = puntajePromedio / puntajeMeta;
      Animated.timing(barraAnim, {
        toValue: progreso > 1 ? 1 : progreso,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [cargando, puntajePromedio]);

  const obtenerDatosYHistorial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCorreoUsuario(user.email);
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre, puntaje_meta')
          .eq('id', user.id)
          .maybeSingle();

        if (userData) {
          setNombre(userData.nombre);
          setPuntajeMeta(userData.puntaje_meta || 500);
        }

        const { data: simulacros } = await supabase
          .from('resultados_simulacros')
          .select('*')
          .eq('usuario_id', user.id);

        const { data: practicas } = await supabase
          .from('resultados_practicas')
          .select('*')
          .eq('usuario_id', user.id);

        const listaSimulacros = (simulacros || []).map(s => ({ ...s, tipoItem: 'simulacro' }));
        const listaPracticas = (practicas || []).map(p => ({ ...p, tipoItem: 'practica', puntaje_icfes: Math.round((p.correctas / p.total_preguntas) * 500) }));

        const combinado = [...listaSimulacros, ...listaPracticas].sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
        
        if (combinado.length > 0) {
          setHistorial(combinado);
        }

        if (listaSimulacros.length > 0) {
          const suma = listaSimulacros.reduce((acc, sim) => acc + sim.puntaje_icfes, 0);
          const promedio = Math.round(suma / listaSimulacros.length);
          setPuntajePromedio(promedio);
        } else {
          setPuntajePromedio(0);
        }
      }
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCierreSesion = async () => {
    await supabase.auth.signOut();
  };

  const abrirRevision = (simulacro) => {
    setSimulacroSeleccionado(simulacro);
    setModalRevision(true);
  };

  const anchoProgreso = barraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const obtenerColorNivel = (nivel) => {
    if (!nivel) return '#10B981'; 
    if (nivel.toLowerCase().includes('facil') || nivel.toLowerCase().includes('fácil')) return '#10B981'; 
    if (nivel.toLowerCase().includes('medio')) return '#F97316'; 
    return '#4648d4'; 
  };

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#4648d4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO GLOBAL */}
        <View style={estilos.encabezado}>
          <View style={estilos.textosEncabezado}>
            <Text style={[estilos.titulo, { color: colors.text, fontSize: 32 * fontSizeScale }]}>Tu Progreso</Text>
            <Text style={[estilos.subtitulo, { color: colors.textSecondary, fontSize: 16 * fontSizeScale }]}>Sigue así, {nombre || 'Estudiante'}.</Text>
          </View>
        </View>

        {/* TARJETA DE PUNTAJE PROMEDIO REAL */}
        <View style={[estilos.tarjetaPrincipal, { shadowColor: primaryColor }]}>
          <LinearGradient colors={[primaryColor, primaryColor + 'D0']} style={estilos.gradienteTarjeta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={estilos.filaTarjetaTop}>
              <View style={estilos.etiquetaPuntaje}>
                <Ionicons name="analytics" size={14} color={primaryColor} />
                <Text style={[estilos.textoEtiqueta, { color: primaryColor }]}>Promedio Actual</Text>
              </View>
              <Text style={estilos.textoMeta}>Meta: {puntajeMeta}</Text>
            </View>

            <View style={estilos.contenedorNumeros}>
              <Text style={estilos.numeroActual}>{puntajePromedio}</Text>
              <Text style={estilos.numeroTotal}> / 500</Text>
            </View>

            <View style={estilos.barraFondoHeader}>
              <Animated.View style={[estilos.barraRellenoHeader, { width: anchoProgreso }]} />
            </View>
          </LinearGradient>
        </View>

        {/* HISTORIAL Y REVISIÓN DE SIMULACROS */}
        <View style={estilos.seccion}>
          <Text style={[estilos.tituloSeccion, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Historial de Actividad</Text>
          
          {historial.length === 0 ? (
            <Text style={{color: colors.textSecondary}}>Aún no tienes actividad. ¡Haz un simulacro o una práctica!</Text>
          ) : (
            historial.map((sim, index) => {
              const esPractica = sim.tipoItem === 'practica';
              const fecha = new Date(sim.creado_en).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
              const nivelMostrar = esPractica ? sim.materia : (sim.nivel || 'Fácil');
              const colorEtiqueta = esPractica ? '#3B82F6' : obtenerColorNivel(nivelMostrar);
              const titulo = esPractica ? 'Práctica' : `Simulacro ${historial.length - index}`;

              return (
                <TouchableOpacity key={`${sim.tipoItem}-${sim.id}`} style={[estilos.itemHistorial, { backgroundColor: colors.card, shadowColor: colors.border }]} onPress={() => abrirRevision(sim)}>
                  <View style={[estilos.iconoHistorial, { backgroundColor: primaryColor + '15' }]}>
                    <Ionicons name={esPractica ? "book" : "document-text"} size={24} color={primaryColor} />
                  </View>
                  <View style={estilos.infoHistorial}>
                    <View style={estilos.filaTituloHistorial}>
                      <Text style={[estilos.tituloHistorial, { color: colors.text, fontSize: 16 * fontSizeScale }]}>{titulo}</Text>
                      <View style={[estilos.badgeNivel, { backgroundColor: colorEtiqueta + '20' }]}>
                        <Text style={[estilos.textoBadgeNivel, { color: colorEtiqueta }]}>{nivelMostrar}</Text>
                      </View>
                    </View>
                    <Text style={[estilos.fechaHistorial, { color: colors.textSecondary }]}>{fecha} • {sim.correctas}/{sim.total_preguntas} correctas</Text>
                  </View>
                  <View style={[estilos.puntajeHistorialContainer, { backgroundColor: colors.background }]}>
                    {esPractica ? (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    ) : (
                      <>
                        <Text style={[estilos.puntajeHistorial, { color: primaryColor }]}>{sim.puntaje_icfes}</Text>
                        <Text style={[estilos.ptsHistorial, { color: colors.iconSecondary }]}>Pts</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* MODAL DE REVISIÓN DEL EXAMEN */}
      <Modal visible={modalRevision} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalRevision(false)}>
        <SafeAreaView style={{flex: 1, backgroundColor: colors.background }}>
          <View style={[estilos.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[estilos.modalTitulo, { color: colors.text, fontSize: 20 * fontSizeScale }]}>
              Revisión - {simulacroSeleccionado?.tipoItem === 'practica' ? simulacroSeleccionado?.materia : (simulacroSeleccionado?.nivel || 'Simulacro')}
            </Text>
            <TouchableOpacity onPress={() => setModalRevision(false)} style={[estilos.btnCerrarModal, { backgroundColor: colors.background }]}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{padding: 20}}>
            <View style={[estilos.resumenModal, { backgroundColor: simulacroSeleccionado?.tipoItem === 'practica' ? '#3B82F6' : primaryColor }]}>
              {simulacroSeleccionado?.tipoItem === 'practica' ? (
                <>
                  <Text style={estilos.textoResumenModal}>Aciertos: {simulacroSeleccionado?.correctas} / {simulacroSeleccionado?.total_preguntas}</Text>
                  <Text style={{color: 'rgba(255,255,255,0.8)', marginTop: 4}}>Materia: {simulacroSeleccionado?.materia}</Text>
                </>
              ) : (
                <>
                  <Text style={estilos.textoResumenModal}>Puntaje ICFES: {simulacroSeleccionado?.puntaje_icfes}</Text>
                  <Text style={{color: 'rgba(255,255,255,0.8)', marginTop: 4}}>Nivel: {simulacroSeleccionado?.nivel || 'Fácil'}</Text>
                </>
              )}
            </View>

            {simulacroSeleccionado?.detalle_respuestas?.map((resp, idx) => {
              let esCorrecta = false;
              if (resp.seleccionada !== 'Ninguna') {
                const letraSeleccionada = resp.seleccionada.trim().toUpperCase();
                const correctaDB = String(resp.correcta || '').trim();
                esCorrecta = (letraSeleccionada === correctaDB.toUpperCase()) || 
                             (resp.texto_opcion_seleccionada && resp.texto_opcion_seleccionada.trim().toLowerCase() === correctaDB.toLowerCase());
                // Fallback de seguridad si en detalle_respuestas se guardó que esCorrecta (aunque no lo guardamos explícitamente como booleano antes)
                if(!esCorrecta && letraSeleccionada === correctaDB) esCorrecta = true;
              }
              return (
                <View key={idx} style={[estilos.tarjetaRevision, { backgroundColor: colors.card, borderColor: esCorrecta ? '#10B981' : '#EF4444' }]}>
                  <View style={estilos.headerRevision}>
                    <Text style={[estilos.badgeMateriaRevision, { backgroundColor: colors.background, color: colors.textSecondary }]}>{resp.materia}</Text>
                    <Ionicons name={esCorrecta ? "checkmark-circle" : "close-circle"} size={24} color={esCorrecta ? '#10B981' : '#EF4444'} />
                  </View>
                  
                  <Text style={[estilos.preguntaRevision, { color: colors.text }]}>{idx + 1}. {resp.pregunta}</Text>
                  
                  <Text style={[estilos.textoTuRespuesta, { color: colors.textSecondary }]}>
                    Tu respuesta: <Text style={{color: esCorrecta ? '#10B981' : '#EF4444', fontWeight: 'bold'}}>{resp.seleccionada}</Text>
                  </Text>
                  
                  {!esCorrecta && (
                    <Text style={estilos.textoRespuestaCorrecta}>
                      Respuesta correcta: <Text style={{fontWeight: 'bold'}}>{resp.correcta}</Text>
                    </Text>
                  )}

                  <View style={estilos.cajaJustificacion}>
                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                    <Text style={estilos.textoJustificacion}>{resp.justificacion}</Text>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <View style={[estilos.barraNavegacion, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaPrincipal')}>
          <Ionicons name="home-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNavActivo}>
          <View style={[estilos.circuloNavActivo, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <Ionicons name="trending-up" size={22} color="#FFF" />
          </View>
          <Text style={[estilos.textoNavActivo, { color: primaryColor }]}>Progreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaSimulacros')}>
          <Ionicons name="book-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Simulacros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaAjustes')}>
          <Ionicons name="settings-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
      <RachaFlotante />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  pantallaCarga: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  
  // ESTILOS DEL ENCABEZADO GLOBAL
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  textosEncabezado: { flex: 1, paddingRight: 12 },
  titulo: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  subtitulo: { fontSize: 16, color: '#64748B', marginTop: 4 },
  accionesEncabezado: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  contenedorRacha: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  textoRacha: { color: '#FF6B35', fontWeight: '700', marginLeft: 3, fontSize: 13 },
  botonNotif: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
  avatarGradiente: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarLetra: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  perfilMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, maxWidth: 140 },
  avatarMini: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  correoMini: { fontSize: 11, color: '#64748B', fontWeight: '600', flexShrink: 1 },

  tarjetaPrincipal: { borderRadius: 24, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, marginBottom: 32 },
  gradienteTarjeta: { borderRadius: 24, padding: 24 },
  filaTarjetaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  etiquetaPuntaje: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  textoEtiqueta: { color: '#4648d4', fontWeight: '800', fontSize: 12, marginLeft: 4 },
  textoMeta: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 14 },
  contenedorNumeros: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  numeroActual: { fontSize: 56, fontWeight: '900', color: '#FFF', lineHeight: 60 },
  numeroTotal: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  barraFondoHeader: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  barraRellenoHeader: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },

  seccion: { marginBottom: 24 },
  tituloSeccion: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  
  itemHistorial: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  iconoHistorial: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoHistorial: { flex: 1 },
  filaTituloHistorial: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tituloHistorial: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  badgeNivel: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  textoBadgeNivel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  fechaHistorial: { fontSize: 13, color: '#64748B', marginTop: 4 },
  puntajeHistorialContainer: { alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  puntajeHistorial: { fontSize: 18, fontWeight: '900', color: '#4648d4' },
  ptsHistorial: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
  modalTitulo: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  btnCerrarModal: { padding: 5, backgroundColor: '#F1F5F9', borderRadius: 20 },
  resumenModal: { backgroundColor: '#4648d4', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  textoResumenModal: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  tarjetaRevision: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderLeftWidth: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerRevision: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badgeMateriaRevision: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700', color: '#475569' },
  preguntaRevision: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  textoTuRespuesta: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  textoRespuestaCorrecta: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  cajaJustificacion: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginTop: 8 },
  textoJustificacion: { flex: 1, fontSize: 13, color: '#92400E', marginLeft: 8, lineHeight: 18 },

  barraNavegacion: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFF', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 26 : 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15 },
  itemNavActivo: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  circuloNavActivo: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#4648d4', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  textoNavActivo: { fontSize: 11, color: '#4648d4', fontWeight: '700' },
  itemNav: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  textoNav: { fontSize: 11, marginTop: 4, color: '#9CA3AF', fontWeight: '500' }
});