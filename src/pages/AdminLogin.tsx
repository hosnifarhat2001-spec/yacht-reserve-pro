import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Anchor, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(t('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Invalid email or password'));
        setIsLoading(false);
        return;
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData) {
          // User is admin - redirect to dashboard immediately
          toast.success(t('مرحباً بك في لوحة التحكم', 'Welcome to Dashboard'));
          navigate('/admin/dashboard');
        } else {
          // Regular user - redirect to home
          toast.success(t('تم تسجيل الدخول بنجاح', 'Logged in successfully'));
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('حدث خطأ في تسجيل الدخول', 'Login error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-ocean">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-ocean px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-ocean rounded-xl flex items-center justify-center mb-4">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">{t('تسجيل الدخول', 'Login')}</h1>
          <p className="text-muted-foreground mt-2">{t('للمستخدمين والمديرين', 'For Users & Admins')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label>{t('البريد الإلكتروني', 'Email')}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yachts.com"
              required
            />
          </div>

          <div>
            <Label>{t('كلمة المرور', 'Password')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-ocean" size="lg" disabled={isLoading}>
            <Lock className="w-4 h-4 mr-2" />
            {isLoading ? t('جاري تسجيل الدخول...', 'Logging in...') : t('تسجيل الدخول', 'Login')}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
          <p className="font-semibold mb-2">{t('ملاحظة:', 'Note:')}</p>
          <p className="text-muted-foreground">
            {t('المديرون سيتم توجيههم إلى لوحة التحكم، المستخدمون العاديون إلى الصفحة الرئيسية', 
               'Admins will be redirected to dashboard, regular users to home page')}
          </p>
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/')}
          >
            {t('العودة للصفحة الرئيسية', 'Back to Home')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
