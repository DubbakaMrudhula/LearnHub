import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export const BaseLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-purple-500 selection:text-white relative">
      {/* Subtle Purple Ambient Lighting Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[28rem] h-[28rem] bg-indigo-100/35 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BaseLayout;
