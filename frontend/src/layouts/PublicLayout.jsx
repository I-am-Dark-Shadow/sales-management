import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import BgAnimation from '../components/shared/BgAnimation'; // ⬅️ import animation component

const PublicHeader = () => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-black/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 grid place-items-center rounded-md border border-black/10 text-pran-red font-semibold tracking-tighter">
              <img src="./logo.png" alt="Logo" />
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">Sales Management</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2.5 text-sm font-medium tracking-tight hover:bg-[#b72828] focus:outline-none focus-visible:ring-2 ring-pran-red/40 transition"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const PublicFooter = () => {
  return (
    <footer className="bg-pran-red border-t border-black/5 ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-center text-sm text-white font-medium">
        <p>&copy; {new Date().getFullYear()} PRAN-RFL Group. All rights reserved.</p>
        <p className="mt-2">Sales management.</p>
      </div>
    </footer>
  );
};

const PublicLayout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Animation */}
      <BgAnimation />

      {/* Foreground Content */}
      <div className="relative z-10 bg-gray-light/70">
        <PublicHeader />
        <main>
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </div>
  );
};

export default PublicLayout;
