import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);

      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/check?email=${user.email}`);
          const data = await response.json();

          if (data.exists) {
            setCurrentUser(user);
            setMongoUser(data.user); 
          } else {
            await signOut(auth);
            setCurrentUser(null);
            setMongoUser(null);
            setError("Access Denied: You are not authorized by HR.");
          }
        } catch (err) {
          console.error("Verification error:", err);
          setError("Connection failed. Please try again.");
          await signOut(auth);
        }
      } else {
        setCurrentUser(null);
        setMongoUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    mongoUser,
    loading, /* Remove this line when we remove the comment below*/
    error,
    logout,
    isHR: mongoUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {/* What we had before: just commented to be able to test
          {!loading ? children : <div className="loading-spinner">Verifying Credentials...</div>}
      */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);