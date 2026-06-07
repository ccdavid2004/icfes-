import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { supabase } from './src/servicios/supabase';

// 1. Importamos tus pantallas originales EXACTAMENTE como las tienes
import InicioSesion from './src/pantallas/InicioSesion';
import Registro from './src/pantallas/Registro';
import RecuperarContrasena from './src/pantallas/RecuperarContrasena';
import RestablecerContrasena from './src/pantallas/RestablecerContrasena';
import PantallaPrincipal from './src/pantallas/PantallaPrincipal';
import PantallaProgreso from './src/pantallas/PantallaProgreso';
import PantallaSimulacros from './src/pantallas/PantallaSimulacros';
import MotorSimulacro from './src/pantallas/MotorSimulacro';
// 2. Importamos la NUEVA pantalla de Onboarding
import PantallaOnboarding from './src/pantallas/PantallaOnboarding';

const Stack = createNativeStackNavigator();

// Configuración original de Deep Linking que tenías
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
  
  // Nuevo estado para saber si ya llenó sus metas
  const [onboardingCompletado, setOnboardingCompletado] = useState(false);

  useEffect(() => {
    // 1. Al abrir la app, buscar si hay una sesión guardada
    const verificarSesionInicial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);
      
      if (session) {
        // Si hay sesión, validamos si ya hizo el onboarding
        await verificarOnboarding(session.user.id);
      } else {
        setCargando(false);
      }
    };

    verificarSesionInicial();

    // 2. Escuchar en tiempo real si el usuario inicia o cierra sesión
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, sessionActiva) => {
      setSesion(sessionActiva);
      
      if (sessionActiva) {
        setCargando(true);
        await verificarOnboarding(sessionActiva.user.id);
      } else {
        setCargando(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función que busca en la base de datos si ya respondió las preguntas
  const verificarOnboarding = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('onboarding_completado')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setOnboardingCompletado(data.onboarding_completado);
      }
    } catch (error) {
      console.log('Error verificando onboarding:', error.message);
    } finally {
      setCargando(false);
    }
  };

  // Mientras verifica la memoria y la base de datos, mostramos el ícono de carga
  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#4648d4" />
      </View>
    );
  }

  return (
   <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        
        {!sesion ? (
          // FLUJO 1: NO HAY SESIÓN 
          <>
            <Stack.Screen name="InicioSesion" component={InicioSesion} />
            <Stack.Screen name="Registro" component={Registro} />
            <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasena} />
            <Stack.Screen name="RestablecerContrasena" component={RestablecerContrasena} />
          </>
        ) : (
          // FLUJO 2 y 3: HAY SESIÓN
          <>
            {/* Si no ha completado el onboarding, esta pantalla se pone de primera obligatoriamente */}
            {!onboardingCompletado && (
              <Stack.Screen name="PantallaOnboarding" component={PantallaOnboarding} />
            )}
            {/* La Pantalla Principal siempre está disponible, así el Onboarding puede navegar hacia ella */}
            <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
            <Stack.Screen name="PantallaProgreso" component={PantallaProgreso} />
            <Stack.Screen name="PantallaSimulacros" component={PantallaSimulacros} />
            <Stack.Screen name="MotorSimulacro" component={MotorSimulacro} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  pantallaCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FB',
  },
});