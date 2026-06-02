import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colores } from '../tema/colores';

export const BotonPrincipal = ({ titulo, alPresionar, estiloAdicional }) => {
  return (
    <TouchableOpacity 
      style={[styles.boton, estiloAdicional]} 
      onPress={alPresionar}
      activeOpacity={0.8}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    backgroundColor: colores.primario,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra para iOS
    shadowColor: colores.primarioOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 5, 
    width: '100%',
  },
  texto: {
    color: colores.textoClaro,
    fontSize: 18,
    fontWeight: 'bold',
  }
});