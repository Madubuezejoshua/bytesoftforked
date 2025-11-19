import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password, 'admin');
    
    if (success) {
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin panel!",
      });
      navigate('/admin-panel');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/bs-logo.svg" alt="ByteSoft" className="w-8 h-8" />
          <span className="text-3xl font-bold font-heading">Admin Access</span>
        </div>

        <Card className="p-8 shadow-strong border-primary/20">
          <div className="flex items-center justify-center mb-6">
            <img src="/bs-logo.svg" alt="ByteSoft" className="w-12 h-12" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Administrator Login</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            This area is restricted to administrators only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@bytesoft.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Login as Admin
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Not an admin?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Go to user login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
