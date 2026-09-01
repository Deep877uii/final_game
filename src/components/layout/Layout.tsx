import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ToastContainer from '../Toast';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useApp();

  return (
    <div className={`flex min-h-screen font-sans antialiased ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
