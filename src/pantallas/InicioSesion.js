import React, { useState } from 'react';
// 1. Quitamos SafeAreaView de la importación
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema/colores';
import { supabase } from '../servicios/supabase';

export default function InicioSesion({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [correoEnfocado, setCorreoEnfocado] = useState(false);
  const [contrasenaEnfocada, setContrasenaEnfocada] = useState(false);

  const manejarInicioSesion = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    setCargando(false);

    if (error) {
      Alert.alert('Acceso Denegado', 'Correo o contraseña incorrectos.');
      return; 
    }

    Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente.');
    // navigation.navigate('PantallaPrincipal'); 
  };

  return (
    // 2. Cambiamos SafeAreaView por un View normal
    <View style={estilos.areaSegura}>
      <KeyboardAvoidingView 
        style={estilos.tecladoEvitador} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // 3. ESTA ES LA MAGIA: Apagamos este componente en Android
        enabled={Platform.OS === 'ios'} 
      >
        <ScrollView 
          contentContainerStyle={estilos.contenedorScroll} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          <View style={estilos.espaciadorSuperior} />

          <View style={estilos.encabezado}>
            <View style={estilos.contenedorLogo}>
              <Ionicons name="school" size={48} color={colores.superficie} />
            </View>
            <Text style={estilos.marca}>Prep ICFES</Text>
            <Text style={estilos.titulo}>Tu futuro comienza hoy</Text>
            <Text style={estilos.subtitulo}>La mejor preparación para el ICFES en la palma de tu mano.</Text>
          </View>

          <View style={estilos.formulario}>
            <Text style={estilos.etiquetaEntrada}>Correo electrónico</Text>
            <View style={[estilos.contenedorEntrada, correoEnfocado && estilos.entradaEnfocada]}>
              <Ionicons name="mail-outline" size={20} color={correoEnfocado ? colores.primario : colores.textoSecundario} style={estilos.iconoEntrada} />
            <TextInput
  style={estilos.entrada}
  placeholder="Ej. estudiante@colegio.edu.co"
  placeholderTextColor={colores.textoSecundario}
  value={correo}
  onChangeText={setCorreo}
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
/>
            </View>

            <Text style={estilos.etiquetaEntrada}>Contraseña</Text>
            <View style={[estilos.contenedorEntrada, contrasenaEnfocada && estilos.entradaEnfocada]}>
              <Ionicons name="lock-closed-outline" size={20} color={contrasenaEnfocada ? colores.primario : colores.textoSecundario} style={estilos.iconoEntrada} />
              <TextInput
  style={estilos.entrada}
  placeholder="Ingresa tu contraseña"
  placeholderTextColor={colores.textoSecundario}
  value={contrasena}
  onChangeText={setContrasena}
  secureTextEntry
  autoCapitalize="none"
  underlineColorAndroid="transparent"
/>
            </View>

            <TouchableOpacity style={estilos.olvidoContrasena} onPress={() => navigation.navigate('RecuperarContrasena')}>
              <Text style={estilos.textoOlvidoContrasena}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[estilos.botonPrincipal, cargando && estilos.botonDeshabilitado]} 
              onPress={manejarInicioSesion} 
              disabled={cargando}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotonPrincipal}>
                {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>
            
            <View style={estilos.contenedorSso}>
               <View style={estilos.contenedorDivisor}>
                 <View style={estilos.divisor} />
                 <Text style={estilos.textoSso}>O ingresa con</Text>
                 <View style={estilos.divisor} />
               </View>
               
               <View style={estilos.botonesSso}>
                  <TouchableOpacity style={estilos.botonSso} activeOpacity={0.7}>
                      <Ionicons name="logo-google" size={20} color={colores.textoPrincipal} />
                      <Text style={estilos.textoBotonSso}>Google</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'ios' && (
                      <TouchableOpacity style={estilos.botonSso} activeOpacity={0.7}>
                          <Ionicons name="logo-apple" size={20} color={colores.textoPrincipal} />
                          <Text style={estilos.textoBotonSso}>Apple</Text>
                      </TouchableOpacity>
                  )}
               </View>
            </View>

            <View style={estilos.piePagina}>
              <Text style={estilos.textoPiePagina}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
                <Text style={estilos.enlacePiePagina}>Regístrate</Text>
              </TouchableOpacity>
            </View>
            
            <View style={estilos.espaciadorInferior} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  tecladoEvitador: {
    flex: 1,
  },
  contenedorScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  espaciadorSuperior: {
    height: Platform.OS === 'android' ? 60 : 40,
  },
  espaciadorInferior: {
    height: 40,
  },
  encabezado: {
    marginBottom: 48,
    alignItems: 'center',
  },
  contenedorLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  marca: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.primario,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.textoPrincipal, 
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
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
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  entradaEnfocada: {
    borderColor: colores.primario,
    backgroundColor: colores.superficie,
    elevation: 2,
  },
  iconoEntrada: {
    marginRight: 8,
  },
  entrada: {
    flex: 1,
    color: colores.textoPrincipal,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0, 
  },
  olvidoContrasena: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  textoOlvidoContrasena: {
    color: colores.primario,
    fontSize: 14,
    fontWeight: '600',
  },
  botonPrincipal: {
    height: 56,
    backgroundColor: colores.primario,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoBotonPrincipal: {
    color: colores.textoClaro,
    fontSize: 18,
    fontWeight: 'bold',
  },
  contenedorSso: {
      alignItems: 'center',
      marginBottom: 24,
  },
  contenedorDivisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divisor: {
    flex: 1,
    height: 1,
    backgroundColor: colores.borde,
  },
  textoSso: {
      color: colores.textoSecundario,
      fontSize: 14,
      paddingHorizontal: 16,
  },
  botonesSso: {
      flexDirection: 'row',
      gap: 16,
      width: '100%',
  },
  botonSso: {
      flex: 1,
      height: 52,
      flexDirection: 'row',
      borderRadius: 16,
      backgroundColor: colores.superficie,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colores.borde,
  },
  textoBotonSso: {
      color: colores.textoPrincipal,
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
  },
  piePagina: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  textoPiePagina: {
    color: colores.textoSecundario,
    fontSize: 16,
  },
  enlacePiePagina: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: 'bold',
  },
});