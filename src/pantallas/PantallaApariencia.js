import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, primaryColors } from '../contextos/ThemeContext';

export default function PantallaApariencia() {
  const navigation = useNavigation();
  
  const { 
    themeMode, 
    activeTheme, 
    colors, 
    primaryColor, 
    fontSizeScale, 
    animationsEnabled,
    updateThemeMode,
    updatePrimaryColor,
    updateFontSizeScale,
    updateAnimations
  } = useTheme();

  const isDarkPreview = activeTheme === 'dark';

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botonVolver, { backgroundColor: colors.card }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[estilos.tituloEncabezado, { color: colors.text }]}>Apariencia</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* INFO SECCIÓN */}
        <View style={estilos.infoSeccion}>
          <View style={[estilos.iconoInfo, { backgroundColor: primaryColor + '15' }]}>
            <Ionicons name="color-palette-outline" size={32} color={primaryColor} />
          </View>
          <Text style={[estilos.textoInfo, { color: colors.textSecondary }]}>
            Personaliza cómo se ve tu aplicación. Ajusta el tema, el color y el tamaño de texto a tu gusto.
          </Text>
        </View>

        {/* OPCIONES DE TEMA */}
        <Text style={[estilos.tituloSeccion, { color: colors.textSecondary }]}>Modo de Tema</Text>
        <View style={[estilos.seccion, { backgroundColor: colors.card }]}>
          
          <ThemeOption 
            title="Automático" 
            subtitle="Usa la configuración del dispositivo"
            icon="settings-outline"
            isSelected={themeMode === 'system'}
            onPress={() => updateThemeMode('system')}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
          />
          
          <ThemeOption 
            title="Modo Claro" 
            subtitle="Fondo blanco y texto oscuro"
            icon="sunny-outline"
            isSelected={themeMode === 'light'}
            onPress={() => updateThemeMode('light')}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
          />
          
          <ThemeOption 
            title="Modo Oscuro" 
            subtitle="Fondo oscuro y texto claro"
            icon="moon-outline"
            isSelected={themeMode === 'dark'}
            onPress={() => updateThemeMode('dark')}
            isLast={true}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
          />

        </View>

        {/* TAMAÑO DE TEXTO */}
        <Text style={[estilos.tituloSeccion, { color: colors.textSecondary }]}>Tamaño de Texto</Text>
        <View style={[estilos.seccion, { backgroundColor: colors.card }]}>
          <ThemeOption 
            title="Pequeño" 
            subtitle="Ideal para ver más contenido"
            icon="text-outline"
            isSelected={fontSizeScale === 0.9}
            onPress={() => updateFontSizeScale(0.9)}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={0.9}
          />
          <ThemeOption 
            title="Normal" 
            subtitle="Tamaño por defecto"
            icon="text-outline"
            isSelected={fontSizeScale === 1.0}
            onPress={() => updateFontSizeScale(1.0)}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={1.0}
          />
          <ThemeOption 
            title="Grande" 
            subtitle="Mejora la legibilidad"
            icon="text-outline"
            isSelected={fontSizeScale === 1.15}
            onPress={() => updateFontSizeScale(1.15)}
            isLast={true}
            colors={colors}
            primaryColor={primaryColor}
            fontSizeScale={1.15}
          />
        </View>

        {/* COLOR PRINCIPAL */}
        <Text style={[estilos.tituloSeccion, { color: colors.textSecondary }]}>Color Principal</Text>
        <View style={[estilos.seccion, { backgroundColor: colors.card, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 }]}>
          {primaryColors.map((colorObj) => (
            <TouchableOpacity
              key={colorObj.id}
              style={[
                estilos.circuloColor,
                { backgroundColor: colorObj.hex },
                primaryColor === colorObj.hex && { borderWidth: 3, borderColor: colors.text }
              ]}
              onPress={() => updatePrimaryColor(colorObj.hex)}
            >
              {primaryColor === colorObj.hex && <Ionicons name="checkmark" size={18} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCESIBILIDAD / ANIMACIONES */}
        <Text style={[estilos.tituloSeccion, { color: colors.textSecondary }]}>Navegación</Text>
        <View style={[estilos.seccion, { backgroundColor: colors.card, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
             <Text style={{ fontSize: 16 * fontSizeScale, color: colors.text, fontWeight: '600' }}>Animaciones Fluidas</Text>
             <Text style={{ fontSize: 13 * fontSizeScale, color: colors.textSecondary, marginTop: 4 }}>
               Activa las transiciones de pantalla. Desactívalo si la app va lenta.
             </Text>
          </View>
          <Switch
            value={animationsEnabled}
            onValueChange={updateAnimations}
            trackColor={{ false: colors.border, true: primaryColor }}
            thumbColor={'#FFF'}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ThemeOption = ({ title, subtitle, icon, isSelected, onPress, isLast, colors, primaryColor, fontSizeScale }) => (
  <TouchableOpacity 
    style={[
      estilos.opcionContenedor, 
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      isSelected && { backgroundColor: primaryColor + '08' }
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      estilos.iconoContenedor, 
      { backgroundColor: isSelected ? primaryColor + '15' : colors.iconBg }
    ]}>
      <Ionicons name={icon} size={22} color={isSelected ? primaryColor : colors.iconSecondary} />
    </View>
    <View style={estilos.textosOpcion}>
      <Text style={[
        { fontSize: 16 * fontSizeScale, fontWeight: '600', marginBottom: 2 },
        { color: isSelected ? primaryColor : colors.text }
      ]}>{title}</Text>
      <Text style={{ fontSize: 12 * fontSizeScale, color: colors.textSecondary }}>{subtitle}</Text>
    </View>
    <View style={[
      estilos.radioBtn, 
      { borderColor: isSelected ? primaryColor : colors.border },
    ]}>
      {isSelected && <View style={[estilos.radioBtnInner, { backgroundColor: primaryColor }]} />}
    </View>
  </TouchableOpacity>
);

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },
  
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  botonVolver: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tituloEncabezado: { fontSize: 20, fontWeight: '800' },

  infoSeccion: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 10, marginTop: 10 },
  iconoInfo: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  textoInfo: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  tituloSeccion: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  seccion: { borderRadius: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, overflow: 'hidden' },

  opcionContenedor: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconoContenedor: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textosOpcion: { flex: 1 },
  
  radioBtn: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  radioBtnInner: { width: 10, height: 10, borderRadius: 5 },

  circuloColor: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
});
