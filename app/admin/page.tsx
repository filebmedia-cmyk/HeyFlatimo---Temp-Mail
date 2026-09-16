'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUpRight,
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
  Crown,
  Clock,
  Timer,
  Power,
  Edit3,
  ChevronDown,
  ChevronUp,
  Menu,
  Bot,
  LayoutDashboard,
} from 'lucide-react';
import Toast from '@/components/Toast';
import { playSound, getSoundEnabled, setSoundEnabled, unlockAudio } from '@/lib/sound';

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

type AdminSection =
  | 'dashboard'
  | 'domains'
  | 'apikeys'
  | 'endpoints'
  | 'telegram'
  | 'credentials'
  | 'access'
  | 'announcement'
  | 'cleaner';

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

  // Active Sidebar Section & Mobile Drawer State
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Private REST API & Webhook Docs State
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(
    new Set(['generate', 'otp', 'links', 'inbox'])
  );
  const [copiedEndpointId, setCopiedEndpointId] = useState<string | null>(null);
  const [copiedCurlId, setCopiedCurlId] = useState<string | null>(null);

  const toggleEndpointExpand = (id: string) => {
    playSound('click');
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyEndpointUrl = (url: string, id: string) => {
    playSound('success');
    navigator.clipboard.writeText(url);
    setCopiedEndpointId(id);
    showToast('URL Endpoint berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedEndpointId(null), 2000);
  };

  const handleCopyEndpointCurl = (curlCommand: string, id: string) => {
    playSound('success');
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurlId(id);
    showToast('Perintah cURL berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedCurlId(null), 2000);
  };

  // Edit API Key Modal State
  const [keyToEdit, setKeyToEdit] = useState<ApiKeyItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editSingleBot, setEditSingleBot] = useState(false);
  const [isSavingEditKey, setIsSavingEditKey] = useState(false);

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

  // Database Cleaner & Retention State
  const [cleanupStats, setCleanupStats] = useState<{
    totalMessages?: number;
    expiredCount?: number;
    retentionDays?: number;
    activeMessages?: number;
    uniqueActiveMailboxes?: number;
    totalDeletedAllTime?: number;
    totalReceivedAllTime?: number;
    status?: string;
  } | null>(null);
  const [isCleaningExpired, setIsCleaningExpired] = useState(false);
  const [showCleanAllModal, setShowCleanAllModal] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);

  // Admin Credentials State
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Access Gate State
  const [accessEnabled, setAccessEnabled] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [accessMessageInput, setAccessMessageInput] = useState('');
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  // Announcement State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTagInput, setAnnouncementTagInput] = useState('INFO');
  const [announcementTitleInput, setAnnouncementTitleInput] = useState('');
  const [announcementContentInput, setAnnouncementContentInput] = useState('');
  const [announcementDisplayModeInput, setAnnouncementDisplayModeInput] = useState<'once' | 'always'>('once');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [showAnnouncementPreview, setShowAnnouncementPreview] = useState(false);

  // Telegram Bot State
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramBotTokenInput, setTelegramBotTokenInput] = useState('');
  const [telegramApiBaseUrlInput, setTelegramApiBaseUrlInput] = useState('');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; botName?: string; username?: string; error?: string } | null>(null);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);
  const [telegramWebhookInfo, setTelegramWebhookInfo] = useState<{ url?: string; has_custom_certificate?: boolean; pending_update_count?: number; last_error_message?: string } | null>(null);

  // Interactive API Tester State
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'node' | 'curl' | 'php'>('python');
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [origin, setOrigin] = useState('https://heyflatimo.com');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMsg(message);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // Auto-dismiss keyNotice setelah 6 detik
  useEffect(() => {
    if (!keyNotice) return;
    const timer = setTimeout(() => {
      setKeyNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [keyNotice]);

  // Auto-dismiss domainNotice setelah 6 detik
  useEffect(() => {
    if (!domainNotice) return;
    const timer = setTimeout(() => {
      setDomainNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [domainNotice]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      // Sinkronkan daftar domain segera saat halaman dibuka
      fetchDomains();
      const isLogged = sessionStorage.getItem('heyflatimo_admin_logged');
      if (isLogged === 'true') {
        setIsLoggedIn(true);
        const savedKey = sessionStorage.getItem('heyflatimo_admin_key');
        if (savedKey) setApiKey(savedKey);
        fetchApiKeys();
        fetchCleanupStats();
        fetchSettings();
        fetchStats(savedKey || undefined);
      }
    }
  }, []);

  const getAdminHeaders = (): Record<string, string> => {
    const auth = typeof window !== 'undefined' ? sessionStorage.getItem('heyflatimo_admin_auth') || '' : '';
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('heyflatimo_admin_token') || '' : '';
    const key = typeof window !== 'undefined' ? sessionStorage.getItem('heyflatimo_admin_key') || apiKey || '' : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (auth) {
      headers['Authorization'] = `Basic ${auth}`;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (token) {
      headers['x-admin-token'] = token;
    }
    if (key) {
      headers['x-api-key'] = key;
    }
    return headers;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const basicAuth = btoa(`${username}:${password}`);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        sessionStorage.setItem('heyflatimo_admin_logged', 'true');
        sessionStorage.setItem('heyflatimo_admin_auth', basicAuth);
        if (data.sessionToken) {
          sessionStorage.setItem('heyflatimo_admin_token', data.sessionToken);
        }
        const activeApiKey = data.apiKey || data.admin?.apiKey;
        if (activeApiKey) {
          sessionStorage.setItem('heyflatimo_admin_key', activeApiKey);
          setApiKey(activeApiKey);
        }
        setIsLoggedIn(true);
        showToast('Login Admin Berhasil!', 'success');
        fetchApiKeys();
        fetchDomains();
        fetchCleanupStats();
        fetchSettings();
        fetchStats(activeApiKey);
      } else {
        playSound('error');
        showToast(data.error || 'Username atau password salah!', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal terhubung ke server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    playSound('click');
    sessionStorage.removeItem('heyflatimo_admin_logged');
    sessionStorage.removeItem('heyflatimo_admin_auth');
    sessionStorage.removeItem('heyflatimo_admin_token');
    sessionStorage.removeItem('heyflatimo_admin_key');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setIsMobileMenuOpen(false);
    showToast('Berhasil logout dari panel admin.', 'info');
  };

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('/api/admin/apikeys', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setApiKeys(data.keys);
        if (data.keys.length > 0 && !selectedApiKey) {
          setSelectedApiKey(data.keys[0].key);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyTitle.trim()) {
      showToast('Harap isi judul/nama untuk API Key ini!', 'error');
      return;
    }
    setIsCreatingKey(true);
    try {
      const res = await fetch('/api/admin/apikeys', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newKeyTitle.trim(),
          key: newKeyValue.trim() || undefined,
          isSingleBot: newKeySingleBot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('API Key baru berhasil dibuat!', 'success');
        setKeyNotice({ type: 'success', message: `API Key "${data.key.name}" berhasil dibuat dan siap digunakan.` });
        setNewKeyTitle('');
        setNewKeyValue('');
        setNewKeySingleBot(true);
        fetchApiKeys();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal membuat API Key', 'error');
        setKeyNotice({ type: 'error', message: data.error || 'Gagal membuat API Key.' });
      }
    } catch (err) {
      playSound('error');
      showToast('Koneksi gagal saat membuat API Key', 'error');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleGenerateRandomKeyInput = () => {
    playSound('pop');
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setNewKeyValue(`hfl_key_${randomHex}`);
    showToast('Nilai random API Key digenerate!', 'info');
  };

  const toggleKeyVisibility = (id: string) => {
    playSound('click');
    setVisibleKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopySingleKey = (keyString: string, id: string) => {
    playSound('success');
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    showToast('API Key berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleResetKeyBinding = async (id: string, name: string) => {
    playSound('click');
    try {
      const res = await fetch(`/api/admin/apikeys/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ resetBinding: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast(`Ikatan 1-Bot untuk "${name}" berhasil direset!`, 'success');
        setKeyNotice({ type: 'success', message: `Status kunci API Key "${name}" berhasil direset. Bot lain kini dapat mengikat kembali.` });
        fetchApiKeys();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal mereset ikatan bot', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal mereset ikatan bot', 'error');
    }
  };

  const handleToggleKeyActive = async (id: string, currentStatus: boolean) => {
    playSound('click');
    try {
      const res = await fetch(`/api/admin/apikeys/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast(`Status API Key berhasil diubah ke ${!currentStatus ? 'AKTIF' : 'NONAKTIF'}!`, 'success');
        fetchApiKeys();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal mengubah status API Key', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal mengubah status API Key', 'error');
    }
  };

  const handleOpenEditKeyModal = (item: ApiKeyItem) => {
    playSound('click');
    setKeyToEdit(item);
    setEditTitle(item.name);
    setEditValue(item.key);
    setEditSingleBot(item.isSingleBot);
  };

  const handleSaveEditKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyToEdit) return;
    if (!editTitle.trim()) {
      showToast('Judul API Key tidak boleh kosong!', 'error');
      return;
    }
    if (!editValue.trim()) {
      showToast('Nilai API Key tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingEditKey(true);
    try {
      const res = await fetch(`/api/admin/apikeys/${keyToEdit.id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: editTitle.trim(),
          key: editValue.trim(),
          isSingleBot: editSingleBot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('API Key berhasil diperbarui!', 'success');
        setKeyNotice({ type: 'success', message: `API Key "${data.key.name}" berhasil diperbarui.` });
        setKeyToEdit(null);
        fetchApiKeys();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal memperbarui API Key', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal memperbarui API Key', 'error');
    } finally {
      setIsSavingEditKey(false);
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
        playSound('delete');
        showToast(`API Key "${keyToDelete.name}" berhasil dihapus!`, 'success');
        setKeyNotice({ type: 'success', message: `API Key "${keyToDelete.name}" telah berhasil dihapus dari sistem.` });
        setKeyToDelete(null);
        fetchApiKeys();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menghapus API Key', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal menghapus API Key', 'error');
    } finally {
      setIsDeletingKey(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/admin/domains', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.domains) && data.domains.length > 0) {
        const normalized = data.domains.map((d: any) => {
          if (typeof d === 'string') return { domain: d, isVip: false };
          return { domain: d.domain, isVip: Boolean(d.isVip), createdAt: d.createdAt };
        });
        setDomains(normalized);
        return;
      }
    } catch (err) {
      console.error('Error fetching admin domains:', err);
    }

    // Fallback sync with public domain endpoint if admin API response is empty or unauthenticated
    try {
      const pubRes = await fetch('/api/domains');
      const pubData = await pubRes.json();
      if (pubData.domainDetails && Array.isArray(pubData.domainDetails) && pubData.domainDetails.length > 0) {
        const normalized = pubData.domainDetails.map((d: any) => ({
          domain: typeof d === 'string' ? d : d.domain,
          isVip: Boolean(d.isVip),
          createdAt: d.createdAt,
        }));
        setDomains(normalized);
      } else if (pubData.domains && Array.isArray(pubData.domains) && pubData.domains.length > 0) {
        setDomains(pubData.domains.map((d: string) => ({ domain: d, isVip: false })));
      }
    } catch (pubErr) {
      console.error('Error fetching public fallback domains:', pubErr);
    }
  };

  const fetchStats = async (keyToUse?: string) => {
    try {
      const activeKey = keyToUse || apiKey || 'hfl_key_8899aabbccddeeff00112233';
      const res = await fetch(`/api/v1/stats`, {
        headers: { 'x-api-key': activeKey },
      });
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCleanupStats = async () => {
    try {
      const res = await fetch('/api/admin/cleanup', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) setCleanupStats(data);
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
          setAdminPassInput('');
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
          if (data.telegram.botToken) setTelegramBotTokenInput(data.telegram.botToken);
          if (data.telegram.apiBaseUrl) setTelegramApiBaseUrlInput(data.telegram.apiBaseUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUserInput.trim()) {
      showToast('Username admin tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingCreds(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          section: 'credentials',
          data: {
            username: adminUserInput.trim(),
            password: adminPassInput.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('Kredensial Admin berhasil diperbarui!', 'success');
        if (adminPassInput.trim()) {
          const newAuth = btoa(`${adminUserInput.trim()}:${adminPassInput.trim()}`);
          sessionStorage.setItem('heyflatimo_admin_auth', newAuth);
        }
        setAdminPassInput('');
      } else {
        playSound('error');
        showToast(data.error || 'Gagal memperbarui kredensial', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Koneksi gagal saat menyimpan kredensial', 'error');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccess(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          section: 'access',
          data: {
            enabled: accessEnabled,
            key: accessKeyInput.trim(),
            message: accessMessageInput.trim(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('Pengaturan Kode Akses TMail berhasil disimpan!', 'success');
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menyimpan pengaturan kode akses', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Koneksi gagal saat menyimpan akses', 'error');
    } finally {
      setIsSavingAccess(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          section: 'announcement',
          data: {
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
        playSound('success');
        showToast('Pengaturan Pengumuman Pop-Up berhasil disimpan!', 'success');
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menyimpan pengumuman', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Koneksi gagal saat menyimpan pengumuman', 'error');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          section: 'telegram',
          data: {
            enabled: telegramEnabled,
            botToken: telegramBotTokenInput.trim(),
            apiBaseUrl: telegramApiBaseUrlInput.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('Pengaturan Bot Telegram berhasil disimpan!', 'success');
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menyimpan pengaturan telegram', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Koneksi gagal saat menyimpan pengaturan bot', 'error');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegramConnection = async () => {
    playSound('click');
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch('/api/webhook/telegram?action=test', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ botToken: telegramBotTokenInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        setTelegramTestResult({
          success: true,
          botName: data.botName,
          username: data.username,
        });
        showToast(`Bot Telegram Terhubung: @${data.username}`, 'success');
      } else {
        playSound('error');
        setTelegramTestResult({
          success: false,
          error: data.error || 'Gagal memverifikasi token Bot Telegram',
        });
        showToast('Token Bot Telegram tidak valid atau gagal terhubung!', 'error');
      }
    } catch (err: any) {
      playSound('error');
      setTelegramTestResult({
        success: false,
        error: err.message || 'Koneksi ke server Telegram gagal',
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSetWebhook = async () => {
    playSound('click');
    setIsSettingWebhook(true);
    try {
      const res = await fetch('/api/webhook/telegram?action=set-webhook', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('Webhook Telegram berhasil didaftarkan!', 'success');
        if (data.webhookInfo) setTelegramWebhookInfo(data.webhookInfo);
      } else {
        playSound('error');
        showToast(data.error || 'Gagal mendaftarkan webhook', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal mendaftarkan webhook Telegram', 'error');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleDeleteWebhook = async () => {
    playSound('delete');
    setIsDeletingWebhook(true);
    try {
      const res = await fetch('/api/webhook/telegram?action=delete-webhook', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast('Webhook Telegram berhasil dihapus!', 'info');
        setTelegramWebhookInfo(null);
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menghapus webhook', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal menghapus webhook Telegram', 'error');
    } finally {
      setIsDeletingWebhook(false);
    }
  };

  const handleCleanExpired = async () => {
    playSound('click');
    setIsCleaningExpired(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'clean_expired' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        showToast(`Pembersihan selesai! ${data.deletedCount || 0} pesan kedaluwarsa dihapus.`, 'success');
        fetchCleanupStats();
        fetchStats();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal membersihkan pesan', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal membersihkan pesan', 'error');
    } finally {
      setIsCleaningExpired(false);
    }
  };

  const handleCleanAll = async () => {
    setIsCleaningAll(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'clean_all' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('delete');
        showToast(`Seluruh database pesan (${data.deletedCount || 0} pesan) telah dimusnahkan!`, 'success');
        setShowCleanAllModal(false);
        fetchCleanupStats();
        fetchStats();
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menghapus seluruh pesan', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal menghapus seluruh pesan', 'error');
    } finally {
      setIsCleaningAll(false);
    }
  };

  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomainInput.trim().toLowerCase().replace(/^@+/, '');
    if (!clean) return;
    setDomainToAdd(clean);
  };

  const handleConfirmAddDomain = async () => {
    if (!domainToAdd) return;
    setIsAddingDomain(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ domain: domainToAdd, isVip: isNewDomainVip }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        setNewDomainInput('');
        setIsNewDomainVip(false);
        setDomainToAdd(null);
        if (Array.isArray(data.domains)) {
          const normalized = data.domains.map((d: any) => ({
            domain: typeof d === 'string' ? d : d.domain,
            isVip: Boolean(d.isVip),
            createdAt: d.createdAt,
          }));
          setDomains(normalized);
        } else {
          fetchDomains();
        }
        showToast(`Domain @${domainToAdd} berhasil ditambahkan!`, 'success');
        setDomainNotice({ type: 'success', message: `Domain @${domainToAdd} berhasil ditambahkan dan siap digunakan.` });
      } else {
        playSound('error');
        const errorText = data.error || 'Gagal menambahkan domain';
        showToast(errorText, 'error');
        setDomainNotice({ type: 'error', message: errorText });
      }
    } catch (err: any) {
      playSound('error');
      showToast('Gagal menambahkan domain', 'error');
      setDomainNotice({ type: 'error', message: 'Koneksi ke database gagal saat menambahkan domain.' });
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleConfirmToggleVip = async () => {
    if (!domainToToggleVip) return;
    setIsTogglingVip(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ domain: domainToToggleVip.domain, isVip: domainToToggleVip.isVip }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('success');
        if (Array.isArray(data.domains)) {
          const normalized = data.domains.map((d: any) => ({
            domain: typeof d === 'string' ? d : d.domain,
            isVip: Boolean(d.isVip),
            createdAt: d.createdAt,
          }));
          setDomains(normalized);
        } else {
          fetchDomains();
        }
        const successMsg = `Status @${domainToToggleVip.domain} diubah ke ${domainToToggleVip.isVip ? 'VIP' : 'FREE'}!`;
        showToast(successMsg, 'success');
        setDomainNotice({ type: 'success', message: successMsg });
        setDomainToToggleVip(null);
      } else {
        playSound('error');
        showToast(data.error || 'Gagal mengubah status VIP domain', 'error');
      }
    } catch (err) {
      playSound('error');
      showToast('Gagal mengubah status VIP domain', 'error');
    } finally {
      setIsTogglingVip(false);
    }
  };

  const handleDeleteClick = (dom: string) => {
    playSound('pop');
    setDomainToDelete(dom);
  };

  const handleConfirmDeleteDomain = async () => {
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
        playSound('delete');
        if (Array.isArray(data.domains)) {
          const normalized = data.domains.map((d: any) => ({
            domain: typeof d === 'string' ? d : d.domain,
            isVip: Boolean(d.isVip),
            createdAt: d.createdAt,
          }));
          setDomains(normalized);
        } else {
          fetchDomains();
        }
        showToast(`Domain @${target} berhasil dihapus!`, 'success');
        setDomainNotice({ type: 'success', message: `Domain @${target} telah berhasil dihapus dari sistem.` });
      } else {
        playSound('error');
        showToast(data.error || 'Gagal menghapus domain', 'error');
        setDomainNotice({ type: 'error', message: data.error || 'Gagal menghapus domain' });
      }
    } catch (err: any) {
      playSound('error');
      showToast('Gagal menghapus domain', 'error');
      setDomainNotice({ type: 'error', message: 'Koneksi ke database gagal saat menghapus domain.' });
    }
  };

  const safeKey = selectedApiKey || (apiKeys.length > 0 ? apiKeys[0].key : apiKey);

  const runTest = async (endpoint: string, params: string = '') => {
    playSound('click');
    setIsTesting(true);
    setTestResult('Memproses request...');
    try {
      const fullUrl = `${origin}/api/v1/${endpoint}${params ? '?' + params : ''}`;
      const res = await fetch(fullUrl, {
        headers: { 'x-api-key': safeKey },
      });
      const data = await res.json();
      setTestResult(data);
      if (data.error || !res.ok) playSound('error');
      else playSound('success');
      if (data.email && !testEmail) setTestEmail(data.email);
    } catch (err: any) {
      playSound('error');
      setTestResult({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const codeSnippets = {
    python: `# Contoh Bot Python: Integrasi HeyFlatimo TMail API
import requests
import time

BASE_URL = "` + origin + `"
API_KEY = "` + safeKey + `"
HEADERS = {"x-api-key": API_KEY}

# 1. Generate Email Baru
gen_res = requests.get(f"{BASE_URL}/api/v1/generate", headers=HEADERS).json()
email = gen_res["email"]
print(f"[+] Email Terdaftar: {email}")

# 2. Tunggu dan Ekstrak OTP Otomatis
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

const BASE_URL = '` + origin + `';
const API_KEY = '` + safeKey + `';
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
curl -X GET "` + origin + `/api/v1/domains" -H "x-api-key: ` + safeKey + `"

# 2. Generate Email Baru
curl -X GET "` + origin + `/api/v1/generate" -H "x-api-key: ` + safeKey + `"

# 3. Baca Inbox Pesan
curl -X GET "` + origin + `/api/v1/inbox?email=user@domain.com" -H "x-api-key: ` + safeKey + `"

# 4. Auto-Extract OTP
curl -X GET "` + origin + `/api/v1/otp?email=user@domain.com" -H "x-api-key: ` + safeKey + `"

# 5. Auto-Extract Link Verifikasi
curl -X GET "` + origin + `/api/v1/links?email=user@domain.com" -H "x-api-key: ` + safeKey + `"`,
    php: `<?php
// Contoh Integrasi HeyFlatimo API di PHP
$baseUrl = "` + origin + `";
$apiKey = "` + safeKey + `";

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

  const navMenuItems = [
    { id: 'dashboard' as const, label: 'Ringkasan Sistem', icon: Server, badge: 'KPI' },
    { id: 'domains' as const, label: 'Kelola Domain', icon: Globe, count: domains.length },
    { id: 'apikeys' as const, label: 'Multi-API Key & 1-Bot', icon: Key, count: apiKeys.length },
    { id: 'endpoints' as const, label: 'Dokumentasi REST API', icon: Code2, badge: '9 API' },
    { id: 'telegram' as const, label: 'Bot Telegram & Tester', icon: Bot, badge: telegramEnabled ? 'ON' : 'OFF' },
    { id: 'credentials' as const, label: 'Kredensial Admin', icon: User, badge: null },
    { id: 'access' as const, label: 'Kode Akses TMail', icon: Lock, badge: accessEnabled ? 'ON' : 'OFF' },
    { id: 'announcement' as const, label: 'Pop-Up Broadcast', icon: Megaphone, badge: announcementEnabled ? 'ON' : 'OFF' },
    { id: 'cleaner' as const, label: 'Database Cleaner', icon: Database, badge: '72 Jam' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col selection:bg-[var(--color-blue)] selection:text-white max-w-full overflow-x-hidden">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />

      {!isLoggedIn ? (
        /* LOGIN FORM */
        <div className="min-h-screen flex flex-col justify-center items-center p-3 xs:p-4 sm:p-6 w-full max-w-full">
          <div className="max-w-md w-full my-4 sm:my-8">
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

              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className="text-xs font-mono-custom font-bold text-[var(--color-blue)] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OPTION 2: SIDEBAR LAYOUT */
        <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-full">
          {/* MOBILE TOP NAVBAR (< lg) */}
          <header className="lg:hidden border-b-[3px] border-[var(--border-color)] bg-[var(--card-bg)] sticky top-0 z-40 shadow-[0px_3px_0px_var(--shadow-color)] w-full max-w-full overflow-hidden">
            <div className="px-2.5 xs:px-4 py-2 flex justify-between items-center gap-2 w-full min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="w-7 h-7 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-[1.5px_1.5px_0px_var(--shadow-color)] flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-[var(--color-yellow)] fill-[var(--color-yellow)]" />
                </div>
                <span className="font-heading font-black text-sm uppercase truncate">
                  HeyFlatimo
                </span>
                <span className="bg-[var(--color-yellow)] text-black text-[7px] font-mono-custom font-black px-1 py-0.2 border border-[var(--border-color)] uppercase flex-shrink-0">
                  ADMIN
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setIsMobileMenuOpen(true);
                  }}
                  className="brutal-btn bg-[var(--color-blue)] text-white px-2.5 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-[10px] font-mono-custom uppercase">MENU</span>
                </button>
              </div>
            </div>
          </header>

          {/* MOBILE DRAWER MODAL */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm lg:hidden w-screen max-w-full">
              <div className="w-4/5 max-w-xs bg-[var(--card-bg)] h-full border-r-[3.5px] border-[var(--border-color)] shadow-[6px_0px_0px_var(--shadow-color)] p-4 flex flex-col justify-between overflow-y-auto min-w-0">
                <div className="space-y-4">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-[1.5px_1.5px_0px_var(--shadow-color)] flex-shrink-0">
                        <Shield className="w-4 h-4 text-[var(--color-yellow)]" />
                      </div>
                      <span className="font-heading font-black text-sm uppercase">MENU NAVIGASI</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-[var(--border-color)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Menu items */}
                  <nav className="space-y-1.5">
                    {navMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setActiveSection(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 text-xs font-mono-custom font-bold flex items-center justify-between border-[2px] transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[var(--color-yellow)] text-black border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] font-black'
                              : 'bg-transparent text-[var(--text-main)] border-transparent hover:border-[var(--border-color)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-mono-custom font-black px-1.5 py-0.2 bg-white dark:bg-zinc-900 border border-[var(--border-color)] text-black dark:text-white flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                          {typeof item.count === 'number' && (
                            <span className="text-[9px] font-mono-custom font-black px-1.5 py-0.2 bg-[var(--color-blue)] text-white border border-[var(--border-color)] flex-shrink-0">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t-2 border-dashed border-[var(--border-color)] space-y-2">
                  <Link
                    href="/"
                    onClick={() => {
                      playSound('click');
                      sessionStorage.removeItem('heyflatimo_admin_logged');
                      setIsLoggedIn(false);
                    }}
                    className="brutal-btn bg-[var(--color-yellow)] text-black w-full py-2 text-xs flex items-center justify-center gap-1.5 font-bold shadow-[2px_2px_0px_var(--shadow-color)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>KE BERANDA</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="brutal-btn bg-[var(--color-red)] text-white w-full py-2 text-xs flex items-center justify-center gap-1.5 font-bold shadow-[2px_2px_0px_var(--shadow-color)]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP SIDEBAR (>= lg) */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[var(--card-bg)] border-r-[3.5px] border-[var(--border-color)] h-screen sticky top-0 shadow-[4px_0px_0px_var(--shadow-color)] z-30 flex-shrink-0 justify-between select-none p-4 xl:p-5 overflow-y-auto">
            <div className="space-y-4 xl:space-y-5">
              {/* Brand Logo Header */}
              <Link
                href="/"
                onClick={() => {
                  playSound('click');
                  sessionStorage.removeItem('heyflatimo_admin_logged');
                  setIsLoggedIn(false);
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 xl:w-10 xl:h-10 bg-[var(--color-blue)] border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2.5px_2.5px_0px_var(--shadow-color)] group-hover:rotate-6 transition-transform flex-shrink-0">
                  <Zap className="w-5 h-5 text-[var(--color-yellow)] fill-[var(--color-yellow)]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-heading font-black text-lg xl:text-xl tracking-tight text-[var(--text-main)] uppercase">
                      HeyFlatimo
                    </span>
                    <span className="bg-[var(--color-yellow)] text-black text-[8px] font-mono-custom font-black px-1 py-0.2 border border-[var(--border-color)] uppercase">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[9px] font-mono-custom text-[var(--text-muted)] block -mt-0.5">
                    Control Center Pro
                  </span>
                </div>
              </Link>

              {/* Status Box */}
              <div className="p-2.5 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1 text-xs font-mono-custom">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--text-muted)] font-bold">STATUS API:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 motion-pulse-dot" />
                    ONLINE (V1)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--text-muted)] font-bold">RETENSI:</span>
                  <span className="font-bold text-[var(--text-main)]">72 Jam (WIB)</span>
                </div>
              </div>

              {/* Navigation Menu Items */}
              <nav className="space-y-1.5">
                <div className="text-[10px] font-mono-custom font-black uppercase text-[var(--text-muted)] px-1 mb-1">
                  MENU NAVIGASI
                </div>
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setActiveSection(item.id);
                      }}
                      className={`w-full text-left p-2.5 xl:p-3 text-xs font-mono-custom font-bold flex items-center justify-between border-[2px] transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--color-yellow)] text-black border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] font-black translate-x-1'
                          : 'bg-transparent text-[var(--text-main)] border-transparent hover:border-[var(--border-color)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono-custom font-black px-1.5 py-0.2 bg-white dark:bg-zinc-900 border border-[var(--border-color)] text-black dark:text-white flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                      {typeof item.count === 'number' && (
                        <span className="text-[9px] font-mono-custom font-black px-1.5 py-0.2 bg-[var(--color-blue)] text-white border border-[var(--border-color)] flex-shrink-0">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer Controls */}
            <div className="pt-4 border-t-2 border-dashed border-[var(--border-color)] space-y-2">
              <Link
                href="/"
                onClick={() => {
                  playSound('click');
                  sessionStorage.removeItem('heyflatimo_admin_logged');
                  setIsLoggedIn(false);
                }}
                className="brutal-btn bg-[var(--color-yellow)] text-black w-full py-2 text-xs flex items-center justify-center gap-1.5 font-bold shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>KEMBALI KE BERANDA</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 w-full py-2 text-xs flex items-center justify-center gap-1.5 font-bold shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT ADMIN</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
            {/* 1. RINGKASAN STATUS SISTEM (DASHBOARD) */}
            {activeSection === 'dashboard' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                        <Server className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-yellow)]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)] truncate">
                          RINGKASAN STATUS SISTEM
                        </h2>
                        <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)] truncate">
                          Informasi real-time server, database, domain aktif, dan API key terdaftar.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        fetchStats();
                        fetchCleanupStats();
                        fetchDomains();
                        fetchApiKeys();
                        showToast('Data statistik berhasil disegarkan!', 'info');
                      }}
                      className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2.5 xs:px-3 py-1.5 text-[10px] xs:text-xs font-bold font-mono-custom flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] self-start sm:self-auto cursor-pointer flex-shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>REFRESH STATS</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 w-full mb-5">
                    <div className="p-2.5 sm:p-3 bg-[#eff6ff] dark:bg-sky-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-sky-800 dark:text-sky-300 uppercase truncate">REST API</div>
                      <div className="text-base sm:text-lg font-heading font-black text-[var(--color-blue)] mt-0.5 truncate">ONLINE</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">V1 (Private)</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#fdf4ff] dark:bg-purple-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-purple-800 dark:text-purple-300 uppercase truncate">TOTAL EMAIL</div>
                      <div className="text-base sm:text-lg font-heading font-black text-purple-700 dark:text-purple-300 mt-0.5 truncate">{stats?.totalEmails ?? 0}</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">Semua Waktu</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#ecfdf5] dark:bg-emerald-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-emerald-800 dark:text-emerald-300 uppercase truncate">PESAN AKTIF</div>
                      <div className="text-base sm:text-lg font-heading font-black text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">{cleanupStats?.activeMessages ?? 0}</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">Di Database</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#fffbeb] dark:bg-amber-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-amber-800 dark:text-amber-300 uppercase truncate">RETENSI DATA</div>
                      <div className="text-base sm:text-lg font-heading font-black text-amber-700 dark:text-amber-300 mt-0.5 truncate">72 JAM</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">WIB Timezone</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#f0fdf4] dark:bg-green-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-green-800 dark:text-green-300 uppercase truncate">DOMAIN AKTIF</div>
                      <div className="text-base sm:text-lg font-heading font-black text-green-700 dark:text-green-300 mt-0.5 truncate">{domains.length}</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">Tersedia</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#fef2f2] dark:bg-rose-950/50 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] min-w-0">
                      <div className="text-[10px] font-mono-custom font-bold text-rose-800 dark:text-rose-300 uppercase truncate">API KEY AKTIF</div>
                      <div className="text-base sm:text-lg font-heading font-black text-rose-700 dark:text-rose-300 mt-0.5 truncate">{apiKeys.length}</div>
                      <div className="text-[9px] font-mono-custom text-[var(--text-muted)] mt-0.5 truncate">Koneksi Bot</div>
                    </div>
                  </div>

                  {/* Quick Shortcut Navigation Grid */}
                  <div className="border-t-2 border-dashed border-[var(--border-color)] pt-4 space-y-2">
                    <div className="text-xs font-mono-custom font-black uppercase text-[var(--text-main)]">
                      AKSES CEPAT MODUL ADMIN:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => { playSound('click'); setActiveSection('domains'); }}
                        className="brutal-btn bg-[#f8fbff] dark:bg-zinc-900 p-2.5 text-left border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-sky-50"
                      >
                        <Globe className="w-4 h-4 text-[var(--color-blue)] mb-1" />
                        <div className="text-[11px] font-mono-custom font-black">KELOLA DOMAIN</div>
                        <div className="text-[9px] text-[var(--text-muted)]">{domains.length} Domain</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSound('click'); setActiveSection('apikeys'); }}
                        className="brutal-btn bg-[#f8fbff] dark:bg-zinc-900 p-2.5 text-left border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-amber-50"
                      >
                        <Key className="w-4 h-4 text-[var(--color-orange)] mb-1" />
                        <div className="text-[11px] font-mono-custom font-black">API KEY & BOT</div>
                        <div className="text-[9px] text-[var(--text-muted)]">{apiKeys.length} Kunci</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSound('click'); setActiveSection('endpoints'); }}
                        className="brutal-btn bg-[#f8fbff] dark:bg-zinc-900 p-2.5 text-left border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-emerald-50"
                      >
                        <Code2 className="w-4 h-4 text-[var(--color-green)] mb-1" />
                        <div className="text-[11px] font-mono-custom font-black">REST API DOCS</div>
                        <div className="text-[9px] text-[var(--text-muted)]">9 Endpoints</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSound('click'); setActiveSection('cleaner'); }}
                        className="brutal-btn bg-[#f8fbff] dark:bg-zinc-900 p-2.5 text-left border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-rose-50"
                      >
                        <Database className="w-4 h-4 text-[var(--color-red)] mb-1" />
                        <div className="text-[11px] font-mono-custom font-black">DB CLEANER</div>
                        <div className="text-[9px] text-[var(--text-muted)]">72 Jam Auto</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. KELOLA DOMAIN */}
            {activeSection === 'domains' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
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
                    <div className="relative flex-1 min-w-0">
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
            )}

            {/* 3. MULTI-API KEY & 1-BOT LOCK */}
            {activeSection === 'apikeys' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
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
                          className="brutal-input flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
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
                              <div className="relative flex-1 min-w-0">
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
                                  onClick={() => handleOpenEditKeyModal(keyItem)}
                                  className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-amber-400 px-2.5 py-1 text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                                  title="Edit judul, nilai API Key kustom, atau pengaturan kunci"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>EDIT</span>
                                </button>

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
                                  onClick={() => {
                                    playSound('pop');
                                    setKeyToDelete(keyItem);
                                  }}
                                  className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 p-1.5 text-[10px] flex items-center justify-center shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                                  title="Hapus API Key ini"
                                >
                                  <Trash2 className="w-3 h-3" />
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
            )}

            {/* 4. DOKUMENTASI REST API */}
            {activeSection === 'endpoints' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] space-y-4 w-full max-w-full overflow-hidden min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 sm:pb-4 border-b-2 border-dashed border-[var(--border-color)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-blue)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                        DOKUMENTASI ENDPOINT & WEBHOOK (KHUSUS OWNER)
                      </h3>
                      <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                        Spesifikasi teknis integrasi Bot & REST API private dengan otentikasi API Key terenkripsi.
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] xs:text-xs font-mono-custom font-black px-3 py-1.5 bg-[#eff6ff] dark:bg-sky-950/60 text-[var(--color-blue)] dark:text-sky-300 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] self-start md:self-auto flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>STATUS: 100% PRIVATE & TERPROTEKSI</span>
                  </div>
                </div>

                {/* Private Security Banner */}
                <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono-custom font-black text-[var(--text-main)] uppercase">
                    <Info className="w-4 h-4 text-[var(--color-blue)] flex-shrink-0" />
                    <span>KEBIJAKAN AKSES & KEAMANAN SISTEM:</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-mono-custom text-[var(--text-muted)] leading-relaxed">
                    Semua endpoint <code>/api/v1/*</code> berstatus <strong>Private (Bukan Open Public)</strong> dan wajib menyertakan header <code>x-api-key</code> yang valid. Endpoint webhook <code>/api/webhook/email</code> dan <code>/api/webhook/telegram</code> diverifikasi secara ketat menggunakan secret signature token internal. Akses tanpa kredensial yang sah akan langsung ditolak dengan status HTTP <code>401 Unauthorized</code> atau <code>403 Forbidden</code>.
                  </p>
                </div>

                {/* Endpoint Cards List */}
                <div className="space-y-3 pt-1">
                  {/* 1. GET /api/v1/generate */}
                  <div className="border-[2px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 bg-[var(--color-green)] text-white text-[10px] sm:text-xs font-mono-custom font-black border border-[var(--border-color)] flex-shrink-0">
                          GET
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] break-all">
                              /api/v1/generate
                            </code>
                            <span className="text-[9px] font-mono-custom font-bold px-1.5 py-0.2 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 uppercase">
                              PRIVATE (x-api-key)
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] mt-0.5">
                            Generate mailbox email sementara baru (random otomatis atau custom prefix & domain).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyEndpointUrl(`${origin}/api/v1/generate`, 'ep_gen_url')}
                          className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                          title="Salin Full URL Endpoint"
                        >
                          {copiedEndpointId === 'ep_gen_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>SALIN URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpointCurl(
                              `curl -X GET "${origin}/api/v1/generate" -H "x-api-key: ${safeKey}"`,
                              'ep_gen_curl'
                            )
                          }
                          className="brutal-btn bg-[var(--color-yellow)] hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                          title="Salin cURL Siap Pakai"
                        >
                          {copiedCurlId === 'ep_gen_curl' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                          <span>cURL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEndpointExpand('generate')}
                          className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          <span>{expandedEndpoints.has('generate') ? 'TUTUP' : 'DETAIL'}</span>
                          {expandedEndpoints.has('generate') ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {expandedEndpoints.has('generate') && (
                      <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-t-2 border-dashed border-[var(--border-color)] space-y-3 text-xs font-mono-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                              Required Request Headers:
                            </span>
                            <div className="p-2 bg-white dark:bg-zinc-900 border border-[var(--border-color)]">
                              <code>x-api-key: {safeKey}</code>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                              Optional Query Parameters:
                            </span>
                            <div className="p-2 bg-white dark:bg-zinc-900 border border-[var(--border-color)] space-y-1 text-[11px]">
                              <p><code>prefix</code>: Nama mailbox khusus (cth: <code>user1</code>)</p>
                              <p><code>domain</code>: Domain spesifik (cth: <code>kingoutlook.my.id</code>)</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                            Contoh Respon Sukses (JSON):
                          </span>
                          <pre className="w-full max-w-full p-2.5 bg-zinc-950 text-emerald-400 text-[10px] sm:text-[11px] overflow-x-auto border border-[var(--border-color)] font-mono whitespace-pre">
{`{
  "success": true,
  "email": "user1@kingoutlook.my.id",
  "prefix": "user1",
  "domain": "kingoutlook.my.id",
  "createdAt": ${Date.now()},
  "retentionHours": 72
}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. GET /api/v1/inbox */}
                  <div className="border-[2px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 bg-[var(--color-green)] text-white text-[10px] sm:text-xs font-mono-custom font-black border border-[var(--border-color)] flex-shrink-0">
                          GET
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] break-all">
                              /api/v1/inbox
                            </code>
                            <span className="text-[9px] font-mono-custom font-bold px-1.5 py-0.2 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 uppercase">
                              PRIVATE (x-api-key)
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] mt-0.5">
                            Mengambil daftar seluruh pesan email yang masuk untuk mailbox target.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyEndpointUrl(`${origin}/api/v1/inbox?email=user@domain.com`, 'ep_inbox_url')}
                          className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedEndpointId === 'ep_inbox_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>SALIN URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpointCurl(
                              `curl -X GET "${origin}/api/v1/inbox?email=user@domain.com" -H "x-api-key: ${safeKey}"`,
                              'ep_inbox_curl'
                            )
                          }
                          className="brutal-btn bg-[var(--color-yellow)] hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedCurlId === 'ep_inbox_curl' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                          <span>cURL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEndpointExpand('inbox')}
                          className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          <span>{expandedEndpoints.has('inbox') ? 'TUTUP' : 'DETAIL'}</span>
                          {expandedEndpoints.has('inbox') ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {expandedEndpoints.has('inbox') && (
                      <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-t-2 border-dashed border-[var(--border-color)] space-y-3 text-xs font-mono-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                              Required Query Parameters:
                            </span>
                            <div className="p-2 bg-white dark:bg-zinc-900 border border-[var(--border-color)]">
                              <code>email</code>: Alamat email target (cth: <code>user1@kingoutlook.my.id</code>)
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                            Contoh Respon Sukses (JSON):
                          </span>
                          <pre className="w-full max-w-full p-2.5 bg-zinc-950 text-emerald-400 text-[10px] sm:text-[11px] overflow-x-auto border border-[var(--border-color)] font-mono whitespace-pre">
{`{
  "success": true,
  "count": 1,
  "messages": [
    {
      "id": "msg_66df1234abcd",
      "sender": "noreply@instagram.com",
      "subject": "123456 adalah kode konfirmasi akun Anda",
      "receivedAt": ${Date.now()}
    }
  ]
}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. GET /api/v1/otp */}
                  <div className="border-[2px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 bg-[var(--color-green)] text-white text-[10px] sm:text-xs font-mono-custom font-black border border-[var(--border-color)] flex-shrink-0">
                          GET
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] break-all">
                              /api/v1/otp
                            </code>
                            <span className="text-[9px] font-mono-custom font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                              AUTO-EXTRACT
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] mt-0.5">
                            Ekstraksi instan kode angka OTP dari subjek atau badan email terbaru.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyEndpointUrl(`${origin}/api/v1/otp?email=user@domain.com`, 'ep_otp_url')}
                          className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedEndpointId === 'ep_otp_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>SALIN URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpointCurl(
                              `curl -X GET "${origin}/api/v1/otp?email=user@domain.com" -H "x-api-key: ${safeKey}"`,
                              'ep_otp_curl'
                            )
                          }
                          className="brutal-btn bg-[var(--color-yellow)] hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedCurlId === 'ep_otp_curl' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                          <span>cURL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEndpointExpand('otp')}
                          className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          <span>{expandedEndpoints.has('otp') ? 'TUTUP' : 'DETAIL'}</span>
                          {expandedEndpoints.has('otp') ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {expandedEndpoints.has('otp') && (
                      <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-t-2 border-dashed border-[var(--border-color)] space-y-3 text-xs font-mono-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                              Required Query Parameters:
                            </span>
                            <div className="p-2 bg-white dark:bg-zinc-900 border border-[var(--border-color)]">
                              <code>email</code>: Alamat email target
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                            Contoh Respon Sukses (JSON):
                          </span>
                          <pre className="w-full max-w-full p-2.5 bg-zinc-950 text-emerald-400 text-[10px] sm:text-[11px] overflow-x-auto border border-[var(--border-color)] font-mono whitespace-pre">
{`{
  "success": true,
  "found": true,
  "otp": "748921",
  "sender": "support@telegram.org",
  "subject": "Telegram code: 748921",
  "receivedAt": ${Date.now()}
}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. GET /api/v1/links */}
                  <div className="border-[2px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 bg-[var(--color-green)] text-white text-[10px] sm:text-xs font-mono-custom font-black border border-[var(--border-color)] flex-shrink-0">
                          GET
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] break-all">
                              /api/v1/links
                            </code>
                            <span className="text-[9px] font-mono-custom font-bold px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 uppercase">
                              AUTO-EXTRACT
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] mt-0.5">
                            Ekstraksi instan link verifikasi atau tautan aktivasi dari email terbaru.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyEndpointUrl(`${origin}/api/v1/links?email=user@domain.com`, 'ep_links_url')}
                          className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedEndpointId === 'ep_links_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>SALIN URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpointCurl(
                              `curl -X GET "${origin}/api/v1/links?email=user@domain.com" -H "x-api-key: ${safeKey}"`,
                              'ep_links_curl'
                            )
                          }
                          className="brutal-btn bg-[var(--color-yellow)] hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedCurlId === 'ep_links_curl' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                          <span>cURL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEndpointExpand('links')}
                          className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          <span>{expandedEndpoints.has('links') ? 'TUTUP' : 'DETAIL'}</span>
                          {expandedEndpoints.has('links') ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {expandedEndpoints.has('links') && (
                      <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-t-2 border-dashed border-[var(--border-color)] space-y-3 text-xs font-mono-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                              Required Query Parameters:
                            </span>
                            <div className="p-2 bg-white dark:bg-zinc-900 border border-[var(--border-color)]">
                              <code>email</code>: Alamat email target
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block mb-1">
                            Contoh Respon Sukses (JSON):
                          </span>
                          <pre className="w-full max-w-full p-2.5 bg-zinc-950 text-emerald-400 text-[10px] sm:text-[11px] overflow-x-auto border border-[var(--border-color)] font-mono whitespace-pre">
{`{
  "success": true,
  "found": true,
  "verificationUrl": "https://example.com/verify?token=xyz987abc123",
  "allLinks": [
    "https://example.com/verify?token=xyz987abc123"
  ],
  "sender": "auth@service.com",
  "subject": "Verifikasi Akun Anda"
}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. GET /api/v1/domains */}
                  <div className="border-[2px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 bg-[var(--color-green)] text-white text-[10px] sm:text-xs font-mono-custom font-black border border-[var(--border-color)] flex-shrink-0">
                          GET
                        </span>
                        <div className="min-w-0">
                          <code className="text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] break-all">
                            /api/v1/domains
                          </code>
                          <p className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] mt-0.5">
                            Daftar domain aktif yang dapat digunakan untuk membuat alamat email.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyEndpointUrl(`${origin}/api/v1/domains`, 'ep_dom_url')}
                          className="brutal-btn bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedEndpointId === 'ep_dom_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>SALIN URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpointCurl(
                              `curl -X GET "${origin}/api/v1/domains" -H "x-api-key: ${safeKey}"`,
                              'ep_dom_curl'
                            )
                          }
                          className="brutal-btn bg-[var(--color-yellow)] hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {copiedCurlId === 'ep_dom_curl' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                          <span>cURL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. INTEGRASI BOT TELEGRAM & INTERACTIVE TESTER */}
            {activeSection === 'telegram' && (
              <div className="space-y-6">
                {/* Bot Settings Card */}
                <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#229ED9] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                          INTEGRASI BOT TELEGRAM (INBOX & OTP READER)
                        </h3>
                        <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                          Hubungkan bot Telegram resmi untuk membaca email masuk dan ekstraksi OTP real-time.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
                      <input
                        type="checkbox"
                        checked={telegramEnabled}
                        onChange={(e) => setTelegramEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#229ED9]"
                      />
                      <span className="text-xs font-mono-custom font-black uppercase">
                        {telegramEnabled ? 'BOT TELEGRAM AKTIF' : 'BOT NONAKTIF'}
                      </span>
                    </label>
                  </div>

                  <form onSubmit={handleSaveTelegram} className="space-y-4">
                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Telegram Bot Token (dari @BotFather):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 min-w-0">
                          <input
                            type="password"
                            value={telegramBotTokenInput}
                            onChange={(e) => setTelegramBotTokenInput(e.target.value)}
                            placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                            className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleTestTelegramConnection}
                          disabled={isTestingTelegram || !telegramBotTokenInput.trim()}
                          className="brutal-btn bg-[#229ED9] text-white hover:bg-sky-600 px-3.5 py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isTestingTelegram ? 'MENGUJI...' : 'TES KONEKSI BOT'}</span>
                        </button>
                      </div>
                    </div>

                    {telegramTestResult && (
                      <div
                        className={`p-3 border-[2px] text-xs font-mono-custom shadow-[2px_2px_0px_var(--shadow-color)] flex items-start gap-2 ${
                          telegramTestResult.success
                            ? 'bg-[#ecfdf5] dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                            : 'bg-[#fef2f2] dark:bg-red-950 border-red-500 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {telegramTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-green)] flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[var(--color-red)] flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          {telegramTestResult.success ? (
                            <p>
                              <strong>Koneksi Sukses!</strong> Bot ditemukan:{' '}
                              <strong>{telegramTestResult.botName}</strong> (
                              <code>@{telegramTestResult.username}</code>)
                            </p>
                          ) : (
                            <p>
                              <strong>Koneksi Gagal:</strong> {telegramTestResult.error}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Webhook Settings Row */}
                    <div className="p-3 bg-[#f8fbff] dark:bg-zinc-900 border-[2px] border-[var(--border-color)] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-mono-custom font-black uppercase text-[var(--text-main)] block">
                            Webhook URL Otomatis:
                          </span>
                          <code className="text-[11px] text-[var(--color-blue)] font-bold break-all">
                            {origin}/api/webhook/telegram
                          </code>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={handleSetWebhook}
                            disabled={isSettingWebhook || !telegramBotTokenInput.trim()}
                            className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)] disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSettingWebhook ? 'MENGHUBUNGKAN...' : 'SET WEBHOOK'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDeleteWebhook}
                            disabled={isDeletingWebhook}
                            className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>HAPUS</span>
                          </button>
                        </div>
                      </div>
                    </div>

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

                {/* Two Column Layout: Code Generator & Live Interactive Tester */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7 w-full min-w-0">
                  {/* Left Column: Code Generator for Bots */}
                  <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] flex flex-col w-full max-w-full overflow-hidden min-w-0">
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
                            onClick={() => {
                              playSound('click');
                              setActiveCodeTab(lang);
                            }}
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

                    <div className="relative flex-1 min-w-0">
                      <pre className="w-full max-w-full h-[280px] xs:h-[320px] sm:h-[360px] p-3 sm:p-4 bg-zinc-950 text-emerald-400 font-mono text-[10px] xs:text-[11px] sm:text-xs overflow-x-auto overflow-y-auto border-[2px] sm:border-[3px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[3.5px_3.5px_0px_var(--shadow-color)] whitespace-pre">
                        {codeSnippets[activeCodeTab]}
                      </pre>
                      <button
                        onClick={() => {
                          playSound('success');
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
                  <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] flex flex-col w-full max-w-full overflow-hidden min-w-0">
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
                          onClick={() => runTest('inbox', `email=${encodeURIComponent(testEmail)}`)}
                          disabled={isTesting || !testEmail}
                          className="brutal-btn bg-[var(--color-green)] text-white py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          <span>INBOX</span>
                        </button>

                        <button
                          onClick={() => runTest('otp', `email=${encodeURIComponent(testEmail)}`)}
                          disabled={isTesting || !testEmail}
                          className="brutal-btn bg-[var(--color-orange)] text-white py-1.5 sm:py-2 text-[10px] font-bold flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          <span>CEK OTP</span>
                        </button>
                      </div>
                    </div>

                    {/* Output Viewer */}
                    <div className="flex-1 min-w-0 flex flex-col min-h-[180px] sm:min-h-[220px]">
                      <span className="text-[10px] font-black uppercase font-mono-custom text-[var(--text-muted)] block mb-1">
                        Respon Hasil Test (JSON Output):
                      </span>
                      <pre className="w-full max-w-full flex-1 p-2.5 sm:p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] xs:text-[11px] overflow-x-auto border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] whitespace-pre-wrap break-all select-text">
                        {testResult ? (
                          typeof testResult === 'string' ? (
                            testResult
                          ) : (
                            JSON.stringify(testResult, null, 2)
                          )
                        ) : (
                          <span className="text-zinc-500">// Klik tombol aksi di atas untuk menguji response API secara live...</span>
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. KREDENSIAL LOGIN ADMIN */}
            {activeSection === 'credentials' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                      KREDENSIAL LOGIN ADMIN (USERNAME & PASSWORD)
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                      Ubah username dan password untuk masuk ke halaman Admin ini.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveCredentials} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Username Admin Baru:
                      </label>
                      <input
                        type="text"
                        value={adminUserInput}
                        onChange={(e) => setAdminUserInput(e.target.value)}
                        placeholder="admin"
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Password Baru (Kosongkan jika tidak ingin ganti):
                      </label>
                      <input
                        type="password"
                        value={adminPassInput}
                        onChange={(e) => setAdminPassInput(e.target.value)}
                        placeholder="••••••••"
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingCreds}
                      className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingCreds ? 'MENYIMPAN...' : 'SIMPAN KREDENSIAL'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 7. KODE AKSES WEB TMAIL */}
            {activeSection === 'access' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                        KODE AKSES WEB TMAIL (ACCESS GATE)
                      </h3>
                      <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                        Kunci halaman depan website agar hanya pengguna yang punya passcode yang bisa masuk.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={accessEnabled}
                      onChange={(e) => setAccessEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-blue)]"
                    />
                    <span className="text-xs font-mono-custom font-black uppercase">
                      {accessEnabled ? 'PROTEKSI AKSES AKTIF' : 'PROTEKSI NONAKTIF'}
                    </span>
                  </label>
                </div>

                <form onSubmit={handleSaveAccess} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Kode Akses / Sandi Masuk Pengunjung:
                      </label>
                      <input
                        type="text"
                        value={accessKeyInput}
                        onChange={(e) => setAccessKeyInput(e.target.value)}
                        placeholder="Contoh: HEYFLATIMO-VIP-2026"
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Pesan Petunjuk untuk Pengunjung (Opsional):
                      </label>
                      <input
                        type="text"
                        value={accessMessageInput}
                        onChange={(e) => setAccessMessageInput(e.target.value)}
                        placeholder="Masukkan kode akses dari admin Telegram..."
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingAccess}
                      className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAccess ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN AKSES'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 8. POP-UP PENGUMUMAN / BROADCAST */}
            {activeSection === 'announcement' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-dashed border-[var(--border-color)]">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--color-purple)] text-white border-2 border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
                      <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)]">
                        POP-UP PENGUMUMAN / BROADCAST
                      </h3>
                      <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)]">
                        Tampilkan modal pesan atau informasi penting kepada pengunjung web.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-purple)]"
                    />
                    <span className="text-xs font-mono-custom font-black uppercase">
                      {announcementEnabled ? 'PENGUMUMAN AKTIF' : 'PENGUMUMAN MATI'}
                    </span>
                  </label>
                </div>

                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Tag Kategori (Badge):
                      </label>
                      <input
                        type="text"
                        value={announcementTagInput}
                        onChange={(e) => setAnnouncementTagInput(e.target.value)}
                        placeholder="UPDATE / INFO / PENTING"
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                        Judul Pengumuman:
                      </label>
                      <input
                        type="text"
                        value={announcementTitleInput}
                        onChange={(e) => setAnnouncementTitleInput(e.target.value)}
                        placeholder="Contoh: Pembaruan Server & Penambahan Domain Baru"
                        className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--text-main)]">
                      Isi Pesan Pengumuman:
                    </label>
                    <textarea
                      rows={3}
                      value={announcementContentInput}
                      onChange={(e) => setAnnouncementContentInput(e.target.value)}
                      placeholder="Tuliskan isi pengumuman lengkap di sini..."
                      className="brutal-input w-full px-3 py-2 text-xs sm:text-sm font-mono-custom font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('pop');
                        setShowAnnouncementPreview(true);
                      }}
                      className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>PREVIEW POP-UP</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingAnnouncement}
                      className="brutal-btn bg-[var(--color-purple)] text-white hover:bg-purple-700 px-4 xs:px-6 py-2 sm:py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_var(--shadow-color)]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAnnouncement ? 'MENYIMPAN...' : 'SIMPAN PENGUMUMAN'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 9. DATABASE & AUTO-DELETE (3 HARI WIB) CLEANER */}
            {activeSection === 'cleaner' && (
              <div className="brutal-card p-3.5 xs:p-4.5 sm:p-6 bg-[var(--card-bg)] w-full max-w-full overflow-hidden min-w-0">
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

                {/* Retention Stats Bar */}
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
                      <code className="bg-white dark:bg-zinc-950 px-1.5 py-0.5 border border-emerald-400 font-bold break-all inline-block max-w-full">
                        {new Date(Date.now() + 72 * 3600000).toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        WIB
                      </code>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
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

                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border-[2px] border-dashed border-red-300 dark:border-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-mono-custom font-black text-red-700 dark:text-red-300 block">
                        Pembersihan Total: Hapus Semua Pesan Saat Ini
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono-custom text-zinc-500 block">
                        Menghapus seluruh pesan email yang ada di database saat ini, termasuk yang baru masuk.
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
            )}
          </main>
        </div>
      )}

      {/* ALL MODALS (RENDERED AT ROOT LEVEL) */}
      {/* EDIT API KEY MODAL */}
      {keyToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[var(--border-color)] mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--color-yellow)]" />
                <h4 className="font-heading font-black text-base uppercase">EDIT API KEY</h4>
              </div>
              <button
                onClick={() => setKeyToEdit(null)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKey} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black font-mono-custom uppercase mb-1">
                  Nama / Judul Bot:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black font-mono-custom uppercase mb-1">
                  Nilai API Key:
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="brutal-input w-full px-3 py-2 text-xs font-mono-custom font-bold"
                  required
                />
              </div>

              <label className="flex items-start gap-2.5 p-2.5 bg-[#f8fbff] dark:bg-zinc-900 border border-[var(--border-color)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSingleBot}
                  onChange={(e) => setEditSingleBot(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-500"
                />
                <span className="text-xs font-mono-custom font-bold">
                  Kunci 1 Bot / 1 SC (Single-Instance Lock)
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKeyToEdit(null)}
                  className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditKey}
                  className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-4 py-2 text-xs font-black"
                >
                  {isSavingEditKey ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE API KEY MODAL */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[var(--color-red)] mb-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-heading font-black text-base uppercase">HAPUS API KEY?</h4>
            </div>
            <p className="text-xs font-mono-custom mb-5">
              Apakah Anda yakin ingin menghapus API Key <strong>"{keyToDelete.name}"</strong>? Bot atau script yang menggunakan key ini tidak akan bisa mengakses endpoint API lagi.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setKeyToDelete(null)}
                className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleDeleteApiKey}
                disabled={isDeletingKey}
                className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 px-4 py-2 text-xs font-black"
              >
                {isDeletingKey ? 'MENGHAPUS...' : 'YA, HAPUS KEY'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOGGLE VIP CONFIRMATION MODAL */}
      {domainToToggleVip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center gap-2.5 text-amber-500 mb-3">
              <Crown className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-heading font-black text-base uppercase">
                {domainToToggleVip.isVip ? 'JADIKAN DOMAIN VIP?' : 'HAPUS STATUS VIP?'}
              </h4>
            </div>
            <p className="text-xs font-mono-custom mb-5">
              Ubah status domain <strong>@{domainToToggleVip.domain}</strong> menjadi{' '}
              <strong>{domainToToggleVip.isVip ? 'VIP (Khusus Pengguna VIP)' : 'FREE (Tersedia Bebas)'}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDomainToToggleVip(null)}
                className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleVip}
                disabled={isTogglingVip}
                className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-4 py-2 text-xs font-black"
              >
                {isTogglingVip ? 'MENYIMPAN...' : 'YA, UBAH STATUS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOMAIN CONFIRMATION MODAL */}
      {domainToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[var(--color-blue)] mb-3">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-heading font-black text-base uppercase">TAMBAH DOMAIN BARU?</h4>
            </div>
            <p className="text-xs font-mono-custom mb-5">
              Domain <strong>@{domainToAdd}</strong> akan ditambahkan ke sistem{' '}
              {isNewDomainVip ? '(sebagai domain VIP/Premium)' : '(sebagai domain publik)'}.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDomainToAdd(null)}
                className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmAddDomain}
                disabled={isAddingDomain}
                className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-4 py-2 text-xs font-black"
              >
                {isAddingDomain ? 'MENAMBAHKAN...' : 'YA, TAMBAHKAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DOMAIN CONFIRMATION MODAL */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[var(--color-red)] mb-3">
              <Trash2 className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-heading font-black text-base uppercase">HAPUS DOMAIN?</h4>
            </div>
            <p className="text-xs font-mono-custom mb-5">
              Apakah Anda yakin ingin menghapus domain <strong>@{domainToDelete}</strong> dari sistem?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDomainToDelete(null)}
                className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDomain}
                className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 px-4 py-2 text-xs font-black"
              >
                YA, HAPUS DOMAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW ANNOUNCEMENT MODAL */}
      {showAnnouncementPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[var(--border-color)] mb-4">
              <span className="bg-[var(--color-purple)] text-white text-[9px] font-mono-custom font-black px-2 py-0.5 border border-[var(--border-color)] uppercase">
                {announcementTagInput || 'PENGUMUMAN'}
              </span>
              <button
                onClick={() => setShowAnnouncementPreview(false)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-heading font-black text-base sm:text-lg uppercase text-[var(--text-main)] mb-2">
              {announcementTitleInput || 'Judul Pengumuman Preview'}
            </h4>
            <p className="text-xs font-mono-custom text-[var(--text-muted)] mb-5 leading-relaxed whitespace-pre-wrap">
              {announcementContentInput || 'Ini adalah contoh tampilan pesan pengumuman pop-up yang akan muncul pada layar pengunjung.'}
            </p>

            <button
              type="button"
              onClick={() => setShowAnnouncementPreview(false)}
              className="brutal-btn bg-[var(--color-blue)] text-white w-full py-2 text-xs font-black"
            >
              MENGERTI
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAN ALL MODAL */}
      {showCleanAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto w-full max-w-full">
          <div className="brutal-card bg-[var(--card-bg)] max-w-md w-full p-4 xs:p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] my-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[var(--color-red)] mb-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-heading font-black text-base uppercase">HAPUS TOTAL SEMUA PESAN?</h4>
            </div>
            <p className="text-xs font-mono-custom mb-5 text-red-600 dark:text-red-400 font-bold">
              PERINGATAN: Tindakan ini akan memusnahkan SEMUA pesan email yang ada di database seketika tanpa bisa dikembalikan!
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCleanAllModal(false)}
                className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 text-xs font-black"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleCleanAll}
                disabled={isCleaningAll}
                className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-700 px-4 py-2 text-xs font-black"
              >
                {isCleaningAll ? 'MEMUSNAHKAN...' : 'YA, HAPUS SEMUA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
