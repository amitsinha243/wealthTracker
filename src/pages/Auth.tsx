import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, Wallet, Lock, User, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'email-sent';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('view');
    const token = searchParams.get('token');

    if (view === 'reset-password' && token) {
      setResetToken(token);
      setAuthView('reset-password');
    }
  }, [location.search]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signup(email, password, name);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.error || 'Signup failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent!');
      setAuthView('email-sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      toast.success('Password reset successfully! You can now login.');
      setAuthView('login');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0b] selection:bg-primary/30 selection:text-white">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] bg-accent/20 rounded-full blur-[100px]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,11,0.8)_100%)]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-[440px] px-6 relative z-10"
      >
        {/* Branding Section */}
        <div className="text-center mb-8 space-y-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/20 mb-4"
          >
            <Wallet className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white tracking-tighter"
          >
            Wealth<span className="text-primary">Tracker</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm font-medium tracking-wide uppercase"
          >
            Master Your Financial Universe
          </motion.p>
        </div>

        {/* Main Card */}
        <div className="bg-[#161618]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <AnimatePresence mode="wait">
            {authView === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                  <p className="text-muted-foreground text-sm">Please enter your details to login.</p>
                </div>
                <Tabs defaultValue="login" className="w-full" onValueChange={(val) => setAuthView(val as any)}>
                  <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 mb-8 rounded-xl h-12">
                    <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Join</TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="bg-[#0a0a0b]/50 border-white/5 h-12 pl-10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#0a0a0b]/50 border-white/5 h-12 pl-10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all mt-4" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-xs text-muted-foreground hover:text-primary transition-colors mt-2 font-medium"
                      onClick={() => setAuthView('forgot-password')}
                    >
                      Forgot your password?
                    </button>
                  </form>
                </Tabs>
              </motion.div>
            )}

            {authView === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
                  <p className="text-muted-foreground text-sm">Start your financial journey today.</p>
                </div>
                <Tabs defaultValue="signup" className="w-full" onValueChange={(val) => setAuthView(val as any)}>
                  <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 mb-8 rounded-xl h-12">
                    <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Join</TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          className="bg-[#0a0a0b]/50 border-white/5 h-12 pl-10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="bg-[#0a0a0b]/50 border-white/5 h-12 pl-10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#0a0a0b]/50 border-white/5 h-12 pl-10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all mt-4" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </Tabs>
              </motion.div>
            )}

            {authView === 'forgot-password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
                  <p className="text-muted-foreground text-sm">We'll send you a link to reset your password.</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="bg-[#0a0a0b]/50 border-white/5 h-12 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full hover:bg-white/5 text-muted-foreground"
                    onClick={() => setAuthView('login')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </form>
              </motion.div>
            )}

            {authView === 'email-sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <ShieldCheck size={48} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Email Sent!</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Check your inbox we've sent instructions to <span className="text-white font-medium">{email}</span>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5"
                  onClick={() => setAuthView('login')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Login
                </Button>
              </motion.div>
            )}

            {authView === 'reset-password' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">New Password</h2>
                  <p className="text-muted-foreground text-sm">Please set your new secure password.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0a0a0b]/50 border-white/5 h-12 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0a0a0b]/50 border-white/5 h-12 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Reset Password"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" />
              AI Powered
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-widest">
              <Lock className="h-4 w-4" />
              Secure Bank-Grade
            </div>
          </div>
          <p className="text-[10px] text-white/20 font-medium tracking-tighter uppercase">
            &copy; 2026 WealthTracker Labs. All assets encrypted.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
