import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 transition-smooth">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <img src="/bs-logo.svg" alt="ByteSoft" className="w-16 h-16" />
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Empowering learners worldwide with quality education and expert guidance.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">About Us</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Careers</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Press</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Blog</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Help Center</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Community</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Guides</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Terms of Service</a></li>
              <li><a href="#" className="text-secondary-foreground/80 hover:text-primary transition-smooth hover:translate-x-1 inline-block">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8">
          <div className="flex flex-col items-center gap-4">
            <Link to="/admin-login">
              <Button variant="ghost" size="sm" className="text-xs text-secondary-foreground/80 hover:text-primary hover:bg-primary/10 transition-smooth">
                Admin Access
              </Button>
            </Link>
            <p className="text-center text-sm text-secondary-foreground/80 flex items-center gap-1">
              &copy; {new Date().getFullYear()} ByteSoft. Made with <Heart className="w-3 h-3 text-red-500 inline fill-current animate-pulse" /> for learners worldwide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
