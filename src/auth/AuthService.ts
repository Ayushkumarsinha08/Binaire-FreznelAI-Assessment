import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { AuthUser } from '../types/model';
import { checkFirebaseConfiguration, firebaseAuth } from './firebase';

/**
 * AuthService
 *
 * Encapsulates Firebase Authentication using OOP principles.
 * STRICT ENFORCEMENT:
 * - Firebase is the SOLE authentication mechanism.
 * - Absolutely NO mock/demo authentication bypass.
 * - Automatically translates cryptic Firebase Auth error codes into friendly UI messages.
 */
export class AuthService {
  private auth: Auth | null;

  constructor(authInstance: Auth | null = firebaseAuth) {
    this.auth = authInstance;
  }

  /**
   * Returns current configuration status.
   */
  public getConfigurationStatus() {
    return checkFirebaseConfiguration();
  }

  /**
   * Signs in an existing user with email and password via Firebase Auth.
   */
  public async signIn(email: string, pass: string): Promise<AuthUser> {
    if (!this.auth) {
      throw new Error(
        'Firebase is not configured. Please set the required VITE_FIREBASE_* environment variables in your .env file.'
      );
    }

    try {
      const cred = await signInWithEmailAndPassword(this.auth, email.trim(), pass);
      return this.mapFirebaseUser(cred.user);
    } catch (error: any) {
      throw new Error(this.translateFirebaseError(error));
    }
  }

  /**
   * Registers a new user with email and password via Firebase Auth.
   */
  public async signUp(email: string, pass: string): Promise<AuthUser> {
    if (!this.auth) {
      throw new Error(
        'Firebase is not configured. Please set the required VITE_FIREBASE_* environment variables in your .env file.'
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), pass);
      return this.mapFirebaseUser(cred.user);
    } catch (error: any) {
      throw new Error(this.translateFirebaseError(error));
    }
  }

  /**
   * Signs out the currently authenticated Firebase user.
   */
  public async signOut(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
  }

  /**
   * Subscribes to Firebase Auth state changes.
   */
  public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    if (!this.auth) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(this.auth, (user: User | null) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  /**
   * Normalizes Firebase User object into minimal AuthUser.
   */
  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Developer'),
    };
  }

  /**
   * Translates Firebase error codes into helpful, human-readable guidance.
   */
  public translateFirebaseError(error: any): string {
    const code = error?.code || '';
    const message = error?.message || '';

    switch (code) {
      case 'auth/invalid-email':
        return 'The email address format is invalid. Please enter a valid email.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please double check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Access temporarily blocked for security. Please try again later.';
      case 'auth/configuration-not-found':
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method, and enable "Email/Password".';
      default:
        return message || 'An unexpected authentication error occurred.';
    }
  }
}

// Default singleton instance
export const authService = new AuthService();
