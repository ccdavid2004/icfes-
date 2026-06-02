import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema/colores';
import { supabase } from '../servicios/supabase';

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!nombre || !apellido || !correo || !contrasena) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setCargando(true);
    
    try {
      // 1. Intentamos el registro
      const { data: datosAuth, error: errorAuth } = await supabase.auth.signUp({
        email: correo,
        password: contrasena,
      });

      // Si el error es que ya existe, lo capturamos amablemente
      if (errorAuth) {
        if (errorAuth.message === 'User already registered') {
          throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
        }
        throw errorAuth;
      }

      // 2. Insertamos en la tabla solo si Auth fue exitoso
      if (datosAuth.user) {
        const { error: errorTabla } = await supabase
          .from('usuarios')
          .insert([{ 
            id: datosAuth.user.id, 
            nombre: nombre, 
            apellido: apellido, 
            correo: correo 
          }]);

        if (errorTabla) {
          // Si falla la inserción en la tabla, borramos el usuario creado en Auth para no dejar "huérfanos"
          await supabase.auth.signOut();
          throw new Error('Error al guardar datos de usuario. Intenta de nuevo.');
        }

        Alert.alert('¡Excelente!', 'Cuenta creada correctamente.');
        navigation.navigate('InicioSesion');
      }
    } catch (error) {
      Alert.alert('Error de Registro', error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <ScrollView contentContainerStyle={estilos.contenedorScroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={estilos.botonVolver} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
        
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Crea tu cuenta</Text>
          <Text style={estilos.subtitulo}>Únete y comienza a prepararte para el ICFES</Text>
        </View>

        <View style={estilos.formulario}>
          <View style={estilos.fila}>
            <View style={{ flex: 1, marginRight: 4 }}>
              <Text style={estilos.etiquetaEntrada}>Nombre</Text>
              <View style={estilos.contenedorEntrada}>
                <Ionicons name="person-outline" size={20} color={colores.textoSecundario} style={estilos.iconoEntrada} />
                <TextInput
                  style={estilos.entrada}
                  placeholder="Ej. Juan"
                  placeholderTextColor={colores.textoSecundario}
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text style={estilos.etiquetaEntrada}>Apellido</Text>
              <View style={estilos.contenedorEntrada}>
                <Ionicons name="person-outline" size={20} color={colores.textoSecundario} style={estilos.iconoEntrada} />
                <TextInput
                  style={estilos.entrada}
                  placeholder="Ej. Pérez"
                  placeholderTextColor={colores.textoSecundario}
                  value={apellido}
                  onChangeText={setApellido}
                />
              </View>
            </View>
          </View>

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

          <Text style={estilos.etiquetaEntrada}>Contraseña</Text>
          <View style={estilos.contenedorEntrada}>
            <Ionicons name="lock-closed-outline" size={20} color={colores.textoSecundario} style={estilos.iconoEntrada} />
            <TextInput
              style={estilos.entrada}
              placeholder="Crea una contraseña segura"
              placeholderTextColor={colores.textoSecundario}
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[estilos.botonPrincipal, cargando && estilos.botonDeshabilitado]}
            onPress={manejarRegistro}
            disabled={cargando}
            activeOpacity={0.8}
          >
            <Text style={estilos.textoBotonPrincipal}>
              {cargando ? 'Creando cuenta...' : 'Regístrate'}
            </Text>
          </TouchableOpacity>
          
          <View style={estilos.piePagina}>
            <Text style={estilos.textoPiePagina}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={estilos.enlacePiePagina}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    color: colores.textoPrincipal,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  formulario: {
    width: '100%',
  },
  fila: {
    flexDirection: 'row',
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
    marginTop: 16,
    marginBottom: 32,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoBotonPrincipal: {
    color: colores.textoClaro,
    fontSize: 18,
    fontWeight: 'bold',
  },
  piePagina: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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