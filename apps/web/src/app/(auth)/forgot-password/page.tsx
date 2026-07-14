'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset email. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">BizOptics</span>
        </Link>

        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-8">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link to your email address. It expires in 1 hour.
              </p>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-5">
                  <Mail className="w-7 h-7 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
                <p className="text-slate-400 text-sm">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-5">
                <Link href="/login" className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
