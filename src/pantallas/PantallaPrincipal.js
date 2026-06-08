import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView, Animated, Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import { colores } from '../tema/colores';
import RachaFlotante from '../componentes/RachaFlotante';
import { useTheme } from '../contextos/ThemeContext';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function PantallaPrincipal({ navigation }) {
  const { colors, primaryColor, fontSizeScale, themeMode, calcularRacha } = useTheme();

  // 1. ESTADOS PARA LOS DATOS DINÁMICOS
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [carreraMeta, setCarreraMeta] = useState('Definir Carrera');
  const [universidadMeta, setUniversidadMeta] = useState('Definir Universidad');
  const [puntajeMeta, setPuntajeMeta] = useState(500);
  
  // Nuevos estados para los simulacros
  const [puntajeActual, setPuntajeActual] = useState(0); // Este será el promedio
  const [ultimoPuntaje, setUltimoPuntaje] = useState(0); // El puntaje del último examen
  const [cargando, setCargando] = useState(true);

  // Animaciones
  const animacionPulso = useRef(new Animated.Value(1)).current;
  const barraAnim = useRef(new Animated.Value(0)).current;

  const areasEstudio = [
    { id: '1', nombre: 'Lectura Crítica', icono: 'book-open-variant', gradiente: ['#4648d4', '#6366f1'] },
    { id: '2', nombre: 'Matemáticas', icono: 'calculator-variant', gradiente: ['#E84E0F', '#F97316'] },
    { id: '3', nombre: 'Sociales', icono: 'earth', gradiente: ['#059669', '#10B981'] },
    { id: '4', nombre: 'Ciencias Nat.', icono: 'flask', gradiente: ['#DC2626', '#F87171'] },
    { id: '5', nombre: 'Inglés', icono: 'translate', gradiente: ['#1E40AF', '#2563EB'] },
  ];

  // Ejecutamos la consulta cada vez que la pantalla gana el "foco" (cuando vuelves a ella)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCargando(true);
      obtenerDatosDelEstudiante();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    obtenerDatosDelEstudiante();
    iniciarAnimacionPulso();
  }, []);

  // Animar la barra solo cuando cambie el puntaje actual
  useEffect(() => {
    if (!cargando && puntajeMeta > 0) {
      const progresoFinal = puntajeActual / puntajeMeta;
      Animated.timing(barraAnim, {
        toValue: progresoFinal > 1 ? 1 : progresoFinal,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [puntajeActual, cargando, puntajeMeta]);

  const iniciarAnimacionPulso = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacionPulso, { toValue: 1.02, duration: 1800, useNativeDriver: true }),
        Animated.timing(animacionPulso, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  };

  // 3. CONSULTA A SUPABASE POR TODOS LOS DATOS Y EL HISTORIAL
  const obtenerDatosDelEstudiante = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCorreoUsuario(user.email);
        // A. Actualizamos la racha global silenciosamente
        calcularRacha();

        // B. Traemos los datos de la meta
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre, carrera_meta, universidad_meta, puntaje_meta')
          .eq('id', user.id)
          .maybeSingle(); 

        if (userData) {
          setNombreUsuario(userData.nombre);
          if (userData.carrera_meta) setCarreraMeta(userData.carrera_meta);
          if (userData.universidad_meta) setUniversidadMeta(userData.universidad_meta);
          if (userData.puntaje_meta) setPuntajeMeta(userData.puntaje_meta);
        }

        // B. Traemos el historial de simulacros para calcular el progreso real
        const { data: simulacros } = await supabase
          .from('resultados_simulacros')
          .select('puntaje_icfes')
          .eq('usuario_id', user.id)
          .order('creado_en', { ascending: false }); // El más reciente primero

        if (simulacros && simulacros.length > 0) {
          // El puntaje del último simulacro realizado
          setUltimoPuntaje(simulacros[0].puntaje_icfes);
          
          // Promedio de todos los simulacros
          const suma = simulacros.reduce((acc, sim) => acc + sim.puntaje_icfes, 0);
          setPuntajeActual(Math.round(suma / simulacros.length));
        } else {
          setPuntajeActual(0);
          setUltimoPuntaje(0);
        }
      }
    } catch (error) {
      console.log('Error al obtener datos:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCierreSesion = async () => {
    await supabase.auth.signOut();
  };

  if (cargando && !nombreUsuario) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#4648d4" />
      </View>
    );
  }

  const anchoBarraPorcentaje = barraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ── ENCABEZADO UNIFICADO ── */}
        <View style={estilos.encabezado}>
          <View style={estilos.textosEncabezado}>
            <View style={estilos.filaHola}>
              <Text style={[estilos.saludo, { color: colors.text }]}>Hola,{'\n'}
                <Text style={[estilos.saludoNombre, { color: primaryColor }]}>{nombreUsuario || 'Estudiante'}</Text>
              </Text>
              <Text style={estilos.emoji}>👋</Text>
            </View>
            <Text style={[estilos.subtituloMotivacion, { color: colors.textSecondary }]}>El éxito es la suma de pequeños esfuerzos diarios.</Text>
          </View>
        </View>

        {/* ── TARJETA META ICFES DINÁMICA ── */}
        <Animated.View style={{ transform: [{ scale: animacionPulso }] }}>
          <AnimatedGradient
            colors={[primaryColor, primaryColor + 'D0', primaryColor + '99']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[estilos.tarjetaIcfes, { shadowColor: primaryColor }]}
          >
            <View style={estilos.circuloDecorativo1} />
            <View style={estilos.circuloDecorativo2} />

            <Text style={estilos.etiquetaIcfes}>TU PUNTAJE ACTUAL</Text>

            <View style={estilos.filaBadge}>
              <View style={estilos.contenedorBadgesIzquierda}>
                <View style={estilos.badgeRangoPro}>
                  <Ionicons name="trophy" size={12} color="#FFF" />
                  <Text style={estilos.textoBadge}> {puntajeActual >= 350 ? 'Rango Pro' : 'En Entrenamiento'}</Text>
                </View>
                <View style={estilos.badgeUltimo}>
                  <Ionicons name="time-outline" size={13} color="#FFF" />
                  <Text style={estilos.textoBadge}> Último: {ultimoPuntaje}</Text>
                </View>
              </View>
              <View style={estilos.iconoTendencia}>
                <Ionicons name="trending-up" size={32} color="rgba(255,255,255,0.15)" />
              </View>
            </View>

            {/* PUNTAJE DINÁMICO RECIÉN CALCULADO */}
            <View style={estilos.filaPuntaje}>
              <Text style={estilos.puntajeGrande}>{puntajeActual}</Text>
              <Text style={estilos.puntajeTotal}> / {puntajeMeta}</Text>
            </View>

            {/* BARRA ANIMADA CON PROGRESO REAL */}
            <View style={estilos.barraContenedor}>
              <Animated.View style={[estilos.barraRelleno, { width: anchoBarraPorcentaje }]} />
            </View>

            <View style={estilos.badgeTop}>
              <Ionicons name="flash" size={13} color="#F59E0B" />
              <Text style={estilos.textoTop}> 
                {puntajeActual >= puntajeMeta 
                  ? ' ¡Alcanzaste tu meta!' 
                  : ` A ${puntajeMeta - puntajeActual} puntos de tu meta`}
              </Text>
            </View>

            {/* CAJA DE METAS */}
            <View style={estilos.cajaMeta}>
              <View style={estilos.iconoMeta}>
                <Ionicons name="flag" size={18} color="#FFF" />
              </View>
              <View style={estilos.textosMeta}>
                <Text style={estilos.etiquetaMeta}>TU GRAN META</Text>
                <Text style={estilos.textoMeta} numberOfLines={1}>{carreraMeta}</Text>
                <Text style={estilos.textoSubMeta} numberOfLines={1}>{universidadMeta}</Text>
              </View>
            </View>
          </AnimatedGradient>
        </Animated.View>

        {/* ── ÁREAS DE ESTUDIO ── */}
        <View style={estilos.seccionMaterias}>
          <View style={estilos.encabezadoSeccion}>
            <Text style={[estilos.tituloSeccion, { color: colors.text }]}>Áreas de Estudio</Text>
            <TouchableOpacity>
              <Text style={[estilos.enlaceVerTodo, { color: primaryColor }]}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={estilos.cuadriculaMaterias}>
            {areasEstudio.map((area) => (
              <TouchableOpacity 
                key={area.id} 
                style={[estilos.tarjetaMateria, { backgroundColor: colors.card }]} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MotorMateria', { materia: area.nombre })}
              >
                <LinearGradient colors={area.gradiente} style={estilos.iconoAreaContenedor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <MaterialCommunityIcons name={area.icono} size={30} color="#FFF" />
                </LinearGradient>
                <Text style={[estilos.nombreArea, { color: colors.text }]} numberOfLines={2}>{area.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── BARRA DE NAVEGACIÓN INFERIOR ── */}
      <View style={[estilos.barraNavegacion, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={estilos.itemNavActivo}>
          <View style={[estilos.circuloNavActivo, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <Ionicons name="home" size={22} color="#FFF" />
          </View>
          <Text style={[estilos.textoNavActivo, { color: primaryColor }]}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNav} onPress={() => navigation.replace('PantallaProgreso')}>
          <Ionicons name="trending-up-outline" size={24} color={colors.iconSecondary} />
          <Text style={[estilos.textoNav, { color: colors.iconSecondary }]}>Progreso</Text>
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
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },
  
  // ENCABEZADO
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  textosEncabezado: { flex: 1, paddingRight: 12 },
  filaHola: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  saludo: { fontSize: 26, fontWeight: '800', color: '#0F172A', lineHeight: 32 },
  saludoNombre: { fontSize: 26, fontWeight: '800', color: '#4648d4' },
  emoji: { fontSize: 24, marginTop: 2 },
  subtituloMotivacion: { fontSize: 13, color: '#64748B', marginTop: 6, lineHeight: 18 },
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

  // TARJETA ICFES
  tarjetaIcfes: { borderRadius: 28, padding: 22, marginBottom: 28, overflow: 'hidden', elevation: 10, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16 },
  circuloDecorativo1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40 },
  circuloDecorativo2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -20, left: -20 },
  filaBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contenedorBadgesIzquierda: { flexDirection: 'row', gap: 8 },
  badgeRangoPro: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeUltimo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  textoBadge: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  iconoTendencia: { position: 'absolute', right: -10, top: -20, opacity: 0.9 },
  etiquetaIcfes: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  filaPuntaje: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  puntajeGrande: { fontSize: 54, fontWeight: '900', color: '#FFF', lineHeight: 60 },
  puntajeTotal: { fontSize: 20, fontWeight: '500', color: 'rgba(255,255,255,0.65)', marginBottom: 8 },
  barraContenedor: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' },
  barraRelleno: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  badgeTop: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 16 },
  textoTop: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  cajaMeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 18 },
  iconoMeta: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textosMeta: { flex: 1 },
  etiquetaMeta: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 1, marginBottom: 3 },
  textoMeta: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  textoSubMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: 2 },
  
  // MATERIAS
  seccionMaterias: { marginBottom: 16 },
  encabezadoSeccion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tituloSeccion: { fontSize: 20, fontWeight: '800', color: '#111827' },
  enlaceVerTodo: { color: '#4648d4', fontSize: 14, fontWeight: '600' },
  cuadriculaMaterias: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  tarjetaMateria: { width: '47%', backgroundColor: '#FFF', borderRadius: 22, paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  iconoAreaContenedor: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  nombreArea: { fontSize: 14, fontWeight: '700', color: '#1F2937', textAlign: 'center', lineHeight: 19 },
  
  // BARRA NAVEGACIÓN
  barraNavegacion: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFF', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 26 : 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15 },
  itemNavActivo: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  circuloNavActivo: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#4648d4', justifyContent: 'center', alignItems: 'center', marginBottom: 4, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  textoNavActivo: { fontSize: 11, color: '#4648d4', fontWeight: '700' },
  itemNav: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  textoNav: { fontSize: 11, marginTop: 4, color: '#9CA3AF', fontWeight: '500' }
});