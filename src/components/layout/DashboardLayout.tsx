import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
