import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'coordinator' | 'teacher'>('student');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signup(email, password, name, role, accessCode || undefined);

      if (result.success) {
        toast({
          title: "Account created successfully",
          description: "Welcome to ByteSoft!",
        });

        if (role === 'student') {
          navigate('/student-dashboard');
        } else if (role === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/coordinator-dashboard');
        }
      } else {
        toast({
          title: "Signup failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <img src="/bs-logo.svg" alt="ByteSoft" className="w-16 h-16" />
            <span className="text-5xl font-bold font-heading">ByteSoft</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Join ByteSoft Today!</h2>
          <p className="text-xl text-muted-foreground">
            Start your learning journey with our comprehensive courses and expert instructors.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <img src="/bs-logo.svg" alt="ByteSoft" className="w-10 h-10" />
            <span className="text-3xl font-bold font-heading">ByteSoft</span>
          </div>

          <Card className="p-8 shadow-strong">
            <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

            <Tabs defaultValue="student" onValueChange={(v) => setRole(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="coordinator">Coordinator</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled={loading}
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
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {(role === 'teacher' || role === 'coordinator') && (
                <div>
                  <Label htmlFor="accessCode">
                    {role === 'teacher' ? 'Teacher Access Code (6-digit)' : 'Coordinator Access Code (8-digit)'}
                  </Label>
                  <Input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    placeholder={role === 'teacher' ? '123456' : '12345678'}
                    maxLength={role === 'teacher' ? 6 : 8}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only codes generated by the admin are valid
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
