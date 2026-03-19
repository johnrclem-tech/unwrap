import { initializeApp } from 'firebase/app';
// @ts-ignore – getReactNativePersistence is exported from the RN entry point
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCXWygSsv_9fi4pyK_xDEZ-MI1oGO9T1eQ',
  authDomain: 'unwrap-7db52.firebaseapp.com',
  projectId: 'unwrap-7db52',
  storageBucket: 'unwrap-7db52.firebasestorage.app',
  messagingSenderId: '222002653125',
  appId: '1:222002653125:web:58d84f9a51b303f3638dac',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
