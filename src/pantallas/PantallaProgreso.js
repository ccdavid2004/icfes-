import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, ActivityIndicator, Platform, Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import { colores } from '../tema/colores';

export default function PantallaProgreso({ navigation }) {
  const [nombre, setNombre] = useState('');
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
          .eq('usuario_id', user.id)
          .order('creado_en', { ascending: false });

        if (simulacros && simulacros.length > 0) {
          setHistorial(simulacros);
          const suma = simulacros.reduce((acc, sim) => acc + sim.puntaje_icfes, 0);
          setPuntajePromedio(Math.round(suma / simulacros.length));
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
    <SafeAreaView style={estilos.areaSegura} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO GLOBAL (Título + Racha + Perfil + Salir) */}
        <View style={estilos.encabezado}>
          <View style={estilos.textosEncabezado}>
            <Text style={estilos.titulo}>Tu Progreso</Text>
            <Text style={estilos.subtitulo}>Sigue así, {nombre || 'Estudiante'}.</Text>
          </View>

          <View style={estilos.accionesEncabezado}>
            <View style={estilos.contenedorRacha}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={estilos.textoRacha}>7</Text>
            </View>
            <TouchableOpacity style={estilos.botonNotif} onPress={manejarCierreSesion}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
            <View style={estilos.avatar}>
              <LinearGradient colors={['#4648d4', '#6366f1']} style={estilos.avatarGradiente}>
                <Text style={estilos.avatarLetra}>{(nombre || 'E').charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* TARJETA DE PUNTAJE PROMEDIO REAL */}
        <View style={estilos.tarjetaPrincipal}>
          <LinearGradient colors={['#4648d4', '#6366f1']} style={estilos.gradienteTarjeta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={estilos.filaTarjetaTop}>
              <View style={estilos.etiquetaPuntaje}>
                <Ionicons name="analytics" size={14} color="#4648d4" />
                <Text style={estilos.textoEtiqueta}>Promedio Actual</Text>
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
          <Text style={estilos.tituloSeccion}>Historial de Simulacros</Text>
          
          {historial.length === 0 ? (
            <Text style={{color: '#64748B'}}>Aún no has hecho simulacros. ¡Ve a la pestaña de Simulacros y haz el primero!</Text>
          ) : (
            historial.map((sim, index) => {
              const fecha = new Date(sim.creado_en).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
              const nivelMostrar = sim.nivel || 'Fácil';
              const colorEtiqueta = obtenerColorNivel(nivelMostrar);

              return (
                <TouchableOpacity key={sim.id} style={estilos.itemHistorial} onPress={() => abrirRevision(sim)}>
                  <View style={estilos.iconoHistorial}>
                    <Ionicons name="document-text" size={24} color="#4648d4" />
                  </View>
                  <View style={estilos.infoHistorial}>
                    <View style={estilos.filaTituloHistorial}>
                      <Text style={estilos.tituloHistorial}>Simulacro {historial.length - index}</Text>
                      <View style={[estilos.badgeNivel, { backgroundColor: colorEtiqueta + '20' }]}>
                        <Text style={[estilos.textoBadgeNivel, { color: colorEtiqueta }]}>{nivelMostrar}</Text>
                      </View>
                    </View>
                    <Text style={estilos.fechaHistorial}>{fecha} • {sim.correctas}/{sim.total_preguntas} correctas</Text>
                  </View>
                  <View style={estilos.puntajeHistorialContainer}>
                    <Text style={estilos.puntajeHistorial}>{sim.puntaje_icfes}</Text>
                    <Text style={estilos.ptsHistorial}>Pts</Text>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* MODAL DE REVISIÓN DEL EXAMEN */}
      <Modal visible={modalRevision} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalRevision(false)}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#F8FAFC'}}>
          <View style={estilos.modalHeader}>
            <Text style={estilos.modalTitulo}>Revisión del Examen</Text>
            <TouchableOpacity onPress={() => setModalRevision(false)} style={estilos.btnCerrarModal}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{padding: 20}}>
            <View style={estilos.resumenModal}>
              <Text style={estilos.textoResumenModal}>Puntaje ICFES: {simulacroSeleccionado?.puntaje_icfes}</Text>
              <Text style={{color: '#E0E7FF', marginTop: 4}}>Nivel: {simulacroSeleccionado?.nivel || 'Fácil'}</Text>
            </View>

            {simulacroSeleccionado?.detalle_respuestas?.map((resp, idx) => {
              const esCorrecta = resp.seleccionada === resp.correcta;
              return (
                <View key={idx} style={[estilos.tarjetaRevision, { borderColor: esCorrecta ? '#10B981' : '#EF4444' }]}>
                  <View style={estilos.headerRevision}>
                    <Text style={estilos.badgeMateriaRevision}>{resp.materia}</Text>
                    <Ionicons name={esCorrecta ? "checkmark-circle" : "close-circle"} size={24} color={esCorrecta ? '#10B981' : '#EF4444'} />
                  </View>
                  
                  <Text style={estilos.preguntaRevision}>{idx + 1}. {resp.pregunta}</Text>
                  
                  <Text style={estilos.textoTuRespuesta}>
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
      <View style={estilos.barraNavegacion}>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaPrincipal')}>
          <Ionicons name="home-outline" size={24} color="#9CA3AF" />
          <Text style={estilos.textoNav}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNavActivo}>
          <View style={estilos.circuloNavActivo}>
            <Ionicons name="trending-up" size={22} color="#FFF" />
          </View>
          <Text style={estilos.textoNavActivo}>Progreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaSimulacros')}>
          <Ionicons name="book-outline" size={24} color="#9CA3AF" />
          <Text style={estilos.textoNav}>Simulacros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.itemNav}>
          <Ionicons name="settings-outline" size={24} color="#9CA3AF" />
          <Text style={estilos.textoNav}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: '#F8FAFC' },
  pantallaCarga: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
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