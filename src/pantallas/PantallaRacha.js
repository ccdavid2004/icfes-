import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../servicios/supabase';
import { useTheme } from '../contextos/ThemeContext';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// Convierte una fecha a string "YYYY-MM-DD" en hora local
const fechaAString = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
};

export default function PantallaRacha({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();
  const animacionPulso = useRef(new Animated.Value(1)).current;

  const [cargando, setCargando] = useState(true);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [totalSimulacros, setTotalSimulacros] = useState(0);
  const [diasSemana, setDiasSemana] = useState([
    { inicial: 'L', activo: false },
    { inicial: 'M', activo: false },
    { inicial: 'M', activo: false },
    { inicial: 'J', activo: false },
    { inicial: 'V', activo: false },
    { inicial: 'S', activo: false },
    { inicial: 'D', activo: false },
  ]);

  useEffect(() => {
    cargarDatos();
    iniciarAnimacionPulso();
  }, []);

  const iniciarAnimacionPulso = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacionPulso, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(animacionPulso, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  };

  const cargarDatos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Traemos TODOS los simulacros del usuario ordenados por fecha ascendente
      const { data: simulacros } = await supabase
        .from('resultados_simulacros')
        .select('creado_en')
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: true });

      if (!simulacros || simulacros.length === 0) {
        setCargando(false);
        return;
      }

      setTotalSimulacros(simulacros.length);

      // Obtenemos los días únicos (sin repetir) en que hizo simulacros
      const diasUnicos = [...new Set(simulacros.map(s => fechaAString(s.creado_en)))];

      // ── CÁLCULO DE RACHA ACTUAL ──
      // Contamos hacia atrás desde hoy cuántos días consecutivos hay
      let racha = 0;
      const hoy = fechaAString(new Date());
      let fechaRevisar = new Date();

      while (true) {
        const fechaStr = fechaAString(fechaRevisar);
        if (diasUnicos.includes(fechaStr)) {
          racha++;
          fechaRevisar.setDate(fechaRevisar.getDate() - 1);
        } else {
          // Si hoy no estudió todavía, revisamos ayer
          if (fechaStr === hoy && racha === 0) {
            fechaRevisar.setDate(fechaRevisar.getDate() - 1);
            // revisamos si ayer rompió la racha
            const ayer = fechaAString(fechaRevisar);
            if (!diasUnicos.includes(ayer)) break;
          } else {
            break;
          }
        }
      }
      setRachaActual(racha);

      // ── CÁLCULO DE MEJOR RACHA ──
      let maxRacha = 1;
      let rachaTemp = 1;
      for (let i = 1; i < diasUnicos.length; i++) {
        const anterior = new Date(diasUnicos[i - 1]);
        const actual = new Date(diasUnicos[i]);
        const diff = (actual - anterior) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          rachaTemp++;
          if (rachaTemp > maxRacha) maxRacha = rachaTemp;
        } else {
          rachaTemp = 1;
        }
      }
      setMejorRacha(maxRacha);

      // ── DÍAS DE LA SEMANA ACTUAL ──
      // Lunes = índice 0, Domingo = índice 6
      const hoyDate = new Date();
      const diaSemanaHoy = hoyDate.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      // Calculamos el lunes de la semana actual
      const lunes = new Date(hoyDate);
      const diffLunes = diaSemanaHoy === 0 ? -6 : 1 - diaSemanaHoy;
      lunes.setDate(hoyDate.getDate() + diffLunes);
      lunes.setHours(0, 0, 0, 0);

      const nuevoDiasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((inicial, i) => {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);
        const fechaStr = fechaAString(fecha);
        return { inicial, activo: diasUnicos.includes(fechaStr) };
      });
      setDiasSemana(nuevoDiasSemana);

    } catch (error) {
      console.log('Error cargando racha:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const diasActivos = diasSemana.filter(d => d.activo).length;

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>

        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botonVolver, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[estilos.tituloEncabezado, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Mi Racha</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* TARJETA PRINCIPAL DE FUEGO */}
        <Animated.View style={{ transform: [{ scale: animacionPulso }] }}>
          <AnimatedGradient
            colors={[primaryColor, primaryColor + 'D0', primaryColor + '99']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[estilos.tarjetaFuego, { shadowColor: primaryColor }]}
          >
            <View style={estilos.circulo1} />
            <View style={estilos.circulo2} />

            <Text style={estilos.etiquetaRacha}>RACHA ACTUAL</Text>

            <View style={estilos.contenedorFuego}>
              <Ionicons name="flame" size={64} color="rgba(255,255,255,0.9)" />
              <View style={estilos.columnaNumero}>
                <Text style={estilos.numeroRacha}>{rachaActual}</Text>
                <Text style={estilos.textoDias}>{rachaActual === 1 ? 'día seguido' : 'días seguidos'}</Text>
              </View>
            </View>

            <View style={estilos.barraProgreso}>
              <View style={[estilos.barraRelleno, { width: `${Math.min((diasActivos / 7) * 100, 100)}%` }]} />
            </View>
            <Text style={estilos.textoProgreso}>{diasActivos} de 7 días esta semana</Text>

            <View style={estilos.badgeMotivacion}>
              <Ionicons name="flash" size={13} color={primaryColor} />
              <Text style={[estilos.textoMotivacion, { color: primaryColor }]}>
                {' '}{rachaActual === 0 ? '¡Haz tu primer simulacro hoy!' : '¡Sigue así! Estás imparable'}
              </Text>
            </View>
          </AnimatedGradient>
        </Animated.View>

        {/* CALENDARIO SEMANAL */}
        <View style={[estilos.seccionCalendario, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Text style={[estilos.tituloSeccion, { color: colors.text, fontSize: 18 * fontSizeScale }]}>Esta Semana</Text>
          <View style={estilos.filaDias}>
            {diasSemana.map((dia, index) => (
              <View key={index} style={estilos.diaContenedor}>
                <View style={[
                  estilos.circuloDia,
                  dia.activo 
                    ? [estilos.circuloDiaActivo, { backgroundColor: primaryColor, shadowColor: primaryColor }] 
                    : [estilos.circuloDiaInactivo, { backgroundColor: colors.background, borderColor: colors.border }]
                ]}>
                  {dia.activo ? (
                    <Ionicons name="flame" size={16} color="#FFF" />
                  ) : (
                    <Text style={[estilos.textoDiaInicial, { color: colors.iconSecondary }]}>{dia.inicial}</Text>
                  )}
                </View>
                <Text style={[
                  estilos.textoDiaLabel,
                  dia.activo ? { color: primaryColor, fontWeight: '800' } : { color: colors.iconSecondary }
                ]}>{dia.inicial}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ESTADÍSTICAS */}
        <Text style={[estilos.tituloSeccion, { color: colors.text, fontSize: 18 * fontSizeScale }]}>Estadísticas</Text>
        <View style={estilos.cuadriculaStats}>
          <View style={[estilos.tarjetaStat, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[estilos.iconoStat, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="trophy" size={26} color={primaryColor} />
            </View>
            <Text style={[estilos.valorStat, { color: colors.text, fontSize: 28 * fontSizeScale }]}>{mejorRacha}</Text>
            <Text style={[estilos.labelStat, { color: colors.textSecondary }]}>Mejor{'\n'}Racha</Text>
          </View>

          <View style={[estilos.tarjetaStat, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[estilos.iconoStat, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="book" size={26} color={primaryColor} />
            </View>
            <Text style={[estilos.valorStat, { color: colors.text, fontSize: 28 * fontSizeScale }]}>{totalSimulacros}</Text>
            <Text style={[estilos.labelStat, { color: colors.textSecondary }]}>Simulacros{'\n'}Totales</Text>
          </View>

          <View style={[estilos.tarjetaStat, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[estilos.iconoStat, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="calendar" size={26} color={primaryColor} />
            </View>
            <Text style={[estilos.valorStat, { color: colors.text, fontSize: 28 * fontSizeScale }]}>{diasActivos}</Text>
            <Text style={[estilos.labelStat, { color: colors.textSecondary }]}>Días Esta{'\n'}Semana</Text>
          </View>
        </View>

        {/* MENSAJE MOTIVACIONAL FINAL */}
        <View style={[estilos.mensajeContenedor, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '30' }]}>
          <Ionicons name="star" size={18} color={primaryColor} />
          <Text style={[estilos.mensajeTexto, { color: colors.text }]}>
            {rachaActual === 0
              ? '¡Haz tu primer simulacro hoy y empieza tu racha!'
              : rachaActual >= 7
              ? '¡Increíble! Una semana perfecta. Eres una máquina de estudio.'
              : `¡A ${7 - rachaActual} días de completar la semana perfecta! Tú puedes.`}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },
  pantallaCarga: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  botonVolver: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tituloEncabezado: { fontSize: 20, fontWeight: '800', color: '#0F172A' },

  tarjetaFuego: { borderRadius: 28, padding: 24, marginBottom: 24, overflow: 'hidden', elevation: 12, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20 },
  circulo1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -50 },
  circulo2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -30, left: -30 },
  etiquetaRacha: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },
  contenedorFuego: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  columnaNumero: { marginLeft: 16 },
  numeroRacha: { fontSize: 72, fontWeight: '900', color: '#FFF', lineHeight: 76 },
  textoDias: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  barraProgreso: { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  barraRelleno: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  textoProgreso: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginBottom: 16 },
  badgeMotivacion: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  textoMotivacion: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },

  seccionCalendario: { backgroundColor: '#FFF', borderRadius: 24, padding: 22, marginBottom: 24, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  tituloSeccion: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  filaDias: { flexDirection: 'row', justifyContent: 'space-between' },
  diaContenedor: { alignItems: 'center', gap: 6 },
  circuloDia: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  circuloDiaActivo: { backgroundColor: '#FF6B35', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5 },
  circuloDiaInactivo: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  textoDiaInicial: { color: '#CBD5E1', fontWeight: '700', fontSize: 12 },
  textoDiaLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  textoDiaLabelActivo: { color: '#FF6B35', fontWeight: '800' },

  cuadriculaStats: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  tarjetaStat: { flex: 1, backgroundColor: '#FFF', borderRadius: 22, padding: 18, alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  iconoStat: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  valorStat: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  labelStat: { fontSize: 11, color: '#64748B', textAlign: 'center', fontWeight: '600', lineHeight: 15 },

  mensajeContenedor: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 18, padding: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: '#FDE68A' },
  mensajeTexto: { flex: 1, marginLeft: 10, fontSize: 14, color: '#92400E', fontWeight: '600', lineHeight: 20 },
});
