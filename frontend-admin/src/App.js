import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import VolunteerManagement from './pages/VolunteerManagement';
import VolunteerApplicationManagement from './pages/VolunteerApplicationManagement';
import ActivityManagement from './pages/ActivityManagement';
import ActivityApplicationManagement from './pages/ActivityApplicationManagement';
import RegistrationManagement from './pages/RegistrationManagement';
import BannerManagement from './pages/BannerManagement';
import NewsManagement from './pages/NewsManagement';
import MessageManagement from './pages/MessageManagement';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <Navigate to="/dashboard" replace />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/volunteers" element={
          <ProtectedRoute>
            <AdminLayout>
              <VolunteerManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/volunteer-applications" element={
          <ProtectedRoute>
            <AdminLayout>
              <VolunteerApplicationManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/activities" element={
          <ProtectedRoute>
            <AdminLayout>
              <ActivityManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/activity-applications" element={
          <ProtectedRoute>
            <AdminLayout>
              <ActivityApplicationManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrations" element={
          <ProtectedRoute>
            <AdminLayout>
              <RegistrationManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/banners" element={
          <ProtectedRoute>
            <AdminLayout>
              <BannerManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/news" element={
          <ProtectedRoute>
            <AdminLayout>
              <NewsManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <AdminLayout>
              <MessageManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <AdminLayout>
              <Profile />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
