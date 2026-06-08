import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores } from '../tema/colores';
import RachaFlotante from '../componentes/RachaFlotante';
import { useTheme } from '../contextos/ThemeContext';

export default function PantallaSimulacros({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para los selectores de los simulacros cortos
  const [selFacil, setSelFacil] = useState(30);
  const [selMedio, setSelMedio] = useState(60);

  const iniciarSimulacro = (nivel, cantidad) => {
    // Al presionar iniciar, enviamos cuántas preguntas y minutos queremos
    navigation.navigate('MotorSimulacro', { 
      nivel: nivel, 
      cantidad: cantidad,
      tiempo: cantidad // Ej: Si pide 30 preguntas, le damos 30 minutos
    });
  };

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: colors.text, fontSize: 32 * fontSizeScale }]}>Simulacros</Text>
          <Text style={[estilos.subtitulo, { color: colors.textSecondary, fontSize: 16 * fontSizeScale }]}>Ponte a prueba. Elige tu nivel de entrenamiento para hoy.</Text>
        </View>

        {/* TARJETA NIVEL FÁCIL */}
        <View style={[estilos.tarjetaContenedor, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <View style={[estilos.bordeColor, { backgroundColor: '#10B981' }]} />
          <View style={estilos.tarjetaInterior}>
            <View style={estilos.headerTarjeta}>
              <View style={[estilos.iconoContenedor, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="leaf" size={24} color="#059669" />
              </View>
              <View style={estilos.textosHeader}>
                <Text style={[estilos.tituloNivel, { color: colors.text, fontSize: 18 * fontSizeScale }]}>Fácil (Práctica Rápida)</Text>
                <Text style={[estilos.descNivel, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Preguntas aleatorias • Nivel Básico</Text>
              </View>
            </View>
            
            <Text style={estilos.labelSelector}>Elige cantidad y tiempo:</Text>
            <View style={estilos.filaSelectores}>
              {[30, 40, 50].map((num) => (
                <TouchableOpacity 
                  key={`facil-${num}`}
                  style={[estilos.btnSelector, selFacil === num && estilos.btnSelectorActivoFacil]}
                  onPress={() => setSelFacil(num)}
                >
                  <Text style={[estilos.textoSelector, selFacil === num && estilos.textoSelectorActivo]}>
                    {num} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[estilos.btnIniciar, { backgroundColor: '#10B981' }]}
              onPress={() => iniciarSimulacro('Facil', selFacil)}
            >
              <Text style={estilos.textoBtnIniciar}>Iniciar {selFacil} preguntas</Text>
              <Ionicons name="play" size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TARJETA NIVEL MEDIO */}
        <View style={[estilos.tarjetaContenedor, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <View style={[estilos.bordeColor, { backgroundColor: '#F97316' }]} />
          <View style={estilos.tarjetaInterior}>
            <View style={estilos.headerTarjeta}>
              <View style={[estilos.iconoContenedor, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="flame" size={24} color="#EA580C" />
              </View>
              <View style={estilos.textosHeader}>
                <Text style={[estilos.tituloNivel, { color: colors.text, fontSize: 18 * fontSizeScale }]}>Medio (Desafío)</Text>
                <Text style={[estilos.descNivel, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Exigencia moderada • Mayor enfoque</Text>
              </View>
            </View>
            
            <Text style={estilos.labelSelector}>Elige cantidad y tiempo:</Text>
            <View style={estilos.filaSelectores}>
              {[60, 70, 80].map((num) => (
                <TouchableOpacity 
                  key={`medio-${num}`}
                  style={[estilos.btnSelector, selMedio === num && estilos.btnSelectorActivoMedio]}
                  onPress={() => setSelMedio(num)}
                >
                  <Text style={[estilos.textoSelector, selMedio === num && estilos.textoSelectorActivo]}>
                    {num} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[estilos.btnIniciar, { backgroundColor: '#F97316' }]}
              onPress={() => iniciarSimulacro('Medio', selMedio)}
            >
              <Text style={estilos.textoBtnIniciar}>Iniciar {selMedio} preguntas</Text>
              <Ionicons name="play" size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TARJETA NIVEL DIFÍCIL (SIMULACRO ICFES) */}
        <TouchableOpacity activeOpacity={0.9} style={[estilos.tarjetaContenedorPrincipal, { shadowColor: primaryColor }]}>
          <LinearGradient colors={[primaryColor, primaryColor + 'D0']} style={estilos.gradienteIcfes} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            
            <View style={estilos.badgeRecomendado}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={estilos.textoBadgeRecomendado}> Experiencia Real</Text>
            </View>

            <View style={estilos.headerIcfes}>
              <MaterialCommunityIcons name="brain" size={40} color="#FFF" />
              <View style={estilos.textosIcfes}>
                <Text style={estilos.tituloIcfes}>Simulacro ICFES 11</Text>
                <Text style={estilos.descIcfes}>Formato Oficial • Todas las materias</Text>
              </View>
            </View>

            <View style={estilos.infoGridIcfes}>
              <View style={estilos.itemInfoIcfes}>
                <Ionicons name="time-outline" size={20} color="#C7D2FE" />
                <Text style={estilos.textoInfoIcfes}>9 Horas</Text>
              </View>
              <View style={estilos.itemInfoIcfes}>
                <Ionicons name="document-text-outline" size={20} color="#C7D2FE" />
                <Text style={estilos.textoInfoIcfes}>254 Pregs.</Text>
              </View>
              <View style={estilos.itemInfoIcfes}>
                <Ionicons name="sunny-outline" size={20} color="#C7D2FE" />
                <Text style={estilos.textoInfoIcfes}>2 Sesiones</Text>
              </View>
            </View>

            <View style={estilos.accionesIcfes}>
              <TouchableOpacity style={estilos.btnVerEstructura} onPress={() => setModalVisible(true)}>
                <Text style={estilos.textoBtnSecundario}>Ver estructura</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={estilos.btnIniciarIcfes} onPress={() => iniciarSimulacro('ICFES', 254)}>
                <Text style={[estilos.textoBtnIniciarIcfes, { color: primaryColor }]}>Empezar Sesión 1</Text>
                <Ionicons name="arrow-forward" size={16} color={primaryColor} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL CON LA ESTRUCTURA DEL ICFES */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={estilos.modalFondo}>
          <View style={[estilos.modalContenedor, { backgroundColor: colors.background }]}>
            <View style={estilos.modalHeader}>
              <Text style={[estilos.modalTitulo, { color: colors.text, fontSize: 22 * fontSizeScale }]}>Estructura ICFES Saber 11</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[estilos.btnCerrarModal, { backgroundColor: colors.card }]}>
                <Ionicons name="close" size={24} color={colors.iconSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[estilos.modalSeccion, { color: primaryColor, fontSize: 18 * fontSizeScale }]}>Sesión 1 (Mañana) - 4h 30m</Text>
              <View style={[estilos.modalTabla, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Matemáticas 1: <Text style={{fontWeight: 'bold'}}>25</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Lectura Crítica: <Text style={{fontWeight: 'bold'}}>41</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Sociales y Ciudadanas 1: <Text style={{fontWeight: 'bold'}}>25</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Ciencias Naturales 1: <Text style={{fontWeight: 'bold'}}>29</Text></Text>
                <Text style={[estilos.modalTextoTabla, estilos.modalTotal, { color: colors.text, borderTopColor: colors.border }]}>Total Sesión 1: 120 preguntas</Text>
              </View>

              <Text style={[estilos.modalSeccion, { color: primaryColor, fontSize: 18 * fontSizeScale }]}>Sesión 2 (Tarde) - 4h 30m</Text>
              <View style={[estilos.modalTabla, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Sociales y Ciudadanas 2: <Text style={{fontWeight: 'bold'}}>25</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Matemáticas 2: <Text style={{fontWeight: 'bold'}}>25</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Ciencias Naturales 2: <Text style={{fontWeight: 'bold'}}>29</Text></Text>
                <Text style={[estilos.modalTextoTabla, { color: colors.textSecondary }]}>• Inglés: <Text style={{fontWeight: 'bold'}}>45-55</Text></Text>
                <Text style={[estilos.modalTextoTabla, estilos.modalTotal, { color: colors.text, borderTopColor: colors.border }]}>Total Sesión 2: ~134 preguntas</Text>
              </View>

              <View style={[estilos.modalInfoExtra, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <Text style={[estilos.modalTextoExtra, { color: primaryColor }]}>El puntaje global va de 0 a 500 puntos. 350+ es Muy Bueno y 450+ es Nivel Élite.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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

        <TouchableOpacity style={estilos.itemNavActivo}>
          <View style={[estilos.circuloNavActivo, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <Ionicons name="document-text" size={22} color="#FFF" />
          </View>
          <Text style={[estilos.textoNavActivo, { color: primaryColor }]}>Simulacros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaAjustes')}>
          <Ionicons name="settings-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
      <RachaFlotante racha={7} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  
  encabezado: { marginBottom: 24 },
  titulo: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  subtitulo: { fontSize: 16, color: '#64748B', marginTop: 4, lineHeight: 22 },

  // Tarjetas Niveles
  tarjetaContenedor: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, marginBottom: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  bordeColor: { width: 8 },
  tarjetaInterior: { flex: 1, padding: 20 },
  headerTarjeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconoContenedor: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textosHeader: { flex: 1 },
  tituloNivel: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  descNivel: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  labelSelector: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  filaSelectores: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnSelector: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnSelectorActivoFacil: { backgroundColor: '#10B981', borderColor: '#10B981' },
  btnSelectorActivoMedio: { backgroundColor: '#F97316', borderColor: '#F97316' },
  textoSelector: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  textoSelectorActivo: { color: '#FFF' },

  btnIniciar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 16 },
  textoBtnIniciar: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // Tarjeta Difícil (ICFES)
  tarjetaContenedorPrincipal: { borderRadius: 24, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8, marginBottom: 30 },
  gradienteIcfes: { borderRadius: 24, padding: 24 },
  badgeRecomendado: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignItems: 'center' },
  textoBadgeRecomendado: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  headerIcfes: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 24 },
  textosIcfes: { marginLeft: 16, flex: 1 },
  tituloIcfes: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  descIcfes: { fontSize: 14, color: '#E0E7FF', marginTop: 4 },
  infoGridIcfes: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 24 },
  itemInfoIcfes: { alignItems: 'center' },
  textoInfoIcfes: { color: '#FFF', fontWeight: '700', fontSize: 13, marginTop: 6 },
  accionesIcfes: { flexDirection: 'row', gap: 12 },
  btnVerEstructura: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  textoBtnSecundario: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnIniciarIcfes: { flex: 1.5, flexDirection: 'row', paddingVertical: 14, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  textoBtnIniciarIcfes: { color: '#4648d4', fontWeight: '800', fontSize: 14 },

  // Modal
  modalFondo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContenedor: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  btnCerrarModal: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },
  modalSeccion: { fontSize: 18, fontWeight: '800', color: '#4648d4', marginTop: 16, marginBottom: 12 },
  modalTabla: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  modalTextoTabla: { fontSize: 15, color: '#475569', marginBottom: 8 },
  modalTotal: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#CBD5E1', fontWeight: '800', color: '#0F172A' },
  modalInfoExtra: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16, marginTop: 24, marginBottom: 40 },
  modalTextoExtra: { flex: 1, marginLeft: 12, color: '#4338CA', fontSize: 14, fontWeight: '600', lineHeight: 20 },

  // Navegación Inferior
  barraNavegacion: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFF', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 26 : 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15 },
  itemNavActivo: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  circuloNavActivo: { width: 46, height: 46, borderRadius: 23, backgroundColor: colores.primario, justifyContent: 'center', alignItems: 'center', marginBottom: 4, shadowColor: colores.primario, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  textoNavActivo: { fontSize: 11, color: colores.primario, fontWeight: '700' },
  itemNav: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  textoNav: { fontSize: 11, marginTop: 4, color: '#9CA3AF', fontWeight: '500' }
});