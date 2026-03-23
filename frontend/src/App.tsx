import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Users from './pages/Users';
import { useAuth } from './hooks/useAuth';

// TODO: import additional pages and add routes below

export default function App() {
  const user = useAuth();

  useEffect(() => {
    if (!user) window.location.href = '/login';
  }, [user]);

  if (!user) return null;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="users" element={<Users />} />
        {/* TODO: add more routes here */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
