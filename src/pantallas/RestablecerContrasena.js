import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../servicios/supabase';
import { colores } from '../tema/colores';

export default function RestablecerContrasena({ navigation }) {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  // Esta función es la que realmente cambia la contraseña en Supabase
  const actualizarContrasena = async () => {
    if (nuevaContrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    
    // Supabase automáticamente detecta el token de la sesión activa al hacer esto
    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('¡Éxito!', 'Contraseña actualizada correctamente.');
      navigation.navigate('InicioSesion');
    }
    setCargando(false);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Cambiar Contraseña</Text>
      <TextInput 
        placeholder="Escribe tu nueva contraseña" 
        secureTextEntry 
        onChangeText={setNuevaContrasena} 
        style={styles.input}
      />
      <TouchableOpacity onPress={actualizarContrasena} style={styles.boton}>
        <Text style={styles.textoBoton}>{cargando ? 'Guardando...' : 'Confirmar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colores.fondo },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: colores.textoPrincipal },
  input: { borderWidth: 1, borderColor: colores.borde, padding: 15, marginBottom: 20, borderRadius: 8, backgroundColor: colores.superficie },
  boton: { backgroundColor: colores.primario, padding: 15, alignItems: 'center', borderRadius: 8 },
  textoBoton: { color: 'white', fontWeight: 'bold' }
});