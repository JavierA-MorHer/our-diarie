import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type DocumentData
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import type {
  UploadResult
} from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type {
  User,
  UserCredential
} from 'firebase/auth';
import { db, storage, auth } from './config-simple';

// Types for common operations
export interface DiaryEntry extends Record<string, unknown> {
  id?: string;
  title: string;
  content: string;
  date: Date | Timestamp;
  mood?: string;
  tags?: string[];
  photos?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  diaryId?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface UserProfile {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Collaboration interfaces
export interface SharedDiary extends Record<string, unknown> {
  id?: string;
  ownerId: string;
  shareCode: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Timestamp;
  lastModifiedAt: Timestamp;
  lastModifiedBy: string;
}

export interface DiaryCollaborator extends Record<string, unknown> {
  id?: string;
  diaryId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy: string;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  status: 'active' | 'pending' | 'removed';
}

export interface DiaryInvitation extends Record<string, unknown> {
  id?: string;
  diaryId: string;
  invitedEmail: string;
  shareCode: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

// Firestore utilities
export class FirestoreService {
  // Generic CRUD operations
  static async create<T extends Record<string, unknown>>(
    collectionName: string, 
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async getById<T extends Record<string, unknown>>(
    collectionName: string, 
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  static async getAll<T extends DocumentData>(
    collectionName: string,
    constraints?: unknown[]
  ): Promise<T[]> {
    try {
      let q: any = collection(db, collectionName);
      
      if (constraints) {
        q = query(q, ...(constraints as any));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Record<string, unknown>)
      })) as unknown as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  static async update<T extends DocumentData>(
    collectionName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Diary-specific operations
  static async getDiaryEntries(userId: string, limitCount?: number): Promise<DiaryEntry[]> {
    try {
      // Get all entries for the user
      const userEntries = await this.getAll<DiaryEntry>('diaryEntries', [
        where('userId', '==', userId)
      ]);

      // Filter out entries that belong to shared diaries (only keep personal diary entries)
      const personalEntries = userEntries.filter(entry => !entry.diaryId);

      // Sort by date in descending order
      const sortedEntries = personalEntries.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : a.date.toDate();
        const dateB = b.date instanceof Date ? b.date : b.date.toDate();
        return dateB.getTime() - dateA.getTime();
      });

      // Apply limit if specified
      if (limitCount) {
        return sortedEntries.slice(0, limitCount);
      }

      return sortedEntries;
    } catch (error) {
      console.error('❌ Error getting diary entries:', error);
      throw error;
    }
  }

  static async createDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<DiaryEntry>('diaryEntries', entry);
  }

  static async updateDiaryEntry(id: string, entry: Partial<DiaryEntry>): Promise<void> {
    return this.update<DiaryEntry>('diaryEntries', id, entry);
  }

  static async deleteDiaryEntry(id: string): Promise<void> {
    return this.delete('diaryEntries', id);
  }
}

// Storage utilities
export class StorageService {
  static async uploadFile(
    file: File, 
    path: string
  ): Promise<{ url: string; path: string }> {
    try {
      const storageRef = ref(storage, path);
      const uploadResult: UploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return {
        url: downloadURL,
        path: uploadResult.ref.fullPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  static async uploadDiaryPhoto(
    file: File, 
    userId: string, 
    entryId: string
  ): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `diary-photos/${userId}/${entryId}/${fileName}`;
    
    return this.uploadFile(file, path);
  }
}

// Auth utilities
export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      // Configure Google provider
      this.googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, this.googleProvider);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      // Note: Firebase Auth doesn't provide a direct way to get user info by ID
      // We'll need to get it from Firestore users collection if we store it there
      // For now, return the current user if IDs match, otherwise return null
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.uid === userId) {
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

// Collaboration Service
export class CollaborationService {
  // Generate unique share code
  private static generateShareCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Create shared diary
  static async createSharedDiary(title: string, description?: string): Promise<string> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const shareCode = this.generateShareCode();
      const now = Timestamp.now();

      const sharedDiary: Omit<SharedDiary, 'id'> = {
        ownerId: currentUser.uid,
        shareCode,
        title,
        description: description || '',
        isPublic: false,
        createdAt: now,
        lastModifiedAt: now,
        lastModifiedBy: currentUser.uid
      };

      const diaryId = await FirestoreService.create<SharedDiary>('sharedDiaries', sharedDiary);

      // Add owner as collaborator
      await this.addCollaborator(diaryId, currentUser.uid, currentUser.email || '', currentUser.displayName || 'Usuario', 'owner', currentUser.uid);

      return diaryId;
    } catch (error) {
      console.error('Error creating shared diary:', error);
      throw error;
    }
  }

  // Get shared diaries for user
  static async getSharedDiaries(userId: string): Promise<SharedDiary[]> {
    try {
      // Get diaries where user is owner
      const ownedDiaries = await FirestoreService.getAll<SharedDiary>('sharedDiaries', [
        where('ownerId', '==', userId)
      ]);

      // Get collaborator records for this user
      const collaboratorDiaries = await FirestoreService.getAll<DiaryCollaborator>('diaryCollaborators', [
        where('userId', '==', userId),
        where('status', '==', 'active')
      ]);

      // Get shared diaries for collaborators
      const collaboratorDiaryIds = collaboratorDiaries.map(c => c.diaryId);
      
      let sharedDiaries: SharedDiary[] = [];
      if (collaboratorDiaryIds.length > 0) {
        // Get each diary individually to avoid issues with 'in' query
        for (const diaryId of collaboratorDiaryIds) {
          try {
            const diary = await FirestoreService.getById<SharedDiary>('sharedDiaries', diaryId);
            if (diary) {
              sharedDiaries.push(diary);
            }
          } catch (error) {
            console.error('Error getting diary:', diaryId, error);
          }
        }
      }

      // Combine and remove duplicates
      const allDiaries = [...ownedDiaries, ...sharedDiaries];
      const uniqueDiaries = allDiaries.filter((diary, index, self) => 
        index === self.findIndex(d => d.id === diary.id)
      );

      return uniqueDiaries;
    } catch (error) {
      console.error('Error getting shared diaries:', error);
      throw error;
    }
  }

  // Get shared diary by share code
  static async getSharedDiary(shareCode: string): Promise<SharedDiary | null> {
    try {
      const diaries = await FirestoreService.getAll<SharedDiary>('sharedDiaries', [where('shareCode', '==', shareCode)]);
      return diaries.length > 0 ? diaries[0] : null;
    } catch (error) {
      console.error('Error getting shared diary:', error);
      throw error;
    }
  }

  // Get shared diary by ID
  static async getSharedDiaryById(diaryId: string): Promise<SharedDiary | null> {
    try {
      return await FirestoreService.getById<SharedDiary>('sharedDiaries', diaryId);
    } catch (error) {
      console.error('Error getting shared diary by ID:', error);
      throw error;
    }
  }

  // Add collaborator
  private static async addCollaborator(
    diaryId: string, 
    userId: string, 
    userEmail: string, 
    userName: string, 
    role: 'owner' | 'editor' | 'viewer',
    invitedBy: string
  ): Promise<void> {
    try {
      const collaborator: Omit<DiaryCollaborator, 'id'> = {
        diaryId,
        userId,
        userEmail,
        userName,
        role,
        invitedBy,
        joinedAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
        status: 'active'
      };

      await FirestoreService.create<DiaryCollaborator>('diaryCollaborators', collaborator);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // Invite collaborator by email
  static async inviteCollaborator(diaryId: string, email: string, role: 'editor' | 'viewer'): Promise<void> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const sharedDiary = await FirestoreService.getById<SharedDiary>('sharedDiaries', diaryId);
      if (!sharedDiary) {
        throw new Error('Diario no encontrado');
      }

      if (sharedDiary.ownerId !== currentUser.uid) {
        throw new Error('No tienes permisos para invitar colaboradores');
      }

      const shareCode = sharedDiary.shareCode;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const invitation: Omit<DiaryInvitation, 'id'> = {
        diaryId,
        invitedEmail: email,
        shareCode,
        role,
        invitedBy: currentUser.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      await FirestoreService.create<DiaryInvitation>('diaryInvitations', invitation);

      // Send email invitation
      try {
        const { EmailService } = await import('../services/emailService');
        const inviterName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
        const invitationLink = `${window.location.origin}?invite=${shareCode}`;
        
        await EmailService.sendInvitationEmail({
          to_email: email,
          diary_title: sharedDiary.title,
          inviter_name: inviterName,
          invitation_link: invitationLink,
          role: role === 'editor' ? 'Editor' : 'Visualizador',
          expires_date: expiresAt.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
        
        console.log(`Email invitation sent to ${email} for diary ${diaryId}`);
      } catch (emailError) {
        console.error('Error sending email invitation:', emailError);
        // No lanzamos el error para que la invitación se guarde aunque falle el email
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  }

  // Accept invitation
  static async acceptInvitation(invitationCode: string, userId: string): Promise<void> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Find invitation
      const invitations = await FirestoreService.getAll<DiaryInvitation>('diaryInvitations', [
        where('shareCode', '==', invitationCode),
        where('status', '==', 'pending')
      ]);

      if (invitations.length === 0) {
        throw new Error('Invitación no encontrada o expirada');
      }

      const invitation = invitations[0];

      // Check if invitation is expired
      if (invitation.expiresAt.toDate() < new Date()) {
        throw new Error('La invitación ha expirado');
      }

      // Add user as collaborator
      await this.addCollaborator(
        invitation.diaryId,
        userId,
        currentUser.email || '',
        currentUser.displayName || 'Usuario',
        invitation.role,
        invitation.invitedBy
      );

      // Update invitation status
      await FirestoreService.update<DiaryInvitation>('diaryInvitations', invitation.id!, {
        status: 'accepted'
      });
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Get collaborators for a diary
  static async getCollaborators(diaryId: string): Promise<DiaryCollaborator[]> {
    try {
      return await FirestoreService.getAll<DiaryCollaborator>('diaryCollaborators', [
        where('diaryId', '==', diaryId),
        where('status', '==', 'active')
      ]);
    } catch (error) {
      console.error('Error getting collaborators:', error);
      throw error;
    }
  }

  // Check if user can edit diary
  static async canUserEditDiary(diaryId: string, userId: string): Promise<boolean> {
    try {
      const collaborators = await this.getCollaborators(diaryId);
      const userCollaborator = collaborators.find(c => c.userId === userId);
      return userCollaborator ? ['owner', 'editor'].includes(userCollaborator.role) : false;
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return false;
    }
  }

}

// Test connection utility
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Test Firestore connection
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    
    // Test Auth connection
    const currentUser = auth.currentUser;
    
    console.log('✅ Firebase connection test passed');
    console.log('📊 Firestore: Connected');
    console.log('🔐 Auth: Connected');
    console.log('👤 Current user:', currentUser ? currentUser.email : 'Not signed in');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};