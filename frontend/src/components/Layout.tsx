import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo_short from "../../public/images/logo_short.png";
import { Archive, Calculator, ChartLine, HomeIcon, LogOut, User, Users, Settings } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const desktopNavStyle = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-colors text-[11px] font-semibold ${
      isActive ? "bg-blue-100 text-sello-blue" : "text-gray-700 hover:bg-gray-100"
    }`;

  const mobileNavStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center transition-all duration-300 ${
      isActive ? "bg-blue-100 text-sello-blue px-4 py-2.5 rounded-full gap-2" : "text-gray-600 p-2.5"
    }`;

  // 1. Accept a className prop and remove the hardcoded 'absolute' class
  const DropdownMenu = ({ className = "" }: { className?: string }) => (
    <div className={`w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 flex flex-col text-sm overflow-hidden ${className}`}>
      <button className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-sello-blue transition-colors text-left w-full">
        <User size={16} />
        View profile
      </button>
      <button className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-sello-blue transition-colors text-left w-full">
        <Settings size={16} />
        Settings
      </button>
      <div className="h-px bg-gray-100 my-1"></div>
      <button 
        onClick={logout} 
        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left w-full font-medium"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f7fb] md:bg-gray-100 md:p-4 md:gap-4 overflow-hidden relative">
      
      {/* --- MOBILE TOP HEADER --- */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#f4f7fb]">
        <img src={logo_short} alt="Sello Logo" className="h-7 object-contain" />
        
        <div className="flex items-center gap-4" ref={mobileMenuRef}>
          <div className="relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sello-blue transition-all"
            >
              <User size={18} className="text-gray-500" />
            </button>

            {/* 2. Apply absolute, right-0, and top-full directly to the component */}
            {isMobileMenuOpen && (
              <DropdownMenu className="absolute right-0 top-full mt-2" />
            )}
          </div>
        </div>
      </header>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-24 bg-white rounded-[2rem] shadow-sm flex-col items-center py-8 z-20 relative">
        <div className="flex flex-col items-center mb-10 gap-2">
          <img src={logo_short} alt="Sello Logo" className="h-8 object-contain" />
          <strong className="text-sello-blue text-sm">Sello</strong>
        </div>

        <nav className="flex flex-col items-center gap-4 w-full px-4">
          <NavLink to="/" className={desktopNavStyle} end>
            <HomeIcon size={24} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/products" className={desktopNavStyle}>
            <Archive size={24} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/analytics" className={desktopNavStyle}>
            <ChartLine size={24} />
            <span>Analytics</span>
          </NavLink>
          <NavLink to="/accounts" className={desktopNavStyle}>
            <Calculator size={24} />
            <span>Accounts</span>
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/users" className={desktopNavStyle}>
              <Users size={24} />
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-6 w-full px-2" ref={desktopMenuRef}>
          <div className="relative w-full flex flex-col items-center">
            <button 
              onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sello-blue transition-all"
            >
              <User size={20} className="text-gray-500" />
            </button>

            {/* 3. Apply absolute, left-full, and bottom-0 directly to the component */}
            {isDesktopMenuOpen && (
              <DropdownMenu className="absolute left-full bottom-0 ml-4" />
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 bg-white md:rounded-[2rem] rounded-t-3xl md:rounded-t-[2rem] shadow-sm overflow-hidden flex flex-col z-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden absolute bottom-6 left-6 right-6 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between px-3 py-2.5 z-50 border border-gray-100">
        <NavLink to="/" className={mobileNavStyle} end>
          {({ isActive }) => (
            <>
              <HomeIcon size={20} />
              {isActive && <span className="text-[13px] font-semibold">Home</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/products" className={mobileNavStyle}>
          {({ isActive }) => (
            <>
              <Archive size={20} />
              {isActive && <span className="text-[13px] font-semibold">Inventory</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/analytics" className={mobileNavStyle}>
          {({ isActive }) => (
            <>
              <ChartLine size={20} />
              {isActive && <span className="text-[13px] font-semibold">Analytics</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/accounts" className={mobileNavStyle}>
          {({ isActive }) => (
            <>
              <Calculator size={20} />
              {isActive && <span className="text-[13px] font-semibold">Accounts</span>}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}