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

const AUTO_SYNC_INTERVAL = 3; // 3 Detik Realtime

interface MainMailViewProps {
  initialSlug?: string;
}

export default function MainMailView({ initialSlug }: MainMailViewProps) {
  const [appName, setAppName] = useState('HeyFlatimo');
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'split'>('home');

  // Sound Notification State (Default: MUTE / SILENT)
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const isSoundEnabledRef = useRef<boolean>(false);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // VIP Access State (Resets on page refresh / browser close via sessionStorage)
  const [isVipUnlocked, setIsVipUnlocked] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [targetVipDomain, setTargetVipDomain] = useState<string | null>(null);

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
    const savedTheme = localStorage.getItem('tmail_theme');
    const shouldDark = savedTheme === 'dark';

    setIsDark(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (process.env.NEXT_PUBLIC_APP_NAME) {
      setAppName(process.env.NEXT_PUBLIC_APP_NAME);
    }

    // Inisialisasi status Suara Notifikasi (Default: MUTE / SILENT)
    const soundActive = getSoundEnabled();
    setIsSoundEnabled(soundActive);
    isSoundEnabledRef.current = soundActive;

    // Cek apakah sesi ini sudah pernah membuka VIP (sessionStorage otomatis reset jika refresh / keluar web)
    const isVipActive = sessionStorage.getItem('tmail_vip_session') === 'true';
    if (isVipActive) {
      setIsVipUnlocked(true);
    }
  }, []);

  const handleToggleSound = () => {
    unlockAudio();
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    isSoundEnabledRef.current = next;
    setSoundEnabled(next);
    if (next) {
      playSound('success');
      showToast('Suara Notifikasi Diaktifkan', 'info');
    } else {
      showToast('Suara Notifikasi Dinonaktifkan (Mute)', 'info');
    }
  };

  const toggleTheme = () => {
    playSound('click');
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tmail_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tmail_theme', 'light');
    }
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
          detailsList = data.domainDetails;
          setDomainDetails(detailsList);
          domainsList = detailsList.map((d: any) => d.domain);
          setAvailableDomains(domainsList);
        } else if (data.domains && Array.isArray(data.domains)) {
          domainsList = data.domains;
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
      const safeDefaultPool = freeDomains.length > 0 ? freeDomains : domainsList;

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
      const isSessionVip = sessionStorage.getItem('tmail_vip_session') === 'true';

      let initialPrefix = '';
      let initialDomain = safeDefaultPool[0] || 'tempmail.com';

      if (parsedSlug && parsedSlug.length > 0) {
        if (parsedSlug.includes('@')) {
          const parts = parsedSlug.split('@');
          initialPrefix = parts[0]?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
          const reqDomain = parts[1]?.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');

          if (reqDomain && reqDomain.includes('.')) {
            // Cek apakah reqDomain cocok dengan salah satu domain terdaftar (case-insensitive)
            const matchedDomain = domainsList.find((d) => d.trim().toLowerCase() === reqDomain);
            if (matchedDomain) {
              initialDomain = matchedDomain;
            } else {
              // Jika domain spesifik diminta dari URL (misal: kingoutlook.my.id), gunakan domain tersebut langsung
              initialDomain = reqDomain;
              if (!domainsList.map((d) => d.toLowerCase()).includes(reqDomain)) {
                domainsList.push(reqDomain);
                detailsList.push({ domain: reqDomain, isVip: false });
                setAvailableDomains([...domainsList]);
                setDomainDetails([...detailsList]);
              }
            }
          } else {
            initialDomain = safeDefaultPool[0] || reqDomain || 'tempmail.com';
          }
        } else {
          initialPrefix = parsedSlug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
          initialDomain = safeDefaultPool[0] || 'tempmail.com';
        }
      } else if (savedEmail && savedEmail.includes('@')) {
        const parts = savedEmail.split('@');
        initialPrefix = parts[0]?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomPrefix();
        const savedDom = parts[1]?.trim().toLowerCase();
        const matchedSaved = domainsList.find((d) => d.trim().toLowerCase() === savedDom);
        const savedIsVip = detailsList.find((d) => d.domain.toLowerCase() === savedDom)?.isVip;

        // Jika domain lama adalah VIP tapi sesi ini belum unlock, beralih ke domain Free
        if (matchedSaved && (!savedIsVip || isSessionVip)) {
          initialDomain = matchedSaved;
        } else if (matchedSaved && savedIsVip && !isSessionVip) {
          initialDomain = safeDefaultPool[0];
        } else if (savedDom && savedDom.includes('.')) {
          initialDomain = savedDom;
        } else {
          initialDomain = safeDefaultPool[0];
        }
      } else {
        initialPrefix = generateRandomPrefix();
        initialDomain = safeDefaultPool[Math.floor(Math.random() * safeDefaultPool.length)] || safeDefaultPool[0];
      }

      setCurrentPrefix(initialPrefix);
      setCurrentDomain(initialDomain);
      const fullEmail = `${initialPrefix}@${initialDomain}`;
      setCurrentEmail(fullEmail);

      if (typeof window !== 'undefined') {
        localStorage.setItem('tmail_address', fullEmail);
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
        const res = await fetch(`/api/messages?email=${encodeURIComponent(emailToFetch)}`);
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          const fetchedMessages: EmailMessage[] = result.data;
          setMessages(fetchedMessages);

          // Jika ada pesan baru masuk, bunyikan alert visual dan suara jika diizinkan
          if (fetchedMessages.length > previousCountRef.current && previousCountRef.current > 0) {
            showToast(`Ada ${fetchedMessages.length - previousCountRef.current} pesan baru diterima!`, 'info');
            if (isSoundEnabledRef.current) {
              playSound('notification');
            }
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
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
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
      const res = await fetch(`/api/messages?email=${encodeURIComponent(currentEmail)}`, {
        method: 'DELETE',
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
        }}
        onSuccess={(unlockedDomain) => {
          playSound('success');
          setIsVipUnlocked(true);
          showToast('Akses VIP Aktif! Semua domain bermahkota terbuka.', 'success');
          if (unlockedDomain && availableDomains.includes(unlockedDomain)) {
            setCurrentDomain(unlockedDomain);
            const prefix = currentPrefix || generateRandomPrefix();
            setCurrentPrefix(prefix);
            const newEmail = `${prefix}@${unlockedDomain}`;
            setCurrentEmail(newEmail);
            localStorage.setItem('tmail_address', newEmail);
            setSelectedMessage(null);
          }
        }}
      />
    </div>
  );
}
