import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contextos/ThemeContext';

// Configuración por materia (colores y nombres para la tabla de Supabase)
const CONFIG_MATERIAS = {
  'Lectura Crítica':   { gradiente: ['#4648d4', '#6366f1'], icono: 'book-outline',    supabaseNombre: 'Lectura Crítica' },
  'Matemáticas':       { gradiente: ['#E84E0F', '#F97316'], icono: 'calculator-outline', supabaseNombre: 'Matemáticas' },
  'Sociales':          { gradiente: ['#059669', '#10B981'], icono: 'earth-outline',    supabaseNombre: 'Sociales' },
  'Ciencias Nat.':     { gradiente: ['#DC2626', '#F87171'], icono: 'flask-outline',    supabaseNombre: 'Ciencias Naturales' },
  'Inglés':            { gradiente: ['#1E40AF', '#2563EB'], icono: 'language-outline', supabaseNombre: 'Inglés' },
};

const TOTAL_PREGUNTAS = 20;
const TIEMPO_MINUTOS = 20; // 20 minutos para 20 preguntas

export default function MotorMateria({ route, navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();

  const materia = route.params?.materia || 'Lectura Crítica';
  const config = CONFIG_MATERIAS[materia] || CONFIG_MATERIAS['Lectura Crítica'];
  const colorMateria = config.gradiente[0];

  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados del examen
  const [indiceActual, setIndiceActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenTerminado, setExamenTerminado] = useState(false);

  // Revisión
  const [modalRevision, setModalRevision] = useState(false);
  const [reporteDetallado, setReporteDetallado] = useState([]);
  const [correctas, setCorrectas] = useState(0);

  // Temporizador
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_MINUTOS * 60);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  useEffect(() => {
    if (cargando || examenTerminado || preguntas.length === 0) return;

    if (tiempoRestante <= 0) {
      finalizarPractica();
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante, cargando, examenTerminado, preguntas.length]);

  const cargarPreguntas = async () => {
    try {
      // Trae preguntas al azar de la materia seleccionada
      const { data, error } = await supabase
        .from('preguntas')
        .select('*')
        .eq('materia', config.supabaseNombre)
        .limit(TOTAL_PREGUNTAS);

      if (error) throw error;
      setPreguntas(data || []);
    } catch (error) {
      console.log('Error cargando preguntas de materia:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs < 10 ? '0' : ''}${segs}`;
  };

  const seleccionarOpcion = (letra) => {
    setOpcionSeleccionada(letra);
  };

  const avanzarPregunta = () => {
    const nuevasRespuestas = {
      ...respuestasUsuario,
      [preguntas[indiceActual].id]: opcionSeleccionada
    };
    
    setRespuestasUsuario(nuevasRespuestas);
    setOpcionSeleccionada(null);

    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      finalizarPractica(nuevasRespuestas);
    }
  };

  const finalizarPractica = async (respuestasFinales = respuestasUsuario) => {
    setCargando(true);

    // Calcular puntaje
    let aciertos = 0;
    const reporte = preguntas.map((p) => {
      const seleccionada = respuestasFinales[p.id] || 'Ninguna';
      let esCorrecta = false;
      if (seleccionada !== 'Ninguna') {
        const letraSeleccionada = seleccionada.trim().toUpperCase();
        const correctaDB = String(p.respuesta_correcta || '').trim();
        // Compara letra (Ej: 'A' === 'A') o si el texto de la opción seleccionada coincide con respuesta_correcta
        const textoOpcionSeleccionada = p[`opcion_${letraSeleccionada.toLowerCase()}`] || '';
        
        esCorrecta = (letraSeleccionada === correctaDB.toUpperCase()) || 
                     (textoOpcionSeleccionada.trim() !== '' && textoOpcionSeleccionada.trim().toLowerCase() === correctaDB.toLowerCase());
      }
      if (esCorrecta) aciertos++;

      return {
        pregunta: p.texto_pregunta,
        materia: p.materia,
        correcta: p.respuesta_correcta,
        seleccionada: seleccionada,
        justificacion: p.justificacion
      };
    });

    setCorrectas(aciertos);
    setReporteDetallado(reporte);

    // Guardar resultado como práctica (NO afecta el promedio ICFES)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('resultados_practicas').insert({
          usuario_id: user.id,
          materia: config.supabaseNombre,
          correctas: aciertos,
          total_preguntas: preguntas.length,
          detalle_respuestas: reporte,
        });

        if (error) {
          console.log('Error insertando en supabase:', error);
          alert('Error al guardar: Asegúrate de haber creado la tabla "resultados_practicas" en Supabase.');
        }
      }
    } catch (error) {
      console.log('Error guardando práctica:', error.message);
      alert('Error guardando práctica: ' + error.message);
    }

    setCargando(false);
    setExamenTerminado(true);
  };

  // ─── PANTALLA DE CARGA ───
  if (cargando) {
    return (
      <View style={[estilos.pantallaCentrada, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colorMateria} />
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14 * fontSizeScale }}>
          Preparando práctica de {materia}...
        </Text>
      </View>
    );
  }

  // ─── SIN PREGUNTAS ───
  if (preguntas.length === 0) {
    return (
      <View style={[estilos.pantallaCentrada, { backgroundColor: colors.background }]}>
        <View style={[estilos.iconoVacio, { backgroundColor: colorMateria + '15' }]}>
          <Ionicons name={config.icono} size={48} color={colorMateria} />
        </View>
        <Text style={[estilos.tituloVacio, { color: colors.text, fontSize: 22 * fontSizeScale }]}>
          Próximamente
        </Text>
        <Text style={[estilos.textoVacio, { color: colors.textSecondary, fontSize: 15 * fontSizeScale }]}>
          Aún no hay preguntas de {materia} en la base de datos. Pronto las agregaremos.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[estilos.btnVolverVacio, { backgroundColor: colorMateria }]}
        >
          <Ionicons name="arrow-back" size={18} color="#FFF" />
          <Text style={[estilos.textoBtnVolverVacio, { fontSize: 15 * fontSizeScale }]}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── PANTALLA DE RESULTADOS ───
  if (examenTerminado) {
    const porcentaje = Math.round((correctas / preguntas.length) * 100);
    const emojiResultado = porcentaje >= 80 ? '🏆' : porcentaje >= 60 ? '💪' : porcentaje >= 40 ? '📚' : '🔥';

    return (
      <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorResultado}>
          
          <LinearGradient colors={config.gradiente} style={estilos.tarjetaResultado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={estilos.circuloDecor1} />
            <View style={estilos.circuloDecor2} />
            
            <Text style={estilos.emojiResultado}>{emojiResultado}</Text>
            <Text style={estilos.tituloResultado}>Práctica Finalizada</Text>
            <Text style={estilos.subtituloResultado}>{materia}</Text>

            <View style={estilos.filaPuntaje}>
              <Text style={estilos.numeroPuntaje}>{correctas}</Text>
              <Text style={estilos.separadorPuntaje}>/</Text>
              <Text style={estilos.totalPuntaje}>{preguntas.length}</Text>
            </View>

            <View style={estilos.barraResultado}>
              <View style={[estilos.barraRellenoResultado, { width: `${porcentaje}%` }]} />
            </View>
            <Text style={estilos.textoPorcentaje}>{porcentaje}% de aciertos</Text>
          </LinearGradient>

          <View style={estilos.filaAcciones}>
            <TouchableOpacity 
              style={[estilos.btnAccion, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setModalRevision(true)}
            >
              <Ionicons name="eye-outline" size={20} color={colorMateria} />
              <Text style={[estilos.textoAccion, { color: colors.text, fontSize: 14 * fontSizeScale }]}>Ver Revisión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[estilos.btnAccion, { backgroundColor: colorMateria }]}
              onPress={() => navigation.replace('PantallaPrincipal')}
            >
              <Ionicons name="home-outline" size={20} color="#FFF" />
              <Text style={[estilos.textoAccion, { color: '#FFF', fontSize: 14 * fontSizeScale }]}>Ir al Inicio</Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje motivacional */}
          <View style={[estilos.cajaMensaje, { backgroundColor: colorMateria + '12', borderColor: colorMateria + '25' }]}>
            <Ionicons name="bulb" size={20} color={colorMateria} />
            <Text style={[estilos.textoMensaje, { color: colors.text, fontSize: 14 * fontSizeScale }]}>
              {porcentaje >= 80 
                ? '¡Excelente dominio! Estás muy bien preparado en esta materia.'
                : porcentaje >= 60 
                ? '¡Buen trabajo! Sigue practicando para perfeccionar tus respuestas.'
                : 'Practica más esta materia. Cada intento te acerca a tu meta.'}
            </Text>
          </View>
        </ScrollView>

        {/* ─── MODAL DE REVISIÓN ─── */}
        <Modal visible={modalRevision} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalRevision(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[estilos.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[estilos.modalTitulo, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Revisión - {materia}</Text>
              <TouchableOpacity onPress={() => setModalRevision(false)} style={[estilos.btnCerrarModal, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <LinearGradient colors={config.gradiente} style={estilos.resumenRevision}>
                <Text style={estilos.textoResumenRevision}>{correctas} de {preguntas.length} correctas</Text>
              </LinearGradient>

              {reporteDetallado.map((resp, idx) => {
                let esCorrecta = false;
                if (resp.seleccionada !== 'Ninguna') {
                  const letraSeleccionada = resp.seleccionada.trim().toUpperCase();
                  const correctaDB = String(resp.correcta || '').trim();
                  // Usamos la pregunta original de la lista para obtener el texto de la opción
                  const pOriginal = preguntas[idx];
                  const textoOpcionSeleccionada = pOriginal ? (pOriginal[`opcion_${letraSeleccionada.toLowerCase()}`] || '') : '';
                  
                  esCorrecta = (letraSeleccionada === correctaDB.toUpperCase()) || 
                               (textoOpcionSeleccionada.trim() !== '' && textoOpcionSeleccionada.trim().toLowerCase() === correctaDB.toLowerCase());
                }
                return (
                  <View key={idx} style={[estilos.tarjetaRevision, { backgroundColor: colors.card, borderColor: esCorrecta ? '#10B981' : '#EF4444' }]}>
                    <View style={estilos.headerRevision}>
                      <View style={[estilos.numeroPregRevision, { backgroundColor: colorMateria + '15' }]}>
                        <Text style={[estilos.textoNumeroRevision, { color: colorMateria }]}>{idx + 1}</Text>
                      </View>
                      <Ionicons name={esCorrecta ? "checkmark-circle" : "close-circle"} size={24} color={esCorrecta ? '#10B981' : '#EF4444'} />
                    </View>
                    
                    <Text style={[estilos.preguntaRevision, { color: colors.text, fontSize: 15 * fontSizeScale }]}>{resp.pregunta}</Text>
                    
                    <Text style={[estilos.textoRespuesta, { color: colors.textSecondary }]}>
                      Tu respuesta: <Text style={{ color: esCorrecta ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{resp.seleccionada}</Text>
                    </Text>
                    
                    {!esCorrecta && (
                      <Text style={[estilos.textoRespuesta, { color: colors.textSecondary }]}>
                        Respuesta correcta: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>{resp.correcta}</Text>
                      </Text>
                    )}

                    {resp.justificacion && (
                      <View style={[estilos.cajaJustificacion, { backgroundColor: colorMateria + '08' }]}>
                        <Ionicons name="bulb" size={16} color={colorMateria} />
                        <Text style={[estilos.textoJustificacion, { color: colors.text, fontSize: 13 * fontSizeScale }]}>{resp.justificacion}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─── PANTALLA DEL EXAMEN ACTIVO ───
  const preguntaActiva = preguntas[indiceActual];
  const opciones = [
    { letra: 'A', texto: preguntaActiva.opcion_a },
    { letra: 'B', texto: preguntaActiva.opcion_b },
    { letra: 'C', texto: preguntaActiva.opcion_c },
    { letra: 'D', texto: preguntaActiva.opcion_d },
  ];

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      {/* BARRA SUPERIOR */}
      <View style={[estilos.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.btnSalir}>
          <Ionicons name="close" size={24} color={colors.iconSecondary} />
        </TouchableOpacity>
        
        <View style={estilos.infoCentro}>
          <Text style={[estilos.textoContador, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>
            Pregunta {indiceActual + 1} de {preguntas.length}
          </Text>
          <View style={[estilos.barraProgresoFondo, { backgroundColor: colors.border }]}>
            <View style={[estilos.barraProgresoRelleno, { backgroundColor: colorMateria, width: `${((indiceActual + 1) / preguntas.length) * 100}%` }]} />
          </View>
        </View>

        <View style={[estilos.cajaTiempo, { backgroundColor: colorMateria + '15' }]}>
          <Ionicons name="time-outline" size={18} color={tiempoRestante < 60 ? '#EF4444' : colorMateria} />
          <Text style={[estilos.textoTiempo, { color: tiempoRestante < 60 ? '#EF4444' : colorMateria }]}>
            {formatearTiempo(tiempoRestante)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.contenedorScroll}>
        {/* BADGE DE MATERIA */}
        <View style={[estilos.badgeMateria, { backgroundColor: colorMateria + '15' }]}>
          <Text style={[estilos.textoBadge, { color: colorMateria, fontSize: 12 * fontSizeScale }]}>{materia}</Text>
        </View>

        {/* TEXTO DE LA PREGUNTA */}
        <Text style={[estilos.textoPregunta, { color: colors.text, fontSize: 20 * fontSizeScale }]}>{preguntaActiva.texto_pregunta}</Text>

        {/* OPCIONES */}
        <View style={estilos.contenedorOpciones}>
          {opciones.map((opc) => {
            const esSeleccionada = opcionSeleccionada === opc.letra;
            return (
              <TouchableOpacity 
                key={opc.letra}
                style={[
                  estilos.botonOpcion, 
                  { backgroundColor: colors.card, borderColor: esSeleccionada ? colorMateria : colors.border }
                ]}
                onPress={() => seleccionarOpcion(opc.letra)}
                activeOpacity={0.7}
              >
                <View style={[estilos.circuloLetra, { backgroundColor: esSeleccionada ? colorMateria : colors.background }]}>
                  <Text style={[estilos.textoLetra, { color: esSeleccionada ? '#FFF' : colors.textSecondary }]}>{opc.letra}</Text>
                </View>
                <Text style={[estilos.textoOpcion, { color: esSeleccionada ? colors.text : colors.textSecondary, fontWeight: esSeleccionada ? '700' : '500' }]}>{opc.texto}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[estilos.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[estilos.btnSiguiente, !opcionSeleccionada && estilos.btnSiguienteDeshabilitado]}
          onPress={avanzarPregunta}
          disabled={!opcionSeleccionada}
        >
          <LinearGradient
            colors={opcionSeleccionada ? config.gradiente : [colors.border, colors.border]}
            style={estilos.gradienteSiguiente}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={[estilos.textoSiguiente, { color: opcionSeleccionada ? '#FFF' : colors.iconSecondary, fontSize: 16 * fontSizeScale }]}>
              {indiceActual === preguntas.length - 1 ? 'Finalizar Práctica' : 'Siguiente Pregunta'}
            </Text>
            {opcionSeleccionada && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  pantallaCentrada: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

  // Pantalla vacía
  iconoVacio: { width: 96, height: 96, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  tituloVacio: { fontWeight: '900', marginBottom: 8 },
  textoVacio: { textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 },
  btnVolverVacio: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 8 },
  textoBtnVolverVacio: { color: '#FFF', fontWeight: '700' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  btnSalir: { padding: 5 },
  infoCentro: { flex: 1, alignItems: 'center', paddingHorizontal: 15 },
  textoContador: { fontWeight: '700', marginBottom: 6 },
  barraProgresoFondo: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  barraProgresoRelleno: { height: '100%', borderRadius: 3 },
  cajaTiempo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  textoTiempo: { marginLeft: 4, fontWeight: '800', fontSize: 13 },

  // Pregunta
  badgeMateria: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  textoBadge: { fontWeight: '800' },
  textoPregunta: { fontWeight: '700', lineHeight: 30, marginBottom: 30 },

  // Opciones
  contenedorOpciones: { gap: 16 },
  botonOpcion: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  circuloLetra: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textoLetra: { fontSize: 16, fontWeight: '800' },
  textoOpcion: { flex: 1, fontSize: 16, lineHeight: 24 },

  // Footer
  footer: { padding: 20, borderTopWidth: 1 },
  btnSiguiente: { borderRadius: 16, overflow: 'hidden' },
  btnSiguienteDeshabilitado: { opacity: 0.7 },
  gradienteSiguiente: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  textoSiguiente: { fontWeight: '800' },

  // Resultados
  contenedorResultado: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 50 },
  tarjetaResultado: { borderRadius: 28, padding: 28, marginBottom: 24, overflow: 'hidden', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  circuloDecor1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },
  circuloDecor2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -20, left: -20 },
  emojiResultado: { fontSize: 56, marginBottom: 12 },
  tituloResultado: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  subtituloResultado: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 24 },
  filaPuntaje: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  numeroPuntaje: { fontSize: 56, fontWeight: '900', color: '#FFF', lineHeight: 60 },
  separadorPuntaje: { fontSize: 24, color: 'rgba(255,255,255,0.6)', marginHorizontal: 4, marginBottom: 8 },
  totalPuntaje: { fontSize: 24, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 8 },
  barraResultado: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barraRellenoResultado: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  textoPorcentaje: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' },

  filaAcciones: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btnAccion: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  textoAccion: { fontWeight: '700' },

  cajaMensaje: { flexDirection: 'row', padding: 16, borderRadius: 18, borderWidth: 1, gap: 12, alignItems: 'flex-start' },
  textoMensaje: { flex: 1, fontWeight: '600', lineHeight: 22 },

  // Modal revisión
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitulo: { fontWeight: '800' },
  btnCerrarModal: { padding: 6, borderRadius: 20 },
  resumenRevision: { padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  textoResumenRevision: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  tarjetaRevision: { padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderLeftWidth: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  headerRevision: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  numeroPregRevision: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  textoNumeroRevision: { fontWeight: '800', fontSize: 14 },
  preguntaRevision: { fontWeight: '700', marginBottom: 12, lineHeight: 22 },
  textoRespuesta: { fontSize: 14, marginBottom: 4 },
  cajaJustificacion: { flexDirection: 'row', padding: 12, borderRadius: 12, marginTop: 10, gap: 8 },
  textoJustificacion: { flex: 1, lineHeight: 18 },
});
