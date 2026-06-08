import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CelebracionMeta({ visible, onClose, puntaje, meta }) {
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 50, // Baja hasta 50px desde el borde superior
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Auto cerrar después de 5 segundos
      const timer = setTimeout(() => {
        cerrar();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const cerrar = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose && onClose());
  };

  if (!visible) return null;

  return (
    <Animated.View style={[estilos.contenedor, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={cerrar}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={estilos.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={estilos.circuloIcono}>
            <Ionicons name="trophy" size={24} color="#D97706" />
          </View>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>¡Logro Desbloqueado!</Text>
            <Text style={estilos.mensaje}>Has superado tu meta de {meta} puntos.</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  circuloIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 4,
  },
  mensaje: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  }
});
