import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contextos/ThemeContext';

export default function PantallaAyudaSoporte({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();
  
  // Estado para manejar el acordeón de las preguntas frecuentes
  const [preguntaActiva, setPreguntaActiva] = useState(null);

  const preguntasFrecuentes = [
    {
      id: 1,
      pregunta: '¿Cómo se calculan los puntajes de los simulacros?',
      respuesta: 'Tus simulacros se evalúan usando una aproximación a la escala oficial del ICFES, dándote un puntaje ponderado sobre 500 según el número de respuestas correctas.'
    },
    {
      id: 2,
      pregunta: '¿Puedo cambiar mi meta después?',
      respuesta: '¡Sí! Puedes ir a "Ajustes > Perfil" en cualquier momento para modificar la carrera que deseas estudiar, la universidad o el puntaje ICFES meta.'
    },
    {
      id: 3,
      pregunta: '¿Qué pasa si cierro la app durante un simulacro?',
      respuesta: 'Si sales del simulacro, perderás el progreso actual. Recomendamos tomar los simulacros completos cuando tengas tiempo ininterrumpido disponible.'
    },
    {
      id: 4,
      pregunta: '¿Cómo funciona el sistema de rachas?',
      respuesta: 'Para mantener tu racha viva, necesitas completar al menos una sesión de estudio o simulacro cada día consecutivo. ¡No dejes que la llama se apague!'
    }
  ];

  const alternarPregunta = (id) => {
    setPreguntaActiva(preguntaActiva === id ? null : id);
  };

  const contactarSoporte = () => {
    Linking.openURL('mailto:soporte@icfesapp.com?subject=Ayuda%20y%20Soporte%20IcfesApp');
  };

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botonVolver, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[estilos.tituloEncabezado, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Ayuda y Soporte</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={[estilos.tituloPrincipal, { color: colors.text, fontSize: 24 * fontSizeScale }]}>¿Cómo podemos ayudarte hoy?</Text>
        <Text style={[estilos.subtitulo, { color: colors.textSecondary, fontSize: 15 * fontSizeScale }]}>Encuentra respuestas a las preguntas más comunes o contáctanos directamente.</Text>

        {/* TARJETAS DE CONTACTO RÁPIDO */}
        <View style={estilos.contenedorContacto}>
          <TouchableOpacity style={[estilos.tarjetaContacto, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={contactarSoporte}>
            <View style={[estilos.iconoContacto, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="mail" size={24} color={primaryColor} />
            </View>
            <Text style={[estilos.tituloContacto, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Escríbenos</Text>
            <Text style={[estilos.textoContacto, { color: colors.textSecondary }]}>Te responderemos pronto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.tarjetaContacto, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[estilos.iconoContacto, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#10B981" />
            </View>
            <Text style={[estilos.tituloContacto, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Chat en Vivo</Text>
            <Text style={[estilos.textoContacto, { color: colors.textSecondary }]}>Soporte inmediato</Text>
          </TouchableOpacity>
        </View>

        {/* PREGUNTAS FRECUENTES */}
        <Text style={[estilos.tituloSeccion, { color: colors.text, fontSize: 18 * fontSizeScale }]}>Preguntas Frecuentes</Text>
        
        <View style={[estilos.contenedorPreguntas, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          {preguntasFrecuentes.map((item, index) => {
            const activo = preguntaActiva === item.id;
            const esUltimo = index === preguntasFrecuentes.length - 1;

            return (
              <View key={item.id} style={[estilos.itemPregunta, !esUltimo && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <TouchableOpacity 
                  style={estilos.headerPregunta} 
                  activeOpacity={0.7} 
                  onPress={() => alternarPregunta(item.id)}
                >
                  <Text style={[estilos.textoPregunta, { color: colors.text, fontSize: 15 * fontSizeScale, fontWeight: activo ? '700' : '600' }]}>
                    {item.pregunta}
                  </Text>
                  <Ionicons 
                    name={activo ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={activo ? primaryColor : colors.iconSecondary} 
                  />
                </TouchableOpacity>
                
                {activo && (
                  <View style={estilos.contenedorRespuesta}>
                    <Text style={[estilos.textoRespuesta, { color: colors.textSecondary, fontSize: 14 * fontSizeScale }]}>
                      {item.respuesta}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },

  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  botonVolver: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tituloEncabezado: { fontWeight: '800' },

  tituloPrincipal: { fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  subtitulo: { marginBottom: 32, lineHeight: 22 },

  contenedorContacto: { flexDirection: 'row', gap: 12, marginBottom: 36 },
  tarjetaContacto: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  iconoContacto: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  tituloContacto: { fontWeight: '700', marginBottom: 4 },
  textoContacto: { fontSize: 12, fontWeight: '500' },

  tituloSeccion: { fontWeight: '800', marginBottom: 16 },
  contenedorPreguntas: { borderRadius: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, overflow: 'hidden' },
  itemPregunta: { paddingHorizontal: 16 },
  headerPregunta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  textoPregunta: { flex: 1, paddingRight: 16 },
  contenedorRespuesta: { paddingBottom: 20, paddingRight: 16 },
  textoRespuesta: { lineHeight: 22 },
});
