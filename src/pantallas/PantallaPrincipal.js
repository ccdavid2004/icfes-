import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { supabase } from '../servicios/supabase';
import { colores } from '../tema/colores';

export default function PantallaPrincipal() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Cuando la pantalla carga, ejecutamos la búsqueda
    obtenerDatosDelEstudiante();
  }, []);

  const obtenerDatosDelEstudiante = async () => {
    try {
      // 1. Obtenemos el ID del usuario que tiene la sesión iniciada
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Hacemos la consulta a TU tabla 'usuarios'
        const { data, error } = await supabase
          .from('usuarios')
          .select('nombre') // Solo traemos el nombre para ahorrar datos
          .eq('id', user.id)
          .single(); // '.single()' le dice que solo esperamos un resultado

        if (error) throw error;

        // 3. Guardamos el nombre en la memoria de la pantalla
        if (data) {
          setNombreUsuario(data.nombre);
        }
      }
    } catch (error) {
      console.log('Error al obtener datos:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCierreSesion = async () => {
    await supabase.auth.signOut();
  };

  // Pantalla de carga mientras va y vuelve de la base de datos
  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.contenedor}>
        
        {/* Aquí mostramos el nombre dinámicamente */}
        <Text style={estilos.saludo}>¡Hola, {nombreUsuario || 'Estudiante'}! 👋</Text>
        <Text style={estilos.subtitulo}>¿Listo para tu preparación del ICFES hoy?</Text>

        <View style={estilos.tarjetaReto}>
          <Text style={estilos.textoReto}>Aquí irán tus retos diarios de GamiMind...</Text>
        </View>

        <TouchableOpacity style={estilos.botonPrincipal} onPress={manejarCierreSesion}>
          <Text style={estilos.textoBotonPrincipal}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colores.fondo,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  contenedor: {
    flex: 1,
    padding: 24,
  },
  pantallaCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.fondo,
  },
  saludo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitulo: {
    fontSize: 16,
    color: colores.textoSecundario,
    marginBottom: 32,
  },
  tarjetaReto: {
    backgroundColor: colores.superficie,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginBottom: 32,
  },
  textoReto: {
    color: colores.textoSecundario,
    fontSize: 16,
    fontStyle: 'italic',
  },
  botonPrincipal: {
    height: 56,
    backgroundColor: '#E63946', // Un rojo suave para el cierre de sesión
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto', // Esto empuja el botón al fondo de la pantalla
    marginBottom: 24,
  },
  textoBotonPrincipal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});