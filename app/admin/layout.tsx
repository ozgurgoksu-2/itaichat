'use client';

import { ReactNode, useState } from 'react';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex">
      <Toaster position="top-center" />
      
      {/* Sidebar */}
      <AdminSidebar 
        className="fixed left-0 top-0 h-full z-40" 
        onToggle={handleSidebarToggle}
      />
      
      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
