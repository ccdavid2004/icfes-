import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Claves de AsyncStorage
const NOTIF_KEYS = {
  RECORDATORIO_ACTIVO: 'notif_recordatorio_activo',
  BIENVENIDA_ACTIVA: 'notif_bienvenida_activa',
  HORA_RECORDATORIO: 'notif_hora_recordatorio',
  MINUTO_RECORDATORIO: 'notif_minuto_recordatorio',
  BIENVENIDA_ENVIADA: 'notif_bienvenida_enviada',
};

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── PERMISOS ───
export const solicitarPermisos = async () => {
  const { status: existente } = await Notifications.getPermissionsAsync();
  let permisoFinal = existente;

  if (existente !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    permisoFinal = status;
  }

  if (permisoFinal !== 'granted') {
    console.log('Permiso de notificaciones denegado.');
    return false;
  }

  // Android necesita un canal
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones IcfesApp',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  return true;
};

// ─── NOTIFICACIÓN DE BIENVENIDA ───
export const enviarBienvenida = async (nombreUsuario) => {
  try {
    // Verificar si ya se envió
    const yaEnviada = await AsyncStorage.getItem(NOTIF_KEYS.BIENVENIDA_ENVIADA);
    if (yaEnviada === 'true') return;

    const bienvenidaActiva = await AsyncStorage.getItem(NOTIF_KEYS.BIENVENIDA_ACTIVA);
    if (bienvenidaActiva === 'false') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Bienvenido a IcfesApp! 🎓',
        body: `Hola ${nombreUsuario || 'Estudiante'}, ¡estás un paso más cerca de alcanzar tu meta ICFES! Empieza tu primer simulacro hoy.`,
        sound: 'default',
      },
      trigger: Platform.OS === 'android' 
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'default' }
        : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    });

    await AsyncStorage.setItem(NOTIF_KEYS.BIENVENIDA_ENVIADA, 'true');
  } catch (error) {
    console.log('Error enviando bienvenida:', error.message);
  }
};

// ─── RECORDATORIO DIARIO DE RACHA ───
export const programarRecordatorioRacha = async (hora = 20, minuto = 0) => {
  try {
    // Cancelar cualquier recordatorio previo de racha antes de programar uno nuevo
    await cancelarRecordatorioRacha();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Tu racha está en peligro! 😱',
        body: 'Entra ahora mismo y completa un simulacro o práctica para no perder tu progreso de hoy. 🔥',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hora,
        minute: minuto,
      },
      identifier: 'recordatorio-racha-diario',
    });

    // Guardamos las preferencias
    await AsyncStorage.setItem(NOTIF_KEYS.RECORDATORIO_ACTIVO, 'true');
    await AsyncStorage.setItem(NOTIF_KEYS.HORA_RECORDATORIO, String(hora));
    await AsyncStorage.setItem(NOTIF_KEYS.MINUTO_RECORDATORIO, String(minuto));

    console.log(`Recordatorio de racha programado: ${hora}:${String(minuto).padStart(2, '0')}`);
  } catch (error) {
    console.log('Error programando recordatorio:', error.message);
  }
};

export const cancelarRecordatorioRacha = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync('recordatorio-racha-diario');
    await AsyncStorage.setItem(NOTIF_KEYS.RECORDATORIO_ACTIVO, 'false');
  } catch (error) {
    // Si no existía, ignoramos el error silenciosamente
    console.log('No había recordatorio previo para cancelar.');
  }
};

// ─── LEER PREFERENCIAS GUARDADAS ───
export const obtenerPreferencias = async () => {
  const recordatorioActivo = await AsyncStorage.getItem(NOTIF_KEYS.RECORDATORIO_ACTIVO);
  const bienvenidaActiva = await AsyncStorage.getItem(NOTIF_KEYS.BIENVENIDA_ACTIVA);
  const hora = await AsyncStorage.getItem(NOTIF_KEYS.HORA_RECORDATORIO);
  const minuto = await AsyncStorage.getItem(NOTIF_KEYS.MINUTO_RECORDATORIO);

  return {
    recordatorioActivo: recordatorioActivo !== 'false', // true por defecto
    bienvenidaActiva: bienvenidaActiva !== 'false',     // true por defecto
    hora: hora ? parseInt(hora) : 20,
    minuto: minuto ? parseInt(minuto) : 0,
  };
};

// ─── GUARDAR TOGGLE DE BIENVENIDA ───
export const toggleBienvenida = async (valor) => {
  await AsyncStorage.setItem(NOTIF_KEYS.BIENVENIDA_ACTIVA, String(valor));
  if (valor) {
    // Resetear para que se pueda enviar de nuevo la próxima vez
    await AsyncStorage.removeItem(NOTIF_KEYS.BIENVENIDA_ENVIADA);
  }
};
