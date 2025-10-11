import React, { useState, useEffect } from 'react';
import handsBookImage from '../assets/Hands - Book.png';
import { AuthService } from '../firebase';

interface WelcomeScreenProps {
  onStart: () => void;
  isTransitioning: boolean;
}

export function WelcomeScreen({ onStart, isTransitioning }: WelcomeScreenProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
      
      // Auto-redirect when user successfully authenticates
      if (user) {
        // Small delay to show the success message briefly
        setTimeout(() => {
          onStart();
        }, 1500);
      }
    });

    return () => unsubscribe();
  }, [onStart]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      await AuthService.signInWithGoogle();
      // The auth state change will be handled by the useEffect
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleStart = () => {
    if (isAuthenticated) {
      onStart();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97746] mx-auto mb-4"></div>
          <p className="text-[#9A9B73] family-inter">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8 transition-opacity duration-600 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center max-w-2xl">
        <div className="mb-12 relative inline-block">
          <img
            src={handsBookImage}
            alt="Libro de memorias"
            className="w-80 h-80 mx-auto object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="family-handwritten text-5xl mb-6 text-[#4E443A]">
          Bienvenida a Nuestro Diario
        </h1>

        <p className="text-lg text-[#9A9B73] family-inter leading-relaxed mb-4">
          Este es nuestro espacio especial, donde cada momento compartido se convierte en un tesoro guardado.
        </p>

        <p className="text-md text-[#9A9B73] family-inter leading-relaxed mb-12">
          Aquí escribiremos sobre las risas, los abrazos, las aventuras y esos pequeños instantes
          que hacen que nuestro amor sea único. Cada página es una promesa de que siempre recordaremos
          lo hermoso que es estar juntos.
        </p>

        {!isAuthenticated ? (
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#D97746]/20">
              <p className="text-[#4E443A] family-inter mb-4">
                Para acceder a nuestro diario, necesitas iniciar sesión
              </p>
              
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className={`w-full max-w-sm mx-auto flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isSigningIn
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg'
                }`}
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-3"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800 family-inter text-sm">
                ✅ Sesión iniciada correctamente
              </p>
              <p className="text-green-700 family-inter text-xs mt-2">
                Redirigiendo automáticamente...
              </p>
            </div>
            
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D97746] mx-auto mb-4"></div>
              <p className="family-handwritten text-2xl text-[#D97746]">
                Abriendo nuestro diario...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
