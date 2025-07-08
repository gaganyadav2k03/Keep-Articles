import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactElement }) {
  return  useAuth().user? children:<Navigate to={"/login"}/>;
  
}
