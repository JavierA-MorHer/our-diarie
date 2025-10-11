// Export Firebase services for easy import throughout the app
export { auth, db, storage } from './config-simple';
export { default as app } from './config-simple';

// Export utilities and services
export * from './utils';
export { 
  FirestoreService, 
  StorageService, 
  AuthService, 
  testFirebaseConnection 
} from './utils';
