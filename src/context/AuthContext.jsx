  import { createContext, useContext, useEffect, useState } from "react";
  import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth";
  import {
    doc,
    getDoc,
    setDoc,
  } from "firebase/firestore";
  import { auth, db } from "../firebase/firebase";

  // Crear contexto
  const AuthContext = createContext();

  // Hook personalizado
  export const useAuth = () => useContext(AuthContext);

  // Proveedor de contexto
  export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [rol, setRol] = useState(null);
    const [cargando, setCargando] = useState(true);

    // ✅ Login con Google
    const loginWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          nombre: user.displayName || '',
          telefono: '',
          email: user.email.toLowerCase(),
          fechaNacimiento: '',
          rol: 'user',
          creado: new Date().toISOString(),
        });
      }

      return result;
    };

    // 🚪 Logout
    const logout = () => signOut(auth);

    // 🔁 Observar el estado del auth
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUsuario(user);
          try {
            const ref = doc(db, "usuarios", user.uid);
            const snap = await getDoc(ref);
            setRol(snap.exists() ? snap.data().rol : 'user');
          } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            setRol(null);
          }
        } else {
          setUsuario(null);
          setRol(null);
        }

        setCargando(false);
      });

      return () => unsubscribe();
    }, []);

    return (
      <AuthContext.Provider
        value={{
          usuario,
          rol,
          cargando,
          loginWithGoogle,
          logout,
        }}
      >
        {!cargando && children}
      </AuthContext.Provider>
    );
  };
