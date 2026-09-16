'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Key,
  Lock,
  User,
  Copy,
  Check,
  Code2,
  Terminal,
  Send,
  Zap,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Server,
  Database,
  CheckCircle2,
  Eye,
  EyeOff,
  LogOut,
  Play,
  Cpu,
  RefreshCw,
  Globe,
  Plus,
  Trash2,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Megaphone,
  Save,
  Sliders,
  BellRing,
  ToggleLeft,
  ToggleRight,
  Crown,
  Clock,
  Timer,
  Power,
} from 'lucide-react';
import Toast from '@/components/Toast';

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  isSingleBot: boolean;
  boundIdentifier: string | null;
  boundAt: string | null;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  totalRequests: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('hfl_key_8899aabbccddeeff00112233');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Multi API Key & Single-Bot Lock State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [newKeyTitle, setNewKeyTitle] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeySingleBot, setNewKeySingleBot] = useState(true);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Set<string>>(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyItem | null>(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Domain Management State
  const [domains, setDomains] = useState<{ domain: string; isVip: boolean; createdAt?: string }[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isNewDomainVip, setIsNewDomainVip] = useState(false);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isResettingKey, setIsResettingKey] = useState(false);
  const [domainToAdd, setDomainToAdd] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [domainToToggleVip, setDomainToToggleVip] = useState<{ domain: string; isVip: boolean } | null>(null);
  const [isTogglingVip, setIsTogglingVip] = useState(false);
  const [domainNotice, setDomainNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const getAdminHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('heyflatimo_admin_session_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'x-admin-token': token } : {}),
    };
  };

  // Access Key Gate State
  const [accessEnabled, setAccessEnabled] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('123456');
  const [accessMessageInput, setAccessMessageInput] = useState('Silakan masukkan kode akses untuk menggunakan layanan email sementara ini.');
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  // Admin Credentials State (Empty by default for privacy)
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Announcement / Broadcast State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTagInput, setAnnouncementTagInput] = useState('PENGUMUMAN RESMI');
  const [announcementTitleInput, setAnnouncementTitleInput] = useState('Pemberitahuan Sistem');
  const [announcementContentInput, setAnnouncementContentInput] = useState('Selamat datang di layanan HeyFlatimo Personal Temp Mail. Semua fitur email aktif dan siap digunakan.');
  const [announcementDisplayModeInput, setAnnouncementDisplayModeInput] = useState<'always' | 'once_per_session' | 'once_per_device'>('once_per_device');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [showAnnouncementPreview, setShowAnnouncementPreview] = useState(false);

  // Telegram Bot State
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramBotTokenInput, setTelegramBotTokenInput] = useState('');
  const [telegramBotUsername, setTelegramBotUsername] = useState('');
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState('');
  const [telegramWebhookInfo, setTelegramWebhookInfo] = useState<any>(null);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingBot, setIsTestingBot] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);
  const [isCheckingWebhookInfo, setIsCheckingWebhookInfo] = useState(false);

  // Database Retention & Cleanup State (Auto-Delete 3 Hari / 72 Jam WIB Paten)
  const [isCleaningExpired, setIsCleaningExpired] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);
  const [showCleanAllModal, setShowCleanAllModal] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<{
    totalMessages: number;
    activeMessages?: number;
    totalReceivedAllTime?: number;
    totalDeletedAllTime?: number;
    totalGeneratedAllTime?: number;
    uniqueActiveMailboxes?: number;
    unreadMessages?: number;
    expiredCount: number;
    oldestCreatedAt: string | null;
    retentionHours: number;
  } | null>(null);

  // Code Tab Selection
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'node' | 'curl' | 'php'>('python');

  // Live Tester State
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [origin, setOrigin] = useState('http://localhost:3000');

  // Stats State
  const [stats, setStats] = useState<any>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      // Clear any legacy persistent storage
      localStorage.removeItem('heyflatimo_admin_logged');
      
      const savedAuth = sessionStorage.getItem('heyflatimo_admin_logged');
      if (savedAuth === 'true') {
        setIsLoggedIn(true);
        fetchApiKeys();
        fetchDomains();
        fetchStats();
        fetchSettings();
        fetchCleanupStats();
      }

      // Auto logout when leaving web / closing tab
      const handleAutoLogout = () => {
        sessionStorage.removeItem('heyflatimo_admin_logged');
        sessionStorage.removeItem('heyflatimo_admin_session_token');
        localStorage.removeItem('heyflatimo_admin_logged');
      };

      window.addEventListener('beforeunload', handleAutoLogout);
      window.addEventListener('pagehide', handleAutoLogout);

      return () => {
        window.removeEventListener('beforeunload', handleAutoLogout);
        window.removeEventListener('pagehide', handleAutoLogout);
      };
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsLoggedIn(true);
        if (data.sessionToken) {
          sessionStorage.setItem('heyflatimo_admin_session_token', data.sessionToken);
        }
        const loggedKey = data.admin?.apiKey;
        if (loggedKey) {
          setApiKey(loggedKey);
          setSelectedApiKey(loggedKey);
        }
        sessionStorage.setItem('heyflatimo_admin_logged', 'true');
        showToast('Login Admin Berhasil! Selamat Datang.', 'success');
        fetchApiKeys();
        fetchDomains();
        fetchStats(loggedKey);
        fetchSettings();
        fetchCleanupStats();
      } else {
        showToast(data.error || 'Username atau password salah', 'error');
      }
    } catch (err: any) {
      showToast('Gagal melakukan login', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('heyflatimo_admin_logged');
    sessionStorage.removeItem('heyflatimo_admin_session_token');
    localStorage.removeItem('heyflatimo_admin_logged');
    setPassword('');
    showToast('Berhasil Logout');
  };

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('/api/admin/apikeys', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setApiKeys(data.keys);
        if (data.keys.length > 0) {
          setSelectedApiKey((prev) => prev || data.keys[0].key);
          setApiKey(data.keys[0].key);
        }
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleGenerateRandomKeyInput = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setNewKeyValue(`hfl_live_${randomHex}`);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyTitle.trim()) {
      showToast('Judul / Nama Bot wajib diisi.', 'error');
      return;
    }

    setIsCreatingKey(true);
    setKeyNotice(null);
    try {
      const res = await fetch('/api/admin/apikeys', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newKeyTitle.trim(),
          key: newKeyValue.trim(),
          isSingleBot: newKeySingleBot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('API Key baru berhasil dibuat.', 'success');
        setKeyNotice({ type: 'success', message: `API Key "${data.key.name}" berhasil dibuat dan siap digunakan.` });
        setNewKeyTitle('');
        setNewKeyValue('');
        setNewKeySingleBot(true);
        fetchApiKeys();
      } else {
        showToast(data.error || 'Gagal membuat API Key', 'error');
        setKeyNotice({ type: 'error', message: data.error || 'Gagal membuat API Key' });
      }
    } catch (err: any) {
      showToast('Gagal membuat API Key', 'error');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleToggleKeyActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/apikeys/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`API Key berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
        fetchApiKeys();
      } else {
        showToast(data.error || 'Gagal mengubah status', 'error');
      }
    } catch (err) {
      showToast('Gagal mengubah status API Key', 'error');
    }
  };

  const handleResetKeyBinding = async (id: string, name: string) => {
    if (!confirm(`Lepas kunci binding untuk "${name}"? Bot baru yang pertama kali konek akan otomatis mengunci key ini.`)) return;

    try {
      const res = await fetch(`/api/admin/apikeys/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ resetBinding: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Kunci bot berhasil dilepas (Reset)!', 'success');
        setKeyNotice({ type: 'success', message: `Kunci binding untuk "${name}" telah dilepas. Siap dihubungkan ke bot baru.` });
        fetchApiKeys();
      } else {
        showToast(data.error || 'Gagal mereset kunci', 'error');
      }
    } catch (err) {
      showToast('Gagal mereset kunci binding', 'error');
    }
  };

  const handleDeleteApiKey = async () => {
    if (!keyToDelete) return;

    setIsDeletingKey(true);
    try {
      const res = await fetch(`/api/admin/apikeys/${keyToDelete.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`API Key "${keyToDelete.name}" berhasil dihapus.`, 'success');
        setKeyNotice({ type: 'info', message: `API Key "${keyToDelete.name}" telah dihapus permanen.` });
        setKeyToDelete(null);
        fetchApiKeys();
      } else {
        showToast(data.error || 'Gagal menghapus API Key', 'error');
      }
    } catch (err) {
      showToast('Gagal menghapus API Key', 'error');
    } finally {
      setIsDeletingKey(false);
    }
  };

  const handleCopySingleKey = (keyVal: string, id: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    showToast('API Key berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/admin/domains', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.domains)) {
        const normalized = data.domains.map((d: any) => {
          if (typeof d === 'string') {
            return { domain: d, isVip: false };
          }
          return { domain: d.domain, isVip: Boolean(d.isVip), createdAt: d.createdAt };
        });
        setDomains(normalized);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async (keyToUse?: string) => {
    try {
      const activeKey = keyToUse || apiKey || 'hfl_key_8899aabbccddeeff00112233';
      const res = await fetch(`/api/v1/stats`, {
        headers: {
          'x-api-key': activeKey,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCleanupStats = async () => {
    try {
      const res = await fetch('/api/admin/cleanup', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setCleanupStats(data);
      }
    } catch (err) {
      console.error('Error fetching cleanup stats:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        if (data.access) {
          setAccessEnabled(Boolean(data.access.enabled));
          if (data.access.key) setAccessKeyInput(data.access.key);
          if (data.access.message) setAccessMessageInput(data.access.message);
        }
        if (data.credentials) {
          if (data.credentials.username) setAdminUserInput(data.credentials.username);
          setAdminPassInput(''); // Never populate plain password
        }
        if (data.announcement) {
          setAnnouncementEnabled(Boolean(data.announcement.enabled));
          if (data.announcement.tag) setAnnouncementTagInput(data.announcement.tag);
          if (data.announcement.title) setAnnouncementTitleInput(data.announcement.title);
          if (data.announcement.content) setAnnouncementContentInput(data.announcement.content);
          if (data.announcement.displayMode) setAnnouncementDisplayModeInput(data.announcement.displayMode);
        }
        if (data.telegram) {
          setTelegramEnabled(Boolean(data.telegram.enabled));
          if (data.telegram.botToken) {
            setTelegramBotTokenInput(data.telegram.botToken);
            fetchWebhookInfo(data.telegram.botToken);
          }
          if (data.telegram.botUsername) setTelegramBotUsername(data.telegram.botUsername);
          if (data.telegram.webhookUrl) setTelegramWebhookUrl(data.telegram.webhookUrl);
        }
      }
      fetchCleanupStats();
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchWebhookInfo = async (tokenOverride?: string) => {
    const token = tokenOverride || telegramBotTokenInput.trim();
    if (!token) return;
    setIsCheckingWebhookInfo(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegramAction: 'get_webhook_info',
          botToken: token,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.webhook) setTelegramWebhookInfo(data.webhook);
        if (data.bot?.username) setTelegramBotUsername(data.bot.username);
        if (data.webhook?.url) setTelegramWebhookUrl(data.webhook.url);
      }
    } catch (err) {
      console.error('Error fetching webhook info:', err);
    } finally {
      setIsCheckingWebhookInfo(false);
    }
  };

  const handleSaveTelegram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegram: {
            botToken: telegramBotTokenInput.trim(),
            enabled: telegramEnabled,
            botUsername: telegramBotUsername,
            webhookUrl: telegramWebhookUrl,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.telegram) {
          setTelegramEnabled(Boolean(data.telegram.enabled));
          setTelegramWebhookUrl(data.telegram.webhookUrl || '');
          if (data.telegram.botUsername) setTelegramBotUsername(data.telegram.botUsername);
        }
        showToast('Pengaturan Bot Telegram berhasil disimpan!', 'success');
        fetchWebhookInfo(telegramBotTokenInput.trim());
      } else {
        showToast(data.error || 'Gagal menyimpan pengaturan bot', 'error');
      }
    } catch (err: any) {
      showToast('Gagal terhubung saat menyimpan setelan Telegram', 'error');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestBot = async () => {
    if (!telegramBotTokenInput.trim()) {
      showToast('Masukkan Token Bot Telegram terlebih dahulu', 'error');
      return;
    }
    setIsTestingBot(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegramAction: 'test_bot',
          botToken: telegramBotTokenInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramBotUsername(data.bot?.username || '');
        showToast(data.message || 'Koneksi Bot Telegram Berhasil!', 'success');
        fetchWebhookInfo(telegramBotTokenInput.trim());
      } else {
        showToast(data.error || 'Token Bot Telegram tidak valid', 'error');
      }
    } catch (err: any) {
      showToast('Gagal menguji koneksi Bot Telegram', 'error');
    } finally {
      setIsTestingBot(false);
    }
  };

  const handleSetWebhook = async () => {
    if (!telegramBotTokenInput.trim()) {
      showToast('Masukkan Token Bot Telegram terlebih dahulu', 'error');
      return;
    }
    setIsSettingWebhook(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegramAction: 'set_webhook',
          botToken: telegramBotTokenInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramEnabled(true);
        if (data.telegram) {
          setTelegramWebhookUrl(data.telegram.webhookUrl || '');
          if (data.telegram.botUsername) setTelegramBotUsername(data.telegram.botUsername);
        }
        showToast('Webhook Telegram Berhasil Didaftarkan! Bot sekarang siap menerima pesan.', 'success');
        fetchWebhookInfo(telegramBotTokenInput.trim());
      } else {
        showToast(data.error || 'Gagal mengatur Webhook Telegram', 'error');
      }
    } catch (err: any) {
      showToast('Gagal menghubungi API Telegram untuk set webhook', 'error');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan dan menghapus Webhook Telegram?')) return;
    setIsDeletingWebhook(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegramAction: 'delete_webhook',
          botToken: telegramBotTokenInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramEnabled(false);
        setTelegramWebhookUrl('');
        setTelegramWebhookInfo(null);
        showToast('Webhook Telegram berhasil dinonaktifkan.', 'info');
      } else {
        showToast(data.error || 'Gagal menghapus Webhook Telegram', 'error');
      }
    } catch (err: any) {
      showToast('Gagal menghapus Webhook Telegram', 'error');
    } finally {
      setIsDeletingWebhook(false);
    }
  };

  const handleCleanExpired = async () => {
    setIsCleaningExpired(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'clean_expired',
          hours: 72,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Berhasil membersihkan pesan yang berusia lebih dari 3 hari!', 'success');
        fetchCleanupStats();
        fetchStats();
      } else {
        showToast(data.error || 'Gagal membersihkan pesan', 'error');
      }
    } catch (err) {
      showToast('Gagal membersihkan database', 'error');
    } finally {
      setIsCleaningExpired(false);
    }
  };

  const confirmCleanAll = async () => {
    setShowCleanAllModal(false);
    setIsCleaningAll(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'clean_all' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Semua pesan di database telah dibersihkan!', 'success');
        fetchCleanupStats();
        fetchStats();
      } else {
        showToast(data.error || 'Gagal mengosongkan database', 'error');
      }
    } catch (err) {
      showToast('Gagal mengosongkan database', 'error');
    } finally {
      setIsCleaningAll(false);
    }
  };

  const handleSaveCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminUserInput.trim() || !adminPassInput.trim()) {
      showToast('Username dan Password baru tidak boleh kosong', 'error');
      return;
    }
    setIsSavingCreds(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          credentials: {
            username: adminUserInput.trim(),
            password: adminPassInput.trim(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Kredensial Login Admin (Username & Password) berhasil disimpan!', 'success');
        setAdminPassInput(''); // Clear password field after saving
      } else {
        showToast(data.error || 'Gagal mengubah kredensial admin', 'error');
      }
    } catch (err: any) {
      showToast('Terjadi kesalahan koneksi saat menyimpan kredensial', 'error');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleSaveAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAccess(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          access: {
            enabled: accessEnabled,
            key: accessKeyInput.trim(),
            message: accessMessageInput.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Pengaturan Kode Akses Web berhasil disimpan!', 'success');
      } else {
        showToast(data.error || 'Gagal menyimpan pengaturan akses', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi saat menyimpan akses', 'error');
    } finally {
      setIsSavingAccess(false);
    }
  };

  const handleSaveAnnouncement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAnnouncement(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          announcement: {
            enabled: announcementEnabled,
            tag: announcementTagInput.trim(),
            title: announcementTitleInput.trim(),
            content: announcementContentInput.trim(),
            displayMode: announcementDisplayModeInput,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Pengaturan Pengumuman Popup berhasil disimpan!', 'success');
      } else {
        showToast(data.error || 'Gagal menyimpan pengumuman', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi saat menyimpan pengumuman', 'error');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    showToast('API Key berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Reset API Key Action
  const handleResetApiKey = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin mereset API Key? Semua bot yang menggunakan API Key lama tidak akan bisa terhubung lagi sampai diperbarui.')) {
      return;
    }

    setIsResettingKey(true);
    try {
      const res = await fetch('/api/admin/apikey', { method: 'POST', headers: getAdminHeaders() });
      const data = await res.json();

      if (data.success && data.apiKey) {
        setApiKey(data.apiKey);
        showToast('API Key baru berhasil dibuat dan disimpan!', 'success');
      } else {
        showToast(data.error || 'Gagal mereset API Key', 'error');
      }
    } catch (err: any) {
      showToast('Gagal mereset API Key', 'error');
    } finally {
      setIsResettingKey(false);
    }
  };

  // Step 1: Trigger Add Domain Confirmation Modal
  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomainInput.trim().toLowerCase().replace(/^@/, '');
    if (!cleanDomain) {
      showToast('Masukkan nama domain yang valid', 'error');
      return;
    }

    if (domains.some((d) => d.domain === cleanDomain)) {
      showToast(`Domain @${cleanDomain} sudah terdaftar!`, 'info');
      setDomainNotice({
        type: 'info',
        message: `Domain @${cleanDomain} sudah ada dalam daftar aktif.`,
      });
      return;
    }

    setDomainToAdd(cleanDomain);
  };

  // Step 2: Confirm Add Domain Action
  const confirmAddDomain = async () => {
    if (!domainToAdd) return;
    const cleanDomain = domainToAdd;
    const isVip = isNewDomainVip;
    setDomainToAdd(null);
    setIsAddingDomain(true);

    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ domain: cleanDomain, isVip }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDomains();
        setNewDomainInput('');
        setIsNewDomainVip(false);
        const successText = `Domain @${cleanDomain} berhasil ditambahkan ${isVip ? 'sebagai VIP' : ''}!`;
        showToast(successText, 'success');
        setDomainNotice({
          type: 'success',
          message: `Berhasil menambahkan domain @${cleanDomain} ke daftar aktif.`,
        });
      } else {
        const errorText = data.error || 'Gagal menambahkan domain';
        showToast(errorText, 'error');
        setDomainNotice({
          type: 'error',
          message: errorText,
        });
      }
    } catch (err: any) {
      showToast('Gagal menambahkan domain ke database', 'error');
      setDomainNotice({
        type: 'error',
        message: 'Koneksi ke database gagal saat menambahkan domain.',
      });
    } finally {
      setIsAddingDomain(false);
    }
  };

  // 1-Click Toggle VIP Confirmation Action
  const confirmToggleVipDomain = async () => {
    if (!domainToToggleVip) return;
    const { domain, isVip: targetVip } = domainToToggleVip;
    setDomainToToggleVip(null);
    setIsTogglingVip(true);

    try {
      const res = await fetch('/api/admin/domains', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ domain, isVip: targetVip }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDomains();
        const msg = `Status domain @${domain} diubah ke ${targetVip ? 'VIP' : 'Free'}`;
        showToast(msg, 'success');
        setDomainNotice({
          type: 'success',
          message: msg,
        });
      } else {
        const errorText = data.error || 'Gagal mengubah status VIP domain';
        showToast(errorText, 'error');
        setDomainNotice({
          type: 'error',
          message: errorText,
        });
      }
    } catch (err: any) {
      showToast('Gagal mengubah status VIP', 'error');
    } finally {
      setIsTogglingVip(false);
    }
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteClick = (domain: string) => {
    setDomainToDelete(domain);
  };

  // Confirm Delete Domain Action
  const confirmDeleteDomain = async () => {
    if (!domainToDelete) return;
    const target = domainToDelete;
    setDomainToDelete(null);

    try {
      const res = await fetch(`/api/admin/domains?domain=${encodeURIComponent(target)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDomains();
        const successText = `Domain @${target} berhasil dihapus!`;
        showToast(successText, 'success');
        setDomainNotice({
          type: 'success',
          message: `Domain @${target} telah berhasil dihapus dari sistem.`,
        });
      } else {
        const errorText = data.error || 'Gagal menghapus domain';
        showToast(errorText, 'error');
        setDomainNotice({
          type: 'error',
          message: errorText,
        });
      }
    } catch (err: any) {
      showToast('Gagal menghapus domain', 'error');
      setDomainNotice({
        type: 'error',
        message: 'Koneksi ke database gagal saat menghapus domain.',
      });
    }
  };

  const safeKey =
    selectedApiKey ||
    apiKeys.find((k) => k.isActive)?.key ||
    apiKey ||
    'hfl_key_8899aabbccddeeff00112233';

  const runTest = async (endpoint: string, params: string = '') => {
    setIsTesting(true);
    setTestResult('Memproses request...');
    try {
      const fullUrl = `${origin}/api/v1/${endpoint}${params ? '?' + params : ''}`;
      const res = await fetch(fullUrl, {
        headers: {
          'x-api-key': safeKey,
        },
      });
      const data = await res.json();
      setTestResult(data);

      if (data.email && !testEmail) {
        setTestEmail(data.email);
      }
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Code templates for external bot integration
  const codeSnippets = {
    python: `# Contoh Bot Python: Integrasi HeyFlatimo TMail API
import requests
import time

BASE_URL = "${origin}"
API_KEY = "${safeKey}"
HEADERS = {"x-api-key": API_KEY}

# 1. Generate Email Baru
gen_res = requests.get(f"{BASE_URL}/api/v1/generate", headers=HEADERS).json()
email = gen_res["email"]
print(f"[+] Email Terdaftar: {email}")

# 2. Gunakan email di website/aplikasi target...
# (Kirim OTP / link verifikasi ke email ini)

# 3. Tunggu dan Ekstrak OTP Otomatis
print("[*] Menunggu kode OTP masuk...")
for _ in range(12):  # Polling hingga 60 detik
    time.sleep(5)
    otp_res = requests.get(f"{BASE_URL}/api/v1/otp?email={email}", headers=HEADERS).json()
    if otp_res.get("found"):
        print(f"[SUCCESS] Kode OTP Ditemukan: {otp_res['otp']}")
        print(f"[+] Dari: {otp_res['sender']} | Subjek: {otp_res['subject']}")
        break
`,
    node: `// Contoh Bot Node.js / JavaScript (Axios / Fetch)
const axios = require('axios');

const BASE_URL = '${origin}';
const API_KEY = '${safeKey}';
const headers = { 'x-api-key': API_KEY };

async function runBot() {
  // 1. Buat Email Baru
  const { data: gen } = await axios.get(\`\${BASE_URL}/api/v1/generate\`, { headers });
  console.log(\`[+] Email Baru: \${gen.email}\`);

  // 2. Tunggu dan Ekstrak OTP Otomatis
  console.log('[*] Menunggu OTP...');
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const { data: otpData } = await axios.get(\`\${BASE_URL}/api/v1/otp?email=\${gen.email}\`, { headers });
    
    if (otpData.found) {
      console.log(\`[SUCCESS] OTP Didapat: \${otpData.otp}\`);
      return otpData.otp;
    }
  }
}

runBot();`,
    curl: `# 1. Dapatkan Daftar Domain
curl -X GET "${origin}/api/v1/domains" -H "x-api-key: ${safeKey}"

# 2. Generate Email Baru
curl -X GET "${origin}/api/v1/generate" -H "x-api-key: ${safeKey}"

# 3. Baca Inbox Pesan
curl -X GET "${origin}/api/v1/inbox?email=user@domain.com" -H "x-api-key: ${safeKey}"

# 4. Auto-Extract OTP (Keluaran langsung kode angka)
curl -X GET "${origin}/api/v1/otp?email=user@domain.com" -H "x-api-key: ${safeKey}"

# 5. Auto-Extract Link Verifikasi (Keluaran URL aktivasi)
curl -X GET "${origin}/api/v1/links?email=user@domain.com" -H "x-api-key: ${safeKey}"`,
    php: `<?php
// Contoh Integrasi HeyFlatimo API di PHP
$baseUrl = "${origin}";
$apiKey = "${safeKey}";

function requestApi($endpoint, $apiKey) {
    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-api-key: $apiKey"]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 1. Generate Email
$gen = requestApi("$baseUrl/api/v1/generate", $apiKey);
$email = $gen['email'];
echo "Email: $email\\n";

// 2. Ekstrak OTP
$otpData = requestApi("$baseUrl/api/v1/otp?email=$email", $apiKey);
if (!empty($otpData['found'])) {
    echo "Kode OTP: " . $otpData['otp'] . "\\n";
}
?>`,
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col selection:bg-[var(--color-blue)] selection:text-white">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />

      {/* Top Navbar */}
      <header className="border-b-[3px] sm:border-b-[4px] border-[var(--border-color)] bg-[var(--card-bg)] sticky top-0 z-40 shadow-[0px_3px_0px_var(--shadow-color)] sm:shadow-[0px_4px_0px_var(--shadow-color)]">
        <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center gap-2">
          <Link
            href="/"
            onClick={() => {
              sessionStorage.removeItem('heyflatimo_admin_logged');
              setIsLoggedIn(false);
            }}
            className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 group cursor-pointer flex-shrink-0"
          >
            <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-[var(--color-blue)] border-[2px] sm:border-[3px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] group-hover:rotate-6 transition-transform flex-shrink-0">
              <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6 text-[var(--color-yellow)] fill-[var(--color-yellow)]" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-heading font-black text-sm xs:text-base sm:text-xl tracking-tight text-[var(--text-main)] uppercase whitespace-nowrap">
                HeyFlatimo
              </span>
              <span className="bg-[var(--color-yellow)] text-black text-[7px] xs:text-[8px] sm:text-[9px] font-mono-custom font-black px-1 py-0.2 border-[1.5px] border-[var(--border-color)] uppercase flex-shrink-0">
                ADMIN
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 xs:gap-2.5 flex-shrink-0">
            <Link
              href="/"
              onClick={() => {
                sessionStorage.removeItem('heyflatimo_admin_logged');
                setIsLoggedIn(false);
              }}
              className="brutal-btn bg-[var(--color-yellow)] text-black px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 xs:gap-1.5 font-bold shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">BERANDA</span>
              <span className="sm:hidden">HOME</span>
            </Link>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="brutal-btn bg-[var(--color-red)] text-white px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 xs:gap-1.5 font-bold hover:bg-red-600 shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-5 sm:py-8 w-full flex-1">
        {!isLoggedIn ? (
          /* LOGIN FORM */
          <div className="max-w-md mx-auto my-4 sm:my-8">
            <div className="brutal-card p-4 xs:p-6 sm:p-8 bg-[var(--card-bg)] relative shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[7px_7px_0px_var(--shadow-color)]">
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-12 h-12 xs:w-14 xs:h-14 bg-[var(--color-blue)] border-[2.5px] sm:border-[3px] border-[var(--border-color)] flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] motion-float">
                  <Shield className="w-6 h-6 xs:w-7 xs:h-7 text-[var(--color-yellow)]" />
                </div>
                <h1 className="font-heading font-black text-xl xs:text-2xl uppercase tracking-tight text-[var(--text-main)]">
                  ADMIN LOGIN
                </h1>
                <p className="font-mono-custom text-[11px] xs:text-xs text-[var(--text-muted)] mt-1">
                  Masuk untuk mengelola Domain, API Key & Bot Integration.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                    Username:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan Username Admin"
                      autoComplete="off"
                      className="brutal-input w-full pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm font-mono-custom font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                    Password:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan Password Admin"
                      autoComplete="current-password"
                      className="brutal-input w-full pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm font-mono-custom font-bold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 w-full py-3 sm:py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[3px_3px_0px_var(--shadow-color)]"
                >
                  <Key className="w-4 h-4" />
                  <span>{loading ? 'MEMVERIFIKASI...' : 'MASUK KE ADMIN'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ADMIN DASHBOARD */
          <div className="space-y-5 sm:space-y-7">
            {/* MULTI-API KEY & BOT CONNECTION MANAGEMENT SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      KELOLA MULTI-API KEY & KONEKSI BOT
                    </h2>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Buat dan kelola API Key tanpa batas dengan judul kustom serta fitur penguncian 1 Bot / 1 SC.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] xs:text-xs font-mono-custom font-black bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 py-1 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto">
                  {apiKeys.length} API KEY TERDAFTAR
                </div>
              </div>

              {/* Dynamic Notification Notice Banner for API Keys */}
              {keyNotice && (
                <div
                  className={`p-3 sm:p-3.5 mb-4 sm:mb-5 border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] flex items-start justify-between gap-2.5 sm:gap-3 ${
                    keyNotice.type === 'success'
                      ? 'bg-[#ecfdf5] dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                      : keyNotice.type === 'error'
                      ? 'bg-[#fef2f2] dark:bg-red-950 text-red-800 dark:text-red-200'
                      : 'bg-[#eff6ff] dark:bg-sky-950 text-sky-800 dark:text-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono-custom font-black">
                    {keyNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-green)] flex-shrink-0" />
                    ) : keyNotice.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-[var(--color-red)] flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[var(--color-blue)] flex-shrink-0" />
                    )}
                    <span className="break-words">{keyNotice.message}</span>
                  </div>
                  <button
                    onClick={() => setKeyNotice(null)}
                    className="text-xs hover:opacity-70 font-bold px-1 flex-shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CREATE NEW API KEY FORM */}
              <form onSubmit={handleCreateApiKey} className="p-3.5 sm:p-4 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)] space-y-3.5 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-mono-custom font-black uppercase text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
                  <Plus className="w-4 h-4" />
                  <span>BUAT / GENERATE API KEY BARU</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      Judul / Nama Bot / Klien:
                    </label>
                    <input
                      type="text"
                      value={newKeyTitle}
                      onChange={(e) => setNewKeyTitle(e.target.value)}
                      placeholder="Contoh: Bot WhatsApp V1 / SC Register VIP"
                      className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      API Key Kustom (Opsional):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Kosongkan untuk otomatis di-generate"
                        className="brutal-input flex-1 px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandomKeyInput}
                        className="brutal-btn bg-[var(--color-yellow)] text-black px-2.5 sm:px-3 py-2 text-[11px] font-black flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)]"
                        title="Buat nilai API key acak"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>RANDOM</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Single Bot Lock Toggle Checkbox */}
                <label className="flex items-start gap-2.5 p-3 bg-white dark:bg-zinc-950 border-[2px] border-amber-300 dark:border-amber-700 cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)]">
                  <input
                    type="checkbox"
                    checked={newKeySingleBot}
                    onChange={(e) => setNewKeySingleBot(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <span className="font-mono-custom font-black text-xs text-amber-900 dark:text-amber-200 block">
                      KUNCI 1 BOT / 1 SC (SINGLE INSTANCE LOCK)
                    </span>
                    <span className="font-mono-custom text-[10px] sm:text-[11px] text-[var(--text-muted)] block mt-0.5 leading-relaxed">
                      Jika dicentang, API Key ini akan otomatis mengikat IP / Bot pertama yang melakukan request. Script atau IP lain yang mencoba memakai key yang sama akan ditolak (403 Forbidden).
                    </span>
                  </div>
                </label>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isCreatingKey || !newKeyTitle.trim()}
                    className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-4 xs:px-5 py-2 text-xs font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingKey ? 'MEMBUAT API KEY...' : 'BUAT API KEY BARU'}</span>
                  </button>
                </div>
              </form>

              {/* API KEYS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <span className="text-xs font-mono-custom font-black uppercase text-[var(--text-main)]">
                    DAFTAR API KEY AKTIF & STATUS PENGUNCIAN
                  </span>
                  <button
                    type="button"
                    onClick={fetchApiKeys}
                    disabled={isLoadingKeys}
                    className="text-[11px] font-mono-custom font-bold text-[var(--color-blue)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingKeys ? 'animate-spin-fast' : ''}`} />
                    <span>REFRESH</span>
                  </button>
                </div>

                {isLoadingKeys && apiKeys.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono-custom text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)]">
                    Memuat daftar API Key...
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono-custom text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)]">
                    Belum ada API Key. Silakan gunakan formulir di atas untuk membuat API Key baru.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((keyItem) => {
                      const isKeyVisible = visibleKeyIds.has(keyItem.id);
                      const isKeyCopied = copiedKeyId === keyItem.id;

                      return (
                        <div
                          key={keyItem.id}
                          className={`p-3.5 sm:p-4 border-[2px] sm:border-[2.5px] border-[var(--border-color)] bg-white dark:bg-zinc-950 shadow-[3px_3px_0px_var(--shadow-color)] space-y-3 ${
                            !keyItem.isActive ? 'opacity-70 bg-zinc-100 dark:bg-zinc-900' : ''
                          }`}
                        >
                          {/* Title & Badges Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-heading font-black text-sm sm:text-base uppercase tracking-tight text-[var(--text-main)]">
                                {keyItem.name}
                              </h4>
                              {keyItem.isActive ? (
                                <span className="bg-[#ecfdf5] dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[9px] sm:text-[10px] font-mono-custom font-black px-2 py-0.5 border border-emerald-500">
                                  AKTIF
                                </span>
                              ) : (
                                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] sm:text-[10px] font-mono-custom font-black px-2 py-0.5 border border-zinc-400">
                                  NONAKTIF
                                </span>
                              )}

                              {keyItem.isSingleBot ? (
                                keyItem.boundIdentifier ? (
                                  <span className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 text-[9px] sm:text-[10px] font-mono-custom font-black px-2 py-0.5 border border-red-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>TERKUNCI: {keyItem.boundIdentifier}</span>
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[9px] sm:text-[10px] font-mono-custom font-black px-2 py-0.5 border border-amber-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>KUNCI 1-BOT: SIAP BINDING</span>
                                  </span>
                                )
                              ) : (
                                <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-[9px] sm:text-[10px] font-mono-custom font-black px-2 py-0.5 border border-blue-400">
                                  MULTI-BOT (BEBAS)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono-custom text-[var(--text-muted)] self-start sm:self-auto">
                              <span>Total Request: <strong className="text-[var(--text-main)]">{keyItem.totalRequests}</strong></span>
                            </div>
                          </div>

                          {/* Key Input & Copy Row */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <input
                                type={isKeyVisible ? 'text' : 'password'}
                                readOnly
                                value={keyItem.key}
                                className="brutal-input w-full font-mono-custom text-xs py-2 pl-3 pr-10 font-bold select-all bg-zinc-50 dark:bg-zinc-900"
                              />
                              <button
                                type="button"
                                onClick={() => toggleKeyVisibility(keyItem.id)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-black dark:hover:text-white cursor-pointer"
                                title={isKeyVisible ? 'Sembunyikan' : 'Tampilkan'}
                              >
                                {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopySingleKey(keyItem.key, keyItem.id)}
                              className={`brutal-btn px-3 py-2 text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer flex-shrink-0 ${
                                isKeyCopied
                                  ? 'bg-[var(--color-green)] text-white'
                                  : 'bg-[var(--color-blue)] text-white hover:bg-sky-600'
                              }`}
                            >
                              {isKeyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>{isKeyCopied ? 'TERSALIN' : 'SALIN KEY'}</span>
                            </button>
                          </div>

                          {/* Binding Info & Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)] border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            <div>
                              {keyItem.boundAt && (
                                <span>Terkunci pada: {new Date(keyItem.boundAt).toLocaleString('id-ID')} | </span>
                              )}
                              <span>
                                Terakhir dipakai:{' '}
                                {keyItem.lastUsedAt
                                  ? `${new Date(keyItem.lastUsedAt).toLocaleString('id-ID')} (${keyItem.lastUsedIp || '-'})`
                                  : 'Belum pernah digunakan'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {keyItem.isSingleBot && keyItem.boundIdentifier && (
                                <button
                                  type="button"
                                  onClick={() => handleResetKeyBinding(keyItem.id, keyItem.name)}
                                  className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-2.5 py-1 text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                                  title="Lepas ikatan IP agar bisa digunakan bot lain/baru"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>RESET KUNCI</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleKeyActive(keyItem.id, keyItem.isActive)}
                                className={`brutal-btn px-2.5 py-1 text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer ${
                                  keyItem.isActive
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
                                    : 'bg-[var(--color-green)] text-white'
                                }`}
                              >
                                <Power className="w-3 h-3" />
                                <span>{keyItem.isActive ? 'NONAKTIFKAN' : 'AKTIFKAN'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setKeyToDelete(keyItem)}
                                className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 py-1 text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                                title="Hapus API Key ini"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>HAPUS</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DELETE API KEY CONFIRMATION MODAL */}
            {keyToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 xs:p-4">
                <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] sm:border-[3.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] motion-modal-in">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 text-[var(--color-red)]">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-red)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-[var(--text-main)]">
                        HAPUS API KEY?
                      </h4>
                      <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                        Konfirmasi penghapusan API Key
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-mono-custom text-[var(--text-main)] mb-5 sm:mb-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus API Key <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.5 border font-bold">{keyToDelete.name}</span>? Bot yang masih menggunakan key ini akan segera terputus dan tidak dapat mengakses API.
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setKeyToDelete(null)}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      BATAL
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteApiKey}
                      disabled={isDeletingKey}
                      className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-3.5 sm:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeletingKey ? 'MENGHAPUS...' : 'YA, HAPUS KEY'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DOMAIN MANAGEMENT SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      KELOLA DOMAIN EMAIL AKTIF
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Tambah atau hapus domain email yang tersedia di web dan API.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] xs:text-xs font-mono-custom font-black bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 py-1 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto">
                  {domains.length} DOMAIN TERPASANG
                </div>
              </div>

              {/* Dynamic Notification Notice Banner */}
              {domainNotice && (
                <div
                  className={`p-3 sm:p-3.5 mb-4 sm:mb-5 border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] flex items-start justify-between gap-2.5 sm:gap-3 ${
                    domainNotice.type === 'success'
                      ? 'bg-[#ecfdf5] dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                      : domainNotice.type === 'error'
                      ? 'bg-[#fef2f2] dark:bg-red-950 text-red-800 dark:text-red-200'
                      : 'bg-[#eff6ff] dark:bg-sky-950 text-sky-800 dark:text-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono-custom font-black">
                    {domainNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-green)] flex-shrink-0" />
                    ) : domainNotice.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-[var(--color-red)] flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[var(--color-blue)] flex-shrink-0" />
                    )}
                    <span className="break-words">{domainNotice.message}</span>
                  </div>
                  <button
                    onClick={() => setDomainNotice(null)}
                    className="text-xs hover:opacity-70 font-bold px-1 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Add Domain Form */}
              <form onSubmit={handleAddDomainSubmit} className="space-y-2 mb-5 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-mono text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                      @
                    </div>
                    <input
                      type="text"
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      placeholder="mail.domainbaru.com"
                      className="brutal-input w-full pl-8 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingDomain || !newDomainInput.trim()}
                    className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-4 xs:px-5 py-2 sm:py-2.5 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 font-black cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingDomain ? 'MENAMBAHKAN...' : 'TAMBAH DOMAIN'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-custom font-bold text-[var(--text-main)] select-none">
                    <input
                      type="checkbox"
                      checked={isNewDomainVip}
                      onChange={(e) => setIsNewDomainVip(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded-none border-2 border-[var(--border-color)]"
                    />
                    <span className="flex items-center gap-1.5">
                      Jadikan Domain <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><Crown className="w-3.5 h-3.5 fill-amber-400 inline" /> VIP / Premium</strong>
                    </span>
                  </label>
                </div>
              </form>

              {/* Active Domains List */}
              {domains.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-[var(--border-color)] text-center text-xs font-mono-custom text-[var(--text-muted)] bg-[var(--bg-color)]">
                  Belum ada domain kustom yang ditambahkan. Menggunakan domain bawaan sistem.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {domains.map((domItem) => {
                    const dom = typeof domItem === 'string' ? domItem : domItem.domain;
                    const isVip = typeof domItem === 'object' ? Boolean(domItem.isVip) : false;
                    return (
                      <div
                        key={dom}
                        className={`p-2.5 sm:p-3 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex items-center justify-between gap-2 ${
                          isVip ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-1.5 xs:gap-2 flex-1">
                          {isVip ? (
                            <div className="w-5 h-5 bg-[var(--color-yellow)] border border-black flex items-center justify-center flex-shrink-0" title="Domain VIP">
                              <Crown className="w-3 h-3 text-black fill-black" />
                            </div>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-green)] motion-pulse-dot flex-shrink-0" />
                          )}
                          <span className="font-mono-custom font-bold text-xs sm:text-sm break-all">
                            @{dom}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {/* 1-Click VIP Toggle Button with Confirmation Modal */}
                          {isVip ? (
                            <button
                              onClick={() => setDomainToToggleVip({ domain: dom, isVip: false })}
                              className="brutal-btn bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 py-1 text-[10px] xs:text-[11px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-yellow-400 cursor-pointer flex-shrink-0"
                              title="Klik untuk ubah status ke Free"
                            >
                              <Crown className="w-3 h-3 fill-black flex-shrink-0" />
                              <span>VIP</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setDomainToToggleVip({ domain: dom, isVip: true })}
                              className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 xs:px-2.5 py-1 text-[10px] xs:text-[11px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-amber-100 dark:hover:bg-zinc-700 cursor-pointer flex-shrink-0"
                              title="Klik untuk jadikan VIP"
                            >
                              <span>FREE</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(dom)}
                            className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 p-1.5 text-xs flex-shrink-0 cursor-pointer shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                            title={`Hapus domain @${dom}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TOGGLE VIP CONFIRMATION MODAL */}
            {domainToToggleVip && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 xs:p-4">
                <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] sm:border-[3.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] motion-modal-in">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 text-amber-500">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <Crown className="w-5 h-5 fill-black text-black" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-[var(--text-main)]">
                        {domainToToggleVip.isVip ? 'JADIKAN DOMAIN VIP?' : 'HAPUS STATUS VIP?'}
                      </h4>
                      <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                        Konfirmasi perubahan status domain
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-mono-custom text-[var(--text-main)] mb-5 sm:mb-6 leading-relaxed">
                    Apakah Anda yakin ingin mengubah status domain{' '}
                    <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.5 border font-bold">
                      @{domainToToggleVip.domain}
                    </span>{' '}
                    menjadi{' '}
                    <strong>{domainToToggleVip.isVip ? 'VIP (Mahkota Emas)' : 'FREE (Biasa)'}</strong>?
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDomainToToggleVip(null)}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold"
                    >
                      BATAL
                    </button>
                    <button
                      onClick={confirmToggleVipDomain}
                      disabled={isTogglingVip}
                      className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3.5 sm:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isTogglingVip ? 'MEMPROSES...' : 'YA, UBAH STATUS'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ADD DOMAIN CONFIRMATION MODAL */}
            {domainToAdd && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 xs:p-4">
                <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] sm:border-[3.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] motion-modal-in">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 text-[var(--color-green)]">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-green)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-[var(--text-main)]">
                        TAMBAH DOMAIN BARU?
                      </h4>
                      <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                        Konfirmasi penambahan domain aktif
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-mono-custom text-[var(--text-main)] mb-5 sm:mb-6 leading-relaxed">
                    Apakah Anda yakin ingin menambahkan domain <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.5 border font-bold">@{domainToAdd}</span> ke daftar email aktif HeyFlatimo?
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDomainToAdd(null)}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold"
                    >
                      BATAL
                    </button>
                    <button
                      onClick={confirmAddDomain}
                      disabled={isAddingDomain}
                      className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3.5 sm:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isAddingDomain ? 'MENAMBAHKAN...' : 'YA, TAMBAHKAN'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DELETE DOMAIN CONFIRMATION MODAL */}
            {domainToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 xs:p-4">
                <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] sm:border-[3.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] motion-modal-in">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 text-[var(--color-red)]">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-red)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-[var(--text-main)]">
                        HAPUS DOMAIN?
                      </h4>
                      <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                        Konfirmasi penghapusan domain
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-mono-custom text-[var(--text-main)] mb-5 sm:mb-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus domain <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.5 border font-bold">@{domainToDelete}</span> dari daftar email?
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDomainToDelete(null)}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold"
                    >
                      BATAL
                    </button>
                    <button
                      onClick={confirmDeleteDomain}
                      className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-3.5 sm:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>YA, HAPUS DOMAIN</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN LOGIN CREDENTIALS MANAGEMENT SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-purple)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      KREDENSIAL LOGIN ADMIN (USERNAME & PASSWORD)
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Ubah Username dan Password yang digunakan untuk masuk ke Menu Dashboard Admin ini.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] xs:text-xs font-mono-custom font-black px-2.5 py-1 bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AKUN UTAMA ADMIN</span>
                </div>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
                      Username Admin Baru:
                    </label>
                    <input
                      type="text"
                      value={adminUserInput}
                      onChange={(e) => setAdminUserInput(e.target.value)}
                      placeholder="Ketik Username Admin Baru"
                      autoComplete="off"
                      className="brutal-input w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-purple)] dark:text-[var(--color-pink)]">
                      Password Admin Baru:
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPassInput}
                        onChange={(e) => setAdminPassInput(e.target.value)}
                        placeholder="Ketik Password Admin Baru"
                        autoComplete="new-password"
                        className="brutal-input w-full pl-3 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-black"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-black dark:hover:text-white"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingCreds}
                    className="brutal-btn bg-[var(--color-purple)] text-white hover:bg-purple-700 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingCreds ? 'MENYIMPAN...' : 'SIMPAN KREDENSIAL ADMIN'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ACCESS KEY GATE MANAGEMENT SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      KODE AKSES WEB TMAIL (ACCESS GATE)
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Proteksi website TMail dengan kode akses/PIN sebelum pengunjung bisa menggunakan email.
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`text-[10px] xs:text-xs font-mono-custom font-black px-2.5 py-1 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto flex items-center gap-1.5 ${
                  accessEnabled
                    ? 'bg-[var(--color-red)] text-white'
                    : 'bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${accessEnabled ? 'bg-white' : 'bg-[var(--color-green)]'} motion-pulse-dot`} />
                  <span>{accessEnabled ? 'STATUS: PROTEKSI AKTIF (LOCKED)' : 'STATUS: BEBAS (TANPA KUNCI)'}</span>
                </div>
              </div>

              <form onSubmit={handleSaveAccess} className="space-y-4">
                {/* On/Off Toggle Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <div>
                    <span className="font-mono-custom font-bold text-xs sm:text-sm block text-[var(--text-main)]">
                      Aktifkan Proteksi Kode Akses Web
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] block">
                      Jika aktif, setiap pengguna wajib memasukkan kode akses sebelum bisa membuka mailbox.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAccessEnabled(!accessEnabled)}
                    className={`brutal-btn px-4 py-1.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)] ${
                      accessEnabled
                        ? 'bg-[var(--color-green)] text-white'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-black dark:text-white'
                    }`}
                  >
                    {accessEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>AKTIF (ON)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>NONAKTIF (OFF)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Key and Message Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
                      Kode Akses Kustom (Password / Key):
                    </label>
                    <div className="relative">
                      <input
                        type={showAccessKey ? 'text' : 'password'}
                        value={accessKeyInput}
                        onChange={(e) => setAccessKeyInput(e.target.value)}
                        placeholder="Contoh: VIP2026 atau 123456"
                        className="brutal-input w-full pl-3 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-black"
                        required={accessEnabled}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessKey(!showAccessKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-black dark:hover:text-white"
                      >
                        {showAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-purple)] dark:text-[var(--color-pink)]">
                      Pesan Petunjuk untuk Pengunjung:
                    </label>
                    <input
                      type="text"
                      value={accessMessageInput}
                      onChange={(e) => setAccessMessageInput(e.target.value)}
                      placeholder="Petunjuk atau info kontak jika butuh akses..."
                      className="brutal-input w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingAccess}
                    className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingAccess ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN KODE AKSES'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* BROADCAST / POPUP ANNOUNCEMENT SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-orange)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      POP-UP PENGUMUMAN / BROADCAST
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Tampilkan modal pop-up pemberitahuan otomatis saat pengunjung membuka website TMail.
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`text-[10px] xs:text-xs font-mono-custom font-black px-2.5 py-1 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto flex items-center gap-1.5 ${
                  announcementEnabled
                    ? 'bg-[var(--color-green)] text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-[var(--text-muted)]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${announcementEnabled ? 'bg-white' : 'bg-zinc-500'} motion-pulse-dot`} />
                  <span>{announcementEnabled ? 'POPUP: AKTIF (TAMPIL)' : 'POPUP: NONAKTIF'}</span>
                </div>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                {/* On/Off Toggle Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#fffbeb] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <div>
                    <span className="font-mono-custom font-bold text-xs sm:text-sm block text-[var(--text-main)]">
                      Aktifkan Pop-Up Pengumuman Saat Buka Web
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] block">
                      Munculkan pesan broadcast penting secara otomatis ke semua pengguna.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                    className={`brutal-btn px-4 py-1.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)] ${
                      announcementEnabled
                        ? 'bg-[var(--color-green)] text-white'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-black dark:text-white'
                    }`}
                  >
                    {announcementEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>AKTIF (ON)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>NONAKTIF (OFF)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Form Fields: Tag, Title, Display Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      Tag / Badge Label:
                    </label>
                    <input
                      type="text"
                      value={announcementTagInput}
                      onChange={(e) => setAnnouncementTagInput(e.target.value)}
                      placeholder="PENGUMUMAN RESMI"
                      className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      Judul Pop-Up:
                    </label>
                    <input
                      type="text"
                      value={announcementTitleInput}
                      onChange={(e) => setAnnouncementTitleInput(e.target.value)}
                      placeholder="Update Layanan TMail Pro"
                      className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      Pengaturan Muncul Pop-Up:
                    </label>
                    <select
                      value={announcementDisplayModeInput}
                      onChange={(e) => setAnnouncementDisplayModeInput(e.target.value as any)}
                      className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold bg-white dark:bg-zinc-900 cursor-pointer"
                    >
                      <option value="once_per_device">Sekali per Perangkat (Sampai Diubah)</option>
                      <option value="once_per_session">Sekali per Sesi Buka Browser</option>
                      <option value="always">Selalu Muncul Setiap Buka / Refresh</option>
                    </select>
                  </div>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-orange)]">
                    Isi Pesan Pengumuman:
                  </label>
                  <textarea
                    rows={4}
                    value={announcementContentInput}
                    onChange={(e) => setAnnouncementContentInput(e.target.value)}
                    placeholder="Tulis pesan pengumuman atau broadcast lengkap di sini..."
                    className="brutal-input w-full p-3 text-xs sm:text-sm font-mono-custom font-bold bg-[#f8fafc] dark:bg-zinc-900"
                  />
                </div>

                {/* Actions: Preview & Save */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementPreview(true)}
                    className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3.5 xs:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>PREVIEW POP-UP</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingAnnouncement}
                    className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingAnnouncement ? 'MENYIMPAN...' : 'SIMPAN PENGUMUMAN'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* PREVIEW ANNOUNCEMENT MODAL FOR ADMIN */}
            {showAnnouncementPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/80 backdrop-blur-xs">
                <div className="brutal-card w-full max-w-lg p-5 xs:p-6 sm:p-7 bg-white dark:bg-zinc-900 relative shadow-[6px_6px_0px_var(--shadow-color)] sm:shadow-[8px_8px_0px_var(--shadow-color)] border-[3px] sm:border-[4px] border-[var(--border-color)] motion-modal-in">
                  <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b-[2.5px] border-dashed border-[var(--border-color)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block bg-[var(--color-orange)] text-white text-[9px] font-mono-custom font-black px-1.5 py-0.2 border border-[var(--border-color)] uppercase mb-0.5">
                          {announcementTagInput || 'PENGUMUMAN'}
                        </span>
                        <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)] truncate">
                          {announcementTitleInput || 'Pemberitahuan Sistem'}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAnnouncementPreview(false)}
                      className="brutal-btn bg-[var(--color-red)] text-white w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-xs hover:bg-red-600 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] mb-4 max-h-64 overflow-y-auto">
                    <p className="text-xs sm:text-sm font-mono-custom text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                      {announcementContentInput || 'Belum ada isi pengumuman.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAnnouncementPreview(false)}
                    className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 w-full py-2.5 sm:py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_var(--shadow-color)]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>TUTUP PREVIEW</span>
                  </button>
                </div>
              </div>
            )}

            {/* TELEGRAM BOT INTEGRATION SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#229ED9] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 -translate-y-0.5 translate-x-0.5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      INTEGRASI BOT TELEGRAM (INBOX & OTP READER)
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Hubungkan Bot Telegram untuk membaca email dan mengambil kode OTP secara interaktif via tombol inline.
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`text-[10px] xs:text-xs font-mono-custom font-black px-2.5 py-1 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto flex items-center gap-1.5 ${
                    telegramEnabled && (telegramWebhookUrl || telegramWebhookInfo?.url)
                      ? 'bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7]'
                      : telegramEnabled
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-[var(--text-muted)]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      telegramEnabled && (telegramWebhookUrl || telegramWebhookInfo?.url)
                        ? 'bg-[var(--color-green)]'
                        : telegramEnabled
                        ? 'bg-amber-500'
                        : 'bg-zinc-500'
                    } motion-pulse-dot`}
                  />
                  <span>
                    {telegramEnabled && (telegramWebhookUrl || telegramWebhookInfo?.url)
                      ? `BOT AKTIF ${telegramBotUsername ? `(@${telegramBotUsername})` : ''}`
                      : telegramEnabled
                      ? 'BOT AKTIF (BELUM SET WEBHOOK HTTPS)'
                      : 'BOT NONAKTIF'}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Info Banner */}
              <div className="p-3 sm:p-4 bg-[#eff6ff] dark:bg-sky-950/40 border-[2px] border-[var(--border-color)] mb-4 space-y-2 shadow-[2px_2px_0px_var(--shadow-color)]">
                <div className="flex items-center gap-2 font-mono-custom font-black text-xs text-[var(--color-blue)] uppercase">
                  <Info className="w-4 h-4 text-[var(--color-blue)] flex-shrink-0" />
                  <span>Panduan Menghubungkan Bot Telegram:</span>
                </div>
                <div className="text-[11px] sm:text-xs font-mono-custom text-[var(--text-muted)] space-y-1 pl-6">
                  <p>1. Buka <strong>@BotFather</strong> di Telegram, kirim perintah <code>/newbot</code> dan ikuti langkah pembuatan bot.</p>
                  <p>2. Salin <strong>HTTP API Token</strong> yang diberikan dan tempel pada kolom Token Bot di bawah.</p>
                  <p>3. Ubah saklar status ke <strong>AKTIF (ON)</strong> lalu klik tombol <strong>SET WEBHOOK</strong> atau <strong>SIMPAN PENGATURAN BOT</strong>.</p>
                  <p>4. Buka bot Anda di Telegram dan kirim pesan <code>/start</code> atau ketik email langsung untuk cek OTP secara instan!</p>
                </div>
              </div>

              <form onSubmit={handleSaveTelegram} className="space-y-4">
                {/* On/Off Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#f0f9ff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <div>
                    <span className="font-mono-custom font-bold text-xs sm:text-sm block text-[var(--text-main)]">
                      Status Integrasi Bot Telegram
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] block">
                      Aktifkan bot untuk merespons perintah <code>/start</code>, <code>/generate</code>, <code>/otp &lt;email&gt;</code>, dan <code>/inbox &lt;email&gt;</code>.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTelegramEnabled(!telegramEnabled)}
                    className={`brutal-btn px-4 py-1.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)] ${
                      telegramEnabled
                        ? 'bg-[var(--color-green)] text-white'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-black dark:text-white'
                    }`}
                  >
                    {telegramEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>AKTIF (ON)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>NONAKTIF (OFF)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bot Token Input */}
                <div>
                  <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
                    Token Bot Telegram (Dari @BotFather):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={telegramBotTokenInput}
                        onChange={(e) => setTelegramBotTokenInput(e.target.value)}
                        placeholder="Contoh: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        className="brutal-input w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono-custom font-black"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleTestBot}
                      disabled={isTestingBot || !telegramBotTokenInput.trim()}
                      className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3.5 py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isTestingBot ? 'MEMERIKSA...' : 'TES KONEKSI BOT'}</span>
                    </button>
                  </div>
                </div>

                {/* Webhook Configuration & URL Display */}
                <div className="p-3 bg-[#f8fafc] dark:bg-zinc-950 border-[2px] border-[var(--border-color)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono-custom font-black uppercase text-[var(--text-muted)] block mb-0.5">
                        Webhook Endpoint Otomatis:
                      </span>
                      <code className="text-xs font-mono-custom font-bold text-[var(--color-blue)] break-all block">
                        {origin}/api/webhook/telegram
                      </code>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={handleSetWebhook}
                        disabled={isSettingWebhook || !telegramBotTokenInput.trim()}
                        className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)] disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSettingWebhook ? 'animate-spin-fast' : ''}`} />
                        <span>{isSettingWebhook ? 'MENDAFTAR...' : 'SET WEBHOOK'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fetchWebhookInfo(telegramBotTokenInput.trim())}
                        disabled={isCheckingWebhookInfo || !telegramBotTokenInput.trim()}
                        className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)] disabled:opacity-50"
                        title="Cek Status Webhook Langsung dari Telegram API"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCheckingWebhookInfo ? 'animate-spin-fast' : ''}`} />
                        <span>CEK LIVE</span>
                      </button>

                      {(telegramWebhookUrl || telegramWebhookInfo?.url) && (
                        <button
                          type="button"
                          onClick={handleDeleteWebhook}
                          disabled={isDeletingWebhook}
                          className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)]"
                          title="Hapus Webhook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>HAPUS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Webhook Diagnostics Card */}
                {telegramWebhookInfo && (
                  <div className="p-3 bg-[#f0fdf4] dark:bg-zinc-900 border-[2px] border-emerald-500 space-y-1.5 text-xs font-mono-custom shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in">
                    <div className="flex items-center justify-between gap-2 border-b border-dashed border-emerald-300 dark:border-emerald-800 pb-1">
                      <span className="font-black text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>STATUS WEBHOOK DI TELEGRAM SERVER</span>
                      </span>
                      {telegramWebhookInfo.url ? (
                        <span className="bg-emerald-200 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.2 text-[10px] font-bold border border-emerald-400">
                          TERDAFTAR
                        </span>
                      ) : (
                        <span className="bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 text-[10px] font-bold border border-amber-400">
                          BELUM TERDAFTAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-main)] space-y-0.5">
                      <p><strong>URL Terdaftar:</strong> {telegramWebhookInfo.url || '(Belum diset ke Telegram)'}</p>
                      <p><strong>Pending Updates:</strong> {telegramWebhookInfo.pending_update_count ?? 0} pesan</p>
                      {telegramWebhookInfo.last_error_message && (
                        <div className="p-2 bg-red-100 dark:bg-red-950/60 border border-red-400 text-red-800 dark:text-red-300 mt-1">
                          <strong>Error Terakhir dari Telegram:</strong> {telegramWebhookInfo.last_error_message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingTelegram}
                    className="brutal-btn bg-[#229ED9] text-white hover:bg-sky-600 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingTelegram ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN BOT'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* DATABASE & AUTO-DELETE 3 HARI (WIB) CLEANER SECTION */}
            <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-orange)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      DATABASE & AUTO-DELETE (3 HARI WIB)
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Sistem menghapus email otomatis setelah 3 hari dan menyediakan opsi pembersihan manual kapan saja.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] xs:text-xs font-mono-custom font-black px-2.5 py-1 bg-[var(--color-green)] text-white border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AUTO-DELETE 3 HARI (72 JAM WIB) AKTIF</span>
                </div>
              </div>

              {/* Retention & Lifetime Email Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
                <div className="p-3 bg-[#ecfdf5] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <span className="text-[9px] font-mono-custom font-black uppercase text-emerald-700 dark:text-emerald-400 block">
                    Total Email Masuk (All-Time):
                  </span>
                  <span className="text-base sm:text-lg font-heading font-black text-emerald-700 dark:text-emerald-400 block">
                    {cleanupStats?.totalReceivedAllTime ?? stats?.totalReceivedAllTime ?? cleanupStats?.totalMessages ?? stats?.totalMessages ?? 0} Pesan
                  </span>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block mt-0.5">
                    Akumulatif (tetap tercatat aman)
                  </span>
                </div>

                <div className="p-3 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <span className="text-[9px] font-mono-custom font-black uppercase text-[var(--color-blue)] block">
                    Pesan Aktif di DB Saat Ini:
                  </span>
                  <span className="text-base sm:text-lg font-heading font-black text-[var(--color-blue)] block">
                    {cleanupStats?.totalMessages ?? stats?.totalMessages ?? 0} Pesan
                  </span>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block mt-0.5">
                    {cleanupStats?.uniqueActiveMailboxes ?? 0} Alamat Mailbox Aktif
                  </span>
                </div>

                <div className="p-3 bg-[#fef2f2] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <span className="text-[9px] font-mono-custom font-black uppercase text-red-600 dark:text-red-400 block">
                    Pesan Kadaluwarsa (&gt; 3 Hari):
                  </span>
                  <span className="text-base sm:text-lg font-heading font-black text-[var(--color-red)] block">
                    {cleanupStats?.expiredCount ?? 0} Pesan
                  </span>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block mt-0.5">
                    Melebihi batas 72 jam
                  </span>
                </div>

                <div className="p-3 bg-[#fdf4ff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)]">
                  <span className="text-[9px] font-mono-custom font-black uppercase text-purple-700 dark:text-purple-400 block">
                    Total Pesan Dihapus (All-Time):
                  </span>
                  <span className="text-base sm:text-lg font-heading font-black text-purple-700 dark:text-purple-400 block">
                    {cleanupStats?.totalDeletedAllTime ?? 0} Pesan
                  </span>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block mt-0.5">
                    Total dibersihkan seumur hidup
                  </span>
                </div>
              </div>

              {/* Information & WIB Schedule Card */}
              <div className="p-3.5 bg-[#f0fdf4] dark:bg-zinc-900 border-[2px] border-emerald-500 shadow-[2px_2px_0px_var(--shadow-color)] space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-mono-custom font-black text-emerald-800 dark:text-emerald-300 uppercase">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>KEBIJAKAN RETENSI OTOMATIS 3 HARI (ZONA WAKTU WIB / UTC+7)</span>
                </div>
                <div className="text-[11px] sm:text-xs font-mono-custom text-[var(--text-main)] space-y-1">
                  <p>
                    Setiap email yang masuk ke sistem HeyFlatimo Temp Mail akan <strong>otomatis terhapus permanen setelah 3 hari (72 jam)</strong> oleh background task MongoDB TTL.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400">
                    <strong>Simulasi Jadwal:</strong> Email yang masuk saat ini akan otomatis dimusnahkan pada:{' '}
                    <code className="bg-white dark:bg-zinc-950 px-1.5 py-0.5 border border-emerald-400 font-bold">
                      {new Date(Date.now() + 72 * 3600000).toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      })}{' '}
                      WIB
                    </code>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Clean >3 Days and Clean All */}
              <div className="space-y-3">
                <div className="p-3 bg-[#f8fafc] dark:bg-zinc-900 border-[2px] border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-mono-custom font-black text-[var(--text-main)] block">
                      Pembersihan Manual Email Kadaluwarsa (&gt; 3 Hari)
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] block">
                      Paksa hapus pesan yang usianya sudah lebih dari 72 jam sekarang tanpa menunggu background worker.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCleanExpired}
                    disabled={isCleaningExpired}
                    className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-3.5 py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isCleaningExpired ? 'MEMBERSIHKAN...' : 'BERSIHKAN EMAIL > 3 HARI'}</span>
                  </button>
                </div>

                {/* Emergency Clear All Action */}
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border-[2px] border-dashed border-red-300 dark:border-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-mono-custom font-black text-red-700 dark:text-red-300 block">
                      Pembersihan Total: Hapus Semua Pesan Saat Ini
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-custom text-zinc-500 block">
                      Menghapus seluruh pesan email yang ada di database saat ini, termasuk yang baru masuk (&lt; 1 hari atau &lt; 3 hari).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCleanAllModal(true)}
                    className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 px-3.5 py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>HAPUS SEMUA PESAN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CONFIRM CLEAN ALL MODAL */}
            {showCleanAllModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 xs:p-4">
                <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] sm:border-[3.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] motion-modal-in">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 text-[var(--color-red)]">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-red)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-[var(--text-main)]">
                        HAPUS SELURUH PESAN?
                      </h4>
                      <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                        Tindakan ini permanen dan tidak dapat dibatalkan
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-mono-custom text-[var(--text-main)] mb-3 leading-relaxed">
                    Apakah Anda yakin ingin menghapus <strong>seluruh pesan email</strong> yang ada di database saat ini?
                  </p>

                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] font-mono-custom text-amber-900 dark:text-amber-200 mb-5">
                    <strong>Perhatian:</strong> Pesan yang baru masuk (walaupun belum sampai 1 hari atau 3 hari) juga akan <strong>langsung ikut terhapus</strong>. Namun total statistik email masuk all-time Anda tetap aman.
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCleanAllModal(false)}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      BATAL
                    </button>
                    <button
                      type="button"
                      onClick={confirmCleanAll}
                      disabled={isCleaningAll}
                      className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 px-3.5 sm:px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isCleaningAll ? 'MEMBERSIHKAN...' : 'YA, HAPUS SEMUA PESAN'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="brutal-card p-3.5 sm:p-4 bg-[#eff6ff] dark:bg-zinc-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[var(--color-blue)] border-[2.5px] border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                  <Server className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] xs:text-[10px] font-mono-custom font-bold text-[var(--text-muted)] uppercase block truncate">
                    STATUS REST API
                  </span>
                  <span className="font-heading font-black text-base sm:text-lg text-[var(--color-blue)] truncate block">
                    ONLINE (v1 READY)
                  </span>
                </div>
              </div>

              <div className="brutal-card p-3.5 sm:p-4 bg-[#ecfdf5] dark:bg-zinc-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[var(--color-green)] border-[2.5px] border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] xs:text-[10px] font-mono-custom font-bold text-emerald-700 dark:text-emerald-400 uppercase block truncate">
                    TOTAL EMAIL MASUK (ALL-TIME)
                  </span>
                  <span className="font-heading font-black text-base sm:text-lg text-[var(--color-green)] truncate block">
                    {cleanupStats?.totalReceivedAllTime ?? stats?.totalReceivedAllTime ?? cleanupStats?.totalMessages ?? stats?.totalMessages ?? 0} Pesan
                  </span>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block truncate">
                    {cleanupStats?.totalMessages ?? stats?.totalMessages ?? 0} aktif di DB ({cleanupStats?.totalDeletedAllTime ?? 0} dibersihkan)
                  </span>
                </div>
              </div>

              <div className="brutal-card p-3.5 sm:p-4 bg-[#fefce8] dark:bg-zinc-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[var(--color-yellow)] border-[2.5px] border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] xs:text-[10px] font-mono-custom font-bold text-[var(--text-muted)] uppercase block truncate">
                    BOT AUTO-EXTRACT
                  </span>
                  <span className="font-heading font-black text-base sm:text-lg text-black dark:text-white truncate block">
                    OTP + LINKS AKTIF
                  </span>
                </div>
              </div>
            </div>

            {/* API KEY SELECTOR FOR INTEGRATION & LIVE TESTER */}
            <div className="brutal-card p-3.5 sm:p-4 bg-[var(--card-bg)] flex flex-col md:flex-row md:items-center justify-between gap-3 border-[2px] border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono-custom font-black uppercase text-[var(--text-main)] block">
                    PILIH API KEY UNTUK INTEGRASI KODE & LIVE TESTER
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] block">
                    Pilih API Key aktif yang akan disematkan pada contoh kode (Python, Node, cURL, PHP) dan pengujian live di bawah.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-[11px] font-mono-custom font-bold uppercase text-[var(--text-main)] hidden sm:inline">
                  Key Aktif:
                </label>
                <select
                  value={safeKey}
                  onChange={(e) => setSelectedApiKey(e.target.value)}
                  className="brutal-input text-xs font-mono-custom font-bold py-2 px-3 bg-white dark:bg-zinc-900 cursor-pointer w-full md:w-auto min-w-[260px]"
                >
                  {apiKeys.map((k) => (
                    <option key={k.id} value={k.key}>
                      {k.name} ({k.isSingleBot ? (k.boundIdentifier ? '1-BOT LOCKED' : '1-BOT LOCK') : 'MULTI-BOT'}) {!k.isActive ? '[NONAKTIF]' : ''}
                    </option>
                  ))}
                  {apiKeys.length === 0 && <option value={safeKey}>Default Master Key</option>}
                </select>
              </div>
            </div>

            {/* Two Column Layout: Code Generator & Live Interactive Tester */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
              {/* Left Column: Code Generator for Bots */}
              <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)] flex flex-col">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 mb-3 sm:mb-4 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-blue)] flex-shrink-0" />
                    <h3 className="font-heading font-black text-sm xs:text-base uppercase">
                      CONTOH KODE BOT
                    </h3>
                  </div>

                  {/* Language Selector */}
                  <div className="flex gap-1 flex-wrap">
                    {(['python', 'node', 'curl', 'php'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeTab(lang)}
                        className={`px-2 xs:px-2.5 py-1 text-[9px] xs:text-[10px] font-mono-custom font-black border-2 border-[var(--border-color)] uppercase transition-all ${
                          activeCodeTab === lang
                            ? 'bg-[var(--color-yellow)] text-black shadow-[1.5px_1.5px_0px_var(--shadow-color)]'
                            : 'bg-white dark:bg-zinc-800 text-[var(--text-muted)] hover:bg-slate-100'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex-1">
                  <pre className="w-full h-[300px] xs:h-[340px] sm:h-[360px] p-3 sm:p-4 bg-zinc-950 text-emerald-400 font-mono text-[10px] xs:text-[11px] sm:text-xs overflow-auto border-[2.5px] sm:border-[3px] border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] whitespace-pre">
                    {codeSnippets[activeCodeTab]}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
                      showToast(`Kode ${activeCodeTab.toUpperCase()} berhasil disalin!`);
                    }}
                    className="absolute top-2.5 right-2.5 brutal-btn bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 py-1 text-[9px] xs:text-[10px] flex items-center gap-1 font-bold shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>SALIN KODE</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Live API Tester */}
              <div className="brutal-card p-4 xs:p-5 sm:p-6 bg-[var(--card-bg)] flex flex-col">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                  <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-green)] flex-shrink-0" />
                  <h3 className="font-heading font-black text-sm xs:text-base uppercase">
                    INTERACTIVE API TESTER
                  </h3>
                </div>

                <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                  <div>
                    <label className="block text-[10px] xs:text-[11px] font-bold uppercase font-mono-custom mb-1 text-[var(--text-muted)]">
                      Target Email untuk Diuji:
                    </label>
                    <input
                      type="text"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="masukkan email atau klik Generate..."
                      className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    <button
                      onClick={() => runTest('domains')}
                      disabled={isTesting}
                      className="brutal-btn bg-[var(--color-blue)] text-white py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                    >
                      <Play className="w-3 h-3" />
                      <span>DOMAINS</span>
                    </button>

                    <button
                      onClick={() => runTest('generate')}
                      disabled={isTesting}
                      className="brutal-btn bg-[var(--color-yellow)] text-black py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                    >
                      <Play className="w-3 h-3" />
                      <span>GENERATE</span>
                    </button>

                    <button
                      onClick={() => runTest('otp', `email=${encodeURIComponent(testEmail)}`)}
                      disabled={isTesting || !testEmail}
                      className="brutal-btn bg-[var(--color-green)] text-white py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-50 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                      title="Ekstrak OTP dari email terbaru"
                    >
                      <Play className="w-3 h-3" />
                      <span>AMBIL OTP</span>
                    </button>

                    <button
                      onClick={() => runTest('links', `email=${encodeURIComponent(testEmail)}`)}
                      disabled={isTesting || !testEmail}
                      className="brutal-btn bg-[var(--color-orange)] text-white py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-50 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                      title="Ekstrak Link Verifikasi"
                    >
                      <Play className="w-3 h-3" />
                      <span>AMBIL LINK</span>
                    </button>
                  </div>
                </div>

                {/* Output Display */}
                <div className="flex-1 flex flex-col min-h-[180px] sm:min-h-[220px]">
                  <span className="text-[9px] xs:text-[10px] font-mono-custom font-bold text-[var(--text-muted)] uppercase mb-1">
                    Live Response Output:
                  </span>
                  <pre className="flex-1 p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] xs:text-[11px] overflow-auto border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] whitespace-pre-wrap select-text">
                    {testResult
                      ? JSON.stringify(testResult, null, 2)
                      : '// Klik salah satu tombol di atas untuk melihat respon langsung dari server.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
