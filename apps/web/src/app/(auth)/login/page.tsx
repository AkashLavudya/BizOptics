'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, ArrowRight, BarChart3, Target, Bot } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, accessToken } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  // Prevent autofill from submitting before user interaction
  const [userInteracted, setUserInteracted] = useState(false);

  // If store says authenticated AND we have a stored token, go to dashboard
  // But don't redirect blindly — the token may be stale; let it validate on dashboard load
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const cookie = typeof document !== 'undefined'
      ? document.cookie.split(';').some(c => c.trim().startsWith('accessToken='))
      : false;

    // Only redirect if we have both Zustand state AND a real token stored
    if (isAuthenticated && accessToken && storedToken && cookie) {
      router.replace('/dashboard');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    // Guard: browser autofill can trigger onSubmit without real user interaction
    if (!userInteracted) {
      setUserInteracted(true);
      return;
    }

    try {
      const res: any = await authApi.login(data);
      const payload = res?.data ?? res;
      const { user, tokens } = payload;

      if (!user || !tokens?.accessToken) {
        throw new Error('Unexpected response shape from login API');
      }

      setAuth(user, tokens);

      // Write cookie with explicit expiry so middleware can read it immediately
      document.cookie = `accessToken=${encodeURIComponent(tokens.accessToken)}; path=/; SameSite=Lax; max-age=${7 * 86400}`;

      toast({ title: 'Welcome back!', description: `Hello, ${user.firstName}!`, variant: 'success' as any });
      router.push('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.message || err?.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between hero-gradient p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">BizOptics</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Identify Your Next<br />
            <span className="gradient-text">$50,000 Client</span>
          </h2>
          <p className="text-slate-300 mb-10 text-lg">
            AI-powered business intelligence that finds, scores, and prioritizes your best prospects automatically.
          </p>

          <div className="space-y-4">
            {[
              { icon: BarChart3, text: 'Automatic website quality scoring' },
              { icon: Target, text: 'Workflow automation opportunity detection' },
              { icon: Bot, text: 'AI agent suitability analysis' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BizOptics. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">BizOptics</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400">Sign in to your BizOptics account</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            // Mark user interaction on any input change
            onChange={() => setUserInteracted(true)}
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setUserInteracted(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one free
            </Link>
          </p>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400 text-center font-medium mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500 text-center">
              <div>admin@bizoptics.com / Admin@123456</div>
              <div>user@bizoptics.com / User@123456</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
