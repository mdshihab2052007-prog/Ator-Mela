import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase.ts';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  district?: string;
  areaUpazila?: string;
  fullAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserOrderData {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  district?: string;
  areaUpazila?: string;
  fullAddress?: string;
  note?: string;
  items?: any[];
  paidBottlesTotal?: number;
  freeBottlesTotal?: number;
  totalPaidMl?: number;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  paymentMethod?: string;
  status: string;
  courier_name?: string;
  tracking_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  userOrders: UserOrderData[];
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'profile' | 'orders';
  setAuthModalTab: (tab: 'login' | 'signup' | 'profile' | 'orders') => void;
  openAuthModal: (tab?: 'login' | 'signup' | 'profile' | 'orders') => void;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string, fullAddress?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDemoAccount: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
  saveOrderToProfile: (orderData: Omit<UserOrderData, 'userId'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'profile' | 'orders'>('login');

  const openAuthModal = (tab: 'login' | 'signup' | 'profile' | 'orders' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Sync user profile document upon auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userPath = `users/${currentUser.uid}`;
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfileData);
          } else {
            // Create user document if first time
            const now = new Date().toISOString();
            const newProfile: UserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL || '',
              createdAt: now,
              updatedAt: now,
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err: any) {
          if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
            handleFirestoreError(err, OperationType.GET, userPath);
          } else {
            console.warn('Firestore profile fallback:', err?.message || err);
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL || '',
            });
          }
        }
      } else {
        setUserProfile(null);
        setUserOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // Listen for user orders in real time when authenticated
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }

    const ordersCollectionRef = collection(db, 'users', user.uid, 'orders');
    const ordersPath = `users/${user.uid}/orders`;
    const q = query(ordersCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersList: UserOrderData[] = [];
        snapshot.forEach((docSnap) => {
          ordersList.push(docSnap.data() as UserOrderData);
        });
        // Sort newest first
        ordersList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setUserOrders(ordersList);
      },
      (error) => {
        if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
          handleFirestoreError(error, OperationType.GET, ordersPath);
        } else {
          console.warn('Firestore orders sync offline/connectivity notice:', error.message);
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone?: string,
    fullAddress?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userPath = `users/${cred.user.uid}`;
    const now = new Date().toISOString();
    const profile: UserProfileData = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name,
      photoURL: cred.user.photoURL || '',
      phone: phone || '',
      fullAddress: fullAddress || '',
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(userDocRef, profile);
      setUserProfile(profile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithDemoAccount = async () => {
    const demoEmail = 'demo@atormela.online';
    const demoPass = 'demo123456';
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signUpWithEmail(demoEmail, demoPass, 'সম্মানিত টেস্ট গ্রাহক', '01643249148', 'বোয়ালিয়া, রাজশাহী');
          return;
        } catch (innerErr: any) {
          console.warn('Demo account registration attempt:', innerErr?.message || innerErr);
        }
      }

      // Robust fallback if Firebase Auth Email/Password provider is not enabled in Firebase console
      const mockDemoUser: any = {
        uid: 'demo-client-user-123',
        email: demoEmail,
        displayName: 'সম্মানিত টেস্ট গ্রাহক',
        photoURL: '',
        emailVerified: true,
      };
      setUser(mockDemoUser);
      setUserProfile({
        uid: 'demo-client-user-123',
        email: demoEmail,
        displayName: 'সম্মানিত টেস্ট গ্রাহক',
        phone: '01643249148',
        district: 'Rajshahi',
        areaUpazila: 'Boalia',
        fullAddress: 'বোয়ালিয়া, রাজশাহী',
      });
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setUserProfile(null);
    setUserOrders([]);
    setIsAuthModalOpen(false);
  };

  const updateUserProfile = async (data: Partial<UserProfileData>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userPath = `users/${user.uid}`;
    const updated: UserProfileData = {
      ...(userProfile || {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userDocRef, updated, { merge: true });
      setUserProfile(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  };

  const saveOrderToProfile = async (orderData: Omit<UserOrderData, 'userId'>) => {
    if (!user) return;
    const orderDocRef = doc(db, 'users', user.uid, 'orders', orderData.id);
    const orderPath = `users/${user.uid}/orders/${orderData.id}`;
    const fullOrder: UserOrderData = {
      ...orderData,
      userId: user.uid,
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(orderDocRef, fullOrder);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, orderPath);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userOrders,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithDemoAccount,
        signOutUser,
        updateUserProfile,
        saveOrderToProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
