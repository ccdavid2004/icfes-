import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colores } from '../tema/colores';

export const Tarjeta = ({ titulo, descripcion, alPresionar }) => {
  return (
    <TouchableOpacity 
      style={styles.tarjeta} 
      onPress={alPresionar} 
      activeOpacity={0.8}
    >
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie, // Fondo blanco
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    width: '100%',
    // Borde sutil
    borderWidth: 1,
    borderColor: colores.borde,
    // Sombra suave para darle volumen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: colores.textoSecundario,
    lineHeight: 20,
  }
});