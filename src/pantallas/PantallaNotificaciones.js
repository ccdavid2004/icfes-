import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../contextos/ThemeContext';
import {
  solicitarPermisos,
  obtenerPreferencias,
  programarRecordatorioRacha,
  cancelarRecordatorioRacha,
  toggleBienvenida
} from '../servicios/ServicioNotificaciones';

export default function PantallaNotificaciones({ navigation }) {
  const { colors, primaryColor, fontSizeScale } = useTheme();

  const [permisosConcedidos, setPermisosConcedidos] = useState(null);
  const [recordatorioActivo, setRecordatorioActivo] = useState(true);
  const [bienvenidaActiva, setBienvenidaActiva] = useState(true);
  const [hora, setHora] = useState(20);
  const [minuto, setMinuto] = useState(0);

  useEffect(() => {
    cargarEstado();
  }, []);

  const cargarEstado = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermisosConcedidos(status === 'granted');

    const prefs = await obtenerPreferencias();
    setRecordatorioActivo(prefs.recordatorioActivo);
    setBienvenidaActiva(prefs.bienvenidaActiva);
    setHora(prefs.hora);
    setMinuto(prefs.minuto);
  };

  const manejarToggleRecordatorio = async (valor) => {
    if (valor && !permisosConcedidos) {
      const concedido = await solicitarPermisos();
      setPermisosConcedidos(concedido);
      if (!concedido) {
        Alert.alert('Permisos requeridos', 'Necesitas permitir las notificaciones desde la configuración de tu teléfono.');
        return;
      }
    }

    setRecordatorioActivo(valor);
    if (valor) {
      await programarRecordatorioRacha(hora, minuto);
    } else {
      await cancelarRecordatorioRacha();
    }
  };

  const manejarToggleBienvenida = async (valor) => {
    if (valor && !permisosConcedidos) {
      const concedido = await solicitarPermisos();
      setPermisosConcedidos(concedido);
      if (!concedido) {
        Alert.alert('Permisos requeridos', 'Necesitas permitir las notificaciones desde la configuración de tu teléfono.');
        return;
      }
    }

    setBienvenidaActiva(valor);
    await toggleBienvenida(valor);
  };

  const cambiarHora = async (incremento) => {
    let nuevaHora = hora + incremento;
    if (nuevaHora > 23) nuevaHora = 0;
    if (nuevaHora < 0) nuevaHora = 23;
    setHora(nuevaHora);
    if (recordatorioActivo) {
      await programarRecordatorioRacha(nuevaHora, minuto);
    }
  };

  const cambiarMinuto = async (incremento) => {
    let nuevoMinuto = minuto + incremento;
    if (nuevoMinuto >= 60) nuevoMinuto = 0;
    if (nuevoMinuto < 0) nuevoMinuto = 55;
    setMinuto(nuevoMinuto);
    if (recordatorioActivo) {
      await programarRecordatorioRacha(hora, nuevoMinuto);
    }
  };

  const formatearHora = (h) => {
    const periodo = h >= 12 ? 'PM' : 'AM';
    const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hora12, periodo };
  };

  const { hora12, periodo } = formatearHora(hora);

  return (
    <SafeAreaView style={[estilos.areaSegura, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenedorScroll}>
        
        {/* ENCABEZADO */}
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botonVolver, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[estilos.tituloEncabezado, { color: colors.text, fontSize: 20 * fontSizeScale }]}>Notificaciones</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ESTADO DE PERMISOS */}
        <View style={[estilos.tarjetaEstado, { backgroundColor: permisosConcedidos ? '#10B98115' : '#EF444415', borderColor: permisosConcedidos ? '#10B98130' : '#EF444430' }]}>
          <Ionicons 
            name={permisosConcedidos ? "checkmark-circle" : "alert-circle"} 
            size={22} 
            color={permisosConcedidos ? "#10B981" : "#EF4444"} 
          />
          <Text style={[estilos.textoEstado, { color: permisosConcedidos ? '#059669' : '#DC2626', fontSize: 14 * fontSizeScale }]}>
            {permisosConcedidos === null 
              ? 'Verificando permisos...'
              : permisosConcedidos 
                ? 'Las notificaciones están activas en tu dispositivo'
                : 'Las notificaciones están desactivadas en tu dispositivo'}
          </Text>
        </View>

        {/* SECCIÓN: NOTIFICACIÓN DE BIENVENIDA */}
        <Text style={[estilos.tituloSeccion, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Alertas</Text>
        <View style={[estilos.seccion, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <View style={[estilos.itemNotificacion, { borderBottomColor: colors.border }]}>
            <View style={estilos.izquierdaItem}>
              <View style={[estilos.iconoItem, { backgroundColor: '#3B82F615' }]}>
                <Ionicons name="hand-left" size={22} color="#3B82F6" />
              </View>
              <View style={estilos.textosItem}>
                <Text style={[estilos.tituloItem, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Saludo de Bienvenida</Text>
                <Text style={[estilos.descItem, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Recibe un saludo al iniciar sesión</Text>
              </View>
            </View>
            <Switch
              value={bienvenidaActiva}
              onValueChange={manejarToggleBienvenida}
              trackColor={{ false: colors.border, true: primaryColor + '60' }}
              thumbColor={bienvenidaActiva ? primaryColor : '#FFF'}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* RECORDATORIO DIARIO */}
          <View style={estilos.itemNotificacion}>
            <View style={estilos.izquierdaItem}>
              <View style={[estilos.iconoItem, { backgroundColor: '#FF6B3515' }]}>
                <Ionicons name="flame" size={22} color="#FF6B35" />
              </View>
              <View style={estilos.textosItem}>
                <Text style={[estilos.tituloItem, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Recordatorio de Racha</Text>
                <Text style={[estilos.descItem, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Aviso diario para no perder tu racha</Text>
              </View>
            </View>
            <Switch
              value={recordatorioActivo}
              onValueChange={manejarToggleRecordatorio}
              trackColor={{ false: colors.border, true: primaryColor + '60' }}
              thumbColor={recordatorioActivo ? primaryColor : '#FFF'}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* SELECTOR DE HORA */}
        {recordatorioActivo && (
          <>
            <Text style={[estilos.tituloSeccion, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>Hora del recordatorio</Text>
            <View style={[estilos.seccionReloj, { backgroundColor: colors.card, shadowColor: colors.border }]}>
              
              <View style={estilos.contenedorReloj}>
                {/* HORA */}
                <View style={estilos.columnaReloj}>
                  <TouchableOpacity onPress={() => cambiarHora(1)} style={[estilos.botonFlecha, { backgroundColor: primaryColor + '12' }]}>
                    <Ionicons name="chevron-up" size={24} color={primaryColor} />
                  </TouchableOpacity>
                  <View style={[estilos.displayNumero, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[estilos.textoNumero, { color: colors.text, fontSize: 36 * fontSizeScale }]}>
                      {String(hora12).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => cambiarHora(-1)} style={[estilos.botonFlecha, { backgroundColor: primaryColor + '12' }]}>
                    <Ionicons name="chevron-down" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </View>

                <Text style={[estilos.separadorReloj, { color: colors.text, fontSize: 36 * fontSizeScale }]}>:</Text>

                {/* MINUTOS */}
                <View style={estilos.columnaReloj}>
                  <TouchableOpacity onPress={() => cambiarMinuto(5)} style={[estilos.botonFlecha, { backgroundColor: primaryColor + '12' }]}>
                    <Ionicons name="chevron-up" size={24} color={primaryColor} />
                  </TouchableOpacity>
                  <View style={[estilos.displayNumero, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[estilos.textoNumero, { color: colors.text, fontSize: 36 * fontSizeScale }]}>
                      {String(minuto).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => cambiarMinuto(-5)} style={[estilos.botonFlecha, { backgroundColor: primaryColor + '12' }]}>
                    <Ionicons name="chevron-down" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </View>

                {/* AM/PM */}
                <View style={estilos.columnaAmPm}>
                  <TouchableOpacity 
                    style={[estilos.botonAmPm, periodo === 'AM' && { backgroundColor: primaryColor }]}
                    onPress={() => { if (periodo === 'PM') cambiarHora(-12); }}
                  >
                    <Text style={[estilos.textoAmPm, { color: periodo === 'AM' ? '#FFF' : colors.textSecondary }]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[estilos.botonAmPm, periodo === 'PM' && { backgroundColor: primaryColor }]}
                    onPress={() => { if (periodo === 'AM') cambiarHora(12); }}
                  >
                    <Text style={[estilos.textoAmPm, { color: periodo === 'PM' ? '#FFF' : colors.textSecondary }]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[estilos.textoAyudaReloj, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>
                Te avisaremos todos los días a las {hora12}:{String(minuto).padStart(2, '0')} {periodo} para que no pierdas tu racha.
              </Text>
            </View>
          </>
        )}

        {/* INFORMACIÓN EXTRA */}
        <View style={[estilos.cajaInfo, { backgroundColor: primaryColor + '12', borderColor: primaryColor + '25' }]}>
          <Ionicons name="information-circle" size={20} color={primaryColor} />
          <Text style={[estilos.textoInfo, { color: colors.text, fontSize: 13 * fontSizeScale }]}>
            Las notificaciones son locales: funcionan sin internet y se gestionan directamente en tu dispositivo.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1 },
  contenedorScroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },

  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  botonVolver: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tituloEncabezado: { fontWeight: '800' },

  tarjetaEstado: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 28, gap: 12 },
  textoEstado: { flex: 1, fontWeight: '600', lineHeight: 20 },

  tituloSeccion: { fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  seccion: { borderRadius: 20, paddingHorizontal: 4, marginBottom: 28, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },

  itemNotificacion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  izquierdaItem: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  iconoItem: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textosItem: { flex: 1 },
  tituloItem: { fontWeight: '700', marginBottom: 2 },
  descItem: { fontWeight: '500' },

  seccionReloj: { borderRadius: 20, padding: 24, marginBottom: 28, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, alignItems: 'center' },
  contenedorReloj: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  columnaReloj: { alignItems: 'center', gap: 8 },
  botonFlecha: { width: 44, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  displayNumero: { width: 76, height: 72, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  textoNumero: { fontWeight: '900' },
  separadorReloj: { fontWeight: '900', marginHorizontal: 2 },
  
  columnaAmPm: { marginLeft: 8, gap: 8 },
  botonAmPm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'transparent' },
  textoAmPm: { fontWeight: '800', fontSize: 15 },
  textoAyudaReloj: { textAlign: 'center', lineHeight: 20, fontWeight: '500' },

  cajaInfo: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, gap: 12, alignItems: 'flex-start' },
  textoInfo: { flex: 1, fontWeight: '600', lineHeight: 20 },
});
