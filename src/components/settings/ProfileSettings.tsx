'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Update your account identity and avatar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated successfully!
          </div>
        )}

        {/* Avatar Preview & Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Profile Avatar
          </label>
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {name?.charAt(0) || 'U'}
              </div>
            )}

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition ${
                      avatar === preset ? 'border-emerald-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or enter custom image URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                leftIcon={<ImageIcon className="w-4 h-4" />}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          value={user?.email || ''}
          disabled
          helperText="Email address is permanent and used for security login."
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
