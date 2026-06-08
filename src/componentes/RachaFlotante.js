import React, { useRef } from 'react';
import { Animated, PanResponder, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contextos/ThemeContext';

export default function RachaFlotante() {
  const { primaryColor, fontSizeScale, rachaActual } = useTheme();
  const navigation = useNavigation();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const estaArrastrando = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        estaArrastrando.current = false;
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderMove: (evt, gestureState) => {
        estaArrastrando.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  const handlePress = () => {
    if (!estaArrastrando.current) {
      navigation.navigate('PantallaRacha');
    }
  };

  return (
    <Animated.View
      style={[
        estilos.flotante,
        { backgroundColor: primaryColor + '20', shadowColor: primaryColor },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={estilos.boton}>
        <Ionicons name="flame" size={24} color={primaryColor} />
        <Text style={[estilos.textoRacha, { color: primaryColor, fontSize: 16 * fontSizeScale }]}>{rachaActual}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  flotante: {
    position: 'absolute',
    top: 100,
    right: 20,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textoRacha: {
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 6
  }
});
