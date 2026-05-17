'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Bell,
  Shield,
  Palette,
  Save,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your system preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-800/50 border border-white/5 rounded-2xl p-6">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Business Information</h3>
                <p className="text-sm text-slate-400">Configure your business details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Business Name" placeholder="Your Company Ltd" />
                <Input label="Business Phone" type="tel" placeholder="+254 700 000 000" />
                <Input label="Business Email" type="email" placeholder="info@yourcompany.com" />
                <Input label="Business Address" placeholder="123 Main St, City" />
                <Select
                  label="Currency"
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'KES', label: 'KES (KSh)' },
                    { value: 'UGX', label: 'UGX (USh)' },
                    { value: 'TZS', label: 'TZS (TSh)' },
                    { value: 'NGN', label: 'NGN (₦)' },
                    { value: 'GHS', label: 'GHS (GH₵)' },
                  ]}
                />
                <Select
                  label="Default Interest Type"
                  options={[
                    { value: 'flat', label: 'Flat Rate' },
                    { value: 'reducing', label: 'Reducing Balance' },
                  ]}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Notifications</h3>
                <p className="text-sm text-slate-400">Configure alerts and reminders</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Payment Reminders', desc: 'Send SMS reminders before due dates' },
                  { label: 'Overdue Notices', desc: 'Notify borrowers of overdue payments' },
                  { label: 'Loan Approvals', desc: 'Notify borrowers when loans are approved' },
                  { label: 'Payment Confirmations', desc: 'Send receipt via SMS after payment' },
                  { label: 'Staff Activity Alerts', desc: 'Get notified of staff actions' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <Input label="SMS Gateway API Key" type="password" placeholder="Enter API key" />
                <Input label="SMS Sender ID" placeholder="LoanPro" />
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Security</h3>
                <p className="text-sm text-slate-400">Manage security settings</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin logins' },
                  { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity' },
                  { label: 'IP Whitelisting', desc: 'Restrict access to specific IP addresses' },
                  { label: 'Audit Logging', desc: 'Log all system activities for review' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Appearance</h3>
                <p className="text-sm text-slate-400">Customize the look and feel</p>
              </div>

              <div className="space-y-4">
                <Select
                  label="Theme"
                  options={[
                    { value: 'dark', label: 'Dark (Default)' },
                    { value: 'light', label: 'Light' },
                    { value: 'system', label: 'System' },
                  ]}
                />
                <Select
                  label="Accent Color"
                  options={[
                    { value: 'indigo', label: 'Indigo (Default)' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'emerald', label: 'Emerald' },
                    { value: 'purple', label: 'Purple' },
                    { value: 'amber', label: 'Amber' },
                  ]}
                />
                <Select
                  label="Date Format"
                  options={[
                    { value: 'mdy', label: 'MM/DD/YYYY' },
                    { value: 'dmy', label: 'DD/MM/YYYY' },
                    { value: 'ymd', label: 'YYYY-MM-DD' },
                  ]}
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-white/5">
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-emerald-400"
              >
                Settings saved!
              </motion.span>
            )}
            <Button variant="secondary">Reset</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
