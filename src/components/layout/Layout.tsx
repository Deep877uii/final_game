import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ToastContainer from '../Toast';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
  const { theme } = useApp();

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`flex w-full min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar 
        open={sidebarOpen} 
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Spacer to push content right of the fixed sidebar on desktop */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-[248px]'}`} />

      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        <TopNav onMenuClick={toggleSidebar} />

        <main className="flex-1 px-6 md:px-10 py-8 pb-12 w-full transition-all duration-300 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
