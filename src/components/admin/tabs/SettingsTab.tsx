import React, { useEffect, useState } from 'react';
import { 
  KeyRound, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Server, 
  Check, 
  AlertTriangle,
  Lock
, Eye, EyeOff } from 'lucide-react';
import { PortfolioData } from '../../../types';
import { updateAdminCredentials, resetDatabaseAPI, importDatabaseAPI, fetchAdminData, fetchAdminStorage, type AdminStorageDetails } from '../../../api';

interface SettingsTabProps {
  data: PortfolioData;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ data, onRefresh, showToast }) => {
  // Admin credentials state
  const [newUsername, setNewUsername] = useState('');
  const [storage, setStorage] = useState<AdminStorageDetails | null>(null);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    let mounted = true;
    fetchAdminStorage().then(details => {
      if (mounted) { setStorage(details); setNewUsername(details.adminUsername); }
    }).catch(error => { if (mounted) setStorageError(error.message); });
    return () => { mounted = false; };
  }, []);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Backup & Import state
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword && newPassword.length < 4) {
      showToast('Password must be at least 4 characters long.', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      await updateAdminCredentials(newUsername, newPassword || undefined);
      showToast('Admin login credentials updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update credentials', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const savedData = await fetchAdminData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(savedData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Database backup downloaded successfully!');
    } catch (err: any) {
      showToast('Failed to export backup.', 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      setImportLoading(true);
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          await importDatabaseAPI(parsed);
          showToast('Database restored successfully from backup!');
          onRefresh();
        } catch (err: any) {
          showToast(`Import failed: ${err.message}`, 'error');
        } finally {
          setImportLoading(false);
        }
      };
    }
  };

  const handleResetDatabase = async () => {
    try {
      await resetDatabaseAPI();
      showToast('Database reset to original seed state.');
      setResetConfirmOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-settings-tab">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <span>Security, Authentication & Database Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure admin credentials, download database snapshots, and restore content records.
        </p>
      </div>

      {/* Grid: Credentials + Database Management */}
      <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2"><Database className="w-4 h-4" />Current Data Storage</h3>
        {storage ? <dl className="text-sm text-slate-300 space-y-2">
          <div><dt className="font-semibold text-white">Saving to</dt><dd>{storage.type === 'mongodb' ? 'MongoDB' : storage.type === 'local-file' ? 'Local JSON file (MongoDB not configured)' : 'MongoDB is not configured'}</dd></div>
          <div><dt className="font-semibold text-white">Location</dt><dd className="break-all font-mono text-xs">{storage.location}</dd></div>
          {storage.type === 'mongodb' && <div><dt className="font-semibold text-white">Database / collection / document</dt><dd className="break-all">{storage.databaseId} / {storage.collection} / {storage.documentId}</dd></div>}
          <div><dt className="font-semibold text-white">Login credentials</dt><dd>Username: {storage.credentialSources.username}; password: {storage.credentialSources.password}. Local credential changes are saved in .env.local.</dd></div>
          {storage.postgresConfigured && !storage.postgresUsed && <p className="text-amber-300">DATABASE_URL is configured, but this application currently does not use PostgreSQL. Your saved edits are in the location shown above.</p>}
          <p className="text-xs text-slate-400">Set private server variables MONGODB_URI and MONGODB_DB to use MongoDB. Without them, development uses the local JSON file; production refuses to save. The bundled snapshot is not the production database.</p>
        </dl> : <p className="text-sm text-slate-400">{storageError || 'Loading storage status...'}</p>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Admin Credentials */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Administrative Access</h3>
              <p className="text-xs text-slate-400">Change username and password for /admin route</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Secret Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {newPassword && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{authLoading ? 'Updating...' : 'Update Admin Credentials'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Database Backup & Restore */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Database Snapshots & Sync</h3>
                <p className="text-xs text-slate-400">Download or upload JSON database files</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              All portfolio content (publications, projects, bio narrative, timeline, and messages) is stored persistently on your server. You can export a snapshot backup at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                id="export-db-btn"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>{importLoading ? 'Importing...' : 'Restore from JSON'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">Factory Reset:</span> Re-seed default demo data.
            </div>
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Reset Portfolio Database?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will overwrite all custom publications, timeline items, and messages with the initial template for Md. Rashedul Islam.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
