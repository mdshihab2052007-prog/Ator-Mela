import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { toBanglaDigits, formatPrice } from '../utils/formatters.ts';
import { X, User, LogIn, UserPlus, Package, LogOut, CheckCircle2, AlertCircle, ShieldCheck, Search, Truck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    userProfile,
    userOrders,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    updateUserProfile,
  } = useAuth();

  const { lang, setIsTrackingOpen, setLastCreatedOrder } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [areaUpazila, setAreaUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync profile data to edit fields when logged in
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setDistrict(userProfile.district || 'Dhaka');
      setAreaUpazila(userProfile.areaUpazila || '');
      setFullAddress(userProfile.fullAddress || '');
    }
  }, [userProfile]);

  if (!isAuthModalOpen) return null;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে প্রয়োজনীয় ঘরগুলো পূরণ করুন।' : 'Please fill in required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUpWithEmail(email, password, name, phone, fullAddress);
      setSuccessMsg(lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg(lang === 'bn' ? 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত।' : 'This email is already registered.');
      } else if (err?.message?.includes('token-service-api') || err?.message?.includes('securetoken')) {
        setErrorMsg(lang === 'bn' ? 'Firebase Authentication API প্রস্তুত হচ্ছে। আপনি লগইন ছাড়াই সরাসরি অর্ডার করতে পারবেন।' : 'Firebase Token Service API is initializing on your cloud project. You can order directly without login.');
      } else {
        setErrorMsg(err.message || (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করা যায়নি।' : 'Failed to create account.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Please enter email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmail(email, password);
      setSuccessMsg(lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg(lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড।' : 'Invalid email or password.');
      } else if (err?.message?.includes('token-service-api') || err?.message?.includes('securetoken')) {
        setErrorMsg(lang === 'bn' ? 'Firebase Authentication API প্রস্তুত হচ্ছে। আপনি লগইন ছাড়াই সরাসরি অর্ডার করতে পারবেন।' : 'Firebase Token Service API is initializing on your cloud project. You can order directly without login.');
      } else {
        setErrorMsg(err.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      setSuccessMsg(lang === 'bn' ? 'Google দিয়ে সফলভাবে সাইন ইন হয়েছে!' : 'Signed in with Google!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('token-service-api') || err?.message?.includes('securetoken')) {
        setErrorMsg(lang === 'bn' ? 'Firebase Authentication API প্রস্তুত হচ্ছে। আপনি লগইন ছাড়াই সরাসরি ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারেন।' : 'Firebase Token Service API is initializing. You can place your order directly via Cash on Delivery.');
      } else {
        setErrorMsg(err.message || (lang === 'bn' ? 'Google সাইন ইন ব্যর্থ হয়েছে।' : 'Google Sign-In failed.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setIsSubmitting(true);
      await updateUserProfile({
        displayName: name,
        phone,
        district,
        areaUpazila,
        fullAddress,
      });
      setSuccessMsg(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে!' : 'Profile updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(lang === 'bn' ? 'প্রোফাইল সেভ করা যায়নি।' : 'Failed to save profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bn: string; en: string; class: string }> = {
      new: { bn: 'নতুন অর্ডার', en: 'New Order', class: 'bg-amber-950/80 text-amber-300 border-amber-800/50' },
      confirmed: { bn: 'নিশ্চিত', en: 'Confirmed', class: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' },
      shipped: { bn: 'ডেলিভারিতে আছে', en: 'Shipped', class: 'bg-blue-950/80 text-blue-300 border-blue-800/50' },
      delivered: { bn: 'সম্পন্ন', en: 'Delivered', class: 'bg-emerald-900/90 text-emerald-200 border-emerald-700' },
      cancelled: { bn: 'বাতিল', en: 'Cancelled', class: 'bg-red-950/80 text-red-300 border-red-800/50' },
    };

    const target = map[status] || { bn: status, en: status, class: 'bg-stone-800 text-stone-300 border-stone-700' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${target.class}`}>
        {lang === 'bn' ? target.bn : target.en}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-bold text-amber-100">
              {user
                ? lang === 'bn'
                  ? 'গ্রাহক অ্যাকাউন্ট'
                  : 'Customer Account'
                : lang === 'bn'
                ? 'অ্যাটোর মেলা অ্যাকাউন্ট'
                : 'Ator Mela Account'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-800 bg-stone-950/40">
          {user ? (
            <>
              <button
                onClick={() => setAuthModalTab('profile')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                  authModalTab === 'profile'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <User className="w-4 h-4" />
                {lang === 'bn' ? 'আমার তথ্য' : 'Profile'}
              </button>
              <button
                onClick={() => setAuthModalTab('orders')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                  authModalTab === 'orders'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Package className="w-4 h-4" />
                {lang === 'bn' ? `অর্ডারসমূহ (${toBanglaDigits(userOrders.length)})` : `Orders (${userOrders.length})`}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModalTab('signup')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                  authModalTab === 'signup'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {lang === 'bn' ? 'সাইন আপ' : 'Sign Up'}
              </button>
              <button
                onClick={() => setAuthModalTab('login')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                  authModalTab === 'login'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {lang === 'bn' ? 'লগইন' : 'Sign In'}
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN UP FORM */}
          {!user && authModalTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your full name'}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 chars) *'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-900/30 transition disabled:opacity-50"
              >
                {isSubmitting
                  ? lang === 'bn'
                    ? 'তৈরি হচ্ছে...'
                    : 'Creating Account...'
                  : lang === 'bn'
                  ? 'সাইন আপ করুন'
                  : 'Create Account'}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-800"></div>
                </div>
                <span className="relative px-3 bg-stone-900 text-xs text-stone-500">
                  {lang === 'bn' ? 'অথবা' : 'OR'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-stone-950 border border-stone-700 hover:border-amber-500 text-stone-200 font-medium flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {lang === 'bn' ? 'Google দিয়ে সাইন ইন' : 'Sign In with Google'}
              </button>
            </form>
          )}

          {/* SIGN IN FORM */}
          {!user && authModalTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-900/30 transition disabled:opacity-50"
              >
                {isSubmitting
                  ? lang === 'bn'
                    ? 'লগইন হচ্ছে...'
                    : 'Signing In...'
                  : lang === 'bn'
                  ? 'লগইন করুন'
                  : 'Sign In'}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-800"></div>
                </div>
                <span className="relative px-3 bg-stone-900 text-xs text-stone-500">
                  {lang === 'bn' ? 'অথবা' : 'OR'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-stone-950 border border-stone-700 hover:border-amber-500 text-stone-200 font-medium flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {lang === 'bn' ? 'Google দিয়ে সাইন ইন' : 'Sign In with Google'}
              </button>
            </form>
          )}

          {/* PROFILE TAB (LOGGED IN) */}
          {user && authModalTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-950/80 border border-stone-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-14 h-14 rounded-full border border-amber-500/40" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xl border border-amber-500/30">
                    {(userProfile?.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-100 text-lg truncate">{userProfile?.displayName || user.email}</h3>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[11px] text-amber-400 font-mono">
                    ID: {user.uid.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Order History Quick Access Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 via-[#1A1410] to-stone-950 border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-stone-100 text-sm">
                      {lang === 'bn' ? 'অর্ডার হিস্ট্রি (Order History)' : 'Order History'}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                    {lang === 'bn' ? `${toBanglaDigits(userOrders.length)} টি অর্ডার` : `${userOrders.length} Orders`}
                  </span>
                </div>
                
                <p className="text-xs text-stone-400 mb-3">
                  {lang === 'bn'
                    ? 'আপনার ফায়ারস্টোর অ্যাকাউন্টে সংরক্ষিত পূর্বের অর্ডারগুলোর লাইব স্ট্যাটাস ও ট্র্যাকিং বিস্তারিত দেখুন।'
                    : 'View real-time status and live tracking for past orders saved to your account.'}
                </p>

                {userOrders.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-400 font-mono">#{userOrders[0].id}</span>
                      <span className="block text-[10px] text-stone-500">
                        {userOrders[0].createdAt ? new Date(userOrders[0].createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {getStatusBadge(userOrders[0].status)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setAuthModalTab('orders')}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Package className="w-4 h-4" />
                  <span>
                    {lang === 'bn' ? 'সব অর্ডারের তালিকা ও ট্র্যাকিং দেখুন' : 'View All Past Orders & Tracking'}
                  </span>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <h4 className="text-xs uppercase font-semibold text-amber-400 tracking-wider">
                  {lang === 'bn' ? 'ডিফল্ট ডেলিভারি তথ্য' : 'Default Delivery Details'}
                </h4>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {lang === 'bn' ? 'নাম' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {lang === 'bn' ? 'জেলা' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Dhaka"
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {lang === 'bn' ? 'থানা / এলাকা' : 'Upazila / Area'}
                    </label>
                    <input
                      type="text"
                      value={areaUpazila}
                      onChange={(e) => setAreaUpazila(e.target.value)}
                      placeholder="Dhanmondi"
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {lang === 'bn' ? 'সম্পূর্ণ ঠিকানা' : 'Full Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder={lang === 'bn' ? 'বাসা নম্বর, রোড নম্বর...' : 'House #, Road #...'}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm transition"
                  >
                    {isSubmitting
                      ? lang === 'bn'
                        ? 'সেভ হচ্ছে...'
                        : 'Saving...'
                      : lang === 'bn'
                      ? 'তথ্য সেভ করুন'
                      : 'Save Information'}
                  </button>
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-red-950 hover:text-red-300 text-stone-300 font-medium text-sm flex items-center gap-1.5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === 'bn' ? 'লগআউট' : 'Sign Out'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ORDERS TAB / ORDER HISTORY VIEW (LOGGED IN) */}
          {user && authModalTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-base">
                    {lang === 'bn' ? 'আপনার অর্ডারের ইতিহাস (Order History)' : 'Your Order History'}
                  </h3>
                </div>
                <span className="text-xs text-stone-400">
                  {lang === 'bn' ? `${toBanglaDigits(userOrders.length)} টি রেকর্ড` : `${userOrders.length} records`}
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <Package className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
                  <p className="text-sm font-medium text-stone-400">
                    {lang === 'bn' ? 'আপনার অ্যাকাউন্টে কোনো আগের অর্ডার পাওয়া যায়নি।' : 'No past orders found in your account.'}
                  </p>
                  <p className="text-xs text-stone-600">
                    {lang === 'bn' ? 'অর্ডার করার পর এখানে স্বয়ংক্রিয়ভাবে রিয়েল-টাইম তথ্য ও ট্র্যাকিং যুক্ত হবে।' : 'Orders placed with your logged-in account will appear here automatically.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-900/60 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-amber-400 font-mono font-bold">
                            #{ord.id}
                          </span>
                          <div className="text-[11px] text-stone-400">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        {getStatusBadge(ord.status)}
                      </div>

                      {ord.items && ord.items.length > 0 && (
                        <div className="text-xs text-stone-300 space-y-1.5 py-2 border-t border-b border-stone-900 my-1">
                          {ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>
                                {lang === 'bn' ? item.product_name_bn || item.name : item.product_name_en || item.name} ({toBanglaDigits(item.paid_bottles || item.quantity)} বোতল)
                                {item.free_bottles ? ` (+${toBanglaDigits(item.free_bottles)} ফ্রি)` : ''}
                              </span>
                              <span className="font-mono text-stone-400">
                                {formatPrice(item.total_price || (item.unit_price * (item.paid_bottles || item.quantity)), lang)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ord.courier_name && (
                        <div className="p-2 rounded bg-stone-900 border border-stone-800 text-xs text-amber-300/90 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {ord.courier_name} {ord.tracking_id ? `(${ord.tracking_id})` : ''}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs text-stone-400 block">{lang === 'bn' ? 'সর্বমোট' : 'Total'}</span>
                          <span className="text-amber-300 font-mono font-bold text-sm">{formatPrice(ord.total, lang)}</span>
                        </div>

                        {/* 1-Tap Track Order Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setLastCreatedOrder(ord as any);
                            setIsTrackingOpen(true);
                            setIsAuthModalOpen(false);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'লাইভ ট্র্যাক করুন' : 'Track Order'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
