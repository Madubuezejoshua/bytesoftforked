import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out px-4 py-3 sm:top-4 sm:left-4 sm:right-4 sm:px-0 ${
      isScrolled ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-8 scale-95 pointer-events-none'
    }`}>
      <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl px-3 sm:px-4 py-2 relative overflow-hidden max-w-full">
        {/* Liquid glass overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 rounded-2xl sm:rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-2xl sm:rounded-3xl"></div>

        <div className="flex justify-between items-center relative z-10 min-w-0">
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            <img src="/bs-logo.svg" alt="ByteSoft" className="w-6 h-6 flex-shrink-0" />
            <span className="text-base sm:text-lg font-bold text-gray-900 truncate">ByteSoft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center mx-6 xl:mx-8">
            <a href="#home" className="text-gray-700 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap">
              Home
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap">
              About
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap">
              Pricing
            </a>
            <Link to="/courses" className="text-gray-700 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap">
              Courses
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Link
              to="/signup"
              className="hidden lg:block"
            >
              <Button className="bg-blue-500/90 hover:bg-blue-600 text-white rounded-2xl px-3 sm:px-4 py-1.5 text-xs sm:text-sm backdrop-blur-sm border border-blue-400/30 shadow-lg whitespace-nowrap">
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 relative z-10">
            {/* Shining white gradient line */}
            <div className="relative w-full h-px mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm"></div>
            </div>

            <nav className="flex flex-col space-y-2">
              <a
                href="#home"
                className="text-gray-700 hover:text-blue-500 transition-colors py-1.5 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-500 transition-colors py-1.5 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-500 transition-colors py-1.5 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                to="/courses"
                className="text-gray-700 hover:text-blue-500 transition-colors py-1.5 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="bg-blue-500/90 hover:bg-blue-600 text-white rounded-2xl w-full mt-2 py-1.5 text-sm backdrop-blur-sm border border-blue-400/30 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
