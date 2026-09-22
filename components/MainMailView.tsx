'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import EmailCard from '@/components/EmailCard';
import MessageList from '@/components/MessageList';
import SplitInbox from '@/components/SplitInbox';
import Toast from '@/components/Toast';
import AccessGateModal from '@/components/AccessGateModal';
import AnnouncementModal from '@/components/AnnouncementModal';
import VipCdkModal from '@/components/VipCdkModal';
import QrCodeModal from '@/components/QrCodeModal';
import { EmailMessage } from '@/components/MessageReader';
import { generateRandomPrefix } from '@/lib/generator';
import { playSound, unlockAudio, getSoundEnabled, setSoundEnabled } from '@/lib/sound';
import { isDarkModeActive, applyTheme, initThemeListener } from '@/lib/theme';

const AUTO_SYNC_INTERVAL = 3; // 3 Detik Realtime

interface MainMailViewProps {
  initialSlug?: string;
}

export default function MainMailView({ initialSlug }: MainMailViewProps) {
  const [appName, setAppName] = useState('HeyFlatimo');
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'split'>('home');

  // Sound Notification State (Default: ON)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const isSoundEnabledRef = useRef<boolean>(true);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // VIP Access State (Resets on page refresh / browser close via sessionStorage)
  const [isVipUnlocked, setIsVipUnlocked] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [targetVipDomain, setTargetVipDomain] = useState<string | null>(null);
  const [targetVipPrefix, setTargetVipPrefix] = useState<string | null>(null);

  // Access Gate State
  const [isAccessLocked, setIsAccessLocked] = useState(false);
  const [accessMessage, setAccessMessage] = useState('Silakan masukkan kode akses untuk menggunakan layanan email.');

  // Announcement State
  const [announcementData, setAnnouncementData] = useState<{
    enabled: boolean;
    id: string;
    title: string;
    content: string;
    tag: string;
    displayMode: 'always' | 'once_per_session' | 'once_per_device';
    buttonEnabled?: boolean;
    buttonText?: string;
    buttonLink?: string;
  } | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  const [heroHeader, setHeroHeader] = useState<{
    badgeText?: string;
    titlePrefix?: string;
    titleHighlight?: string;
    subtitle?: string;
  }>({
    badgeText: 'DISPOSABLE INBOX SYSTEM',
    titlePrefix: 'TEMPORARY',
    titleHighlight: 'INBOX',
    subtitle: 'Terima kode OTP & verifikasi instan. Otomatis terhapus, aman & tanpa data pribadi.',
  });

  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [domainDetails, setDomainDetails] = useState<{ domain: string; isVip?: boolean }[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [currentEmail, setCurrentEmail] = useState<string>('');


  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(AUTO_SYNC_INTERVAL);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const previousCountRef = useRef<number>(0);
  const hasInitialFetchDoneRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Inisialisasi Tema, App Name, & VIP Session State
  useEffect(() => {
    const activeDark = isDarkModeActive();
    setIsDark(activeDark);
    applyTheme(activeDark);

    const unsubscribeTheme = initThemeListener((dark) => {
      setIsDark(dark);
    });

    if (process.env.NEXT_PUBLIC_APP_NAME) {
      setAppName(process.env.NEXT_PUBLIC_APP_NAME);
    }

    // Inisialisasi status Suara Notifikasi (Default: MUTE / SILENT)
    const soundActive = getSoundEnabled();
    setIsSoundEnabled(soundActive);
    isSoundEnabledRef.current = soundActive;

    // Cek apakah sesi ini memiliki token VIP yang valid
    const isVipActive = sessionStorage.getItem('tmail_vip_session') === 'true';
    const vipToken = sessionStorage.getItem('tmail_vip_token');
    if (isVipActive && vipToken) {
      setIsVipUnlocked(true);
    } else {
      setIsVipUnlocked(false);
      sessionStorage.removeItem('tmail_vip_session');
      sessionStorage.removeItem('tmail_vip_token');
    }

    return () => {
      unsubscribeTheme();
    };
  }, []);

  const handleToggleSound = () => {
    unlockAudio();
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    isSoundEnabledRef.current = next;
    setSoundEnabled(next);
    if (next) {
      playSound('notification', true);
      showToast('Suara Notifikasi Diaktifkan', 'info');
    } else {
      showToast('Suara Notifikasi Dinonaktifkan (Mute)', 'info');
    }
  };

  const toggleTheme = () => {
    playSound('click');
    const nextDark = !isDark;
    setIsDark(nextDark);
    applyTheme(nextDark);
  };



  // 2. Fetch Available Domains & Initialize Email (Handling / or /[slug])
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initDomainsAndEmail() {
      let domainsList: string[] = [];
      let detailsList: { domain: string; isVip?: boolean }[] = [];
      try {
        const res = await fetch('/api/domains');
        const data = await res.json();
        if (data.domainDetails && Array.isArray(data.domainDetails)) {
          detailsList = data.domainDetails.map((d: any) => ({
            domain: typeof d === 'string' ? d.trim().toLowerCase().replace(/^@+/, '') : (d.domain || '').trim().toLowerCase().replace(/^@+/, ''),
            isVip: Boolean(d.isVip),
          }));
          setDomainDetails(detailsList);
          domainsList = detailsList.map((d) => d.domain);
          setAvailableDomains(domainsList);
        } else if (data.domains && Array.isArray(data.domains)) {
          domainsList = data.domains.map((d: string) => d.trim().toLowerCase().replace(/^@+/, ''));
          detailsList = domainsList.map((d) => ({ domain: d, isVip: false }));
          setAvailableDomains(domainsList);
          setDomainDetails(detailsList);
        }
      } catch (err) {
        console.error('Error fetching domains:', err);
      }

      // Fetch public system config (Access Gate & Announcement)
      try {
        const configRes = await fetch('/api/config');
        const configData = await configRes.json();
        if (configData.success) {
          if (configData.accessMessage) {
            setAccessMessage(configData.accessMessage);
          }

          if (configData.accessKeyRequired) {
            // Selalu kunci dan minta kode akses setiap kali buka web / refresh halaman
            setIsAccessLocked(true);
          } else {
            setIsAccessLocked(false);
          }

          if (configData.heroHeader) {
            setHeroHeader({
              badgeText: configData.heroHeader.badgeText || 'DISPOSABLE INBOX SYSTEM',
              titlePrefix: configData.heroHeader.titlePrefix || 'TEMPORARY',
              titleHighlight: configData.heroHeader.titleHighlight || 'INBOX',
              subtitle: configData.heroHeader.subtitle || 'Terima kode OTP & verifikasi instan. Otomatis terhapus, aman & tanpa data pribadi.',
            });
          }

          if (configData.announcement && configData.announcement.enabled) {
            const ann = configData.announcement;
            setAnnouncementData(ann);
            const annId = ann.id || 'default';
            const mode = ann.displayMode || 'once_per_device';

            let shouldShow = true;
            if (mode === 'once_per_session') {
              shouldShow = !sessionStorage.getItem(`tmail_seen_ann_${annId}`);
            } else if (mode === 'once_per_device') {
              shouldShow = !localStorage.getItem(`tmail_seen_ann_${annId}`);
            }

            if (shouldShow) {
              setIsAnnouncementOpen(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      }

      // Jika belum ada domain sama sekali yang didaftarkan di admin
      if (domainsList.length === 0) {
        setAvailableDomains([]);
        setCurrentPrefix('');
        setCurrentDomain('');
        setCurrentEmail('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tmail_address');
        }
        return;
      }

      // Daftar domain Free (Biasa) untuk inisialisasi default aman bagi pengunjung biasa
      const freeDomains = detailsList.filter((d) => !d.isVip).map((d) => d.domain);
      const hasFree = freeDomains.length > 0;
      const safeDefaultPool = hasFree ? freeDomains : domainsList;

      // Prioritas 1: initialSlug dari URL path jika membuka domain.com/emailtemp atau domain.com/slug
      let parsedSlug = '';
      if (initialSlug && initialSlug.trim().length > 0) {
        parsedSlug = decodeURIComponent(initialSlug).trim();
      } else if (typeof window !== 'undefined') {
        const path = window.location.pathname.replace(/^\/+/, '').trim();
        if (path && !['admin', 'api', '_next', 'favicon.ico'].some((prefix) => path.startsWith(prefix))) {
          parsedSlug = decodeURIComponent(path);
        }
      }

      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('tmail_address') : null;
      const isSessionVip =
        sessionStorage.getItem('tmail_vip_session') === 'true' &&
        Boolean(sessionStorage.getItem('tmail_vip_token'));

      let initialPrefix = '';
      let initialDomain = safeDefaultPool[0] || 'tempmail.com';

      if (parsedSlug && parsedSlug.length > 0) {
        if (parsedSlug.includes('@')) {
          const parts = parsedSlug.split('@');
          const reqPrefix = parts[0]?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
          const reqDomain = parts[parts.length - 1]?.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9.-]/g, '');

          const matchedDetail = detailsList.find(
            (d) => d.domain.toLowerCase().trim().replace(/^@+/, '') === reqDomain
          );
          const isVipDomain = matchedDetail ? Boolean(matchedDetail.isVip) : false;

          if (isVipDomain && !isSessionVip) {
            // Domain berstatus VIP tapi sesi belum membuka akses VIP CDK!
            const targetDom = matchedDetail?.domain || reqDomain;
            setTargetVipDomain(targetDom);
            setTargetVipPrefix(reqPrefix);
            setIsVipModalOpen(true);
            showToast(`Domain @${targetDom} berstatus VIP eksklusif. Masukkan Kode Passcode / CDK.`, 'error');

            if (hasFree) {
              initialPrefix = generateRandomPrefix();
              initialDomain = freeDomains[0];
            } else {
              initialPrefix = '';
              initialDomain = '';
            }
          } else if (matchedDetail) {
            initialPrefix = reqPrefix;
            initialDomain = matchedDetail.domain;
          } else {
            // Jika domain tidak ada di daftar resmi
            if (hasFree) {
              initialPrefix = reqPrefix;
              initialDomain = freeDomains[0];
            } else if (!isSessionVip) {
              setTargetVipDomain(domainsList[0]);
              setTargetVipPrefix(reqPrefix);
              setIsVipModalOpen(true);
              initialPrefix = '';
              initialDomain = '';
            } else {
              initialPrefix = reqPrefix;
              initialDomain = domainsList[0];
            }
          }
        } else {
          // Slug tanpa @
          const cleanPrefix = parsedSlug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
          if (hasFree) {
            initialPrefix = cleanPrefix;
            initialDomain = freeDomains[0];
          } else if (!isSessionVip) {
            setTargetVipDomain(domainsList[0]);
            setTargetVipPrefix(cleanPrefix);
            setIsVipModalOpen(true);
            initialPrefix = '';
            initialDomain = '';
          } else {
            initialPrefix = cleanPrefix;
            initialDomain = domainsList[0];
          }
        }
      } else if (savedEmail && savedEmail.includes('@')) {
        const parts = savedEmail.split('@');
        const savedPrefix = parts[0]?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
        const savedDom = parts[parts.length - 1]?.trim().toLowerCase().replace(/^@+/, '');
        const matchedDetail = detailsList.find(
          (d) => d.domain.toLowerCase().trim().replace(/^@+/, '') === savedDom
        );
        const savedIsVip = matchedDetail ? Boolean(matchedDetail.isVip) : false;

        // Jika domain lama adalah VIP tapi sesi ini belum unlock, beralih ke domain Free
        if (matchedDetail && (!savedIsVip || isSessionVip)) {
          initialPrefix = savedPrefix;
          initialDomain = matchedDetail.domain;
        } else if (hasFree) {
          initialPrefix = generateRandomPrefix();
          initialDomain = freeDomains[0];
        } else if (!isSessionVip) {
          setTargetVipDomain(domainsList[0]);
          setIsVipModalOpen(true);
          initialPrefix = '';
          initialDomain = '';
        } else {
          initialPrefix = savedPrefix;
          initialDomain = domainsList[0];
        }
      } else {
        if (hasFree) {
          initialPrefix = generateRandomPrefix();
          initialDomain = freeDomains[Math.floor(Math.random() * freeDomains.length)] || freeDomains[0];
        } else if (!isSessionVip) {
          setTargetVipDomain(domainsList[0]);
          setIsVipModalOpen(true);
          initialPrefix = '';
          initialDomain = '';
        } else {
          initialPrefix = generateRandomPrefix();
          initialDomain = domainsList[0];
        }
      }

      if (initialDomain) {
        setCurrentPrefix(initialPrefix);
        setCurrentDomain(initialDomain);
        const fullEmail = `${initialPrefix}@${initialDomain}`;
        setCurrentEmail(fullEmail);

        if (typeof window !== 'undefined') {
          localStorage.setItem('tmail_address', fullEmail);
        }
      } else {
        setCurrentPrefix('');
        setCurrentDomain('');
        setCurrentEmail('');
      }
    }

    initDomainsAndEmail();
  }, [initialSlug]);

  // 3. Fetch Inbox Messages
  const isFetchingRef = useRef(false);

  const fetchMessages = useCallback(
    async (emailToFetch: string, isSilent = false) => {
      if (!emailToFetch) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      if (!isSilent) setIsRefreshing(true);

      try {
        const vipToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_vip_token') || '' : '';
        const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_access_token') || '' : '';
        const headers: Record<string, string> = {};
        if (vipToken) headers['x-vip-token'] = vipToken;
        if (accessToken) headers['x-access-token'] = accessToken;

        const res = await fetch(`/api/messages?email=${encodeURIComponent(emailToFetch)}`, {
          headers,
        });
        const result = await res.json();

        if (res.status === 403) {
          if (result.isVipRequired) {
            setMessages([]);
            setSelectedMessage(null);
            if (result.domain) {
              setTargetVipDomain(result.domain);
            }
            setIsVipModalOpen(true);
            showToast(result.error || 'Akses VIP diperlukan untuk melihat pesan.', 'error');
            return;
          }
          if (result.isAccessLocked) {
            setMessages([]);
            setSelectedMessage(null);
            setIsAccessLocked(true);
            showToast(result.error || 'Akses layanan email dikunci.', 'error');
            return;
          }
        }

        if (result.success && Array.isArray(result.data)) {
          const fetchedMessages: EmailMessage[] = result.data;
          setMessages(fetchedMessages);

          // Jika ada pesan baru masuk setelah inisialisasi awal, bunyikan alert visual dan suara jika diizinkan
          if (hasInitialFetchDoneRef.current) {
            if (fetchedMessages.length > previousCountRef.current) {
              const newCount = fetchedMessages.length - previousCountRef.current;
              showToast(`Ada ${newCount} pesan baru diterima!`, 'info');
              if (isSoundEnabledRef.current) {
                playSound('notification');
              }
            }
          } else {
            hasInitialFetchDoneRef.current = true;
          }
          previousCountRef.current = fetchedMessages.length;

          // Perbarui selected message secara fungsional tanpa memicu re-trigger dependency
          setSelectedMessage((prev) => {
            if (!prev) return null;
            const updated = fetchedMessages.find((m) => m.id === prev.id);
            return updated || prev;
          });
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        isFetchingRef.current = false;
        if (!isSilent) {
          setTimeout(() => setIsRefreshing(false), 400);
        }
      }
    },
    []
  );

  // Fetch when email changes (Silent background load to prevent spinning button)
  useEffect(() => {
    if (currentEmail) {
      hasInitialFetchDoneRef.current = false;
      previousCountRef.current = 0;
      fetchMessages(currentEmail, true);
      setCountdown(AUTO_SYNC_INTERVAL);
    }
  }, [currentEmail, fetchMessages]);

  // 4. Timer Interval Auto-Sync (Realtime 3 Detik di latar belakang)
  useEffect(() => {
    if (!currentEmail) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMessages(currentEmail, true);
          return AUTO_SYNC_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentEmail, fetchMessages]);

  // 5. Handler Actions
  const handleRandomizeEmail = () => {
    playSound('click');
    if (availableDomains.length === 0) {
      showToast('Belum ada domain email aktif. Silakan tambahkan domain di Menu Admin.', 'error');
      return;
    }
    const newPrefix = generateRandomPrefix();
    // Jika VIP belum terbuka, acak hanya dari domain Free agar domain VIP tidak terpakai otomatis
    const freePool = domainDetails.filter((d) => !d.isVip).map((d) => d.domain);
    const candidateDomains = isVipUnlocked
      ? availableDomains
      : freePool.length > 0
      ? freePool
      : availableDomains;

    const newDomain =
      candidateDomains[Math.floor(Math.random() * candidateDomains.length)] || candidateDomains[0];
    const newEmail = `${newPrefix}@${newDomain}`;

    setCurrentPrefix(newPrefix);
    setCurrentDomain(newDomain);
    setCurrentEmail(newEmail);
    localStorage.setItem('tmail_address', newEmail);
    setSelectedMessage(null);
    showToast('Alamat email acak baru dibuat!');
  };

  const handleChangeDomain = (newDomain: string) => {
    playSound('click');
    const matched = availableDomains.find((d) => d.toLowerCase() === newDomain.toLowerCase()) || newDomain;

    const isVip = domainDetails.find((d) => d.domain.toLowerCase() === matched.toLowerCase())?.isVip;
    if (isVip && !isVipUnlocked) {
      playSound('pop');
      setTargetVipDomain(matched);
      setIsVipModalOpen(true);
      return;
    }

    setCurrentDomain(matched);
    const prefix = currentPrefix || generateRandomPrefix();
    setCurrentPrefix(prefix);
    const newEmail = `${prefix}@${matched}`;
    setCurrentEmail(newEmail);
    localStorage.setItem('tmail_address', newEmail);
    setSelectedMessage(null);

    if (isVip) {
      showToast(`Domain VIP @${matched} Terpilih! Nikmati pengalaman eksklusif.`, 'success');
    } else {
      showToast(`Domain diubah ke @${matched}`);
    }
  };

  const handleApplyCustom = (prefix: string, domain: string) => {
    const validDomain = availableDomains.includes(domain) ? domain : (availableDomains[0] || '');
    if (!validDomain) {
      playSound('error');
      showToast('Pilih domain yang valid dari daftar aktif', 'error');
      return;
    }

    const isVip = domainDetails.find((d) => d.domain.toLowerCase() === validDomain.toLowerCase())?.isVip;
    if (isVip && !isVipUnlocked) {
      playSound('pop');
      setTargetVipDomain(validDomain);
      setIsVipModalOpen(true);
      return;
    }

    playSound('success');
    setCurrentPrefix(prefix);
    setCurrentDomain(validDomain);
    const newEmail = `${prefix}@${validDomain}`;
    setCurrentEmail(newEmail);
    localStorage.setItem('tmail_address', newEmail);
    setSelectedMessage(null);

    if (isVip) {
      showToast(`Domain VIP @${validDomain} Terpilih! Email aktif: ${newEmail}`, 'success');
    } else {
      showToast(`Email diatur ke: ${newEmail}`);
    }
  };

  const handleCopyEmail = (text: string) => {
    playSound('success');
    navigator.clipboard.writeText(text);
    showToast('Alamat email berhasil disalin!');
  };

  const handleCopyText = (text: string) => {
    playSound('success');
    navigator.clipboard.writeText(text);
    showToast('Teks berhasil disalin!');
  };

  const handleManualRefresh = () => {
    playSound('click');
    setCountdown(AUTO_SYNC_INTERVAL);
    fetchMessages(currentEmail);
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      playSound('delete');
      const vipToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_vip_token') || '' : '';
      const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_access_token') || '' : '';
      const headers: Record<string, string> = {};
      if (vipToken) headers['x-vip-token'] = vipToken;
      if (accessToken) headers['x-access-token'] = accessToken;

      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        showToast('Pesan berhasil dihapus');
      }
    } catch (err) {
      showToast('Gagal menghapus pesan', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua pesan di inbox ini?')) return;

    try {
      playSound('delete');
      const vipToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_vip_token') || '' : '';
      const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('tmail_access_token') || '' : '';
      const headers: Record<string, string> = {};
      if (vipToken) headers['x-vip-token'] = vipToken;
      if (accessToken) headers['x-access-token'] = accessToken;

      const res = await fetch(`/api/messages?email=${encodeURIComponent(currentEmail)}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setMessages([]);
        setSelectedMessage(null);
        showToast('Semua pesan berhasil dibersihkan');
      }
    } catch (err) {
      showToast('Gagal membersihkan pesan', 'error');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Top Navbar */}
      <Navbar
        appName={appName}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onToggleView={(v) => {
          playSound('click');
          setActiveView(v);
        }}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      {activeView === 'home' ? (
        <main className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-5 sm:py-8 md:py-10 w-full flex-1">
          {/* Email Generator / Address Card */}
          <EmailCard
            currentEmail={currentEmail}
            currentPrefix={currentPrefix}
            currentDomain={currentDomain}
            availableDomains={domainDetails.length > 0 ? domainDetails : availableDomains}
            isRefreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            onRandomize={handleRandomizeEmail}
            onChangeDomain={handleChangeDomain}
            onApplyCustom={handleApplyCustom}
            onCopy={handleCopyEmail}
            countdownSeconds={countdown}
            isVipUnlocked={isVipUnlocked}
            onOpenVipModal={() => {
              playSound('pop');
              setTargetVipDomain(null);
              setIsVipModalOpen(true);
            }}
            onRequestVipUnlock={(dom) => {
              playSound('pop');
              setTargetVipDomain(dom);
              setIsVipModalOpen(true);
            }}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={handleToggleSound}
            heroHeader={heroHeader}
            onOpenQrModal={() => {
              playSound('pop');
              setIsQrModalOpen(true);
            }}
          />

          {/* Inbox Messages Accordion List */}
          <MessageList
            messages={messages}
            currentEmail={currentEmail}
            onOpenSplitView={() => {
              playSound('click');
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                if (messages.length > 0 && !selectedMessage) {
                  setSelectedMessage(messages[0]);
                }
              }
              setActiveView('split');
            }}
            onSelectMessageForSplit={(msg) => {
              playSound('click');
              setSelectedMessage(msg);
              setActiveView('split');
            }}
            onDeleteMessage={handleDeleteMessage}
            onClearAll={handleClearAll}
          />

          {/* Footer Branding */}
          <footer className="text-center py-5 sm:py-8 mt-2 sm:mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 border-t-[2px] border-dashed border-[var(--border-color)] pt-3.5 sm:pt-4">
              <p className="text-[10px] xs:text-[11px] font-mono-custom font-bold text-[var(--text-muted)] uppercase tracking-wider">
                &copy; 2026 {appName} &bull; Personal Mail System
              </p>
              <span className="hidden sm:inline text-[var(--text-muted)]">&bull;</span>
              <a
                href="/admin"
                onClick={() => playSound('click')}
                className="text-[10px] xs:text-[11px] font-mono-custom font-black text-[var(--color-orange)] hover:underline flex items-center gap-1 uppercase"
              >
                <span>Menu Admin & API</span>
              </a>
            </div>
          </footer>
        </main>
      ) : (
        /* Full Split-Screen Inbox View */
        <SplitInbox
          currentEmail={currentEmail}
          messages={messages}
          selectedMessage={selectedMessage}
          onSelectMessage={(msg) => {
            playSound('click');
            setSelectedMessage(msg);
          }}
          onBackToHome={() => {
            playSound('click');
            setActiveView('home');
          }}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          onDeleteMessage={handleDeleteMessage}
          onClearAll={handleClearAll}
          onCopyText={handleCopyText}
        />
      )}

      {/* Access Gate Modal Overlay */}
      <AccessGateModal
        isOpen={isAccessLocked}
        message={accessMessage}
        onUnlockSuccess={() => {
          playSound('success');
          setIsAccessLocked(false);
        }}
      />

      {/* QR Code Modal Dialog */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        email={currentEmail}
        onClose={() => {
          playSound('click');
          setIsQrModalOpen(false);
        }}
        onCopySuccess={(msg) => {
          playSound('success');
          showToast(msg, 'success');
        }}
      />

      {/* Broadcast Announcement Modal */}
      {announcementData && (
        <AnnouncementModal
          isOpen={isAnnouncementOpen && !isAccessLocked}
          id={announcementData.id}
          tag={announcementData.tag}
          title={announcementData.title}
          content={announcementData.content}
          displayMode={announcementData.displayMode}
          buttonEnabled={announcementData.buttonEnabled}
          buttonText={announcementData.buttonText}
          buttonLink={announcementData.buttonLink}
          onClose={() => {
            playSound('click');
            setIsAnnouncementOpen(false);
          }}
        />
      )}

      {/* VIP CDK Passcode Modal */}
      <VipCdkModal
        isOpen={isVipModalOpen}
        targetDomain={targetVipDomain}
        onClose={() => {
          playSound('click');
          setIsVipModalOpen(false);
          setTargetVipDomain(null);
          setTargetVipPrefix(null);
          // Jika URL path sebelumnya adalah slug VIP, bersihkan URL ke /
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          }
          // Jika saat ini belum ada email aktif karena semua domain VIP, dan user menutup modal:
          const freeDomains = domainDetails.filter((d) => !d.isVip).map((d) => d.domain);
          if (freeDomains.length > 0 && !currentEmail) {
            const prefix = generateRandomPrefix();
            const dom = freeDomains[0];
            const mail = `${prefix}@${dom}`;
            setCurrentPrefix(prefix);
            setCurrentDomain(dom);
            setCurrentEmail(mail);
            localStorage.setItem('tmail_address', mail);
          }
        }}
        onSuccess={(unlockedDomain) => {
          playSound('success');
          setIsVipUnlocked(true);
          showToast('Akses VIP Aktif! Semua domain bermahkota terbuka.', 'success');
          const targetDom = unlockedDomain || targetVipDomain || availableDomains[0];
          if (targetDom) {
            const prefix = targetVipPrefix || currentPrefix || generateRandomPrefix();
            setCurrentPrefix(prefix);
            setCurrentDomain(targetDom);
            const newEmail = `${prefix}@${targetDom}`;
            setCurrentEmail(newEmail);
            localStorage.setItem('tmail_address', newEmail);
            setSelectedMessage(null);
            setTargetVipDomain(null);
            setTargetVipPrefix(null);
          }
        }}
      />
    </div>
  );
}
