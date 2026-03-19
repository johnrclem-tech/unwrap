import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCXWygSsv_9fi4pyK_xDEZ-MI1oGO9T1eQ',
  authDomain: 'unwrap-7db52.firebaseapp.com',
  projectId: 'unwrap-7db52',
  storageBucket: 'unwrap-7db52.firebasestorage.app',
  messagingSenderId: '222002653125',
  appId: '1:222002653125:web:58d84f9a51b303f3638dac',
};

const app = initializeApp(firebaseConfig);

let auth: import('firebase/auth').Auth;
if (Platform.OS === 'web') {
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
