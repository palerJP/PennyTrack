'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { DataManagement } from '@/components/settings/DataManagement';
import { User, Sliders, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'data'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences & Currency', icon: Sliders },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <AppLayout
      title="Account Settings"
      subtitle="Manage your profile, preferred currency, security credentials, and data privacy"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-left transition ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'data' && <DataManagement />}
        </div>
      </div>
    </AppLayout>
  );
}
