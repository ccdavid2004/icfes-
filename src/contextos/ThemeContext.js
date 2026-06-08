import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../servicios/supabase';

// Definición de la paleta básica según el tema
const lightColors = {
  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  iconBg: '#F1F5F9', // Slate 100
  iconSecondary: '#94A3B8', // Slate 400
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
};

const darkColors = {
  background: '#0F172A', // Slate 900
  card: '#1E293B', // Slate 800
  text: '#F8FAFC', // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  border: '#334155', // Slate 700
  iconBg: '#334155', // Slate 700
  iconSecondary: '#64748B', // Slate 500
  danger: '#F87171',
  dangerBg: '#7F1D1D',
};

// Paleta de colores primarios
export const primaryColors = [
  { id: 'purple', hex: '#4648d4', name: 'Morado ICFES' },
  { id: 'blue', hex: '#3B82F6', name: 'Azul Océano' },
  { id: 'emerald', hex: '#10B981', name: 'Verde Esmeralda' },
  { id: 'rose', hex: '#F43F5E', name: 'Rosa Vibrante' },
  { id: 'orange', hex: '#F97316', name: 'Naranja Fuego' },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  const [themeMode, setThemeMode] = useState('system'); // system, light, dark
  const [primaryColorHex, setPrimaryColorHex] = useState(primaryColors[0].hex);
  const [fontSizeScale, setFontSizeScale] = useState(1); // 0.9 (Pequeño), 1 (Normal), 1.15 (Grande)
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [rachaActual, setRachaActual] = useState(0);

  useEffect(() => {
    // Cargar ajustes guardados
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@themeMode');
        const storedColor = await AsyncStorage.getItem('@primaryColor');
        const storedFont = await AsyncStorage.getItem('@fontSizeScale');
        const storedAnim = await AsyncStorage.getItem('@animationsEnabled');

        if (storedTheme) setThemeMode(storedTheme);
        if (storedColor) setPrimaryColorHex(storedColor);
        if (storedFont) setFontSizeScale(parseFloat(storedFont));
        if (storedAnim !== null) setAnimationsEnabled(storedAnim === 'true');
      } catch (error) {
        console.warn('Error loading theme settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
    calcularRacha();
  }, []);

  const fechaAString = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  };

  const calcularRacha = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: simulacros } = await supabase
        .from('resultados_simulacros')
        .select('creado_en')
        .eq('usuario_id', user.id);

      const { data: practicas } = await supabase
        .from('resultados_practicas')
        .select('creado_en')
        .eq('usuario_id', user.id);

      const todos = [...(simulacros || []), ...(practicas || [])];
      if (todos.length === 0) { setRachaActual(0); return; }

      const diasUnicos = [...new Set(todos.map(s => fechaAString(s.creado_en)))];

      let racha = 0;
      const hoy = fechaAString(new Date());
      let fechaRevisar = new Date();

      while (true) {
        const fechaStr = fechaAString(fechaRevisar);
        if (diasUnicos.includes(fechaStr)) {
          racha++;
          fechaRevisar.setDate(fechaRevisar.getDate() - 1);
        } else {
          if (fechaStr === hoy && racha === 0) {
            fechaRevisar.setDate(fechaRevisar.getDate() - 1);
            const ayer = fechaAString(fechaRevisar);
            if (!diasUnicos.includes(ayer)) break;
          } else {
            break;
          }
        }
      }
      setRachaActual(racha);
    } catch (error) {
      console.log('Error calculando racha en contexto:', error);
    }
  };

  const updateThemeMode = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('@themeMode', mode);
  };

  const updatePrimaryColor = async (colorHex) => {
    setPrimaryColorHex(colorHex);
    await AsyncStorage.setItem('@primaryColor', colorHex);
  };

  const updateFontSizeScale = async (scale) => {
    setFontSizeScale(scale);
    await AsyncStorage.setItem('@fontSizeScale', scale.toString());
  };

  const updateAnimations = async (enabled) => {
    setAnimationsEnabled(enabled);
    await AsyncStorage.setItem('@animationsEnabled', enabled.toString());
  };

  // Tema activo evaluado (light o dark)
  const activeTheme = themeMode === 'system' ? (systemColorScheme || 'light') : themeMode;
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const themeContextValue = {
    themeMode,
    activeTheme,
    colors,
    primaryColor: primaryColorHex,
    fontSizeScale,
    animationsEnabled,
    updateThemeMode,
    updatePrimaryColor,
    updateFontSizeScale,
    updateAnimations,
    rachaActual,
    calcularRacha,
  };

  if (!isLoaded) return null; // Evita parpadeos mientras carga AsyncStorage

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
