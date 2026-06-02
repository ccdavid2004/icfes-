import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema/colores';
import { supabase } from '../servicios/supabase';

export default function RecuperarContrasena({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const manejarRecuperacion = async () => {
    if (!correo) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    setCargando(true);
    
    try {
      // Llamada real al servicio de Auth de Supabase
     const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
  redirectTo: 'icfesapp://restablecer-password', 
});
      

      if (error) throw error;

      // Si todo sale bien, actualizamos el estado
      setEnviado(true);
      Alert.alert('¡Éxito!', 'Se ha enviado un enlace de recuperación a tu correo.');
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <ScrollView 
        contentContainerStyle={estilos.contenedorScroll} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <TouchableOpacity style={estilos.botonVolver} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>

        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Recuperar Contraseña</Text>
          <Text style={estilos.subtitulo}>
            {enviado
              ? 'Revisa tu bandeja de entrada para continuar con la recuperación.'
              : 'Ingresa tu correo para recibir un enlace de recuperación.'}
          </Text>
        </View>

        {!enviado && (
          <View style={estilos.formulario}>
            <Text style={estilos.etiquetaEntrada}>Correo electrónico</Text>
            <View style={estilos.contenedorEntrada}>
              <Ionicons name="mail-outline" size={20} color={colores.textoSecundario} style={estilos.iconoEntrada} />
              <TextInput
                style={estilos.entrada}
                placeholder="estudiante@colegio.edu.co"
                placeholderTextColor={colores.textoSecundario}
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity
              style={[estilos.botonPrincipal, cargando && estilos.botonDeshabilitado]}
              onPress={manejarRecuperacion}
              disabled={cargando}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotonPrincipal}>
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedorScroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 96,
  },
  botonVolver: {
    position: 'absolute',
    top: 64,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  encabezado: {
    marginBottom: 32,
    marginTop: 8,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: colores.textoSecundario,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  formulario: {
    width: '100%',
  },
  etiquetaEntrada: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: 4,
    marginLeft: 4,
  },
  contenedorEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 32,
    paddingHorizontal: 16,
    height: 52,
  },
  iconoEntrada: {
    marginRight: 8,
  },
  entrada: {
    flex: 1,
    color: colores.textoPrincipal,
    fontSize: 16,
  },
  botonPrincipal: {
    height: 56,
    backgroundColor: colores.primario,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoBotonPrincipal: {
    color: colores.textoClaro,
    fontSize: 18,
    fontWeight: 'bold',
  },
});