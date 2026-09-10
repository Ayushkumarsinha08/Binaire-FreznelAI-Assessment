import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModelProvider } from './context/ModelContext';
import { AppShell } from './components/Layout/AppShell';
import './styles/app.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ModelProvider>
        <AppShell />
      </ModelProvider>
    </AuthProvider>
  );
};

export default App;
