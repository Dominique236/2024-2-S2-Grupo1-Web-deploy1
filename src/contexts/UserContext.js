// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { USER_ENDPOINT } from '../utils/apiRoutes';
import { useAuth0 } from '@auth0/auth0-react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('');
  const { user, isAuthenticated, isLoading } = useAuth0();

  // Función para obtener el rol del usuario
  const fetchUserRole = async () => {
    try {
      if (isAuthenticated && user) {
        const response = await axios.get(`${USER_ENDPOINT}/${user.sub}`);
        const userData = response.data;                   
        setUserRole(userData.user_metadata.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  // Llamamos a fetchUserRole cuando se monta el componente y cuando user y isAuthenticated cambian
  useEffect(() => {
    if (!isLoading) {
      fetchUserRole();
    }
  }, [user, isAuthenticated, isLoading]);

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};
