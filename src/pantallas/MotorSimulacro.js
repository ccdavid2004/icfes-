import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../servicios/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function MotorSimulacro({ route, navigation }) {
  // Recibimos parámetros de la pantalla anterior (nivel, cantidad de preguntas, etc.)
  // Si no vienen, ponemos valores por defecto para probar.
  const cantidadPreguntas = route.params?.cantidad || 5; 
  const tiempoMinutos = route.params?.tiempo || 5; 
  const nivelSimulacro = route.params?.nivel || 'Fácil'; // <-- ASEGÚRATE DE TENER ESTA LÍNEA

  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados del examen
  const [indiceActual, setIndiceActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenTerminado, setExamenTerminado] = useState(false);
  
  // Temporizador en segundos
  const [tiempoRestante, setTiempoRestante] = useState(tiempoMinutos * 60);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  // Efecto para el temporizador
  useEffect(() => {
    if (cargando || examenTerminado) return;

    if (tiempoRestante <= 0) {
      finalizarExamen();
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante, cargando, examenTerminado]);

  const cargarPreguntas = async () => {
    try {
      const { data, error } = await supabase
        .from('preguntas')
        .select('*')
        .limit(cantidadPreguntas); // Trae solo las preguntas solicitadas

      if (error) throw error;
      setPreguntas(data);
    } catch (error) {
      console.log('Error cargando preguntas:', error.message);
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
    // Guardamos la respuesta del usuario
    setRespuestasUsuario({
      ...respuestasUsuario,
      [preguntas[indiceActual].id]: opcionSeleccionada
    });

    // Limpiamos la selección para la siguiente pregunta
    setOpcionSeleccionada(null);

    // Avanzamos o terminamos
    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      finalizarExamen();
    }
  };

const finalizarExamen = async () => {
    setCargando(true);
    const correctas = calcularPuntaje();
    
    const puntajeIcfes = Math.round((correctas / preguntas.length) * 500);

    const reporteDetallado = preguntas.map((p) => ({
      pregunta: p.texto_pregunta,
      materia: p.materia,
      correcta: p.respuesta_correcta,
      seleccionada: respuestasUsuario[p.id] || 'Ninguna',
      justificacion: p.justificacion
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('resultados_simulacros').insert({
          usuario_id: user.id,
          puntaje_icfes: puntajeIcfes,
          correctas: correctas,
          total_preguntas: preguntas.length,
          detalle_respuestas: reporteDetallado,
          nivel: nivelSimulacro // <-- ¡AQUÍ GUARDAMOS EL NIVEL!
        });
      }
    } catch (error) {
      console.log('Error al guardar resultado:', error.message);
    }

    setCargando(false);
    setExamenTerminado(true);
  };
  const calcularPuntaje = () => {
    let correctas = 0;
    preguntas.forEach((preg) => {
      if (respuestasUsuario[preg.id] === preg.respuesta_correcta) {
        correctas++;
      }
    });
    return correctas;
  };

  if (cargando) {
    return (
      <View style={estilos.pantallaCentrada}>
        <ActivityIndicator size="large" color="#4648d4" />
        <Text style={{marginTop: 10, color: '#64748B'}}>Preparando tu simulacro...</Text>
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View style={estilos.pantallaCentrada}>
        <Text style={{color: '#64748B'}}>No hay preguntas disponibles en la base de datos.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
          <Text style={{color: '#4648d4', fontWeight: 'bold'}}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // PANTALLA DE RESULTADOS (Cuando termina el examen)
  if (examenTerminado) {
    const correctas = calcularPuntaje();
    return (
      <SafeAreaView style={estilos.areaSegura}>
        <View style={estilos.pantallaCentrada}>
          <Ionicons name="trophy" size={80} color="#F59E0B" />
          <Text style={estilos.tituloTerminado}>¡Simulacro Finalizado!</Text>
          <Text style={estilos.textoTerminado}>
            Respondiste correctamente <Text style={{fontWeight: '900', color: '#10B981'}}>{correctas}</Text> de {preguntas.length} preguntas.
          </Text>
          
          <TouchableOpacity 
            style={estilos.btnVolver} 
            onPress={() => navigation.replace('PantallaPrincipal')}
          >
            <Text style={estilos.textoBtnVolver}>Regresar al Inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // PANTALLA DEL EXAMEN ACTIVO
  const preguntaActiva = preguntas[indiceActual];
  const opciones = [
    { letra: 'A', texto: preguntaActiva.opcion_a },
    { letra: 'B', texto: preguntaActiva.opcion_b },
    { letra: 'C', texto: preguntaActiva.opcion_c },
    { letra: 'D', texto: preguntaActiva.opcion_d },
  ];

  return (
    <SafeAreaView style={estilos.areaSegura} edges={['top']}>
      {/* BARRA SUPERIOR (Info y Cronómetro) */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.btnSalir}>
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={estilos.infoCentro}>
          <Text style={estilos.textoContador}>Pregunta {indiceActual + 1} de {preguntas.length}</Text>
          <View style={estilos.barraProgresoFondo}>
            <View style={[estilos.barraProgresoRelleno, { width: `${((indiceActual + 1) / preguntas.length) * 100}%` }]} />
          </View>
        </View>

        <View style={estilos.cajaTiempo}>
          <Ionicons name="time-outline" size={18} color={tiempoRestante < 60 ? '#EF4444' : '#4648d4'} />
          <Text style={[estilos.textoTiempo, tiempoRestante < 60 && { color: '#EF4444' }]}>
            {formatearTiempo(tiempoRestante)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.contenedorScroll}>
        {/* BADGE DE MATERIA */}
        <View style={estilos.badgeMateria}>
          <Text style={estilos.textoBadge}>{preguntaActiva.materia}</Text>
        </View>

        {/* TEXTO DE LA PREGUNTA */}
        <Text style={estilos.textoPregunta}>{preguntaActiva.texto_pregunta}</Text>

        {/* OPCIONES */}
        <View style={estilos.contenedorOpciones}>
          {opciones.map((opc) => {
            const esSeleccionada = opcionSeleccionada === opc.letra;
            return (
              <TouchableOpacity 
                key={opc.letra}
                style={[estilos.botonOpcion, esSeleccionada && estilos.botonOpcionActiva]}
                onPress={() => seleccionarOpcion(opc.letra)}
                activeOpacity={0.7}
              >
                <View style={[estilos.circuloLetra, esSeleccionada && estilos.circuloLetraActiva]}>
                  <Text style={[estilos.textoLetra, esSeleccionada && estilos.textoLetraActiva]}>{opc.letra}</Text>
                </View>
                <Text style={[estilos.textoOpcion, esSeleccionada && estilos.textoOpcionActiva]}>{opc.texto}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* FOOTER - BOTÓN SIGUIENTE */}
      <View style={estilos.footer}>
        <TouchableOpacity 
          style={[estilos.btnSiguiente, !opcionSeleccionada && estilos.btnSiguienteDeshabilitado]}
          onPress={avanzarPregunta}
          disabled={!opcionSeleccionada}
        >
          <LinearGradient
            colors={opcionSeleccionada ? ['#4648d4', '#6366f1'] : ['#E2E8F0', '#CBD5E1']}
            style={estilos.gradienteSiguiente}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={[estilos.textoSiguiente, !opcionSeleccionada && { color: '#94A3B8' }]}>
              {indiceActual === preguntas.length - 1 ? 'Finalizar Simulacro' : 'Siguiente Pregunta'}
            </Text>
            {opcionSeleccionada && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{marginLeft: 8}} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: '#F8FAFC' },
  pantallaCentrada: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC' },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  btnSalir: { padding: 5 },
  infoCentro: { flex: 1, alignItems: 'center', paddingHorizontal: 15 },
  textoContador: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  barraProgresoFondo: { width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  barraProgresoRelleno: { height: '100%', backgroundColor: '#4648d4', borderRadius: 3 },
  cajaTiempo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  textoTiempo: { marginLeft: 4, fontWeight: '800', color: '#4648d4', fontSize: 13 },

  // Pregunta
  badgeMateria: { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  textoBadge: { color: '#4F46E5', fontWeight: '800', fontSize: 12 },
  textoPregunta: { fontSize: 20, fontWeight: '700', color: '#0F172A', lineHeight: 30, marginBottom: 30 },

  // Opciones
  contenedorOpciones: { gap: 16 },
  botonOpcion: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  botonOpcionActiva: { borderColor: '#4648d4', backgroundColor: '#EEF2FF' },
  circuloLetra: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  circuloLetraActiva: { backgroundColor: '#4648d4' },
  textoLetra: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  textoLetraActiva: { color: '#FFF' },
  textoOpcion: { flex: 1, fontSize: 16, color: '#475569', fontWeight: '500', lineHeight: 24 },
  textoOpcionActiva: { color: '#0F172A', fontWeight: '700' },

  // Footer
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  btnSiguiente: { borderRadius: 16, overflow: 'hidden' },
  btnSiguienteDeshabilitado: { opacity: 0.7 },
  gradienteSiguiente: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  textoSiguiente: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  // Pantalla Terminado
  tituloTerminado: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginTop: 20, marginBottom: 10 },
  textoTerminado: { fontSize: 16, color: '#64748B', textAlign: 'center', paddingHorizontal: 30, marginBottom: 40 },
  btnVolver: { backgroundColor: '#4648d4', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  textoBtnVolver: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});