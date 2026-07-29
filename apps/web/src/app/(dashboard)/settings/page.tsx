'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Save, Loader2, Key, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

// ─── API Key Section ──────────────────────────────────────────────────────────
function ApiKeySection() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const queryClient = useQueryClient();

  const { data: statusRaw, isLoading: statusLoading } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: () => profileApi.getApiKeyStatus() as any,
    staleTime: 30_000,
  });

  const status = statusRaw?.data ?? statusRaw ?? {};

  const saveMutation = useMutation({
    mutationFn: (key: string) => profileApi.saveApiKey(key) as any,
    onSuccess: (res: any) => {
      const result = res?.data ?? res ?? {};
      queryClient.invalidateQueries({ queryKey: ['api-key-status'] });
      setApiKey('');
      toast({
        title: result.hasKey ? '✅ API key saved!' : '🗑️ API key removed',
        description: result.hasKey
          ? 'Your Google Places API key is now active. Real business data will be used on next scan.'
          : 'Switched back to demo mode.',
        variant: 'success' as any,
      });
    },
    onError: (err: any) =>
      toast({
        title: 'Failed to save API key',
        description: err?.response?.data?.message ?? 'Please try again.',
        variant: 'destructive',
      }),
  });

  return (
    <div className="space-y-4">
      {/* Current status card */}
      <div className={`bg-slate-900/80 border rounded-2xl p-6 space-y-4 ${
        status.hasKey ? 'border-emerald-500/30' : 'border-slate-800/50'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Google Places API
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Enables real business data in scans. Without it, demo mode is used.
            </p>
          </div>
          {!statusLoading && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              status.hasKey
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-700/50 text-slate-400 border border-slate-700'
            }`}>
              {status.hasKey
                ? <><CheckCircle2 className="w-3 h-3" /> Active</>
                : <><XCircle className="w-3 h-3" /> Demo mode</>}
            </span>
          )}
        </div>

        {/* Show masked key if set */}
        {status.hasKey && status.maskedKey && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-slate-300 text-sm font-mono">{status.maskedKey}</span>
            <button
              onClick={() => saveMutation.mutate('')}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium transition-colors ml-4"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        )}

        {/* Input for new key */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {status.hasKey ? 'Replace API Key' : 'Enter API Key'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-12 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (apiKey.trim()) saveMutation.mutate(apiKey.trim()); }}
            disabled={!apiKey.trim() || saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save API Key
          </button>
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm underline"
          >
            How to get one →
          </a>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">How it works</h4>
        <ul className="space-y-1.5 text-slate-400 text-sm">
          <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Your key is stored securely in the database, tied to your account only.</li>
          <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> When you scan a city, the backend uses your key to fetch real Google Places data.</li>
          <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Without a key, the platform uses realistic demo data instead.</li>
          <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Google gives <strong className="text-white">$200 free credit/month</strong> — enough for ~6,000 scans.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Profile Schema ────────────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase')
    .regex(/[a-z]/, 'One lowercase')
    .regex(/[0-9]/, 'One number')
    .regex(/[^A-Za-z0-9]/, 'One special character'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => profileApi.update(data) as any,
    onSuccess: (res: any) => {
      setUser(res.data);
      toast({ title: 'Profile updated!', variant: 'success' as any });
    },
    onError: () => toast({ title: 'Failed to update profile', variant: 'destructive' }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(data) as any,
    onSuccess: () => {
      passwordForm.reset();
      toast({ title: 'Password changed!', variant: 'success' as any });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.message ?? 'Failed to change password', variant: 'destructive' }),
  });

  const InputField = ({ label, error, ...props }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-slate-800/60">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-white font-medium">{user?.firstName} {user?.lastName}</h3>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-xs rounded-full border border-indigo-500/20">
                  {user?.role}
                </span>
              </div>
            </div>

            <hr className="border-slate-800" />

            <form
              onSubmit={profileForm.handleSubmit(data => updateProfileMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  {...profileForm.register('firstName')}
                  error={profileForm.formState.errors.firstName?.message}
                />
                <InputField
                  label="Last Name"
                  {...profileForm.register('lastName')}
                  error={profileForm.formState.errors.lastName?.message}
                />
              </div>
              <InputField label="Email" type="email" defaultValue={user?.email} disabled />
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-5">Change Password</h3>
            <form
              onSubmit={passwordForm.handleSubmit(data =>
                changePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })
              )}
              className="space-y-4"
            >
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                <input
                  {...passwordForm.register('currentPassword')}
                  type={showCurrentPass ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-12"
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-9 text-slate-400 hover:text-white">
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <input
                  {...passwordForm.register('newPassword')}
                  type={showNewPass ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-12"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-9 text-slate-400 hover:text-white">
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm"
              >
                {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Change Password
              </button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-4">
          <ApiKeySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
