import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { supabase } from './src/servicios/supabase';

// Importa tus pantallas de Autenticación
import InicioSesion from './src/pantallas/InicioSesion';
import Registro from './src/pantallas/Registro';
import RecuperarContrasena from './src/pantallas/RecuperarContrasena';
import RestablecerContrasena from './src/pantallas/RestablecerContrasena';

// Importa tu Pantalla Principal REAL
import PantallaPrincipal from './src/pantallas/PantallaPrincipal';

const Stack = createNativeStackNavigator();

// Configuración de Deep Linking
const linking = {
  prefixes: ['icfesapp://'],
  config: {
    screens: {
      RestablecerContrasena: 'restablecer-password',
    },
  },
};

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Al abrir la app, buscar si hay una sesión guardada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    // 2. Escuchar en tiempo real si el usuario inicia o cierra sesión
    supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });
  }, []);

  // Mientras verifica la memoria, mostramos un ícono de carga
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {sesion && sesion.user ? (
          // SI HAY SESIÓN: Ocultamos el login y mostramos la app principal real
          <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
        ) : (
          // SI NO HAY SESIÓN: Mostramos todo el flujo de registro y login
          <>
            <Stack.Screen name="InicioSesion" component={InicioSesion} />
            <Stack.Screen name="Registro" component={Registro} />
            <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasena} />
            <Stack.Screen name="RestablecerContrasena" component={RestablecerContrasena} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}