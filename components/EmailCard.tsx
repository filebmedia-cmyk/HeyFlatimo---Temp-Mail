'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Shuffle,
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sun,
  Moon,
  QrCode,
  Bell,
  BellOff,
  UserCheck,
  X,
} from 'lucide-react';
import CustomEmailModal from './CustomEmailModal';
import DomainDropdown, { DomainOption } from './DomainDropdown';
import {
  playSound,
  playKatanaSlashSound,
  playNekoSound,
  playShibaSound,
  playArcadeKOSound,
  playSpideyThwipSound,
  playVictoryFanfareSound,
} from '@/lib/sound';

export const SPIDEY_QUOTES = [
  'SPIDEY ON DUTY!',
  'VIP SECURED!',
  'THWIP! WEB READY!',
  'FRIENDLY HERO!',
  'GREAT POWER!',
  'INBOX PROTECTED!',
];

export type HeroId = 'giyu' | 'tanjiro' | 'nezuko' | 'inosuke' | 'zenitsu' | 'shinobu';

export const HERO_KEYS: HeroId[] = ['giyu', 'tanjiro', 'nezuko', 'inosuke', 'zenitsu', 'shinobu'];

export interface HeroInfo {
  id: HeroId;
  name: string;
  badgeName: string;
  title: string;
  element: string;
  elementColor: string;
  desc: string;
  quotes: string[];
  ultName: string;
  ultBanner: string;
  kanji?: string;
  kanjiWatermark?: string;
  stats?: {
    atk: number;
    spd: number;
    ult: number;
    crit: number;
  };
  glowColor?: string;
}

export const HERO_ROSTER: Record<HeroId, HeroInfo> = {
  giyu: {
    id: 'giyu',
    name: 'GIYU TOMIOKA',
    badgeName: 'GIYU',
    title: 'Hashira Air - Nichirin Katana Biru',
    element: 'AIR',
    elementColor: 'bg-cyan-400 text-black',
    desc: 'Pendekar pedang tenang pembawa Pernapasan Air. Memiliki jubah haori dua motif (merah marun polos & geometris hijau-kuning) serta katana biru tua.',
    quotes: ['MINAMO GIRI!', 'PERNAPASAN AIR!', 'WATER SLASH!', 'JU NO KATA!', 'HASHIRA RUSH!'],
    ultName: 'JU NO KATA: SEIRAN',
    ultBanner: 'JU NO KATA: SEIRAN!',
    kanji: '冨岡 義勇',
    kanjiWatermark: '水',
    glowColor: '#06b6d4',
    stats: { atk: 88, spd: 92, ult: 95, crit: 75 },
  },
  tanjiro: {
    id: 'tanjiro',
    name: 'TANJIRO KAMADO',
    badgeName: 'TANJIRO',
    title: 'Dewa Api - Hinokami Kagura',
    element: 'API',
    elementColor: 'bg-red-500 text-white',
    desc: 'Pemuda berhati mulia pembawa Tarian Dewa Api. Mengenakan anting Hanafuda, bekas luka dahi, dan jubah bermotif kotak-kotak hijau-hitam.',
    quotes: ['HINOKAMI KAGURA!', 'ENBU!', 'DEWA API!', 'TARIAN NAGA!', 'HINOKAMI!'],
    ultName: 'HINOKAMI: ENBU',
    ultBanner: 'HINOKAMI KAGURA: ENBU!',
    kanji: '竈門 炭治郎',
    kanjiWatermark: '炎',
    glowColor: '#ef4444',
    stats: { atk: 94, spd: 86, ult: 96, crit: 82 },
  },
  nezuko: {
    id: 'nezuko',
    name: 'SMOL NEZUKO',
    badgeName: 'NEZUKO',
    title: 'Iblis Imut - Kimono Pink & Bambu',
    element: 'LUCU',
    elementColor: 'bg-pink-400 text-black',
    desc: 'Adik iblis imut bertopeng sumbat bambu dan kimono rami merah muda. Memiliki kelincahan luar biasa dan tendangan akrobatik super cepat.',
    quotes: ['NEZUKO RUN!', 'TENDANGAN!', 'NEZUKO RUSH!', 'KOTAK KAYU!'],
    ultName: 'MEGA SPRINT KICK',
    ultBanner: 'SMOL NEZUKO MEGA KICK!',
    kanji: '竈門 禰豆子',
    kanjiWatermark: '鬼',
    glowColor: '#f43f5e',
    stats: { atk: 84, spd: 96, ult: 88, crit: 90 },
  },
  inosuke: {
    id: 'inosuke',
    name: 'INOSUKE HASHIBIRA',
    badgeName: 'INOSUKE',
    title: 'Pendekar Babi - Topeng Hutan & Dual Katana',
    element: 'SERUDUK',
    elementColor: 'bg-amber-500 text-black',
    desc: 'Pendekar bertubuh kekar bertopeng kepala babi hutan dengan gading melengkung, mengayunkan sepasang pedang Nichirin bergerigi tajam.',
    quotes: ['INOSHISHI TOTSUGEKI!', 'KIRI SAKI!', 'DUAL KATANA!', 'MAJU TERUS!'],
    ultName: 'INOSHISHI TOTSUGEKI',
    ultBanner: 'INOSHISHI TOTSUGEKI: KIRI SAKI!',
    kanji: '嘴平 伊之助',
    kanjiWatermark: '獣',
    glowColor: '#f59e0b',
    stats: { atk: 95, spd: 91, ult: 89, crit: 88 },
  },
  zenitsu: {
    id: 'zenitsu',
    name: 'ZENITSU AGATSUMA',
    badgeName: 'ZENITSU',
    title: 'Pendekar Petir - Jubah Kuning Segitiga',
    element: 'PETIR',
    elementColor: 'bg-yellow-400 text-black',
    desc: 'Pendekar kilat berselimut jubah segitiga emas. Melancarkan tebasan kilat Hekireki Issen dengan kecepatan supersonik dalam mode fokus.',
    quotes: ['HEKIREKI ISSEN!', 'ROKUREN!', 'KILAT PETIR!', 'TIDUR KILAT!'],
    ultName: 'HEKIREKI: ROKUREN',
    ultBanner: 'HEKIREKI ISSEN: ROKUREN!',
    kanji: '我妻 善逸',
    kanjiWatermark: '雷',
    glowColor: '#eab308',
    stats: { atk: 96, spd: 99, ult: 92, crit: 98 },
  },
  shinobu: {
    id: 'shinobu',
    name: 'SHINOBU KOCHO',
    badgeName: 'SHINOBU',
    title: 'Pilar Serangga - Jubah Sayap Kupu-Kupu',
    element: 'SERANGGA',
    elementColor: 'bg-purple-400 text-black',
    desc: 'Hashira anggun bersenyum manis pengguna jubah sayap kupu-kupu dan pedang jarum suntik penyalur racun bunga wisteria mematikan.',
    quotes: ['CHOU NO MAI!', 'DOKU WISTERIA!', 'SAYAP KUPU!', 'RACUN SERANGGA!'],
    ultName: 'CHOU NO MAI',
    ultBanner: 'CHOU NO MAI: TAWAMURE!',
    kanji: '胡蝶 しのぶ',
    kanjiWatermark: '蟲',
    glowColor: '#a855f7',
    stats: { atk: 86, spd: 98, ult: 93, crit: 96 },
  },
};

/**
 * Realistic Vector Character Showcase Art Component
 */
export function RealisticHeroArt({ heroId, className = '' }: { heroId: HeroId; className?: string }) {
  if (heroId === 'tanjiro') {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
        <ellipse cx="50" cy="94" rx="36" ry="6" fill="#dc2626" opacity="0.35" />
        <ellipse cx="50" cy="94" rx="22" ry="4" fill="#f97316" opacity="0.5" />
        <rect x="38" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="54" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="37.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <line x1="38" y1="81" x2="46" y2="85" stroke="#000" strokeWidth="1" />
        <rect x="53.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <line x1="54" y1="81" x2="62" y2="85" stroke="#000" strokeWidth="1" />
        <rect x="36" y="86" width="11" height="5" fill="#d97706" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="53" y="86" width="11" height="5" fill="#d97706" stroke="#000" strokeWidth="1.4" rx="1" />
        <path d="M34,44 L66,44 L63,72 L37,72 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <rect x="37" y="66" width="26" height="4" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <rect x="48" y="65.5" width="4" height="5" fill="#eab308" stroke="#000" strokeWidth="1" />
        <path d="M26,42 L74,42 L78,54 L74,73 L26,73 L22,54 Z" fill="#15803d" stroke="#000" strokeWidth="1.8" />
        <rect x="28" y="44" width="7" height="7" fill="#0f172a" />
        <rect x="42" y="44" width="7" height="7" fill="#0f172a" />
        <rect x="56" y="44" width="7" height="7" fill="#0f172a" />
        <rect x="35" y="51" width="7" height="7" fill="#0f172a" />
        <rect x="49" y="51" width="7" height="7" fill="#0f172a" />
        <rect x="63" y="51" width="7" height="7" fill="#0f172a" />
        <rect x="28" y="58" width="7" height="7" fill="#0f172a" />
        <rect x="42" y="58" width="7" height="7" fill="#0f172a" />
        <rect x="56" y="58" width="7" height="7" fill="#0f172a" />
        <rect x="35" y="65" width="7" height="7" fill="#0f172a" />
        <rect x="49" y="65" width="7" height="7" fill="#0f172a" />
        <rect x="63" y="65" width="7" height="7" fill="#0f172a" />
        <line x1="22" y1="56" x2="38" y2="72" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
        <polygon points="21,54 26,52 24,59 19,58" fill="#f97316" stroke="#000" strokeWidth="1" />
        <line x1="14" y1="48" x2="21" y2="55" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <rect x="46" y="38" width="8" height="8" fill="#fde68a" stroke="#000" strokeWidth="1.4" />
        <polygon points="38,24 62,24 61,34 50,42 39,34" fill="#fde68a" stroke="#000" strokeWidth="1.8" />
        <rect x="34" y="32" width="3.5" height="8" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
        <circle cx="35.7" cy="35" r="1.2" fill="#dc2626" />
        <line x1="34" y1="37" x2="37.5" y2="37" stroke="#000" strokeWidth="0.6" />
        <path d="M41,23 Q44,20 42,26 Q45,24 43,28 Z" fill="#991b1b" stroke="#000" strokeWidth="0.5" />
        <polygon points="42,28 47,27 46,31 43,31" fill="#b91c1c" stroke="#000" strokeWidth="1" />
        <rect x="44" y="28" width="1.5" height="1.5" fill="#ffffff" />
        <line x1="41" y1="26" x2="48" y2="25" stroke="#000" strokeWidth="1.6" />
        <polygon points="53,27 58,28 57,31 54,31" fill="#b91c1c" stroke="#000" strokeWidth="1" />
        <rect x="54.5" y="28" width="1.5" height="1.5" fill="#ffffff" />
        <line x1="52" y1="25" x2="59" y2="26" stroke="#000" strokeWidth="1.6" />
        <line x1="47" y1="36" x2="53" y2="36" stroke="#7f1d1d" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M35,23 C36,10 64,10 65,23 C68,18 64,28 62,30 L58,23 L53,30 L50,21 L46,29 L42,22 L37,28 Z" fill="#450a0a" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="24" cy="36" r="2" fill="#f97316" />
        <circle cx="76" cy="40" r="2.5" fill="#ef4444" />
      </svg>
    );
  }

  if (heroId === 'nezuko') {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
        <ellipse cx="50" cy="94" rx="32" ry="5.5" fill="#fb7185" opacity="0.4" />
        <ellipse cx="50" cy="94" rx="20" ry="3.5" fill="#f43f5e" opacity="0.6" />
        <path d="M30,30 C20,40 18,65 24,84 C30,78 32,68 34,58 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <path d="M24,72 C22,78 20,84 25,86 C28,84 28,78 26,72 Z" fill="#f97316" stroke="#000" strokeWidth="1" />
        <path d="M70,30 C80,40 82,65 76,84 C70,78 68,68 66,58 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <path d="M76,72 C78,78 80,84 75,86 C72,84 72,78 74,72 Z" fill="#f97316" stroke="#000" strokeWidth="1" />
        <rect x="39" y="80" width="8" height="10" fill="#ffffff" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="53" y="80" width="8" height="10" fill="#ffffff" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="37.5" y="87" width="11" height="4.5" fill="#fbcfe8" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="51.5" y="87" width="11" height="4.5" fill="#fbcfe8" stroke="#000" strokeWidth="1.4" rx="1" />
        <path d="M28,46 L72,46 L75,78 L25,78 Z" fill="#18181b" stroke="#000" strokeWidth="1.8" />
        <path d="M34,44 L66,44 L64,79 L36,79 Z" fill="#f472b6" stroke="#000" strokeWidth="1.8" />
        <line x1="42" y1="48" x2="50" y2="56" stroke="#fbcfe8" strokeWidth="1.2" />
        <line x1="50" y1="56" x2="58" y2="48" stroke="#fbcfe8" strokeWidth="1.2" />
        <line x1="50" y1="48" x2="50" y2="56" stroke="#fbcfe8" strokeWidth="1.2" />
        <line x1="42" y1="62" x2="50" y2="70" stroke="#fbcfe8" strokeWidth="1.2" />
        <line x1="50" y1="70" x2="58" y2="62" stroke="#fbcfe8" strokeWidth="1.2" />
        <rect x="35" y="58" width="30" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
        <rect x="35" y="58" width="6" height="7" fill="#dc2626" />
        <rect x="47" y="58" width="6" height="7" fill="#dc2626" />
        <rect x="59" y="58" width="6" height="7" fill="#dc2626" />
        <line x1="35" y1="61.5" x2="65" y2="61.5" stroke="#15803d" strokeWidth="1.2" />
        <polygon points="38,24 62,24 61,35 50,43 39,35" fill="#fef08a" stroke="#000" strokeWidth="1.8" />
        <ellipse cx="44" cy="28" rx="4" ry="4.5" fill="#f43f5e" stroke="#000" strokeWidth="1.2" />
        <circle cx="45" cy="27" r="1.8" fill="#ffffff" />
        <ellipse cx="56" cy="28" rx="4" ry="4.5" fill="#f43f5e" stroke="#000" strokeWidth="1.2" />
        <circle cx="57" cy="27" r="1.8" fill="#ffffff" />
        <line x1="37" y1="36" x2="63" y2="36" stroke="#dc2626" strokeWidth="1.5" />
        <rect x="42" y="33" width="16" height="6.5" fill="#22c55e" stroke="#000" strokeWidth="1.4" rx="2" />
        <line x1="47" y1="33" x2="47" y2="39.5" stroke="#15803d" strokeWidth="1" />
        <line x1="53" y1="33" x2="53" y2="39.5" stroke="#15803d" strokeWidth="1" />
        <rect x="58" y="16" width="6" height="6" fill="#f43f5e" stroke="#000" strokeWidth="1" rx="1" />
        <path d="M36,22 C40,12 60,12 64,22 C60,26 58,20 54,23 C50,20 46,24 42,20 C38,24 36,22 36,22 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <polygon points="22,46 25,40 28,46 25,52" fill="#fb7185" />
        <polygon points="78,48 81,42 84,48 81,54" fill="#fb7185" />
      </svg>
    );
  }

  if (heroId === 'inosuke') {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
        <ellipse cx="50" cy="94" rx="36" ry="6" fill="#b45309" opacity="0.35" />
        <ellipse cx="50" cy="94" rx="22" ry="4" fill="#f59e0b" opacity="0.5" />
        <rect x="36" y="66" width="10" height="20" fill="#1e293b" stroke="#000" strokeWidth="1.8" rx="2" />
        <rect x="54" y="66" width="10" height="20" fill="#1e293b" stroke="#000" strokeWidth="1.8" rx="2" />
        <rect x="35" y="78" width="12" height="7" fill="#78350f" stroke="#000" strokeWidth="1.4" rx="1.5" />
        <rect x="53" y="78" width="12" height="7" fill="#78350f" stroke="#000" strokeWidth="1.4" rx="1.5" />
        <rect x="35" y="85" width="12" height="6" fill="#1e293b" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="53" y="85" width="12" height="6" fill="#1e293b" stroke="#000" strokeWidth="1.4" rx="1" />
        <path d="M30,58 L70,58 L74,68 L64,68 L60,65 L50,68 L40,65 L36,68 L26,68 Z" fill="#92400e" stroke="#000" strokeWidth="1.8" />
        <rect x="32" y="56" width="36" height="4" fill="#78350f" stroke="#000" strokeWidth="1.2" />
        <path d="M36,38 L64,38 L62,58 L38,58 Z" fill="#fed7aa" stroke="#000" strokeWidth="1.8" />
        <line x1="39" y1="46" x2="48" y2="47" stroke="#ea580c" strokeWidth="1.4" />
        <line x1="61" y1="46" x2="52" y2="47" stroke="#ea580c" strokeWidth="1.4" />
        <line x1="50" y1="42" x2="50" y2="58" stroke="#ea580c" strokeWidth="1.4" />
        <line x1="44" y1="52" x2="56" y2="52" stroke="#ea580c" strokeWidth="1.2" />
        <path d="M22,30 L10,65 L14,66 L26,31 Z" fill="#94a3b8" stroke="#000" strokeWidth="1.6" />
        <polygon points="17,45 13,47 16,50" fill="#000" />
        <polygon points="14,53 10,55 13,58" fill="#000" />
        <line x1="24" y1="26" x2="28" y2="16" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="24" y1="26" x2="28" y2="16" stroke="#000000" strokeWidth="1" strokeDasharray="1.5,1.5" />
        <path d="M78,30 L90,65 L86,66 L74,31 Z" fill="#94a3b8" stroke="#000" strokeWidth="1.6" />
        <polygon points="83,45 87,47 84,50" fill="#000" />
        <polygon points="86,53 90,55 87,58" fill="#000" />
        <line x1="76" y1="26" x2="72" y2="16" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="76" y1="26" x2="72" y2="16" stroke="#000000" strokeWidth="1" strokeDasharray="1.5,1.5" />
        <ellipse cx="50" cy="26" rx="16" ry="14" fill="#94a3b8" stroke="#000" strokeWidth="1.8" />
        <polygon points="37,16 32,8 41,12" fill="#64748b" stroke="#000" strokeWidth="1.5" />
        <polygon points="63,16 68,8 59,12" fill="#64748b" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="50" cy="31" rx="6.5" ry="4.5" fill="#f472b6" stroke="#000" strokeWidth="1.5" />
        <circle cx="48" cy="31" r="1.2" fill="#000" />
        <circle cx="52" cy="31" r="1.2" fill="#000" />
        <path d="M43,33 C37,34 38,27 41,25" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <path d="M57,33 C63,34 62,27 59,25" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="42" cy="23" rx="3.5" ry="3" fill="#0284c7" stroke="#000" strokeWidth="1.2" />
        <circle cx="43" cy="22.5" r="1" fill="#ffffff" />
        <ellipse cx="58" cy="23" rx="3.5" ry="3" fill="#0284c7" stroke="#000" strokeWidth="1.2" />
        <circle cx="59" cy="22.5" r="1" fill="#ffffff" />
      </svg>
    );
  }

  if (heroId === 'zenitsu') {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
        <ellipse cx="50" cy="94" rx="36" ry="6" fill="#eab308" opacity="0.4" />
        <ellipse cx="50" cy="94" rx="20" ry="3.5" fill="#fde047" opacity="0.6" />
        <rect x="38" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="54" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="37.5" y="79" width="9" height="7" fill="#facc15" stroke="#000" strokeWidth="1.2" />
        <polygon points="42,81 39,85 45,85" fill="#ffffff" />
        <rect x="53.5" y="79" width="9" height="7" fill="#facc15" stroke="#000" strokeWidth="1.2" />
        <polygon points="58,81 55,85 61,85" fill="#ffffff" />
        <rect x="36" y="86" width="11" height="5" fill="#ca8a04" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="53" y="86" width="11" height="5" fill="#ca8a04" stroke="#000" strokeWidth="1.4" rx="1" />
        <path d="M34,44 L66,44 L63,72 L37,72 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <rect x="37" y="66" width="26" height="4" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <rect x="48" y="65.5" width="4" height="5" fill="#eab308" stroke="#000" strokeWidth="1" />
        <path d="M26,42 L74,42 L78,54 L74,73 L26,73 L22,54 Z" fill="#eab308" stroke="#000" strokeWidth="1.8" />
        <path d="M24,65 L76,65 L74,73 L26,73 Z" fill="#ea580c" />
        <polygon points="34,45 31,50 37,50" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="46,45 43,50 49,50" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="58,45 55,50 61,50" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="70,45 67,50 73,50" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="40,54 37,59 43,59" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="52,54 49,59 55,59" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="64,54 61,59 67,59" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="34,63 31,68 37,68" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="46,63 43,68 49,68" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <polygon points="58,63 55,68 61,68" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
        <line x1="20" y1="58" x2="38" y2="70" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="20" y1="58" x2="38" y2="70" stroke="#facc15" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="21" cy="56" r="3" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
        <line x1="12" y1="52" x2="20" y2="56" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <rect x="46" y="38" width="8" height="8" fill="#fde68a" stroke="#000" strokeWidth="1.4" />
        <polygon points="38,24 62,24 61,34 50,42 39,34" fill="#fde68a" stroke="#000" strokeWidth="1.8" />
        <line x1="41" y1="29" x2="48" y2="29" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <line x1="41" y1="26" x2="48" y2="28" stroke="#ca8a04" strokeWidth="1.4" />
        <line x1="52" y1="29" x2="59" y2="29" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="28" x2="59" y2="26" stroke="#ca8a04" strokeWidth="1.4" />
        <line x1="47" y1="36" x2="53" y2="36" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M34,22 C35,8 65,8 66,22 C68,16 66,26 64,28 L59,20 L55,27 L50,18 L45,27 L41,20 L36,28 Z" fill="#facc15" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon points="36,26 40,23 37,28" fill="#ea580c" />
        <polygon points="44,25 47,22 45,27" fill="#ea580c" />
        <polygon points="53,25 56,22 55,27" fill="#ea580c" />
        <polygon points="62,26 65,23 64,28" fill="#ea580c" />
        <polygon points="26,30 20,38 24,38 18,48 28,40 24,40" fill="#facc15" stroke="#000" strokeWidth="0.8" />
        <polygon points="74,32 80,40 76,40 82,50 72,42 76,42" fill="#facc15" stroke="#000" strokeWidth="0.8" />
      </svg>
    );
  }

  if (heroId === 'shinobu') {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
        <ellipse cx="50" cy="94" rx="36" ry="6" fill="#a855f7" opacity="0.35" />
        <ellipse cx="50" cy="94" rx="22" ry="4" fill="#c084fc" opacity="0.5" />
        <rect x="38" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="54" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
        <rect x="37.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <path d="M38,82 Q42,86 46,82" stroke="#06b6d4" strokeWidth="1.2" fill="none" />
        <rect x="53.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <path d="M54,82 Q58,86 62,82" stroke="#06b6d4" strokeWidth="1.2" fill="none" />
        <rect x="36" y="86" width="11" height="5" fill="#fbcfe8" stroke="#000" strokeWidth="1.4" rx="1" />
        <rect x="53" y="86" width="11" height="5" fill="#fbcfe8" stroke="#000" strokeWidth="1.4" rx="1" />
        <line x1="41" y1="86" x2="41" y2="90" stroke="#a855f7" strokeWidth="1.5" />
        <line x1="58" y1="86" x2="58" y2="90" stroke="#a855f7" strokeWidth="1.5" />
        <path d="M34,44 L66,44 L63,72 L37,72 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
        <rect x="37" y="66" width="26" height="4" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="1.2" fill="#facc15" />
        <circle cx="50" cy="56" r="1.2" fill="#facc15" />
        <circle cx="50" cy="62" r="1.2" fill="#facc15" />
        <path d="M22,42 C28,40 38,42 50,44 C62,42 72,40 78,42 C82,54 86,66 80,74 C72,70 65,72 50,75 C35,72 28,70 20,74 C14,66 18,54 22,42 Z" fill="#ffffff" stroke="#000" strokeWidth="1.8" />
        <path d="M20,68 Q35,66 50,68 Q65,66 80,68 L80,74 Q65,72 50,75 Q35,72 20,74 Z" fill="#06b6d4" />
        <path d="M20,71 Q35,69 50,71 Q65,69 80,71 L80,74 Q65,72 50,75 Q35,72 20,74 Z" fill="#ec4899" />
        <path d="M28,46 Q34,60 36,70" stroke="#000" strokeWidth="1" fill="none" />
        <path d="M72,46 Q66,60 64,70" stroke="#000" strokeWidth="1" fill="none" />
        <line x1="22" y1="56" x2="38" y2="72" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="56" x2="38" y2="72" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="55" r="2.5" fill="#06b6d4" stroke="#000" strokeWidth="0.8" />
        <rect x="46" y="38" width="8" height="8" fill="#fde68a" stroke="#000" strokeWidth="1.4" />
        <polygon points="38,24 62,24 61,34 50,42 39,34" fill="#fde68a" stroke="#000" strokeWidth="1.8" />
        <path d="M50,14 C42,8 40,16 48,18 C40,20 44,26 50,20 C56,26 60,20 52,18 C60,16 58,8 50,14 Z" fill="#06b6d4" stroke="#000" strokeWidth="1.2" />
        <circle cx="50" cy="17" r="1.5" fill="#a855f7" />
        <polygon points="42,28 47,27 46,31 43,31" fill="#7c3aed" stroke="#000" strokeWidth="1" />
        <rect x="44" y="28" width="1.5" height="1.5" fill="#ffffff" />
        <line x1="41" y1="26" x2="48" y2="26" stroke="#000" strokeWidth="1.4" />
        <polygon points="53,27 58,28 57,31 54,31" fill="#7c3aed" stroke="#000" strokeWidth="1" />
        <rect x="54.5" y="28" width="1.5" height="1.5" fill="#ffffff" />
        <line x1="52" y1="26" x2="59" y2="26" stroke="#000" strokeWidth="1.4" />
        <path d="M47,35 Q50,37 53,35" stroke="#9333ea" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M35,22 C38,14 62,14 65,22 C67,26 62,28 60,30 L55,24 L50,22 L45,24 L40,30 Z" fill="#1e1b4b" stroke="#000" strokeWidth="1.8" />
        <path d="M16,36 Q20,32 24,36 Q20,40 16,36 Z" fill="#c084fc" stroke="#000" strokeWidth="0.8" />
        <path d="M80,32 Q84,28 88,32 Q84,36 80,32 Z" fill="#06b6d4" stroke="#000" strokeWidth="0.8" />
      </svg>
    );
  }

  // Default: Giyu Tomioka
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" className={`overflow-visible drop-shadow-[4px_4px_0px_#000] ${className}`}>
      <ellipse cx="50" cy="94" rx="36" ry="6" fill="#0891b2" opacity="0.3" />
      <ellipse cx="50" cy="94" rx="24" ry="4" fill="#06b6d4" opacity="0.5" />
      <ellipse cx="50" cy="94" rx="14" ry="2.5" fill="#000000" opacity="0.6" />
      <path d="M42,22 C34,16 26,22 18,34 C26,32 32,36 38,38 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M38,32 C28,34 22,44 16,52 C24,48 30,50 36,46 Z" fill="#090d16" stroke="#000" strokeWidth="1.5" />
      <rect x="37" y="33" width="3.5" height="4.5" fill="#0284c7" stroke="#000" strokeWidth="1" rx="0.5" />
      <rect x="38" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
      <rect x="54" y="70" width="8" height="18" fill="#0f172a" stroke="#000" strokeWidth="1.8" rx="1" />
      <rect x="37.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
      <line x1="38" y1="82.5" x2="46" y2="82.5" stroke="#d97706" strokeWidth="1" />
      <rect x="53.5" y="79" width="9" height="7" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
      <line x1="54" y1="82.5" x2="62" y2="82.5" stroke="#d97706" strokeWidth="1" />
      <rect x="36" y="86" width="11" height="5" fill="#d97706" stroke="#000" strokeWidth="1.4" rx="1" />
      <rect x="53" y="86" width="11" height="5" fill="#d97706" stroke="#000" strokeWidth="1.4" rx="1" />
      <path d="M36,44 L64,44 L62,72 L38,72 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" />
      <rect x="37" y="66" width="26" height="4" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
      <rect x="48" y="65.5" width="4" height="5" fill="#eab308" stroke="#000" strokeWidth="1" />
      <path d="M30,42 L50,42 L50,75 L26,73 L24,52 Z" fill="#991b1b" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M50,42 L70,42 L76,52 L74,73 L50,75 Z" fill="#15803d" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="53,46 59,43 65,46 59,50" fill="#eab308" stroke="#000" strokeWidth="0.8" />
      <polygon points="59,50 65,46 65,54 59,58" fill="#ea580c" stroke="#000" strokeWidth="0.8" />
      <polygon points="53,46 59,50 59,58 53,54" fill="#15803d" stroke="#000" strokeWidth="0.8" />
      <polygon points="63,56 69,53 75,56 69,60" fill="#eab308" stroke="#000" strokeWidth="0.8" />
      <polygon points="69,60 75,56 75,64 69,68" fill="#ea580c" stroke="#000" strokeWidth="0.8" />
      <polygon points="63,56 69,60 69,68 63,64" fill="#15803d" stroke="#000" strokeWidth="0.8" />
      <polygon points="46,44 54,44 52,56 48,56" fill="#ffffff" stroke="#000" strokeWidth="1" />
      <circle cx="50" cy="59" r="1.2" fill="#facc15" stroke="#000" strokeWidth="0.6" />
      <circle cx="50" cy="63" r="1.2" fill="#facc15" stroke="#000" strokeWidth="0.6" />
      <line x1="22" y1="56" x2="38" y2="72" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="22" y1="56" x2="38" y2="72" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="21,54 26,52 24,59 19,58" fill="#a855f7" stroke="#000" strokeWidth="1" />
      <line x1="14" y1="48" x2="21" y2="55" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="48" x2="21" y2="55" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="1.5,1.5" />
      <rect x="46" y="38" width="8" height="8" fill="#fde68a" stroke="#000" strokeWidth="1.4" />
      <polygon points="38,24 62,24 61,34 50,42 39,34" fill="#fde68a" stroke="#000" strokeWidth="1.8" />
      <polygon points="42,28 47,27 46,31 43,31" fill="#0369a1" stroke="#000" strokeWidth="1" />
      <rect x="44" y="28" width="1.5" height="1.5" fill="#ffffff" />
      <line x1="41" y1="26" x2="48" y2="26" stroke="#000" strokeWidth="1.5" />
      <polygon points="53,27 58,28 57,31 54,31" fill="#0369a1" stroke="#000" strokeWidth="1" />
      <rect x="54.5" y="28" width="1.5" height="1.5" fill="#ffffff" />
      <line x1="52" y1="26" x2="59" y2="26" stroke="#000" strokeWidth="1.5" />
      <line x1="47" y1="36" x2="53" y2="36" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M35,22 C38,12 62,12 65,22 C67,26 63,30 63,30 L57,25 L54,32 L50,24 L46,32 L43,25 L37,30 Z" fill="#0f172a" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="28" cy="38" r="2" fill="#38bdf8" opacity="0.75" />
      <circle cx="74" cy="44" r="2.5" fill="#38bdf8" opacity="0.6" />
    </svg>
  );
}

/**
 * Cinematic Signature Skill FX Component for each Hero
 */
export function CinematicSkillFX({ heroId }: { heroId: HeroId }) {
  if (heroId === 'giyu') {
    return (
      <svg width="270" height="190" viewBox="0 0 240 160" className="anim-water-surge overflow-visible">
        {/* Giant Water Dragon Tidal Surge */}
        <path d="M10,130 Q70,10 140,70 T230,50" fill="none" stroke="#0284c7" strokeWidth="24" strokeLinecap="round" opacity="0.85" />
        <path d="M10,130 Q70,10 140,70 T230,50" fill="none" stroke="#38bdf8" strokeWidth="15" strokeLinecap="round" opacity="0.95" />
        <path d="M10,130 Q70,10 140,70 T230,50" fill="none" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        {/* Wave Dragon Crests */}
        <polygon points="120,45 135,25 145,48" fill="#ffffff" />
        <polygon points="175,45 190,20 200,50" fill="#ffffff" />
        <polygon points="70,55 80,35 95,60" fill="#ffffff" />
        {/* Water Droplets */}
        <circle cx="130" cy="20" r="4" fill="#38bdf8" />
        <circle cx="150" cy="15" r="3" fill="#ffffff" />
        <circle cx="195" cy="18" r="4.5" fill="#ffffff" />
        <circle cx="215" cy="35" r="3" fill="#38bdf8" />
      </svg>
    );
  }

  if (heroId === 'tanjiro') {
    return (
      <svg width="270" height="190" viewBox="0 0 240 180" className="anim-flame-wheel overflow-visible">
        {/* Blazing Solar Flame Wheel 360 */}
        <ellipse cx="120" cy="90" rx="90" ry="70" fill="none" stroke="#7f1d1d" strokeWidth="24" opacity="0.8" />
        <ellipse cx="120" cy="90" rx="90" ry="70" fill="none" stroke="#dc2626" strokeWidth="15" opacity="0.95" />
        <ellipse cx="120" cy="90" rx="90" ry="70" fill="none" stroke="#facc15" strokeWidth="6.5" />
        {/* Solar Spikes */}
        <polygon points="120,20 135,2 145,22" fill="#f97316" />
        <polygon points="190,50 215,35 200,68" fill="#facc15" />
        <polygon points="205,100 230,110 200,120" fill="#dc2626" />
        <polygon points="120,160 105,178 95,158" fill="#f97316" />
        <polygon points="50,130 25,145 40,112" fill="#facc15" />
        <circle cx="150" cy="40" r="4" fill="#facc15" />
        <circle cx="75" cy="50" r="3" fill="#ffffff" />
      </svg>
    );
  }

  if (heroId === 'nezuko') {
    return (
      <svg width="250" height="190" viewBox="0 0 200 160" className="anim-blood-burst overflow-visible">
        {/* Blood Demon Pyrokinesis Concentric Shockwave */}
        <circle cx="100" cy="80" r="70" fill="none" stroke="#f43f5e" strokeWidth="16" opacity="0.6" />
        <circle cx="100" cy="80" r="50" fill="none" stroke="#fb7185" strokeWidth="11" opacity="0.85" />
        <circle cx="100" cy="80" r="30" fill="none" stroke="#ffffff" strokeWidth="5.5" />
        <polygon points="100,10 108,35 92,35" fill="#f43f5e" />
        <polygon points="100,150 108,125 92,125" fill="#f43f5e" />
        <polygon points="20,80 45,72 45,88" fill="#f43f5e" />
        <polygon points="180,80 155,72 155,88" fill="#f43f5e" />
        {/* Crystal Sparkles */}
        <polygon points="40,30 46,40 56,40 48,46 51,56 40,50 29,56 32,46 24,40 34,40" fill="#fbcfe8" />
        <polygon points="160,30 166,40 176,40 168,46 171,56 160,50 149,56 152,46 144,40 154,40" fill="#fbcfe8" />
      </svg>
    );
  }

  if (heroId === 'inosuke') {
    return (
      <svg width="270" height="190" viewBox="0 0 240 180" className="anim-beast-slash overflow-visible">
        {/* Heavy Beast X-Slash */}
        <line x1="20" y1="20" x2="220" y2="160" stroke="#f59e0b" strokeWidth="20" strokeLinecap="round" opacity="0.85" />
        <line x1="20" y1="20" x2="220" y2="160" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="220" y1="20" x2="20" y2="160" stroke="#f59e0b" strokeWidth="20" strokeLinecap="round" opacity="0.85" />
        <line x1="220" y1="20" x2="20" y2="160" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        <polygon points="120,70 140,90 100,90" fill="#ffffff" />
        <polygon points="70,50 90,60 80,75" fill="#92400e" />
        <polygon points="170,50 150,60 160,75" fill="#92400e" />
        <rect x="50" y="110" width="7" height="7" fill="#78350f" transform="rotate(45 54 114)" />
        <rect x="190" y="110" width="6" height="6" fill="#78350f" transform="rotate(25 193 113)" />
      </svg>
    );
  }

  if (heroId === 'zenitsu') {
    return (
      <svg width="270" height="190" viewBox="0 0 240 180" className="anim-thunder-flash overflow-visible">
        {/* 6-Fold Branching Electric Lightning */}
        <path d="M10,90 L60,30 L90,100 L140,20 L170,120 L230,60" fill="none" stroke="#eab308" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <path d="M10,90 L60,30 L90,100 L140,20 L170,120 L230,60" fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10,90 L60,30 L90,100 L140,20 L170,120 L230,60" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60,30 L50,80 L30,110" fill="none" stroke="#fde047" strokeWidth="3.5" />
        <circle cx="60" cy="30" r="7" fill="#ffffff" />
        <circle cx="140" cy="20" r="9" fill="#ffffff" />
        <circle cx="170" cy="120" r="6" fill="#ffffff" />
      </svg>
    );
  }

  if (heroId === 'shinobu') {
    return (
      <svg width="270" height="190" viewBox="0 0 240 180" className="anim-butterfly-swarm overflow-visible">
        {/* Needle Stinger Puncture & Swarm */}
        <circle cx="120" cy="90" r="16" fill="none" stroke="#c084fc" strokeWidth="7" opacity="0.75" />
        <circle cx="120" cy="90" r="6" fill="#ffffff" />
        <g transform="translate(60, 40) rotate(-15)">
          <path d="M0,0 Q15,-15 25,0 Q15,15 0,0" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
          <path d="M0,0 Q-15,-15 -25,0 Q-15,15 0,0" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
        </g>
        <g transform="translate(180, 50) rotate(25)">
          <path d="M0,0 Q18,-18 30,0 Q18,18 0,0" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
          <path d="M0,0 Q-18,-18 -30,0 Q-18,18 0,0" fill="#c084fc" stroke="#ffffff" strokeWidth="1" />
        </g>
        <g transform="translate(80, 130) rotate(-35)">
          <path d="M0,0 Q14,-14 24,0 Q14,14 0,0" fill="#c084fc" stroke="#ffffff" strokeWidth="1" />
          <path d="M0,0 Q-14,-14 -24,0 Q-14,14 0,0" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
        </g>
        <circle cx="100" cy="60" r="3" fill="#e9d5ff" />
        <circle cx="140" cy="70" r="4" fill="#c084fc" />
      </svg>
    );
  }

  return null;
}

interface EmailCardProps {
  currentEmail: string;
  currentPrefix: string;
  currentDomain: string;
  availableDomains: (string | DomainOption)[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeDomain: (domain: string) => void;
  onApplyCustom: (prefix: string, domain: string) => void;
  onCopy: (email: string) => void;
  countdownSeconds: number;
  isVipUnlocked?: boolean;
  onOpenVipModal?: () => void;
  onRequestVipUnlock?: (domain: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenQrModal?: () => void;
  heroHeader?: {
    badgeText?: string;
    titlePrefix?: string;
    titleHighlight?: string;
    subtitle?: string;
  };
}

export default function EmailCard({
  currentEmail,
  currentPrefix,
  currentDomain,
  availableDomains,
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeDomain,
  onApplyCustom,
  onCopy,
  countdownSeconds,
  isVipUnlocked = false,
  onOpenVipModal,
  onRequestVipUnlock,
  isDark = false,
  onToggleTheme,
  isSoundEnabled = true,
  onToggleSound,
  onOpenQrModal,
  heroHeader,
}: EmailCardProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Interactive Squad Character States
  const [giyuState, setGiyuState] = useState<'idle' | 'slashing'>('idle');
  const [nekoState, setNekoState] = useState<'idle' | 'meow'>('idle');
  const [shibaState, setShibaState] = useState<'idle' | 'bark'>('idle');

  const badgeText = heroHeader?.badgeText !== undefined ? heroHeader.badgeText : 'DISPOSABLE INBOX SYSTEM';
  const titlePrefix = heroHeader?.titlePrefix !== undefined ? heroHeader.titlePrefix : 'TEMPORARY';
  const titleHighlight = heroHeader?.titleHighlight !== undefined ? heroHeader.titleHighlight : 'INBOX';
  const subtitle = heroHeader?.subtitle !== undefined ? heroHeader.subtitle : 'Terima kode OTP & verifikasi instan. Otomatis terhapus, aman & tanpa data pribadi.';

  const handleGiyuClick = () => {
    if (giyuState === 'slashing') return;
    setGiyuState('slashing');
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
    setTimeout(() => {
      setGiyuState('idle');
    }, 1400);
  };

  const handleNekoClick = () => {
    if (nekoState === 'meow') return;
    setNekoState('meow');
    if (isSoundEnabled) {
      playNekoSound(true);
    }
    setTimeout(() => {
      setNekoState('idle');
    }, 1200);
  };

  const handleShibaClick = () => {
    if (shibaState === 'bark') return;
    setShibaState('bark');
    if (isSoundEnabled) {
      playShibaSound(true);
    }
    setTimeout(() => {
      setShibaState('idle');
    }, 1200);
  };

  // Interactive Strip Runner & Character Select States
  const [activeHero, setActiveHero] = useState<HeroId>('giyu');
  const [isCharModalOpen, setIsCharModalOpen] = useState<boolean>(false);
  const [previewHero, setPreviewHero] = useState<HeroId>('giyu');
  const [transitionState, setTransitionState] = useState<'idle' | 'out-left' | 'in-right' | 'out-right' | 'in-left'>('idle');
  const [showBurstRing, setShowBurstRing] = useState<boolean>(false);
  const [isModalSlashing, setIsModalSlashing] = useState<boolean>(false);
  const [modalQuote, setModalQuote] = useState<string | null>(null);
  const modalQuoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [runnerQuote, setRunnerQuote] = useState<string | null>(null);
  const [isRunnerSlashing, setIsRunnerSlashing] = useState<boolean>(false);
  const [isDemonHit, setIsDemonHit] = useState<boolean>(false);
  const [demonQuote, setDemonQuote] = useState<string | null>(null);
  const runnerQuoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const runnerSlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const demonHitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Arcade Universe: Boss HP Bar & Ultimate Energy States
  const [bossHp, setBossHp] = useState<number>(100);
  const [comboCount, setComboCount] = useState<number>(0);
  const [ultEnergy, setUltEnergy] = useState<number>(35);
  const [isUltActive, setIsUltActive] = useState<boolean>(false);
  const [isBossHurt, setIsBossHurt] = useState<boolean>(false);
  const [isBossKO, setIsBossKO] = useState<boolean>(false);
  const bossHurtTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bossRespawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Demon Defeated Kill Counter & Respawn Countdown Timer
  const [demonKills, setDemonKills] = useState<number>(0);
  const [respawnCountdown, setRespawnCountdown] = useState<number>(3);
  const respawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Spiderman Hanging on VIP Crown States
  const [spideyQuoteIdx, setSpideyQuoteIdx] = useState<number>(0);
  const [isSpideyFlipping, setIsSpideyFlipping] = useState<boolean>(false);
  const [isThwipActive, setIsThwipActive] = useState<boolean>(false);
  const spideyFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spideyThwipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSpideyClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isSoundEnabled) {
      playSpideyThwipSound(true);
    }
    setIsThwipActive(true);
    setIsSpideyFlipping(true);

    if (spideyThwipTimeoutRef.current) clearTimeout(spideyThwipTimeoutRef.current);
    spideyThwipTimeoutRef.current = setTimeout(() => {
      setIsThwipActive(false);
    }, 600);

    if (spideyFlipTimeoutRef.current) clearTimeout(spideyFlipTimeoutRef.current);
    spideyFlipTimeoutRef.current = setTimeout(() => {
      setIsSpideyFlipping(false);
    }, 650);

    setSpideyQuoteIdx((prev) => (prev + 1) % SPIDEY_QUOTES.length);
  };

  const damageBoss = (amount: number, isCritical: boolean = false) => {
    if (isBossKO) return;

    setBossHp((prev) => {
      const nextHp = Math.max(0, prev - amount);
      if (nextHp === 0) {
        setIsBossKO(true);
        setIsBossHurt(false);
        setDemonQuote('K.O.!');

        // Increment kill count and save to localStorage
        setDemonKills((prevKills) => {
          const updated = prevKills + 1;
          if (typeof window !== 'undefined') {
            localStorage.setItem('flatimo_demon_kills', String(updated));
          }
          return updated;
        });

        // Play Arcade KO and Victory Fanfare chimes
        if (isSoundEnabled) {
          playArcadeKOSound(true);
          setTimeout(() => {
            playVictoryFanfareSound(true);
          }, 320);
        }

        // Reset and trigger 3-second respawn countdown
        setRespawnCountdown(3);
        if (respawnIntervalRef.current) clearInterval(respawnIntervalRef.current);
        respawnIntervalRef.current = setInterval(() => {
          setRespawnCountdown((c) => Math.max(1, c - 1));
        }, 1000);

        if (bossRespawnTimeoutRef.current) clearTimeout(bossRespawnTimeoutRef.current);
        bossRespawnTimeoutRef.current = setTimeout(() => {
          setIsBossKO(false);
          setBossHp(100);
          setDemonQuote(null);
          setComboCount(0);
          if (respawnIntervalRef.current) clearInterval(respawnIntervalRef.current);
        }, 3000);
      } else {
        setIsBossHurt(true);
        const scream = isCritical ? `CRITICAL -${amount} HP!` : `-${amount} HP!`;
        setDemonQuote(scream);
        if (bossHurtTimeoutRef.current) clearTimeout(bossHurtTimeoutRef.current);
        bossHurtTimeoutRef.current = setTimeout(() => {
          setIsBossHurt(false);
          setDemonQuote(null);
        }, 700);
      }
      return nextHp;
    });

    setComboCount((prev) => prev + 1);
  };

  const handleCopyClick = () => {
    if (!currentEmail) return;
    onCopy(currentEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Arcade Universe: Gain +25% energy & attack demon
    setUltEnergy((prev) => Math.min(100, prev + 25));
    damageBoss(25);
  };

  const handleRandomizeClick = () => {
    onRandomize();
    setUltEnergy((prev) => Math.min(100, prev + 30));
  };

  const handleTriggerUltimate = () => {
    if (ultEnergy < 100 || isUltActive || isBossKO) return;
    setIsUltActive(true);
    setUltEnergy(0);
    const heroData = HERO_ROSTER[activeHero];
    setRunnerQuote(heroData.ultName);

    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }

    // Critical strike -100 HP to boss with K.O.
    setTimeout(() => {
      damageBoss(100, true);
    }, 280);

    if (ultTimeoutRef.current) clearTimeout(ultTimeoutRef.current);
    ultTimeoutRef.current = setTimeout(() => {
      setIsUltActive(false);
      setRunnerQuote(null);
    }, 1600);
  };

  // Charge Energy and Ultimate Attack Handler (Fixes Charge Button Bug)
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const chargeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChargeOrUltimate = () => {
    if (isUltActive || isBossKO) return;

    if (ultEnergy < 100) {
      setUltEnergy((prev) => {
        const next = Math.min(100, prev + 25);
        if (next >= 100) {
          if (isSoundEnabled) {
            playSound('success');
          }
        } else {
          if (isSoundEnabled) {
            playSound('pop');
          }
        }
        return next;
      });
      setIsCharging(true);
      if (chargeTimeoutRef.current) clearTimeout(chargeTimeoutRef.current);
      chargeTimeoutRef.current = setTimeout(() => setIsCharging(false), 450);
    } else {
      handleTriggerUltimate();
    }
  };

  // Restore saved hero & demon kills from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flatimo_runner_hero') as HeroId;
      if (saved && ['giyu', 'tanjiro', 'nezuko', 'inosuke', 'zenitsu', 'shinobu'].includes(saved)) {
        setActiveHero(saved);
      }
      const savedKills = localStorage.getItem('flatimo_demon_kills');
      if (savedKills) {
        const parsed = parseInt(savedKills, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setDemonKills(parsed);
        }
      }
    }
  }, []);

  const handleSelectHero = (hero: HeroId) => {
    setActiveHero(hero);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flatimo_runner_hero', hero);
    }
    setIsCharModalOpen(false);
    if (isSoundEnabled) {
      playSound('pop');
    }
  };

  const handlePrevHero = () => {
    if (transitionState !== 'idle') return;
    setTransitionState('out-right');
    if (isSoundEnabled) {
      playSound('click');
    }

    setTimeout(() => {
      const idx = HERO_KEYS.indexOf(previewHero);
      const prevIdx = (idx - 1 + HERO_KEYS.length) % HERO_KEYS.length;
      setPreviewHero(HERO_KEYS[prevIdx]);
      setTransitionState('in-left');
      setShowBurstRing(true);

      setTimeout(() => {
        setTransitionState('idle');
        setShowBurstRing(false);
      }, 260);
    }, 220);
  };

  const handleNextHero = () => {
    if (transitionState !== 'idle') return;
    setTransitionState('out-left');
    if (isSoundEnabled) {
      playSound('click');
    }

    setTimeout(() => {
      const idx = HERO_KEYS.indexOf(previewHero);
      const nextIdx = (idx + 1) % HERO_KEYS.length;
      setPreviewHero(HERO_KEYS[nextIdx]);
      setTransitionState('in-right');
      setShowBurstRing(true);

      setTimeout(() => {
        setTransitionState('idle');
        setShowBurstRing(false);
      }, 260);
    }, 220);
  };

  const handleThumbnailSelect = (targetHero: HeroId) => {
    if (targetHero === previewHero || transitionState !== 'idle') return;
    const currentIdx = HERO_KEYS.indexOf(previewHero);
    const targetIdx = HERO_KEYS.indexOf(targetHero);
    if (targetIdx > currentIdx) {
      handleNextHero();
    } else {
      handlePrevHero();
    }
  };

  const getRosterTransitionClass = () => {
    if (transitionState === 'out-left') return 'anim-roster-out-left';
    if (transitionState === 'in-right') return 'anim-roster-in-right';
    if (transitionState === 'out-right') return 'anim-roster-out-right';
    if (transitionState === 'in-left') return 'anim-roster-in-left';
    return 'anim-char-bob';
  };

  const handleModalTestJurus = () => {
    if (isModalSlashing) return;
    setIsModalSlashing(true);
    const heroData = HERO_ROSTER[previewHero];
    const picked = heroData.quotes[Math.floor(Math.random() * heroData.quotes.length)];
    setModalQuote(picked);
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
    if (modalQuoteTimeoutRef.current) clearTimeout(modalQuoteTimeoutRef.current);
    modalQuoteTimeoutRef.current = setTimeout(() => {
      setModalQuote(null);
      setIsModalSlashing(false);
    }, 1400);
  };

  useEffect(() => {
    if (!isCharModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevHero();
      } else if (e.key === 'ArrowRight') {
        handleNextHero();
      } else if (e.key === 'Escape') {
        setIsCharModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCharModalOpen, previewHero]);

  const handleRunnerClick = () => {
    if (isRunnerSlashing || isUltActive) return;
    setIsRunnerSlashing(true);
    const heroData = HERO_ROSTER[activeHero];
    const picked = heroData.quotes[Math.floor(Math.random() * heroData.quotes.length)];
    setRunnerQuote(picked);
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }

    // Gain energy & attack demon boss
    setUltEnergy((prev) => Math.min(100, prev + 15));
    damageBoss(25);

    if (runnerSlashTimeoutRef.current) clearTimeout(runnerSlashTimeoutRef.current);
    runnerSlashTimeoutRef.current = setTimeout(() => {
      setIsRunnerSlashing(false);
      setRunnerQuote(null);
    }, 1050);
  };

  const handleDemonClick = () => {
    if (isBossKO) return;
    setUltEnergy((prev) => Math.min(100, prev + 15));
    damageBoss(25);
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
  };

  return (
    <div className="brutal-card px-4 pb-4 pt-5 xs:px-5 xs:pb-5 xs:pt-6 sm:p-7 mt-14 xs:mt-16 sm:mt-20 mb-5 sm:mb-7 relative bg-[var(--card-bg)]">
      {/* ======================================================== */}
      {/* SQUAD DIORAMA: SOLO GIYU CENTER + CORNER PET GUARDIANS   */}
      {/* BALANCED TRIPOD COMPOSITION: Spacious, zero crowding     */}
      {/* ======================================================== */}
      <div className="absolute -top-[48px] xs:-top-[54px] sm:-top-[58px] left-0 right-0 w-full flex items-end justify-between px-10 xs:px-14 sm:px-20 md:px-24 pointer-events-none z-20 select-none">
        {/* 1. Left: Pixel Neko Gamer (Corner Shoulder Companion) */}
        <div
          onClick={handleNekoClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleNekoClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`flex flex-col items-center anim-char-bob pointer-events-auto cursor-pointer group transition-transform ${
            nekoState === 'meow' ? '-translate-y-2' : ''
          }`}
          title="Neko Gamer (Klik untuk Meow!)"
        >
          <div className="bg-[#ff007f] text-white font-pixel text-[5px] xs:text-[6px] px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
            {nekoState === 'meow' ? 'PURR!' : 'MEOW!'}
          </div>
          <svg width="38" height="38" viewBox="0 0 32 32" className="w-[36px] h-[36px] xs:w-[44px] xs:h-[44px] drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
            <g className="anim-tail">
              <rect x="23" y="16" width="3" height="3" fill="#ff9900" stroke="#000" strokeWidth="0.75" />
              <rect x="25" y="13" width="3" height="4" fill="#ffffff" stroke="#000" strokeWidth="0.75" />
            </g>
            <polygon points="7,4 12,4 7,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
            <polygon points="25,4 20,4 25,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
            <path d="M7,10 Q16,4 25,10" fill="none" stroke="#00ffff" strokeWidth="2.2" />
            <rect x="5" y="9" width="3" height="5" rx="1" fill="#00ffff" stroke="#000" strokeWidth="0.7" />
            <rect x="24" y="9" width="3" height="5" rx="1" fill="#00ffff" stroke="#000" strokeWidth="0.7" />
            <rect x="8" y="8" width="16" height="11" rx="2" fill="#ff9900" stroke="#000" strokeWidth="1" />
            <rect x="12" y="13" width="8" height="5" fill="#ffffff" />
            <rect x="10" y="11" width="3" height="3" fill="#000000" />
            <rect x="10" y="11" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="19" y="11" width="3" height="3" fill="#000000" />
            <rect x="19" y="11" width="1.5" height="1.5" fill="#ffffff" />
            <polygon points="15,14 17,14 16,15.5" fill="#ff007f" />
            <rect x="10" y="18" width="12" height="9" fill="#ff9900" stroke="#000" strokeWidth="0.9" />
            <rect x="12" y="18" width="8" height="6" fill="#ffffff" />
            <rect x="11" y="26" width="4" height="4" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
            <rect x="17" y="26" width="4" height="4" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
          </svg>
        </div>

        {/* 2. Center: GIYU TOMIOKA (Hashira Air) - Interactive Katana Slash Action */}
        <div
          onClick={handleGiyuClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleGiyuClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`flex flex-col items-center relative -mb-0.5 pointer-events-auto cursor-pointer group ${
            giyuState === 'slashing' ? 'anim-action-slash' : 'anim-char-bob'
          }`}
          title="Giyu Tomioka (Klik untuk tebasan air!)"
        >
          {/* Action Tag: Pure Name in Idle, Water Slash during action (No Emoji) */}
          <div className="bg-cyan-500 text-black font-pixel text-[6px] xs:text-[6.5px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-30 flex items-center font-bold group-hover:scale-105 transition-transform">
            <span>{giyuState === 'slashing' ? 'WATER SLASH!' : 'GIYU TOMIOKA'}</span>
          </div>

          {/* Water Slash Wave Effect Overlay when slashing (Aligned directly with Nichirin blade trajectory) */}
          {giyuState === 'slashing' && (
            <div className="absolute top-[-6px] xs:top-[-8px] sm:top-[-10px] left-1/2 -translate-x-1/2 pointer-events-none z-30 w-[180px] xs:w-[210px] sm:w-[250px] anim-water-slash">
              <svg viewBox="0 0 200 70" className="w-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
                <path d="M10,55 Q60,8 130,20 T190,5" fill="none" stroke="#00ffff" strokeWidth="6" strokeLinecap="round" />
                <path d="M15,57 Q65,12 135,22 T195,7" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="45" cy="24" r="3" fill="#00f0ff" />
                <circle cx="85" cy="14" r="4" fill="#ffffff" />
                <circle cx="120" cy="12" r="2.5" fill="#00f0ff" />
                <circle cx="160" cy="16" r="3.5" fill="#ffffff" />
                <circle cx="180" cy="8" r="2" fill="#00f0ff" />
              </svg>
            </div>
          )}

          <div className="relative">
            <div className="absolute -inset-1 bg-cyan-400/20 blur-sm rounded-full anim-water"></div>
            <svg width="60" height="60" viewBox="0 0 36 36" className="xs:w-[68px] xs:h-[68px] relative z-10 drop-shadow-[3px_3px_0px_#000] group-hover:scale-105 transition-transform">
              {/* Ponytail Hair */}
              <polygon points="8,10 3,16 6,24 10,21 10,14" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <rect x="7" y="13" width="3" height="2" fill="#38bdf8" />
              {/* Spiky Black Hair */}
              <polygon points="10,5 18,3 26,5 28,11 26,13 10,13 8,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
              <polygon points="7,8 4,11 9,11" fill="#0f172a" />
              <polygon points="27,8 30,11 25,11" fill="#0f172a" />
              {/* Face */}
              <rect x="10" y="8" width="16" height="11" fill="#fde68a" stroke="#000" strokeWidth="1" />
              <polygon points="10,8 14,13 16,9 20,13 22,8" fill="#0f172a" />
              {/* Eyes */}
              <rect x="12" y="12" width="3" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
              <rect x="13" y="12" width="1" height="1" fill="#ffffff" />
              <rect x="21" y="12" width="3" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
              <rect x="22" y="12" width="1" height="1" fill="#ffffff" />
              <line x1="16" y1="16" x2="20" y2="16" stroke="#000" strokeWidth="0.75" />
              {/* Split Haori */}
              <path d="M10,19 L18,19 L18,29 L8,29 L8,22 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.9" />
              <path d="M18,19 L26,19 L28,22 L28,29 L18,29 Z" fill="#15803d" stroke="#000" strokeWidth="0.9" />
              <rect x="19" y="20" width="3" height="3" fill="#eab308" />
              <rect x="23" y="20" width="3" height="3" fill="#ea580c" />
              <rect x="21" y="23" width="3" height="3" fill="#eab308" />
              <polygon points="15,19 21,19 18,25" fill="#0f172a" />
              <line x1="18" y1="19" x2="18" y2="24" stroke="#ffffff" strokeWidth="0.8" />
              <rect x="13" y="25" width="10" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.6" />

              {/* Nichirin Blade: Sheathed in idle, Drawn in action */}
              {giyuState === 'idle' ? (
                <g>
                  <line x1="5" y1="28" x2="14" y2="23" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="28" x2="14" y2="23" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="13.5" y="21.5" width="2" height="2" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />
                  <line x1="14" y1="22" x2="18" y2="20" stroke="#ffffff" strokeWidth="1.8" />
                </g>
              ) : (
                <g>
                  <line x1="18" y1="20" x2="34" y2="9" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="18" y1="20" x2="34" y2="9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="18" cy="20" r="2" fill="#000" stroke="#00f0ff" strokeWidth="0.8" />
                </g>
              )}

              {/* Legs dangling */}
              <rect x="12" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <line x1="12" y1="31" x2="16" y2="31" stroke="#ffffff" strokeWidth="0.75" />
              <rect x="11.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
              <rect x="20" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <line x1="20" y1="31" x2="24" y2="31" stroke="#ffffff" strokeWidth="0.75" />
              <rect x="19.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
            </svg>
          </div>
        </div>

        {/* 3. Right: Shiba Mail Courier & Mini Ghost (Corner Shoulder Companion) */}
        <div
          onClick={handleShibaClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleShibaClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', animationDelay: '-1.2s' }}
          className={`flex items-end gap-1 anim-char-bob pointer-events-auto cursor-pointer group transition-transform ${
            shibaState === 'bark' ? '-translate-y-2' : ''
          }`}
          title="Shiba Courier (Klik untuk Woof!)"
        >
          <div className="flex flex-col items-center">
            <div className="bg-[#ffe600] text-black font-pixel text-[5px] xs:text-[6px] px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
              {shibaState === 'bark' ? 'WOOF!' : 'MAIL!'}
            </div>
            <svg width="38" height="38" viewBox="0 0 32 32" className="w-[36px] h-[36px] xs:w-[44px] xs:h-[44px] drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
              <polygon points="7,4 12,4 9,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
              <polygon points="25,4 20,4 23,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
              <rect x="8" y="6" width="16" height="4" fill="#1e3a8a" stroke="#000" strokeWidth="0.7" rx="1" />
              <circle cx="16" cy="8" r="1.2" fill="#ffe600" />
              <rect x="8" y="10" width="16" height="11" fill="#d97706" stroke="#000" strokeWidth="0.9" rx="1" />
              <rect x="10" y="13" width="2.5" height="2.5" fill="#000" />
              <rect x="19.5" y="13" width="2.5" height="2.5" fill="#000" />
              <rect x="12" y="15" width="8" height="4" fill="#ffffff" />
              <polygon points="15,16 17,16 16,17" fill="#000" />
              <rect x="11" y="19" width="10" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
              <rect x="14.5" y="20.5" width="3" height="2" fill="#ff0055" />
              <rect x="9" y="25" width="4" height="4" rx="1" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
              <rect x="19" y="25" width="4" height="4" rx="1" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
            </svg>
          </div>
          <div className="hidden xs:block -mb-1 anim-water">
            <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-[2px_2px_0px_#000]">
              <path d="M6,10 A6,6 0 0,1 18,10 L18,20 L15,18 L12,20 L9,18 L6,20 Z" fill="#ff007f" stroke="#000" strokeWidth="1" />
              <rect x="8" y="9" width="3" height="3" fill="#fff" />
              <rect x="9" y="10" width="1.5" height="2" fill="#00f0ff" />
              <rect x="13" y="9" width="3" height="3" fill="#fff" />
              <rect x="14" y="10" width="1.5" height="2" fill="#00f0ff" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top-Left Action Control: Dark/Light Mode Toggle */}
      {onToggleTheme && (
        <div className="absolute top-2.5 left-2.5 xs:top-3 xs:left-3 sm:top-4 sm:left-4 z-30">
          <button
            type="button"
            onClick={onToggleTheme}
            className="brutal-btn w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] dark:bg-zinc-800 text-black dark:text-[var(--color-yellow)] border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] group cursor-pointer transition-colors p-0"
            title="Ganti Tema Gelap / Terang"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 text-[var(--color-yellow)] fill-[var(--color-yellow)] group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 text-black group-hover:-rotate-45 transition-transform duration-300" />
            )}
          </button>
        </div>
      )}

      {/* Top-Right Action Control: VIP Crown Button with Hanging Spiderman */}
      <div className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 sm:top-4 sm:right-4 z-30 flex flex-col items-center">
        {isVipUnlocked ? (
          <div
            className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] relative"
            title="Domain VIP Aktif (Mode Eksklusif)"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-black text-black animate-pulse" />
            {/* Spiderweb Anchor Knot at Bottom */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-white dark:bg-zinc-200 border border-black rounded-full pointer-events-none z-10" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVipModal}
            className="brutal-btn w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-white dark:bg-zinc-800 hover:bg-[var(--color-yellow)] dark:hover:bg-[var(--color-yellow)] text-amber-500 hover:text-black dark:hover:text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] group cursor-pointer transition-colors p-0 relative"
            title="Klik untuk membuka Domain VIP (Masukkan CDK)"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 group-hover:fill-black group-hover:rotate-12 transition-all duration-200" />
            {/* Spiderweb Anchor Knot at Bottom */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-white dark:bg-zinc-200 border border-black rounded-full pointer-events-none z-10" />
          </button>
        )}

        {/* ======================================================== */}
        {/* SPIDERMAN HANGING UNDER CROWN BOX RIG                    */}
        {/* ======================================================== */}
        <div
          onClick={handleSpideyClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleSpideyClick(e);
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className="relative pt-0 anim-spidey-swing select-none pointer-events-auto cursor-pointer group"
          title="Spiderman di Kotak Mahkota! (Klik untuk aksi THWIP!)"
        >
          {/* Tali Benang Jaring Putih (Spiderweb Thread) */}
          <div className="w-[1.5px] xs:w-[2px] h-5 xs:h-6 sm:h-7 bg-gradient-to-b from-white via-zinc-200 to-zinc-300 dark:from-zinc-100 dark:to-zinc-400 mx-auto border-x border-black/40 relative">
            <div className="absolute top-1.5 -left-[1.5px] w-1 h-1 bg-white border border-black/50 rounded-full" />
          </div>

          {/* Speech Tag Bubble (Safe Leftward Anchor) */}
          <div className="absolute -left-16 sm:-left-20 top-4 sm:top-5 bg-red-600 text-white font-pixel text-[4.5px] xs:text-[5px] sm:text-[6px] px-1 xs:px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-40 pointer-events-none animate-pulse">
            {SPIDEY_QUOTES[spideyQuoteIdx]}
          </div>

          {/* THWIP Action FX Pop */}
          {isThwipActive && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-300 text-black font-pixel text-[6px] xs:text-[7px] sm:text-[8px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] font-black whitespace-nowrap z-40 pointer-events-none anim-thwip-pop">
              THWIP!
            </div>
          )}

          {/* Spiderman Sprite Vector SVG */}
          <div className={`transition-transform duration-200 ${isSpideyFlipping ? 'anim-spidey-flip' : 'group-hover:scale-105'}`}>
            <svg
              width="34"
              height="42"
              viewBox="0 0 38 46"
              className="w-[28px] h-[34px] xs:w-[32px] xs:h-[38px] sm:w-[36px] sm:h-[44px] drop-shadow-[1.5px_1.5px_0px_#000] overflow-visible"
            >
              {/* KAKI TERBALIK MELILIT JARING */}
              <g id="spideyLegs">
                <circle cx="19" cy="2" r="2.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                <path d="M19,3 Q10,6 9,12 Q12,15 15,16" fill="none" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" />
                <path d="M9,3 L15,4 L13,10 L8,8 Z" fill="#dc2626" stroke="#000" strokeWidth="0.8" />
                <path d="M19,3 Q28,6 29,12 Q26,15 23,16" fill="none" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" />
                <path d="M29,3 L23,4 L25,10 L30,8 Z" fill="#dc2626" stroke="#000" strokeWidth="0.8" />
              </g>

              {/* BADAN TERBALIK (TORSO: SPIDER EMBLEM & RED-BLUE SUIT) */}
              <g id="spideyTorso">
                <path d="M14,14 L24,14 L26,27 L12,27 Z" fill="#ef4444" stroke="#000" strokeWidth="1" />
                <polygon points="12,16 14,16 13,27 11,27" fill="#1d4ed8" stroke="#000" strokeWidth="0.6" />
                <polygon points="26,16 24,16 25,27 27,27" fill="#1d4ed8" stroke="#000" strokeWidth="0.6" />
                <ellipse cx="19" cy="20" rx="1.8" ry="2.4" fill="#000000" />
                <path d="M19,19 L15,16 M19,19 L23,16 M19,21 L14,24 M19,21 L24,24" stroke="#000" strokeWidth="0.7" strokeLinecap="round" />
              </g>

              {/* TANGAN TERBALIK */}
              <g id="spideyArms">
                <path d="M13,16 Q8,20 10,26" fill="none" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="10" cy="27" r="2" fill="#ef4444" stroke="#000" strokeWidth="0.7" />
                <path d="M25,16 Q30,20 28,26" fill="none" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="28" cy="27" r="2" fill="#ef4444" stroke="#000" strokeWidth="0.7" />
                <rect x="27.5" y="28" width="1.5" height="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.4" />
              </g>

              {/* KEPALA TERBALIK (MASK & SPIDER EYES) */}
              <g id="spideyHead">
                <ellipse cx="19" cy="36" rx="8.5" ry="9.5" fill="#ef4444" stroke="#000" strokeWidth="1.1" />
                <line x1="19" y1="27" x2="19" y2="45" stroke="#991b1b" strokeWidth="0.6" />
                <line x1="11" y1="36" x2="27" y2="36" stroke="#991b1b" strokeWidth="0.6" />
                <ellipse cx="19" cy="36" rx="5" ry="5.5" fill="none" stroke="#991b1b" strokeWidth="0.5" />
                <polygon points="13,33 18,33 15,40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="25,33 20,33 23,40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Title Header: Symmetrically Balanced, Protected from Overlap */}
      <div className="text-center mb-5 sm:mb-6 px-9 xs:px-11 sm:px-14">
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 brutal-badge bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] xs:text-[10px] sm:text-[11px] mb-2 sm:mb-2.5 font-mono-custom uppercase tracking-wide max-w-full truncate">
            <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[var(--color-orange)] icon-wiggle flex-shrink-0" />
            <span className="truncate">{badgeText}</span>
          </div>
        )}
        <h1 className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[var(--text-main)] mb-1.5 sm:mb-2">
          {titlePrefix}{' '}
          {titleHighlight && <span className="text-[var(--color-blue)]">{titleHighlight}</span>}
        </h1>
        {subtitle && (
          <p className="text-[var(--text-muted)] font-mono-custom text-[11px] xs:text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Email Input Display + Copy Button */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1 group min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-blue)] group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <input
            type="text"
            readOnly
            value={currentEmail || 'Memuat alamat email...'}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="brutal-input w-full font-mono-custom text-xs xs:text-sm sm:text-base md:text-lg py-2.5 xs:py-3 sm:py-3.5 pl-9 xs:pl-10 sm:pl-11 pr-3 sm:pr-4 font-bold text-center sm:text-left select-all cursor-pointer bg-white dark:bg-zinc-900 border-[2.5px] sm:border-[3.5px] border-[var(--border-color)] truncate"
          />
        </div>

        {/* Tombol SALIN */}
        <button
          onClick={handleCopyClick}
          className={`brutal-btn px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-2 group shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] ${
            copied
              ? 'bg-[var(--color-green)] text-white'
              : 'bg-[var(--color-blue)] text-white hover:bg-sky-600'
          }`}
          title="Salin ke Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 icon-bounce" />
              <span>TERSALIN!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
              <span>SALIN</span>
            </>
          )}
        </button>
      </div>

      {/* Control Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 xs:gap-2.5 pb-4 sm:pb-5 border-b-[2.5px] sm:border-b-[3px] border-dashed border-[var(--border-color)]">
        {/* Tombol EMAIL BARU */}
        <button
          onClick={handleRandomizeClick}
          className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Buat alamat acak baru"
        >
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
          <span className="truncate">EMAIL BARU</span>
        </button>

        {/* Tombol KUSTOM */}
        <button
          onClick={() => {
            playSound('pop');
            setIsModalOpen(true);
          }}
          className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Tentukan nama email kustom"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-45 transition-transform duration-200 flex-shrink-0" />
          <span className="truncate">KUSTOM</span>
        </button>

        {/* Tombol QR CODE */}
        {onOpenQrModal && (
          <button
            onClick={onOpenQrModal}
            className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 px-3 xs:px-3.5 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
            title="Tampilkan QR Code Alamat Email"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0 text-[var(--color-blue)]" />
            <span className="truncate">QR CODE</span>
          </button>
        )}

        {/* Tombol PILIH PAHLAWAN (ROSTER) */}
        <button
          onClick={() => {
            playSound('pop');
            setPreviewHero(activeHero);
            setIsCharModalOpen(true);
          }}
          className="brutal-btn bg-pink-500 text-white hover:bg-pink-600 px-3 xs:px-3.5 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Pilih Pahlawan Pelari (Character Select Roster)"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform flex-shrink-0 text-yellow-300" />
          <span className="truncate">ROSTER</span>
        </button>

        {/* Tombol SUARA NOTIFIKASI (Default: Mute) */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className={`brutal-btn px-2.5 xs:px-3 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] ${
              isSoundEnabled
                ? 'bg-[var(--color-purple)] text-white hover:bg-purple-700'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
            }`}
            title={
              isSoundEnabled
                ? 'Suara Notifikasi: AKTIF (Klik untuk Mute)'
                : 'Suara Notifikasi: SENYAP/MUTE (Klik untuk Bunyikan)'
            }
          >
            {isSoundEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-yellow)] flex-shrink-0" />
                <span className="hidden xs:inline">SUARA ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">MUTE</span>
              </>
            )}
          </button>
        )}

        {/* Animated Custom Domain Dropdown */}
        {availableDomains.length >= 1 && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-mono-custom font-bold text-[var(--text-muted)] uppercase hidden md:inline">
              Domain:
            </span>
            <DomainDropdown
              domains={availableDomains}
              selectedDomain={currentDomain}
              onSelect={onChangeDomain}
              isVipUnlocked={isVipUnlocked}
              onRequestVipUnlock={onRequestVipUnlock}
              className="w-full sm:w-auto flex-1"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ARCADE BATTLE HUD: BOSS HP & ULTIMATE ENERGY             */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 xs:gap-2.5 sm:gap-4 pt-2.5 xs:pt-3 pb-2.5 border-b border-dashed border-[var(--border-color)]">
        {/* Row 1 / Sisi Kiri: Boss Iblis HP & Combo Counter (Wide, Anti-Collapse) */}
        <div className="flex items-center gap-1.5 xs:gap-2 w-full sm:flex-1 sm:max-w-[320px]">
          <span className="font-pixel text-[6.5px] xs:text-[7.5px] sm:text-[8px] text-red-600 dark:text-red-400 font-bold whitespace-nowrap flex-shrink-0">
            IBLIS HP:
          </span>
          <div className="flex-1 min-w-[90px] xs:min-w-[120px] h-4 xs:h-4.5 bg-black border-2 border-black dark:border-zinc-700 relative overflow-hidden shadow-[1px_1px_0px_#000]">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${bossHp}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-[5.5px] xs:text-[6.5px] sm:text-[7px] text-white font-bold drop-shadow-[1px_1px_0px_#000]">
              {bossHp}/100
            </span>
          </div>
          {comboCount > 0 && !isBossKO && (
            <span className="font-pixel text-[5.5px] xs:text-[6.5px] bg-red-600 text-white px-1.5 py-0.5 border border-black animate-pulse whitespace-nowrap shadow-[1px_1px_0px_#000] flex-shrink-0">
              x{comboCount}
            </span>
          )}
          {demonKills > 0 && (
            <span
              className="font-pixel text-[5px] xs:text-[6px] sm:text-[6.5px] bg-yellow-400 text-black px-1.5 py-0.5 border border-black font-bold shadow-[1px_1px_0px_#000] flex-shrink-0 ml-auto sm:ml-0"
              title={`Total Iblis yang dikalahkan: ${demonKills}`}
            >
              {demonKills} KILLS
            </span>
          )}
        </div>

        {/* Row 2 / Sisi Kanan: Ultimate Meter Gauge & Tombol Jurus / Charge (Wide, Anti-Collapse) */}
        <div className="flex items-center gap-1.5 xs:gap-2 w-full sm:flex-1 sm:max-w-[340px] sm:justify-end">
          <span className="font-pixel text-[6.5px] xs:text-[7.5px] sm:text-[8px] text-[var(--color-blue)] font-bold whitespace-nowrap flex-shrink-0">
            ULT:
          </span>
          <div className={`flex-1 min-w-[90px] xs:min-w-[120px] h-4 xs:h-4.5 bg-black border-2 border-black dark:border-zinc-700 relative overflow-hidden shadow-[1px_1px_0px_#000] transition-all duration-200 ${isCharging ? 'ring-2 ring-cyan-400' : ''}`}>
            <div
              className={`h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-300 ${isCharging ? 'brightness-125' : ''}`}
              style={{ width: `${ultEnergy}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-[5.5px] xs:text-[6.5px] sm:text-[7px] text-white font-bold drop-shadow-[1px_1px_0px_#000]">
              {ultEnergy}%
            </span>
          </div>

          {/* Tombol Jurus Pamungkas & Charge Interaktif (Bisa Diklik untuk Isi Energi) */}
          <button
            type="button"
            onClick={handleChargeOrUltimate}
            disabled={isUltActive || isBossKO}
            className={`brutal-btn px-2.5 xs:px-3 py-1 font-pixel text-[6.5px] xs:text-[7.5px] sm:text-[8px] font-bold border-2 border-black flex-shrink-0 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 ${
              isBossKO
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
                : ultEnergy >= 100
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[2px_2px_0px_#000] cursor-pointer'
                : 'bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-black cursor-pointer'
            }`}
            title={
              isBossKO
                ? 'Iblis telah K.O.! Menunggu respawn...'
                : ultEnergy >= 100
                ? 'Jurus Pamungkas Siap! Klik untuk menyerang Iblis!'
                : `Klik untuk charge energi (+25%)! Sekarang: ${ultEnergy}%`
            }
          >
            <span>{isBossKO ? 'K.O.!' : ultEnergy >= 100 ? 'JURUS!' : 'CHARGE'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STRIP RUNNER ARENA (SPACIOUS, UNCONSTRAINED & BREATHING) */}
      {/* ======================================================== */}
      <div className="w-full relative overflow-visible pt-8 xs:pt-10 sm:pt-12 pb-4 xs:pb-5 sm:pb-6 border-b-[2.5px] sm:border-b-[3px] border-dashed border-[var(--border-color)]">
        {/* Manga Speedlines Runner Background Layer (Bursting Outward, Behind Characters) */}
        {isUltActive && (
          <div className="absolute -inset-x-4 -inset-y-2 z-0 pointer-events-none anim-manga-speedlines opacity-45 rounded" />
        )}

        {/* Ultimate Banner Floating Notification (Mobile Screen Safe & Centered) */}
        {isUltActive && (
          <div className="absolute -top-6 xs:-top-7 sm:-top-8 left-0 right-0 z-40 flex justify-center pointer-events-none px-2">
            <div className="font-pixel text-[7.5px] xs:text-[8.5px] sm:text-xs text-yellow-300 bg-black/95 border-2 border-yellow-400 px-2.5 xs:px-3 py-0.5 xs:py-1 shadow-[2px_2px_0px_#ff0055] whitespace-nowrap truncate animate-pulse max-w-[90vw]">
              {HERO_ROSTER[activeHero].ultBanner}
            </div>
          </div>
        )}

        {/* Arcade K.O.! Splash Overlay - Centered Position Wrapper (Immune to Shift & Clipping) */}
        {isBossKO && (
          <div className="absolute -top-8 xs:-top-10 sm:-top-14 left-0 right-0 z-50 flex justify-center pointer-events-none px-2">
            <div className="flex flex-col items-center anim-arcade-ko whitespace-nowrap max-w-[95vw]">
              <div className="font-pixel text-xl xs:text-2xl sm:text-4xl text-yellow-300 bg-red-600 border-2 sm:border-4 border-black px-4 xs:px-6 sm:px-8 py-1 xs:py-1.5 sm:py-2 shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] tracking-widest animate-bounce">
                K.O.!
              </div>
              <div className="font-pixel text-[6px] xs:text-[7.5px] sm:text-[9px] text-white bg-black px-2.5 xs:px-3 py-0.5 xs:py-1 mt-0.5 sm:mt-1 border sm:border-2 border-yellow-400 font-bold uppercase shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 xs:gap-2">
                <span className="text-yellow-400 font-black">VICTORY!</span>
                <span>TOTAL DIBASMI: {demonKills}</span>
              </div>
              <div className="font-pixel text-[5.5px] xs:text-[6.5px] sm:text-[7.5px] text-black bg-yellow-300 px-2 py-0.5 mt-0.5 border border-black font-bold shadow-[1px_1px_0px_#000]">
                RESPAWN: <span className="font-black text-red-600">{respawnCountdown}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Runner Arena Inner Row */}
        <div className="w-full flex items-end justify-between relative z-20 overflow-visible">
          {/* UJUNG KIRI: CHASE DUO (Hero Runner chasing Demon Target - Wide Breathing Room) */}
          <div className={`flex items-end gap-8 xs:gap-11 sm:gap-16 relative transition-all duration-150 overflow-visible ${isRefreshing ? 'sprint-active' : ''}`}>
            {/* 1. Hero Runner in Place on Strip (Stable Speech Bubble & Fluid Sprite Stride) */}
            <div
              onClick={handleRunnerClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleRunnerClick();
              }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className="relative flex items-end cursor-pointer group pointer-events-auto select-none min-w-[50px] min-h-[44px] flex-shrink-0 overflow-visible"
              title={`${HERO_ROSTER[activeHero].name} (Klik untuk jurus serangan!)`}
            >
              {/* Speech / Action Bubble (Anchored on Left for Mobile, Staggered Floor Level) */}
              <div
                className={`absolute -top-6 xs:-top-7 left-0 xs:-left-1 sm:left-1/2 sm:-translate-x-1/2 font-pixel text-[5px] xs:text-[5.5px] sm:text-[6.5px] px-1.5 xs:px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-30 pointer-events-none transition-all duration-200 ${
                  isBossKO
                    ? 'opacity-100 scale-100 bg-emerald-400 text-black font-black animate-pulse'
                    : runnerQuote || isRefreshing || isRunnerSlashing || isUltActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-85 group-hover:opacity-100 scale-95'
                } ${
                  isBossKO
                    ? ''
                    : isUltActive
                    ? 'bg-red-500 text-white font-black animate-pulse'
                    : isRunnerSlashing
                    ? 'bg-cyan-400 text-black font-black'
                    : isRefreshing
                    ? 'bg-cyan-400 text-black font-black animate-pulse'
                    : 'bg-[var(--color-yellow)] text-black font-bold'
                }`}
              >
                {isBossKO
                  ? 'VICTORY!'
                  : isUltActive
                  ? runnerQuote || HERO_ROSTER[activeHero].ultName
                  : isRunnerSlashing
                  ? runnerQuote || HERO_ROSTER[activeHero].quotes[0]
                  : isRefreshing
                  ? 'HASHIRA SYNC'
                  : runnerQuote || HERO_ROSTER[activeHero].badgeName}
              </div>

              {/* Elemental Slash Arc Effect Overlay (Mobile Proportional, Never Clipped) */}
              {(isRunnerSlashing || isUltActive) && (
                <div
                  className={`absolute -top-4 xs:-top-5 sm:-top-6 -right-12 xs:-right-16 sm:-right-20 pointer-events-none z-30 w-[110px] xs:w-[135px] sm:w-[170px] overflow-visible ${
                    activeHero === 'tanjiro'
                      ? 'anim-flame-arc-fx'
                      : activeHero === 'zenitsu'
                      ? 'anim-thunder-arc-fx'
                      : activeHero === 'shinobu'
                      ? 'anim-poison-arc-fx'
                      : 'anim-water-arc-fx'
                  }`}
                >
                  {activeHero === 'tanjiro' ? (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(255,80,0,0.95)]">
                      <path d="M10,48 Q50,6 110,18 T155,5" fill="none" stroke="#ff4500" strokeWidth="6" strokeLinecap="round" />
                      <path d="M14,50 Q54,10 114,20 T158,7" fill="none" stroke="#ffe600" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="45" cy="20" r="3.5" fill="#ff4500" />
                      <circle cx="90" cy="14" r="4" fill="#ffffff" />
                      <circle cx="130" cy="12" r="2.5" fill="#facc15" />
                    </svg>
                  ) : activeHero === 'zenitsu' ? (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(255,230,0,0.95)]">
                      <polyline points="10,45 40,25 65,35 110,12 135,22 155,5" fill="none" stroke="#ffe600" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="12,46 42,26 67,36 112,13 137,23 157,6" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : activeHero === 'shinobu' ? (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(192,132,252,0.95)]">
                      <path d="M10,48 Q50,6 110,18 T155,5" fill="none" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
                      <path d="M14,50 Q54,10 114,20 T158,7" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="50" cy="18" r="3" fill="#c084fc" />
                      <circle cx="95" cy="15" r="3.5" fill="#22d3ee" />
                      <circle cx="135" cy="10" r="2.5" fill="#ffffff" />
                    </svg>
                  ) : activeHero === 'nezuko' ? (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(244,114,182,0.95)]">
                      <path d="M10,42 Q60,12 120,22 T155,8" fill="none" stroke="#f472b6" strokeWidth="5.5" strokeLinecap="round" />
                      <circle cx="55" cy="22" r="3.5" fill="#f43f5e" />
                      <circle cx="105" cy="18" r="4" fill="#ffffff" />
                      <circle cx="140" cy="12" r="2.5" fill="#fed7aa" />
                    </svg>
                  ) : activeHero === 'inosuke' ? (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]">
                      <line x1="15" y1="12" x2="145" y2="48" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1="15" y1="48" x2="145" y2="12" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 160 60" className="w-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.95)]">
                      <path d="M10,48 Q50,6 110,18 T155,5" fill="none" stroke="#00ffff" strokeWidth="6" strokeLinecap="round" />
                      <path d="M14,50 Q54,10 114,20 T158,7" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="45" cy="20" r="3" fill="#00f0ff" />
                      <circle cx="90" cy="14" r="4" fill="#ffffff" />
                      <circle cx="130" cy="12" r="2.5" fill="#00f0ff" />
                    </svg>
                  )}
                </div>
              )}

              {/* Wind Effects (Fluid Bezier curves, floating water petals, dust puffs) */}
              <div className="absolute -inset-x-6 -top-2 bottom-0 pointer-events-none z-10 overflow-visible">
                <div className="absolute top-2 right-9 w-8 xs:w-10 h-[1.5px] bg-cyan-300 dark:bg-cyan-400 rounded-full fluid-wind-1" />
                <div className="absolute top-4.5 right-7 w-10 xs:w-12 h-[2px] bg-white rounded-full fluid-wind-2" />
                <div className="absolute top-7 right-11 w-7 xs:w-9 h-[1.5px] bg-cyan-200 dark:bg-cyan-300 rounded-full fluid-wind-3" />
                <div className="absolute top-9 right-6 w-9 xs:w-11 h-[1.5px] bg-sky-300 dark:bg-sky-400 rounded-full fluid-wind-4" />
                <div className="absolute top-3.5 right-8 w-1.5 h-1.5 bg-cyan-400 rounded-sm petal-float-1" />
                <div className="absolute top-6.5 right-11 w-1.5 h-1.5 bg-white rounded-full petal-float-2" />
                <div className="absolute bottom-0 left-1 w-2 h-2 bg-zinc-400/80 rounded-full fluid-dust-1" />
                <div className="absolute bottom-0 left-3 w-1.5 h-1.5 bg-zinc-300/70 rounded-full fluid-dust-2" />
              </div>

              {/* Character Sprite Container (With Dynamic Procedural Physics) */}
              <div
                className={`relative z-20 overflow-visible ${
                  isBossKO
                    ? 'anim-victory-hop'
                    : isUltActive
                    ? 'anim-ult-lunge-sprint'
                    : isRunnerSlashing
                    ? 'anim-slash-lunge-action'
                    : activeHero === 'nezuko'
                    ? 'anim-nezuko-stride'
                    : activeHero === 'shinobu'
                    ? 'anim-shinobu-stride'
                    : 'anim-giyu-stride'
                }`}
              >
                {/* 1. GIYU TOMIOKA */}
                {activeHero === 'giyu' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 38 34"
                    className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />
                    <g className="sprite-frame-a">
                      <polygon points="11,11 3,13 0,19 5,22 9,17" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                      <rect x="7" y="13.5" width="2.2" height="2" fill="#38bdf8" />
                      <line x1="2" y1="17" x2="6" y2="16" stroke="#38bdf8" strokeWidth="0.7" />
                      <rect x="8" y="24" width="3" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <rect x="8" y="27" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                      <rect x="7.5" y="29.5" width="3.5" height="1.8" fill="#d97706" rx="0.5" />
                      <rect x="22" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                      <circle cx="23.5" cy="23.5" r="1.5" fill="#fde68a" />
                      <polygon points="12,5 20,3 28,5 30,11 28,13 12,13 10,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
                      <polygon points="9,8 6,11 11,11" fill="#0f172a" />
                      <polygon points="29,8 32,11 27,11" fill="#0f172a" />
                      <rect x="12" y="8" width="16" height="10" fill="#fde68a" stroke="#000" strokeWidth="0.9" rx="0.5" />
                      <polygon points="12,8 16,12 18,9 22,12 24,8" fill="#0f172a" />
                      <rect x="20" y="11" width="3.5" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
                      <rect x="22" y="11" width="1.2" height="1" fill="#ffffff" />
                      <line x1="20" y1="15" x2="24" y2="15" stroke="#000" strokeWidth="0.75" />
                      <path d="M12,17 L18,17 L17,25 L7,25 L6,20 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
                      <path d="M18,17 L26,17 L28,21 L27,26 L18,25 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                      <rect x="19" y="18" width="2.5" height="2.5" fill="#eab308" />
                      <rect x="23" y="18" width="2.5" height="2.5" fill="#ea580c" />
                      <rect x="21" y="21" width="2.5" height="2.5" fill="#eab308" />
                      <polygon points="16,17 21,17 19,23" fill="#0f172a" />
                      <line x1="19" y1="17" x2="19" y2="22" stroke="#ffffff" strokeWidth="0.7" />
                      <rect x="14" y="23" width="9" height="1.8" fill="#ffffff" stroke="#000" strokeWidth="0.6" />
                      <line x1="5" y1="27" x2="15" y2="22" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="5" y1="27" x2="15" y2="22" stroke="#0284c7" strokeWidth="1" strokeLinecap="round" />
                      <rect x="14" y="21" width="1.8" height="1.8" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />
                      <rect x="15" y="24" width="3" height="7" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <rect x="15" y="27.5" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                      <rect x="15.5" y="31" width="3.8" height="1.8" fill="#d97706" rx="0.5" />
                      <rect x="16" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                      <circle cx="18" cy="23.5" r="1.5" fill="#fde68a" />
                    </g>
                    <g className="sprite-frame-b">
                      <polygon points="11,10 2,11 0,16 6,19 9,15" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                      <rect x="7" y="12.5" width="2.2" height="2" fill="#38bdf8" />
                      <line x1="1" y1="15" x2="5" y2="14" stroke="#38bdf8" strokeWidth="0.7" />
                      <rect x="7" y="24" width="3" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <rect x="7" y="27" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                      <rect x="6.5" y="29.5" width="3.5" height="1.8" fill="#d97706" rx="0.5" />
                      <rect x="19" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                      <circle cx="21" cy="23.5" r="1.5" fill="#fde68a" />
                      <polygon points="12,5 20,3 28,5 30,11 28,13 12,13 10,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
                      <polygon points="9,8 6,11 11,11" fill="#0f172a" />
                      <polygon points="29,8 32,11 27,11" fill="#0f172a" />
                      <rect x="12" y="8" width="16" height="10" fill="#fde68a" stroke="#000" strokeWidth="0.9" rx="0.5" />
                      <polygon points="12,8 16,12 18,9 22,12 24,8" fill="#0f172a" />
                      <rect x="20" y="11" width="3.5" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
                      <rect x="22" y="11" width="1.2" height="1" fill="#ffffff" />
                      <line x1="20" y1="15" x2="24" y2="15" stroke="#000" strokeWidth="0.75" />
                      <path d="M12,17 L18,17 L16,24 L5,24 L4,19 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
                      <path d="M18,17 L26,17 L29,19 L28,24 L18,24 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                      <rect x="19" y="17.5" width="2.5" height="2.5" fill="#eab308" />
                      <rect x="23" y="17.5" width="2.5" height="2.5" fill="#ea580c" />
                      <rect x="21" y="20.5" width="2.5" height="2.5" fill="#eab308" />
                      <polygon points="16,17 21,17 19,23" fill="#0f172a" />
                      <line x1="19" y1="17" x2="19" y2="22" stroke="#ffffff" strokeWidth="0.7" />
                      <rect x="14" y="23" width="9" height="1.8" fill="#ffffff" stroke="#000" strokeWidth="0.6" />
                      <line x1="5" y1="26" x2="15" y2="22" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="5" y1="26" x2="15" y2="22" stroke="#0284c7" strokeWidth="1" strokeLinecap="round" />
                      <rect x="14" y="21" width="1.8" height="1.8" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />
                      <rect x="14" y="24" width="3" height="7" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <rect x="14" y="27.5" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                      <rect x="14.5" y="31" width="3.8" height="1.8" fill="#d97706" rx="0.5" />
                      <rect x="15" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                      <circle cx="16.5" cy="23.5" r="1.5" fill="#fde68a" />
                    </g>
                  </svg>
                )}

                {/* 2. TANJIRO KAMADO */}
                {activeHero === 'tanjiro' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 38 34"
                    className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />
                    <g className="sprite-frame-a">
                      <polygon points="15,4 23,4 27,9 25,17 13,17 11,9" fill="#450a0a" stroke="#000" strokeWidth="0.8" />
                      <rect x="14" y="8" width="10" height="7" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <polygon points="15,8 17,9 15,11" fill="#b91c1c" />
                      <rect x="13" y="12" width="1.5" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.4" />
                      <rect x="19" y="10" width="2" height="2" fill="#78350f" />
                      <rect x="23" y="10" width="1.5" height="1.8" fill="#78350f" />
                      <path d="M11,17 L27,17 L29,25 L9,25 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                      <rect x="13" y="18" width="3" height="3" fill="#000000" />
                      <rect x="19" y="18" width="3" height="3" fill="#000000" />
                      <rect x="25" y="18" width="3" height="3" fill="#000000" />
                      <rect x="16" y="21" width="3" height="3" fill="#000000" />
                      <rect x="22" y="21" width="3" height="3" fill="#000000" />
                      <rect x="12" y="24" width="15" height="2" fill="#000000" stroke="#000" strokeWidth="0.7" transform="rotate(-18 12 24)" />
                      <rect x="13" y="25" width="4" height="6" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <rect x="21" y="25" width="4" height="4.5" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                    </g>
                    <g className="sprite-frame-b">
                      <polygon points="15,4 23,4 27,9 25,17 13,17 11,9" fill="#450a0a" stroke="#000" strokeWidth="0.8" />
                      <rect x="14" y="8" width="10" height="7" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <polygon points="15,8 17,9 15,11" fill="#b91c1c" />
                      <rect x="13" y="12" width="1.5" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.4" />
                      <rect x="19" y="10" width="2" height="2" fill="#78350f" />
                      <rect x="23" y="10" width="1.5" height="1.8" fill="#78350f" />
                      <path d="M11,17 L27,17 L29,24 L9,24 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                      <rect x="13" y="17.5" width="3" height="3" fill="#000000" />
                      <rect x="19" y="17.5" width="3" height="3" fill="#000000" />
                      <rect x="25" y="17.5" width="3" height="3" fill="#000000" />
                      <rect x="16" y="20.5" width="3" height="3" fill="#000000" />
                      <rect x="22" y="20.5" width="3" height="3" fill="#000000" />
                      <rect x="11" y="23" width="15" height="2" fill="#000000" stroke="#000" strokeWidth="0.7" transform="rotate(-12 11 23)" />
                      <rect x="21" y="25" width="4" height="6" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <rect x="11" y="25" width="4" height="4.5" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                    </g>
                  </svg>
                )}

                {/* 3. SMOL NEZUKO */}
                {activeHero === 'nezuko' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 34 32"
                    className="w-[44px] h-[38px] xs:w-[50px] xs:h-[44px] sm:w-[54px] sm:h-[48px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="17" cy="30" rx="6" ry="1.2" fill="#000000" opacity="0.45" />
                    <g className="fast-frame-a">
                      <polygon points="10,5 24,5 28,14 26,24 8,24 6,14" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <polygon points="4,16 8,26 12,22 8,16" fill="#f97316" />
                      <polygon points="28,16 32,24 26,22 26,16" fill="#f97316" />
                      <rect x="11" y="8" width="12" height="8" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <circle cx="14" cy="11" r="1.5" fill="#f43f5e" />
                      <circle cx="20" cy="11" r="1.5" fill="#f43f5e" />
                      <rect x="13" y="13.5" width="8" height="3" fill="#84cc16" stroke="#000" strokeWidth="0.7" rx="1" />
                      <path d="M10,17 L24,17 L25,26 L9,26 Z" fill="#f472b6" stroke="#000" strokeWidth="0.8" />
                      <rect x="6" y="17" width="5" height="3" fill="#f472b6" stroke="#000" strokeWidth="0.6" transform="rotate(-30 6 17)" />
                      <rect x="23" y="17" width="5" height="3" fill="#f472b6" stroke="#000" strokeWidth="0.6" transform="rotate(30 23 17)" />
                      <rect x="11" y="26" width="3.5" height="4" fill="#18181b" stroke="#000" strokeWidth="0.6" />
                      <rect x="19" y="26" width="3.5" height="3" fill="#18181b" stroke="#000" strokeWidth="0.6" />
                    </g>
                    <g className="fast-frame-b">
                      <polygon points="10,5 24,5 28,14 26,24 8,24 6,14" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <polygon points="4,16 8,26 12,22 8,16" fill="#f97316" />
                      <polygon points="28,16 32,24 26,22 26,16" fill="#f97316" />
                      <rect x="11" y="8" width="12" height="8" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <circle cx="14" cy="11" r="1.5" fill="#f43f5e" />
                      <circle cx="20" cy="11" r="1.5" fill="#f43f5e" />
                      <rect x="13" y="13.5" width="8" height="3" fill="#84cc16" stroke="#000" strokeWidth="0.7" rx="1" />
                      <path d="M10,17 L24,17 L25,26 L9,26 Z" fill="#f472b6" stroke="#000" strokeWidth="0.8" />
                      <rect x="6" y="18" width="5" height="3" fill="#f472b6" stroke="#000" strokeWidth="0.6" transform="rotate(20 6 18)" />
                      <rect x="23" y="18" width="5" height="3" fill="#f472b6" stroke="#000" strokeWidth="0.6" transform="rotate(-20 23 18)" />
                      <rect x="19" y="26" width="3.5" height="4" fill="#18181b" stroke="#000" strokeWidth="0.6" />
                      <rect x="11" y="26" width="3.5" height="3" fill="#18181b" stroke="#000" strokeWidth="0.6" />
                    </g>
                  </svg>
                )}

                {/* 4. INOSUKE HASHIBIRA */}
                {activeHero === 'inosuke' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 38 34"
                    className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />
                    <g className="inosuke-frame-a">
                      <polygon points="12,5 26,5 30,12 28,18 10,18 8,12" fill="#a1a1aa" stroke="#000" strokeWidth="0.8" />
                      <polygon points="10,3 7,7 12,6" fill="#f472b6" stroke="#000" strokeWidth="0.6" />
                      <polygon points="28,3 31,7 26,6" fill="#f472b6" stroke="#000" strokeWidth="0.6" />
                      <rect x="16" y="13" width="6" height="4" fill="#f472b6" stroke="#000" strokeWidth="0.6" rx="1" />
                      <circle cx="14" cy="11" r="1.5" fill="#38bdf8" stroke="#000" strokeWidth="0.5" />
                      <circle cx="24" cy="11" r="1.5" fill="#38bdf8" stroke="#000" strokeWidth="0.5" />
                      <rect x="12" y="18" width="14" height="6" fill="#fed7aa" stroke="#000" strokeWidth="0.8" />
                      <rect x="10" y="24" width="18" height="3" fill="#713f12" stroke="#000" strokeWidth="0.7" />
                      <rect x="6" y="16" width="12" height="2" fill="#e2e8f0" stroke="#000" strokeWidth="0.6" transform="rotate(-35 6 16)" />
                      <rect x="22" y="16" width="12" height="2" fill="#e2e8f0" stroke="#000" strokeWidth="0.6" transform="rotate(35 22 16)" />
                      <rect x="13" y="27" width="4" height="5" fill="#1e1b4b" stroke="#000" strokeWidth="0.7" />
                      <rect x="21" y="27" width="4" height="3.5" fill="#1e1b4b" stroke="#000" strokeWidth="0.7" />
                    </g>
                    <g className="inosuke-frame-b">
                      <polygon points="12,5 26,5 30,12 28,18 10,18 8,12" fill="#a1a1aa" stroke="#000" strokeWidth="0.8" />
                      <polygon points="10,3 7,7 12,6" fill="#f472b6" stroke="#000" strokeWidth="0.6" />
                      <polygon points="28,3 31,7 26,6" fill="#f472b6" stroke="#000" strokeWidth="0.6" />
                      <rect x="16" y="13" width="6" height="4" fill="#f472b6" stroke="#000" strokeWidth="0.6" rx="1" />
                      <circle cx="14" cy="11" r="1.5" fill="#38bdf8" stroke="#000" strokeWidth="0.5" />
                      <circle cx="24" cy="11" r="1.5" fill="#38bdf8" stroke="#000" strokeWidth="0.5" />
                      <rect x="12" y="18" width="14" height="6" fill="#fed7aa" stroke="#000" strokeWidth="0.8" />
                      <rect x="10" y="24" width="18" height="3" fill="#713f12" stroke="#000" strokeWidth="0.7" />
                      <rect x="6" y="18" width="12" height="2" fill="#e2e8f0" stroke="#000" strokeWidth="0.6" transform="rotate(-15 6 18)" />
                      <rect x="22" y="18" width="12" height="2" fill="#e2e8f0" stroke="#000" strokeWidth="0.6" transform="rotate(15 22 18)" />
                      <rect x="21" y="27" width="4" height="5" fill="#1e1b4b" stroke="#000" strokeWidth="0.7" />
                      <rect x="13" y="27" width="4" height="3.5" fill="#1e1b4b" stroke="#000" strokeWidth="0.7" />
                    </g>
                  </svg>
                )}

                {/* 5. ZENITSU AGATSUMA */}
                {activeHero === 'zenitsu' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 38 34"
                    className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />
                    <g className="sprite-frame-a">
                      <polygon points="14,4 24,4 28,10 25,17 12,17 10,10" fill="#facc15" stroke="#000" strokeWidth="0.8" />
                      <polygon points="12,14 10,18 14,17" fill="#ea580c" />
                      <polygon points="26,14 28,18 24,17" fill="#ea580c" />
                      <rect x="13" y="9" width="12" height="7" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <line x1="17" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1.2" />
                      <line x1="22" y1="12" x2="25" y2="12" stroke="#000" strokeWidth="1.2" />
                      <path d="M11,17 L27,17 L29,25 L9,25 Z" fill="#eab308" stroke="#000" strokeWidth="0.8" />
                      <polygon points="14,19 16,23 12,23" fill="#ffffff" />
                      <polygon points="22,19 24,23 20,23" fill="#ffffff" />
                      <rect x="11" y="23" width="16" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.7" transform="rotate(-15 11 23)" />
                      <rect x="13" y="25" width="4" height="6" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <rect x="21" y="25" width="4" height="4.5" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                    </g>
                    <g className="sprite-frame-b">
                      <polygon points="14,4 24,4 28,10 25,17 12,17 10,10" fill="#facc15" stroke="#000" strokeWidth="0.8" />
                      <polygon points="12,14 10,18 14,17" fill="#ea580c" />
                      <polygon points="26,14 28,18 24,17" fill="#ea580c" />
                      <rect x="13" y="9" width="12" height="7" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <line x1="17" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1.2" />
                      <line x1="22" y1="12" x2="25" y2="12" stroke="#000" strokeWidth="1.2" />
                      <path d="M11,17 L27,17 L29,24 L9,24 Z" fill="#eab308" stroke="#000" strokeWidth="0.8" />
                      <polygon points="14,19 16,23 12,23" fill="#ffffff" />
                      <polygon points="22,19 24,23 20,23" fill="#ffffff" />
                      <rect x="10" y="22" width="16" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.7" transform="rotate(-10 10 22)" />
                      <rect x="21" y="25" width="4" height="6" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <rect x="11" y="25" width="4" height="4.5" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                    </g>
                  </svg>
                )}

                {/* 6. SHINOBU KOCHO */}
                {activeHero === 'shinobu' && (
                  <svg
                    width="52"
                    height="46"
                    viewBox="0 0 38 34"
                    className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />
                    <g>
                      <path d="M4,14 C2,8 10,6 15,12 C10,18 4,20 4,14 Z" fill="#c084fc" stroke="#000" strokeWidth="0.8" />
                      <path d="M34,14 C36,8 28,6 23,12 C28,18 34,20 34,14 Z" fill="#22d3ee" stroke="#000" strokeWidth="0.8" />
                      <polygon points="14,4 24,4 28,10 25,17 13,17 10,10" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <polygon points="12,3 10,0 15,2" fill="#c084fc" />
                      <polygon points="26,3 28,0 23,2" fill="#22d3ee" />
                      <rect x="13" y="8" width="12" height="7" fill="#fde68a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                      <circle cx="16" cy="11" r="1.3" fill="#a855f7" />
                      <circle cx="22" cy="11" r="1.3" fill="#a855f7" />
                      <rect x="14" y="16" width="10" height="9" fill="#18181b" stroke="#000" strokeWidth="0.8" />
                      <line x1="12" y1="22" x2="28" y2="22" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="28" cy="22" r="1.2" fill="#c084fc" />
                    </g>
                  </svg>
                )}
              </div>
            </div>

            {/* 2. Demon Target in Front of Giyu (Stable Speech Bubble & Fluid Sprite Stride) */}
            <div
              onClick={handleDemonClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDemonClick();
              }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className="relative flex items-end cursor-pointer group pointer-events-auto select-none min-w-[44px] min-h-[42px] flex-shrink-0 overflow-visible"
              title="Target Iblis (Dikejar oleh Giyu) - Klik untuk reaksi panik!"
            >
              {/* Demon Badge Tag (Anchored on Right, Staggered Higher Floor - NEVER COLLIDES) */}
              <div
                className={`absolute -top-10 xs:-top-11 sm:-top-10 right-0 xs:-right-1 sm:left-1/2 sm:-translate-x-1/2 font-pixel text-[5px] xs:text-[5.5px] sm:text-[6px] px-1.5 xs:px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-40 pointer-events-none transition-all duration-200 ${
                  demonQuote || isDemonHit || isBossHurt || isBossKO
                    ? 'opacity-100 scale-100 bg-red-600 text-white font-black'
                    : 'opacity-85 group-hover:opacity-100 scale-95 bg-red-700/90 text-white font-bold'
                }`}
              >
                {demonQuote || (isBossKO ? 'K.O.!' : isBossHurt ? 'GYAAA!' : isDemonHit ? 'GYAAA!' : 'TARGET IBLIS')}
              </div>

              {/* Panic Sweat Drop */}
              <div className="absolute -top-4 right-1 pointer-events-none z-30 anim-sweat-fx">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M5,1 C5,1 2,5 2,7 C2,8.5 3.5,9.5 5,9.5 C6.5,9.5 8,8.5 8,7 C8,5 5,1 5,1 Z" fill="#38bdf8" stroke="#000" strokeWidth="0.6" />
                  <circle cx="4" cy="6" r="0.7" fill="#fff" />
                </svg>
              </div>

              {/* Demon Sprite Container (With Smooth Procedural Physics) */}
              <div
                className={`relative z-20 overflow-visible ${
                  isBossKO
                    ? 'anim-demon-ko'
                    : isBossHurt
                    ? 'anim-demon-hurt'
                    : isDemonHit
                    ? 'anim-demon-hit-action'
                    : 'anim-demon-stride'
                }`}
              >
                <svg
                  width="44"
                  height="42"
                  viewBox="0 0 36 34"
                  className="w-[38px] h-[36px] xs:w-[42px] xs:h-[40px] sm:w-[46px] sm:h-[44px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                >
                  <ellipse cx="18" cy="32" rx="7" ry="1.2" fill="#000000" opacity="0.4" />

                  {/* DEMON FRAME A: STEP 1 (Paced Crisp Toggle - 0.54s) */}
                  <g className="demon-frame-a">
                    {/* Red Sharp Horns on Head */}
                    <polygon points="12,3 9,7 13,8" fill="#ef4444" stroke="#000" strokeWidth="0.8" />
                    <polygon points="24,3 27,7 23,8" fill="#ef4444" stroke="#000" strokeWidth="0.8" />

                    {/* Messy Dark Purple Demon Hair */}
                    <polygon points="10,6 18,3 26,6 29,12 26,13 10,13 7,12" fill="#312e81" stroke="#000" strokeWidth="0.8" />
                    <polygon points="7,9 4,12 9,12" fill="#312e81" />
                    <polygon points="29,9 32,12 27,12" fill="#312e81" />

                    {/* Pale Demon Skin Face */}
                    <rect x="10" y="8" width="16" height="10" fill="#a78bfa" stroke="#000" strokeWidth="0.9" rx="0.5" />
                    {/* Fangs & Mouth */}
                    <rect x="13" y="15" width="10" height="2" fill="#450a0a" stroke="#000" strokeWidth="0.5" />
                    <polygon points="14,15 15,17 16,15" fill="#ffffff" />
                    <polygon points="20,15 21,17 22,15" fill="#ffffff" />

                    {/* Glowing Crimson Demon Eyes Looking Back (Leftwards towards Giyu) */}
                    <rect x="12" y="10.5" width="3.5" height="3" fill="#dc2626" stroke="#000" strokeWidth="0.5" />
                    <rect x="12.5" y="11" width="1.2" height="2" fill="#fbbf24" />
                    <rect x="20" y="10.5" width="3.5" height="3" fill="#dc2626" stroke="#000" strokeWidth="0.5" />
                    <rect x="20.5" y="11" width="1.2" height="2" fill="#fbbf24" />

                    {/* Dark Demon Kimono */}
                    <path d="M10,18 L26,18 L28,26 L8,26 Z" fill="#1e1b4b" stroke="#000" strokeWidth="0.8" />
                    <polygon points="15,18 21,18 18,23" fill="#4c1d95" />
                    <rect x="12" y="22" width="12" height="2" fill="#b91c1c" />

                    {/* Demon Legs (Frame A Step) */}
                    <rect x="9" y="25" width="3.5" height="6" fill="#a78bfa" stroke="#000" strokeWidth="0.7" />
                    <rect x="8.5" y="30" width="4.5" height="2" fill="#1e1b4b" rx="0.5" />
                    <rect x="23" y="24" width="3.5" height="7" fill="#a78bfa" stroke="#000" strokeWidth="0.7" />
                    <rect x="23" y="29.5" width="4.5" height="2" fill="#1e1b4b" rx="0.5" />

                    {/* Demon Claws / Arms (Pumping in Panic) */}
                    <rect x="7" y="18" width="3" height="5" fill="#a78bfa" stroke="#000" strokeWidth="0.6" rx="0.5" />
                    <polygon points="7,23 9,23 8,25" fill="#ef4444" />
                    <rect x="26" y="18" width="3" height="5" fill="#a78bfa" stroke="#000" strokeWidth="0.6" rx="0.5" />
                    <polygon points="26,23 28,23 27,25" fill="#ef4444" />
                  </g>

                  {/* DEMON FRAME B: STEP 2 (Paced Crisp Toggle - 0.54s) */}
                  <g className="demon-frame-b">
                    {/* Red Sharp Horns on Head */}
                    <polygon points="12,2 9,6 13,7" fill="#ef4444" stroke="#000" strokeWidth="0.8" />
                    <polygon points="24,2 27,6 23,7" fill="#ef4444" stroke="#000" strokeWidth="0.8" />

                    {/* Messy Dark Purple Demon Hair */}
                    <polygon points="10,5 18,2 26,5 29,11 26,12 10,12 7,11" fill="#312e81" stroke="#000" strokeWidth="0.8" />
                    <polygon points="7,8 4,11 9,11" fill="#312e81" />
                    <polygon points="29,8 32,11 27,11" fill="#312e81" />

                    {/* Pale Demon Skin Face */}
                    <rect x="10" y="7" width="16" height="10" fill="#a78bfa" stroke="#000" strokeWidth="0.9" rx="0.5" />
                    <rect x="13" y="14" width="10" height="2" fill="#450a0a" stroke="#000" strokeWidth="0.5" />
                    <polygon points="14,14 15,16 16,14" fill="#ffffff" />
                    <polygon points="20,14 21,16 22,14" fill="#ffffff" />

                    {/* Glowing Crimson Demon Eyes */}
                    <rect x="12" y="9.5" width="3.5" height="3" fill="#dc2626" stroke="#000" strokeWidth="0.5" />
                    <rect x="12.5" y="10" width="1.2" height="2" fill="#fbbf24" />
                    <rect x="20" y="9.5" width="3.5" height="3" fill="#dc2626" stroke="#000" strokeWidth="0.5" />
                    <rect x="20.5" y="10" width="1.2" height="2" fill="#fbbf24" />

                    {/* Dark Demon Kimono */}
                    <path d="M10,17 L26,17 L28,25 L8,25 Z" fill="#1e1b4b" stroke="#000" strokeWidth="0.8" />
                    <polygon points="15,17 21,17 18,22" fill="#4c1d95" />
                    <rect x="12" y="21" width="12" height="2" fill="#b91c1c" />

                    {/* Demon Legs (Frame B Step: Alternated) */}
                    <rect x="8" y="24" width="3.5" height="7" fill="#a78bfa" stroke="#000" strokeWidth="0.7" />
                    <rect x="7.5" y="29.5" width="4.5" height="2" fill="#1e1b4b" rx="0.5" />
                    <rect x="24" y="25" width="3.5" height="6" fill="#a78bfa" stroke="#000" strokeWidth="0.7" />
                    <rect x="24" y="30" width="4.5" height="2" fill="#1e1b4b" rx="0.5" />

                    {/* Demon Claws / Arms (Higher Flail) */}
                    <rect x="6" y="16" width="3" height="5" fill="#a78bfa" stroke="#000" strokeWidth="0.6" rx="0.5" />
                    <polygon points="6,21 8,21 7,23" fill="#ef4444" />
                    <rect x="27" y="16" width="3" height="5" fill="#a78bfa" stroke="#000" strokeWidth="0.6" rx="0.5" />
                    <polygon points="27,21 29,21 28,23" fill="#ef4444" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* 2. UJUNG KANAN: Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs flex items-center justify-center gap-1.5 sm:gap-2 group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] flex-shrink-0 ml-auto"
            title="Refresh Inbox Manual"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0 ${
                isRefreshing ? 'animate-spin-fast' : 'group-hover:rotate-180'
              }`}
            />
            <span className="hidden xs:inline font-mono-custom font-bold">
              {isRefreshing ? 'MENYINKRONKAN...' : 'REFRESH'}
            </span>
            <span className="xs:hidden">SYNC</span>
          </button>
        </div>
      </div>

      {/* Auto-Sync Live Status Indicator Badge */}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="motion-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
          </div>
          <span className="font-bold text-[var(--text-main)]">
            Auto-Sync Aktif (Setiap {countdownSeconds}s)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--color-blue)]" />
          <span>Masa aktif email: <strong className="text-[var(--text-main)]">24 Jam</strong></span>
        </div>
      </div>

      {/* Custom Email Modal Dialog */}
      <CustomEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onApplyCustom}
        availableDomains={availableDomains}
        currentPrefix={currentPrefix}
        currentDomain={currentDomain}
        isVipUnlocked={isVipUnlocked}
        onRequestVipUnlock={onRequestVipUnlock}
      />

      {/* ======================================================== */}
      {/* MODAL: CHARACTER SELECT ROSTER (ARCADE FIGHTING STYLE)   */}
      {/* ======================================================== */}
      {isCharModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsCharModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] p-4 sm:p-5 brutal-card relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-[2.5px] border-[var(--border-color)] pb-3 mb-4">
              <div className="text-left">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[var(--color-blue)] font-bold block uppercase tracking-wide">
                  PILIH PAHLAWAN ANDA
                </span>
                <h3 className="font-pixel text-xs sm:text-sm text-[var(--text-main)] font-black uppercase">
                  CHARACTER SELECT ROSTER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCharModalOpen(false)}
                className="brutal-btn w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white font-mono-custom font-black border-2 border-[var(--border-color)] text-xs flex items-center justify-center p-0 shadow-[2px_2px_0px_var(--shadow-color)]"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Arcade Fighter Select Layout: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start mb-3">
              {/* Left Column: Stage with Big Left/Right Nav Buttons + Ribbon */}
              <div className="md:col-span-7 flex flex-col space-y-2.5">
                {/* Character Stage Box */}
                <div className="relative w-full aspect-[4/3] xs:aspect-[16/11] bg-zinc-100 dark:bg-zinc-950 border-2 border-[var(--border-color)] overflow-hidden flex items-center justify-center select-none shadow-[2px_2px_0px_var(--shadow-color)]">
                  {/* Elemental Dynamic Glow Circle */}
                  <div
                    className="absolute w-44 h-44 rounded-full blur-2xl opacity-35 pointer-events-none transition-all duration-500"
                    style={{ backgroundColor: HERO_ROSTER[previewHero].glowColor || '#06b6d4' }}
                  />

                  {/* Elemental Burst Ring on Character Arrival */}
                  {showBurstRing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div
                        className="w-44 h-44 rounded-full border-4 anim-roster-burst pointer-events-none"
                        style={{ borderColor: HERO_ROSTER[previewHero].glowColor || '#06b6d4' }}
                      />
                    </div>
                  )}

                  {/* Corner Watermarks */}
                  <div className="absolute top-2 left-2.5 font-pixel text-[7px] text-[var(--text-muted)] pointer-events-none">
                    ARCADE // ROSTER
                  </div>
                  <div className="absolute top-2 right-2.5 font-pixel text-[7px] text-[var(--text-muted)] pointer-events-none">
                    0{HERO_KEYS.indexOf(previewHero) + 1} / 0{HERO_KEYS.length}
                  </div>
                  <div className="absolute bottom-1 right-2 font-black text-4xl sm:text-5xl opacity-10 pointer-events-none font-serif">
                    {HERO_ROSTER[previewHero].kanjiWatermark || '水'}
                  </div>

                  {/* Left Carousel Button (<) */}
                  <button
                    type="button"
                    onClick={handlePrevHero}
                    className="brutal-btn absolute left-2 sm:left-3 z-30 bg-white dark:bg-zinc-800 text-black dark:text-white w-8 h-8 sm:w-9 sm:h-9 font-pixel text-xs font-black flex items-center justify-center hover:bg-[var(--color-yellow)] dark:hover:bg-yellow-500 transition-transform active:scale-90 shadow-[2px_2px_0px_var(--shadow-color)]"
                    title="Pahlawan Sebelumnya (Tombol Panah Kiri)"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
                  </button>

                  {/* Right Carousel Button (>) */}
                  <button
                    type="button"
                    onClick={handleNextHero}
                    className="brutal-btn absolute right-2 sm:right-3 z-30 bg-white dark:bg-zinc-800 text-black dark:text-white w-8 h-8 sm:w-9 sm:h-9 font-pixel text-xs font-black flex items-center justify-center hover:bg-[var(--color-yellow)] dark:hover:bg-yellow-500 transition-transform active:scale-90 shadow-[2px_2px_0px_var(--shadow-color)]"
                    title="Pahlawan Berikutnya (Tombol Panah Kanan)"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
                  </button>

                  {/* Speech Callout Balloon */}
                  {modalQuote && (
                    <div className="absolute top-4 z-25 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-none">
                      <div className="bg-black text-white px-2.5 py-1 font-pixel text-[8px] sm:text-[9px] border-2 border-yellow-300 shadow-[2px_2px_0px_#000] font-bold uppercase tracking-wider">
                        {modalQuote}
                      </div>
                    </div>
                  )}

                  {/* Realistic Character Art with Directional Transition */}
                  <div
                    onClick={handleModalTestJurus}
                    className={`relative z-10 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${getRosterTransitionClass()}`}
                    title="Klik karakter untuk jurus & suara!"
                  >
                    <RealisticHeroArt heroId={previewHero} />
                  </div>

                  {/* Cinematic Signature Skill FX Overlay */}
                  {isModalSlashing && (
                    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
                      <CinematicSkillFX heroId={previewHero} />
                    </div>
                  )}
                </div>

                {/* Quick Selection Thumbnail Ribbon (6 Characters) */}
                <div>
                  <div className="font-pixel text-[7px] text-[var(--text-muted)] font-bold mb-1 uppercase">
                    PILIH CEPAT (6 PAHLAWAN):
                  </div>
                  <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                    {HERO_KEYS.map((k) => {
                      const item = HERO_ROSTER[k];
                      const isCurrent = previewHero === k;
                      const isEquipped = activeHero === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleThumbnailSelect(k)}
                          className={`brutal-btn p-1 flex flex-col items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[var(--color-yellow)] border-black ring-2 ring-[var(--color-blue)] scale-105 shadow-[2px_2px_0px_#000]'
                              : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_var(--shadow-color)]'
                          }`}
                        >
                          <span className="font-pixel text-[6.5px] font-black text-black dark:text-white truncate max-w-full">
                            {item.badgeName}
                          </span>
                          <span className={`font-pixel text-[5px] px-1 py-0.2 border border-black mt-0.5 truncate w-full ${item.elementColor}`}>
                            {item.element}
                          </span>
                          {isEquipped && (
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full border border-black mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Lore, Technique, Stats & Confirm Button */}
              <div className="md:col-span-5 flex flex-col space-y-2.5">
                {/* Hero Identity */}
                <div className="bg-white dark:bg-zinc-900 p-3 border-2 border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 font-pixel text-[7.5px] font-black border border-black uppercase shadow-[1px_1px_0px_#000] ${HERO_ROSTER[previewHero].elementColor}`}>
                      ELEMEN {HERO_ROSTER[previewHero].element}
                    </span>
                    <span className="font-pixel text-[9px] text-[var(--text-muted)] font-bold tracking-widest">
                      {HERO_ROSTER[previewHero].kanji}
                    </span>
                  </div>
                  <h4 className="font-pixel text-xs sm:text-sm text-[var(--text-main)] font-black uppercase">
                    {HERO_ROSTER[previewHero].name}
                  </h4>
                  <div className="font-mono-custom text-[11px] text-[var(--color-blue)] font-bold mb-1.5">
                    {HERO_ROSTER[previewHero].title}
                  </div>
                  <p className="font-mono-custom text-[10.5px] text-[var(--text-muted)] leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-1.5">
                    {HERO_ROSTER[previewHero].desc}
                  </p>
                </div>

                {/* Ultimate Technique Card */}
                <div className="bg-zinc-100 dark:bg-black/50 p-2.5 border border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-pixel text-[7px] text-[var(--text-muted)] font-bold uppercase">JURUS PAMUNGKAS:</div>
                    <div className="font-pixel text-[9.5px] text-[var(--text-main)] font-black uppercase">
                      {HERO_ROSTER[previewHero].ultName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleModalTestJurus}
                    className="brutal-btn px-2 py-1 bg-pink-500 hover:bg-pink-600 text-white font-mono-custom text-[9px] font-bold uppercase shadow-[1px_1px_0px_#000]"
                  >
                    TES JURUS
                  </button>
                </div>

                {/* Arcade Combat Stats */}
                <div className="space-y-1.5 bg-white dark:bg-zinc-900 p-2.5 border border-[var(--border-color)]">
                  <div className="font-pixel text-[7.5px] text-[var(--text-main)] font-black uppercase mb-1">
                    STATISTIK TEMPUR
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono-custom font-bold">
                      <span className="text-[var(--text-muted)]">ATK:</span>
                      <span className="text-red-500 font-pixel text-[7.5px]">{HERO_ROSTER[previewHero].stats?.atk || 85} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 border border-black p-0.5">
                      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${HERO_ROSTER[previewHero].stats?.atk || 85}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono-custom font-bold">
                      <span className="text-[var(--text-muted)]">SPD:</span>
                      <span className="text-yellow-500 font-pixel text-[7.5px]">{HERO_ROSTER[previewHero].stats?.spd || 90} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 border border-black p-0.5">
                      <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${HERO_ROSTER[previewHero].stats?.spd || 90}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono-custom font-bold">
                      <span className="text-[var(--text-muted)]">ULT:</span>
                      <span className="text-cyan-500 font-pixel text-[7.5px]">{HERO_ROSTER[previewHero].stats?.ult || 92} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 border border-black p-0.5">
                      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${HERO_ROSTER[previewHero].stats?.ult || 92}%` }} />
                    </div>
                  </div>
                </div>

                {/* Confirm / Select Button */}
                {activeHero === previewHero ? (
                  <button
                    type="button"
                    disabled
                    className="brutal-btn w-full py-2.5 bg-green-500 text-black font-mono-custom font-black uppercase border-2 border-black text-xs shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>SUDAH AKTIF SEBAGAI PAHLAWAN</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectHero(previewHero)}
                    className="brutal-btn w-full py-2.5 bg-[var(--color-yellow)] hover:bg-yellow-400 text-black font-mono-custom font-black uppercase border-2 border-[var(--border-color)] text-xs shadow-[2px_2px_0px_var(--shadow-color)] transition-all"
                  >
                    JADIKAN {HERO_ROSTER[previewHero].name} PAHLAWAN AKTIF
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] font-mono-custom text-[var(--text-muted)] mb-3 text-center sm:text-left">
              Pilihan pahlawan Anda tersimpan otomatis di perangkat dan langsung aktif di strip pelari setiap kali Anda membuka kotak surat. Gunakan tombol panah kiri / kanan pada keyboard untuk beralih cepat.
            </p>

            <button
              type="button"
              onClick={() => setIsCharModalOpen(false)}
              className="brutal-btn w-full py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[var(--text-main)] font-mono-custom font-bold uppercase border-2 border-[var(--border-color)] text-xs shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              TUTUP ROSTER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
