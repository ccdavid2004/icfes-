import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../servicios/supabase';

export default function PantallaOnboarding({ navigation }) {
  const [pasoActual, setPasoActual] = useState(1);
  const [cargando, setCargando] = useState(false);
  
  // Estados para las respuestas
  const [carrera, setCarrera] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [puntaje, setPuntaje] = useState('');

  // Animaciones principales
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progresoAnim = useRef(new Animated.Value(0.33)).current;
  const botonPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de la barra superior
    Animated.timing(progresoAnim, {
      toValue: pasoActual / 3,
      duration: 300,
      useNativeDriver: false, 
    }).start();

    // Animación de pulso para el botón continuar
    Animated.loop(
      Animated.sequence([
        Animated.timing(botonPulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(botonPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

  }, [pasoActual]);

  const cambiarPasoAnimado = (nuevoPaso) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -15, duration: 200, useNativeDriver: true })
    ]).start(() => {
      setPasoActual(nuevoPaso);
      slideAnim.setValue(15); // Prepara para que entre desde abajo
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, bounciness: 10, useNativeDriver: true })
      ]).start();
    });
  };

  const siguientePaso = () => {
    if (pasoActual === 1 && carrera.trim() === '') return;
    if (pasoActual === 2 && universidad.trim() === '') return;
    
    if (pasoActual < 3) {
      cambiarPasoAnimado(pasoActual + 1);
    } else {
      guardarDatosEnSupabase();
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 15, duration: 200, useNativeDriver: true })
      ]).start(() => {
        setPasoActual(pasoActual - 1);
        slideAnim.setValue(-15);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, bounciness: 10, useNativeDriver: true })
        ]).start();
      });
    }
  };

  const guardarDatosEnSupabase = async () => {
    if (puntaje.trim() === '') return;
    setCargando(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // AQUÍ ESTÁ LA MAGIA: upsert() en lugar de update()
        const { error } = await supabase
          .from('usuarios')
          .upsert({
            id: user.id, // ¡Obligatorio pasarle el ID del usuario!
            carrera_meta: carrera,
            universidad_meta: universidad,
            puntaje_meta: parseInt(puntaje),
            onboarding_completado: true 
          });

        if (error) throw error;
        navigation.replace('PantallaPrincipal'); 
      }
    } catch (error) {
      console.log('Error guardando onboarding:', error.message);
      setCargando(false);
    }
  };
  const anchoProgreso = progresoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={estilos.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* FONDO ANIMADO INTEGRADO */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={StyleSheet.absoluteFillObject} />
        <View style={estilos.burbujaTop} />
        <View style={estilos.burbujaBottom} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.container}
      >
        {/* BARRA DE PROGRESO SUPERIOR */}
        <View style={estilos.header}>
          {pasoActual > 1 ? (
            <TouchableOpacity onPress={pasoAnterior} style={estilos.btnAtras}>
              <Ionicons name="chevron-back" size={28} color="#0F172A" />
            </TouchableOpacity>
          ) : <View style={estilos.btnAtrasPlaceholder} />}
          
          <View style={estilos.barraFondo}>
            <Animated.View style={[estilos.barraRelleno, { width: anchoProgreso }]} />
          </View>
          <View style={estilos.badgePaso}>
             <Text style={estilos.textoPasos}>{pasoActual}/3</Text>
          </View>
        </View>

        {/* CONTENIDO ANIMADO */}
        <Animated.View style={[estilos.contenido, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {pasoActual === 1 && (
            <View style={estilos.pasoContainer}>
              <View style={[estilos.iconoContainer, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="rocket" size={45} color="#4F46E5" />
              </View>
              <Text style={estilos.titulo}>Tu viaje comienza aquí</Text>
              <Text style={estilos.subtitulo}>¿Qué carrera sueñas con estudiar?</Text>
              
              <View style={estilos.tarjetaInput}>
                <TextInput
                  style={estilos.input}
                  placeholder="Ej: Ingeniería de Sistemas"
                  placeholderTextColor="#94A3B8"
                  value={carrera}
                  onChangeText={setCarrera}
                  autoFocus
                />
              </View>
            </View>
          )}

          {pasoActual === 2 && (
            <View style={estilos.pasoContainer}>
              <View style={[estilos.iconoContainer, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="business" size={45} color="#DB2777" />
              </View>
              <Text style={estilos.titulo}>El lugar importa</Text>
              <Text style={estilos.subtitulo}>¿En qué universidad visualizas tu futuro?</Text>
              
              <View style={estilos.tarjetaInput}>
                <TextInput
                  style={estilos.input}
                  placeholder="Ej: Universidad de Nariño"
                  placeholderTextColor="#94A3B8"
                  value={universidad}
                  onChangeText={setUniversidad}
                  autoFocus
                />
              </View>
            </View>
          )}

          {pasoActual === 3 && (
            <View style={estilos.pasoContainer}>
              <View style={[estilos.iconoContainer, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="stats-chart" size={45} color="#059669" />
              </View>
              <Text style={estilos.titulo}>Apunta a lo más alto</Text>
              <Text style={estilos.subtitulo}>¿Cuál es el puntaje ICFES que necesitas?</Text>
              
              <View style={estilos.tarjetaInput}>
                <Text style={estilos.prefijoInput}>Ptos.</Text>
                <TextInput
                  style={[estilos.input, { flex: 1, textAlign: 'left', paddingLeft: 10 }]}
                  placeholder="Ej: 350"
                  placeholderTextColor="#94A3B8"
                  value={puntaje}
                  onChangeText={setPuntaje}
                  keyboardType="numeric"
                  maxLength={3}
                  autoFocus
                />
              </View>
            </View>
          )}

        </Animated.View>

        {/* BOTÓN INFERIOR */}
        <Animated.View style={[estilos.footer, { transform: [{ scale: botonPulseAnim }] }]}>
          <TouchableOpacity 
            style={[
              estilos.btnSiguiente, 
              ((pasoActual === 1 && !carrera) || (pasoActual === 2 && !universidad) || (pasoActual === 3 && !puntaje)) && estilos.btnSiguienteDeshabilitado
            ]} 
            onPress={siguientePaso}
            disabled={cargando}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4648d4', '#9013fe']}
              style={estilos.btnGradiente}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            >
              {cargando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={estilos.textoBtnSiguiente}>
                    {pasoActual === 3 ? '¡Comenzar mi preparación!' : 'Siguiente paso'}
                  </Text>
                  {pasoActual < 3 && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{marginLeft: 8}} />}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 0 
  },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 10 },
  
  // Decoración de Fondo (Glassmorphism bg)
  burbujaTop: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  burbujaBottom: { position: 'absolute', bottom: -50, left: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(168, 85, 247, 0.15)' },

  // Header / Progreso
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnAtras: { padding: 4, marginRight: 16 },
  btnAtrasPlaceholder: { width: 36, marginRight: 16 }, 
  barraFondo: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  barraRelleno: { height: '100%', backgroundColor: '#4648d4', borderRadius: 4 },
  badgePaso: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 16 },
  textoPasos: { color: '#0F172A', fontWeight: '800', fontSize: 13 },

  // Contenido
  contenido: { flex: 1, justifyContent: 'center' },
  pasoContainer: { alignItems: 'center', width: '100%' },
  iconoContainer: { width: 90, height: 90, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  titulo: { fontSize: 32, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  subtitulo: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  
  // Tarjetas Input
  tarjetaInput: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  input: { flex: 1, color: '#0F172A', fontSize: 20, fontWeight: '700', paddingVertical: 16, textAlign: 'center' },
  prefijoInput: { fontSize: 20, fontWeight: '800', color: '#CBD5E1' },

  // Footer / Botón
  footer: { paddingBottom: 30 },
  btnSiguiente: { borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#4648d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 },
  btnSiguienteDeshabilitado: { opacity: 0.5, shadowOpacity: 0 },
  btnGradiente: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  textoBtnSiguiente: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }
});