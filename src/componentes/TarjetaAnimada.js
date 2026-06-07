import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Convertimos el gradiente en un componente animable
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function TarjetaAnimada({ children, style, colors, duracion = 2000, escalaMaxima = 1.03 }) {
  // Inicializamos el valor de la escala en 1 (tamaño original)
  const animacionPulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Creamos el bucle infinito de respiración
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacionPulso, {
          toValue: escalaMaxima, // Cuánto va a crecer
          duration: duracion,    // Qué tan rápido lo hará
          useNativeDriver: true,
        }),
        Animated.timing(animacionPulso, {
          toValue: 1,            // Vuelve a la normalidad
          duration: duracion,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animacionPulso, duracion, escalaMaxima]);

  // Colores por defecto (el azul vibrante que te gustó) si no le pasamos otros
  const coloresPorDefecto = ['#0A2540', '#195B9A', '#0A2540'];

  return (
    <Animated.View style={[{ transform: [{ scale: animacionPulso }] }, style]}>
      <AnimatedGradient
        colors={colors || coloresPorDefecto}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={estilos.gradienteBase}
      >
        {/* Aquí adentro irá lo que sea que envolvamos con esta tarjeta */}
        {children}
      </AnimatedGradient>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  gradienteBase: {
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // Asegura que el contenido no se salga de los bordes redondeados
  },
});