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
  playSpideySenseSound,
  playSpideyCameraSound,
  playSpideyPizzaSound,
  playSpideyDroneSound,
  playVictoryFanfareSound,
  playElementalSkillSound,
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

export interface HeroSkillDef {
  name: string;
  fx: 'waterDragon' | 'waterWheel' | 'deadCalm' | 'solarDragon' | 'sunRing' | 'rokuren' | 'xSlash' | 'butterflyTornado' | 'bladeWave';
  sound: 'dragon' | 'wheel' | 'calm' | 'fire' | 'thunder' | 'slash';
}

export const HERO_SKILLS: Record<HeroId, HeroSkillDef[]> = {
  giyu: [
    { name: '1. Ju no Kata: Seisei Ruten', fx: 'waterDragon', sound: 'dragon' },
    { name: '2. Ni no Kata: Mizu Guruma', fx: 'waterWheel', sound: 'wheel' },
    { name: '3. Juuichi no Kata: Nagi', fx: 'deadCalm', sound: 'calm' },
    { name: '4. Ichi no Kata: Minamo Giri', fx: 'bladeWave', sound: 'slash' },
  ],
  tanjiro: [
    { name: '1. Hinokami: Nichiun no Ryu', fx: 'solarDragon', sound: 'fire' },
    { name: '2. Hinokami: Heki-ra no Ten', fx: 'sunRing', sound: 'fire' },
    { name: '3. Hinokami: Kasha', fx: 'waterWheel', sound: 'fire' },
    { name: '4. Hinokami: Enbu', fx: 'solarDragon', sound: 'fire' },
  ],
  zenitsu: [
    { name: '1. Hekireki: Rokuren (6-Fold)', fx: 'rokuren', sound: 'thunder' },
    { name: '2. Hekireki Issen: Shinsoku', fx: 'rokuren', sound: 'thunder' },
    { name: '3. Thunder Spark Flash', fx: 'rokuren', sound: 'thunder' },
    { name: '4. Honoikazuchi no Kami', fx: 'solarDragon', sound: 'thunder' },
  ],
  inosuke: [
    { name: '1. San no Kiba: Kuizaki', fx: 'xSlash', sound: 'slash' },
    { name: '2. Ichi no Kiba: Ugachi Nuki', fx: 'bladeWave', sound: 'slash' },
    { name: '3. Ni no Kiba: Enten Senkai', fx: 'waterWheel', sound: 'wheel' },
    { name: '4. Inoshishi Totsugeki', fx: 'solarDragon', sound: 'dragon' },
  ],
  shinobu: [
    { name: '1. Chou no Mai: Tawamure', fx: 'butterflyTornado', sound: 'calm' },
    { name: '2. Hachimon: Fukugan Rokkaku', fx: 'rokuren', sound: 'thunder' },
    { name: '3. Houshi no Mai: Manabiki', fx: 'bladeWave', sound: 'slash' },
    { name: '4. Wisteria Mirage', fx: 'deadCalm', sound: 'calm' },
  ],
  nezuko: [
    { name: '1. Bakketsu Fire Claw', fx: 'solarDragon', sound: 'fire' },
    { name: '2. Mega Sprint Kick', fx: 'bladeWave', sound: 'slash' },
    { name: '3. Box Rolling Dodge', fx: 'waterWheel', sound: 'wheel' },
    { name: '4. Blood Demon Burst', fx: 'sunRing', sound: 'fire' },
  ],
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
  const rosterTransitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rosterBurstTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [runnerQuote, setRunnerQuote] = useState<string | null>(null);
  const [isRunnerSlashing, setIsRunnerSlashing] = useState<boolean>(false);
  const [heroSkillIdx, setHeroSkillIdx] = useState<number>(0);
  const [activeSkillFx, setActiveSkillFx] = useState<'waterDragon' | 'waterWheel' | 'deadCalm' | 'solarDragon' | 'sunRing' | 'rokuren' | 'xSlash' | 'butterflyTornado' | 'bladeWave' | null>(null);
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

  // Muzan Counter-Attack & Parry Mechanics
  const MUZAN_ATTACK_TYPES = ['whip', 'shockwave', 'spikes'] as const;
  type MuzanAttackType = typeof MUZAN_ATTACK_TYPES[number];
  const [muzanAttackType, setMuzanAttackType] = useState<MuzanAttackType>('whip');
  const [isMuzanWarning, setIsMuzanWarning] = useState<boolean>(false);
  const [isMuzanAttacking, setIsMuzanAttacking] = useState<boolean>(false);
  const [isHeroParrying, setIsHeroParrying] = useState<boolean>(false);
  const [isHeroStaggered, setIsHeroStaggered] = useState<boolean>(false);
  const muzanWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const muzanAttackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Spiderman Signature Interactive Action States
  type SpideyActionType = 'sense' | 'pizza' | 'camera' | 'drone' | 'yoink';
  const SPIDEY_ACTIONS: SpideyActionType[] = ['sense', 'pizza', 'camera', 'drone', 'yoink'];
  const [activeSpideyAction, setActiveSpideyAction] = useState<SpideyActionType | null>(null);
  const [spideyActionQuote, setSpideyActionQuote] = useState<string | null>(null);
  const [spideyPopBadge, setSpideyPopBadge] = useState<string | null>(null);
  const [isCameraFlashing, setIsCameraFlashing] = useState<boolean>(false);
  const [spideyActionIdx, setSpideyActionIdx] = useState<number>(0);
  const [spideyQuoteIdx, setSpideyQuoteIdx] = useState<number>(0);
  const spideyActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spideyFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSpideyAction = (action: SpideyActionType, customQuote?: string) => {
    if (spideyActionTimeoutRef.current) clearTimeout(spideyActionTimeoutRef.current);
    if (spideyFlashTimeoutRef.current) clearTimeout(spideyFlashTimeoutRef.current);

    setActiveSpideyAction(action);

    if (action === 'sense') {
      if (isSoundEnabled) playSpideySenseSound(true);
      setSpideyPopBadge('ZZZT!');
      setSpideyActionQuote(customQuote || 'SPIDEY-SENSE TINGLING!');

      spideyActionTimeoutRef.current = setTimeout(() => {
        setActiveSpideyAction(null);
        setSpideyPopBadge(null);
        setSpideyActionQuote(null);
      }, 850);
    } else if (action === 'pizza') {
      if (isSoundEnabled) playSpideyPizzaSound(true);
      setSpideyPopBadge('CHOMP!');
      setSpideyActionQuote('PIZZA TIME! NYAM!');

      spideyActionTimeoutRef.current = setTimeout(() => {
        setSpideyActionQuote('ENERGY 100%!');
        setTimeout(() => {
          setActiveSpideyAction(null);
          setSpideyPopBadge(null);
          setSpideyActionQuote(null);
        }, 650);
      }, 700);
    } else if (action === 'camera') {
      if (isSoundEnabled) playSpideyCameraSound(true);
      setSpideyPopBadge('FLASH!');
      setSpideyActionQuote('SAY CHEESE!');
      setIsCameraFlashing(true);

      spideyFlashTimeoutRef.current = setTimeout(() => {
        setIsCameraFlashing(false);
      }, 500);

      spideyActionTimeoutRef.current = setTimeout(() => {
        setSpideyActionQuote('GREAT PHOTO!');
        setTimeout(() => {
          setActiveSpideyAction(null);
          setSpideyPopBadge(null);
          setSpideyActionQuote(null);
        }, 550);
      }, 600);
    } else if (action === 'drone') {
      if (isSoundEnabled) playSpideyDroneSound(true);
      setSpideyPopBadge('DRONE!');
      setSpideyActionQuote('DRONE: SCANNING INBOX...');

      spideyActionTimeoutRef.current = setTimeout(() => {
        setSpideyActionQuote('INBOX CLEAN & SECURE!');
        setTimeout(() => {
          setActiveSpideyAction(null);
          setSpideyPopBadge(null);
          setSpideyActionQuote(null);
        }, 750);
      }, 1500);
    } else if (action === 'yoink') {
      if (isSoundEnabled) playSpideyThwipSound(true);
      setSpideyPopBadge('THWIP!');
      setSpideyActionQuote('THWIP! WEB SLING!');

      spideyActionTimeoutRef.current = setTimeout(() => {
        setActiveSpideyAction(null);
        setSpideyPopBadge(null);
        setSpideyActionQuote(null);
      }, 800);
    }
  };

  const handleSpideyClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const action = SPIDEY_ACTIONS[spideyActionIdx % SPIDEY_ACTIONS.length];
    setSpideyActionIdx((prev) => (prev + 1) % SPIDEY_ACTIONS.length);
    setSpideyQuoteIdx((prev) => (prev + 1) % SPIDEY_QUOTES.length);
    triggerSpideyAction(action);
  };

  const damageBoss = (amount: number, isCritical: boolean = false) => {
    if (isBossKO) return;

    setBossHp((prev) => {
      const nextHp = Math.max(0, prev - amount);
      if (nextHp === 0) {
        setIsBossKO(true);
        setIsBossHurt(false);
        setDemonQuote('K.O.!');
        setIsMuzanWarning(false);
        setIsMuzanAttacking(false);
        if (muzanWarningTimeoutRef.current) clearTimeout(muzanWarningTimeoutRef.current);
        if (muzanAttackTimeoutRef.current) clearTimeout(muzanAttackTimeoutRef.current);

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
        const MUZAN_QUOTES = ['KISAMA...!', 'BERANINYA!', 'KUTUKAN DARAH!', 'LENYAPLAH!', 'TIDAK MUNGKIN!', 'AKU ABADI!'];
        const randomQuote = MUZAN_QUOTES[Math.floor(Math.random() * MUZAN_QUOTES.length)];
        const scream = isCritical ? `CRITICAL -${amount} HP!` : randomQuote;
        setDemonQuote(scream);
        if (bossHurtTimeoutRef.current) clearTimeout(bossHurtTimeoutRef.current);
        bossHurtTimeoutRef.current = setTimeout(() => {
          setIsBossHurt(false);
          setDemonQuote(null);
        }, 700);
        if (!isMuzanWarning && !isMuzanAttacking && Math.random() < 0.3) {
          setTimeout(() => {
            if (!isBossKO && !isUltActive) {
              triggerMuzanAttack();
            }
          }, 1100);
        }
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

    // Pick supreme ultimate FX & synthesized sound based on hero
    if (activeHero === 'giyu') {
      setActiveSkillFx('waterDragon');
      if (isSoundEnabled) playElementalSkillSound('dragon', true);
    } else if (activeHero === 'tanjiro') {
      setActiveSkillFx('solarDragon');
      if (isSoundEnabled) playElementalSkillSound('fire', true);
    } else if (activeHero === 'zenitsu') {
      setActiveSkillFx('rokuren');
      if (isSoundEnabled) playElementalSkillSound('thunder', true);
    } else if (activeHero === 'inosuke') {
      setActiveSkillFx('xSlash');
      if (isSoundEnabled) playElementalSkillSound('slash', true);
    } else if (activeHero === 'shinobu') {
      setActiveSkillFx('butterflyTornado');
      if (isSoundEnabled) playElementalSkillSound('calm', true);
    } else {
      setActiveSkillFx('solarDragon');
      if (isSoundEnabled) playElementalSkillSound('fire', true);
    }

    // Critical strike -100 HP to boss with K.O.
    setTimeout(() => {
      damageBoss(100, true);
    }, 280);

    if (ultTimeoutRef.current) clearTimeout(ultTimeoutRef.current);
    ultTimeoutRef.current = setTimeout(() => {
      setIsUltActive(false);
      setRunnerQuote(null);
      setActiveSkillFx(null);
    }, 1600);
  };

  // Muzan Counter-Attack & Hero Parry Mechanics
  const handleParryHero = () => {
    if (!isMuzanWarning) return;
    if (muzanWarningTimeoutRef.current) clearTimeout(muzanWarningTimeoutRef.current);
    setIsMuzanWarning(false);
    setIsHeroParrying(true);

    if (isSoundEnabled) {
      playKatanaSlashSound(true);
      playSound('pop');
    }

    // Award +25% Ult Energy for perfect parry
    setUltEnergy((prev) => Math.min(100, prev + 25));
    setRunnerQuote('PERFECT PARRY!');

    // Stun Muzan with counter-reaction
    setIsBossHurt(true);
    setDemonQuote('KISAMA...!');
    if (bossHurtTimeoutRef.current) clearTimeout(bossHurtTimeoutRef.current);
    bossHurtTimeoutRef.current = setTimeout(() => {
      setIsBossHurt(false);
      setDemonQuote(null);
    }, 750);

    setTimeout(() => {
      setIsHeroParrying(false);
      setRunnerQuote(null);
    }, 550);
  };

  const triggerMuzanAttack = () => {
    if (isMuzanWarning || isMuzanAttacking || isBossKO || isUltActive) return;

    // Pick random Blood Demon Art
    const chosen = MUZAN_ATTACK_TYPES[Math.floor(Math.random() * MUZAN_ATTACK_TYPES.length)];
    setMuzanAttackType(chosen);
    setIsMuzanWarning(true);

    if (muzanWarningTimeoutRef.current) clearTimeout(muzanWarningTimeoutRef.current);
    muzanWarningTimeoutRef.current = setTimeout(() => {
      setIsMuzanWarning(false);
      setIsMuzanAttacking(true);

      if (isSoundEnabled) {
        playKatanaSlashSound(true);
      }

      // At 200ms, attack strikes the hero if not parried
      if (muzanAttackTimeoutRef.current) clearTimeout(muzanAttackTimeoutRef.current);
      muzanAttackTimeoutRef.current = setTimeout(() => {
        setIsHeroStaggered(true);
        setUltEnergy((prev) => Math.max(0, prev - 10));

        const hitQuote =
          chosen === 'shockwave'
            ? 'TERKENA SHOCKWAVE!'
            : chosen === 'spikes'
            ? 'TERTUSUK DURI BUMI!'
            : 'TERKENA CAMBUK!';
        setRunnerQuote(hitQuote);
        setComboCount(0);

        setTimeout(() => {
          setIsHeroStaggered(false);
          setRunnerQuote(null);
        }, 500);
      }, 200);

      setTimeout(() => {
        setIsMuzanAttacking(false);
      }, 500);
    }, 950);
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
    return () => {
      if (rosterTransitionTimeoutRef.current) clearTimeout(rosterTransitionTimeoutRef.current);
      if (rosterBurstTimeoutRef.current) clearTimeout(rosterBurstTimeoutRef.current);
      if (muzanWarningTimeoutRef.current) clearTimeout(muzanWarningTimeoutRef.current);
      if (muzanAttackTimeoutRef.current) clearTimeout(muzanAttackTimeoutRef.current);
      if (spideyActionTimeoutRef.current) clearTimeout(spideyActionTimeoutRef.current);
      if (spideyFlashTimeoutRef.current) clearTimeout(spideyFlashTimeoutRef.current);
    };
  }, []);

  // Auto Spidey-Sense alert when inbox refresh completes
  const prevRefreshingRef = useRef<boolean>(false);
  useEffect(() => {
    if (prevRefreshingRef.current && !isRefreshing) {
      triggerSpideyAction('sense', 'SPIDEY-SENSE: INBOX SYNCED!');
    }
    prevRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  // Periodic Muzan Counter-Attack Interval (Randomized between 9s and 14s during battle)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 5000) + 9000;
      timer = setTimeout(() => {
        if (!isBossKO && !isUltActive && !isMuzanWarning && !isMuzanAttacking) {
          triggerMuzanAttack();
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timer);
  }, [isBossKO, isUltActive, isMuzanWarning, isMuzanAttacking]);

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
    if (rosterTransitionTimeoutRef.current) {
      clearTimeout(rosterTransitionTimeoutRef.current);
    }
    if (rosterBurstTimeoutRef.current) {
      clearTimeout(rosterBurstTimeoutRef.current);
    }

    if (isSoundEnabled) {
      playSound('click');
    }

    const currentIdx = HERO_KEYS.indexOf(previewHero);
    const prevIdx = (currentIdx - 1 + HERO_KEYS.length) % HERO_KEYS.length;
    const prevHero = HERO_KEYS[prevIdx];

    setPreviewHero(prevHero);
    setTransitionState('in-left');
    setShowBurstRing(true);

    rosterBurstTimeoutRef.current = setTimeout(() => {
      setShowBurstRing(false);
    }, 320);

    rosterTransitionTimeoutRef.current = setTimeout(() => {
      setTransitionState('idle');
    }, 260);
  };

  const handleNextHero = () => {
    if (rosterTransitionTimeoutRef.current) {
      clearTimeout(rosterTransitionTimeoutRef.current);
    }
    if (rosterBurstTimeoutRef.current) {
      clearTimeout(rosterBurstTimeoutRef.current);
    }

    if (isSoundEnabled) {
      playSound('click');
    }

    const currentIdx = HERO_KEYS.indexOf(previewHero);
    const nextIdx = (currentIdx + 1) % HERO_KEYS.length;
    const nextHero = HERO_KEYS[nextIdx];

    setPreviewHero(nextHero);
    setTransitionState('in-right');
    setShowBurstRing(true);

    rosterBurstTimeoutRef.current = setTimeout(() => {
      setShowBurstRing(false);
    }, 320);

    rosterTransitionTimeoutRef.current = setTimeout(() => {
      setTransitionState('idle');
    }, 260);
  };

  const handleThumbnailSelect = (targetHero: HeroId) => {
    if (targetHero === previewHero) return;
    const currentIdx = HERO_KEYS.indexOf(previewHero);
    const targetIdx = HERO_KEYS.indexOf(targetHero);

    if (rosterTransitionTimeoutRef.current) {
      clearTimeout(rosterTransitionTimeoutRef.current);
    }
    if (rosterBurstTimeoutRef.current) {
      clearTimeout(rosterBurstTimeoutRef.current);
    }

    if (isSoundEnabled) {
      playSound('click');
    }

    setPreviewHero(targetHero);
    setTransitionState(targetIdx > currentIdx ? 'in-right' : 'in-left');
    setShowBurstRing(true);

    rosterBurstTimeoutRef.current = setTimeout(() => {
      setShowBurstRing(false);
    }, 320);

    rosterTransitionTimeoutRef.current = setTimeout(() => {
      setTransitionState('idle');
    }, 260);
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
    if (isMuzanWarning) {
      handleParryHero();
      return;
    }
    if (isRunnerSlashing || isUltActive) return;
    setIsRunnerSlashing(true);

    const skills = HERO_SKILLS[activeHero] || HERO_SKILLS.giyu;
    const currentSkill = skills[heroSkillIdx % skills.length];
    setRunnerQuote(currentSkill.name);
    setActiveSkillFx(currentSkill.fx);
    setHeroSkillIdx((prev) => (prev + 1) % skills.length);

    if (isSoundEnabled) {
      playElementalSkillSound(currentSkill.sound, true);
    }

    // Gain energy & attack demon boss
    setUltEnergy((prev) => Math.min(100, prev + 15));
    damageBoss(25);

    if (runnerSlashTimeoutRef.current) clearTimeout(runnerSlashTimeoutRef.current);
    runnerSlashTimeoutRef.current = setTimeout(() => {
      setIsRunnerSlashing(false);
      setRunnerQuote(null);
      setActiveSkillFx(null);
    }, 1050);
  };

  const handleDemonClick = () => {
    if (isBossKO) return;
    if (isMuzanWarning) {
      handleParryHero();
      return;
    }
    setUltEnergy((prev) => Math.min(100, prev + 15));
    damageBoss(25);
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
  };

  return (
    <div className="brutal-card px-4 pb-4 pt-5 xs:px-5 xs:pb-5 xs:pt-6 sm:p-7 mt-14 xs:mt-16 sm:mt-20 mb-5 sm:mb-7 relative bg-[var(--card-bg)]">
      {/* Camera Flash Blitz Screen Overlay (Daily Bugle Snap) */}
      {isCameraFlashing && (
        <div className="absolute inset-0 bg-white pointer-events-none z-50 anim-spidey-flash rounded-sm" />
      )}
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
            {spideyActionQuote || SPIDEY_QUOTES[spideyQuoteIdx]}
          </div>

          {/* Dynamic Action FX Pop Badge */}
          {spideyPopBadge && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-300 text-black font-pixel text-[6px] xs:text-[7px] sm:text-[8px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] font-black whitespace-nowrap z-40 pointer-events-none anim-thwip-pop">
              {spideyPopBadge}
            </div>
          )}

          {/* 1. Spidey-Sense Rays Overlay */}
          {activeSpideyAction === 'sense' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11 h-11 pointer-events-none z-30 anim-spidey-sense-pro">
              <svg viewBox="0 0 50 50" className="w-full h-full filter drop-shadow-[0_0_8px_#facc15]">
                <line x1="8" y1="12" x2="16" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="2" y1="25" x2="12" y2="25" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="8" y1="38" x2="16" y2="32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="42" y1="12" x2="34" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="48" y1="25" x2="38" y2="25" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="42" y1="38" x2="34" y2="32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* 2. Pizza Slice Overlay Graphic */}
          {activeSpideyAction === 'pizza' && (
            <div className="absolute -bottom-1 -left-3 pointer-events-none z-35 anim-spidey-pizza">
              <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[1px_1px_0px_#000]">
                <polygon points="2,4 22,8 10,22" fill="#facc15" stroke="#000" strokeWidth="1.2" />
                <polygon points="2,4 22,8 20,4 4,2" fill="#b45309" stroke="#000" strokeWidth="1" />
                <circle cx="9" cy="11" r="2" fill="#dc2626" />
                <circle cx="15" cy="13" r="2.2" fill="#dc2626" />
                <circle cx="12" cy="17" r="1.5" fill="#dc2626" />
              </svg>
            </div>
          )}

          {/* 3. Retro Camera Graphic */}
          {activeSpideyAction === 'camera' && (
            <div className="absolute bottom-1 -left-3.5 pointer-events-none z-35">
              <svg width="20" height="18" viewBox="0 0 24 22" className="drop-shadow-[1px_1px_0px_#000]">
                <rect x="2" y="5" width="20" height="14" fill="#334155" stroke="#000" strokeWidth="1.2" rx="1" />
                <rect x="6" y="2" width="6" height="3" fill="#64748b" stroke="#000" strokeWidth="1" />
                <circle cx="12" cy="12" r="4.5" fill="#94a3b8" stroke="#000" strokeWidth="1.2" />
                <circle cx="19" cy="8" r="1.5" fill="#ef4444" />
              </svg>
            </div>
          )}

          {/* 4. Spider-Drone Flying Graphic (High-Tech Holographic Scanner) */}
          {activeSpideyAction === 'drone' && (
            <div className="absolute top-2 -left-2 pointer-events-none z-50 anim-spidey-drone">
              <div className="relative">
                {/* Holographic Blue Scanner Cone Beam */}
                <div
                  className="absolute -bottom-5 -left-3 w-12 h-6 bg-gradient-to-b from-cyan-400/40 via-cyan-400/15 to-transparent pointer-events-none"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}
                />
                <svg width="24" height="24" viewBox="0 0 28 28" className="drop-shadow-[0_0_8px_#38bdf8] overflow-visible">
                  {/* Drone Chassis Arms */}
                  <line x1="5" y1="5" x2="23" y2="23" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="5" y1="23" x2="23" y2="5" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Quad Propeller Rings */}
                  <circle cx="5" cy="5" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,2" />
                  <circle cx="23" cy="5" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,2" />
                  <circle cx="5" cy="23" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,2" />
                  <circle cx="23" cy="23" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,2" />
                  {/* Drone Core Body */}
                  <ellipse cx="14" cy="14" rx="5" ry="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                  {/* Glowing Red Sensor Eye */}
                  <circle cx="14" cy="14" r="2.2" fill="#ef4444" />
                  <circle cx="14.8" cy="13.2" r="0.7" fill="#ffffff" />
                </svg>
              </div>
            </div>
          )}

          {/* 5. Web Sling Line Graphic (Visual Shoot, No Auto-Copy) */}
          {activeSpideyAction === 'yoink' && (
            <div className="absolute bottom-1 right-3 h-[2.5px] bg-white border border-black shadow-[0_0_4px_#fff] origin-right pointer-events-none z-30 anim-web-yoink" />
          )}

          {/* Spiderman Sprite Vector SVG */}
          <div
            className={`transition-transform duration-200 ${
              activeSpideyAction === 'sense'
                ? 'anim-spidey-head-shake'
                : activeSpideyAction === 'pizza'
                ? 'anim-spidey-pizza'
                : 'anim-spidey-swing group-hover:scale-105'
            }`}
          >
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
        {/* Row 1 / Sisi Kiri: Boss Muzan HP & Combo Counter (Wide, Anti-Collapse) */}
        <div className="flex items-center gap-1.5 xs:gap-2 w-full sm:flex-1 sm:max-w-[320px]">
          <span className="font-pixel text-[6px] xs:text-[7px] sm:text-[7.5px] bg-red-600 text-white px-2 py-0.5 border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0">
            MUZAN HP
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
              title={`Total Muzan yang dikalahkan: ${demonKills}`}
            >
              {demonKills} KILLS
            </span>
          )}
        </div>

        {/* Row 2 / Sisi Kanan: Ultimate Meter Gauge & Tombol Jurus / Charge (Wide, Anti-Collapse) */}
        <div className="flex items-center gap-1.5 xs:gap-2 w-full sm:flex-1 sm:max-w-[340px] sm:justify-end">
          <span className="font-pixel text-[6px] xs:text-[7px] sm:text-[7.5px] bg-[var(--color-blue)] text-white px-2 py-0.5 border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0">
            ULT METER
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
                ? 'Muzan telah K.O.! Menunggu respawn...'
                : ultEnergy >= 100
                ? 'Jurus Pamungkas Siap! Klik untuk menebas Muzan!'
                : `Klik untuk charge energi (+25%)! Sekarang: ${ultEnergy}%`
            }
          >
            <span>{isBossKO ? 'K.O.!' : ultEnergy >= 100 ? 'JURUS!' : 'CHARGE'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STRIP RUNNER ARENA (GROUNDED PRECISELY ON TRACK LINE)     */}
      {/* ======================================================== */}
      <div className="w-full relative overflow-visible pt-8 xs:pt-10 sm:pt-12 pb-0.5 xs:pb-1 sm:pb-1 border-b-[2.5px] sm:border-b-[3px] border-dashed border-[var(--border-color)]">
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
                MUZAN K.O.!
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

        {/* Telegraph Warning Notification: Muzan Counter-Attack (2 Baris Terstruktur, Bebas Dempet) */}
        {isMuzanWarning && !isBossKO && (
          <div
            onClick={handleParryHero}
            className="absolute -top-1 xs:top-0 sm:top-1 left-0 right-0 z-40 flex justify-center pointer-events-auto cursor-pointer px-2 select-none"
            title="Klik sekarang untuk Tangkis (Parry)!"
          >
            <div className="bg-red-600 dark:bg-red-700 text-white border-2 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 xs:px-4 xs:py-2 flex flex-col items-center gap-1 xs:gap-1.5 max-w-[95vw] sm:max-w-md hover:bg-red-700 active:scale-95 transition-transform">
              {/* Baris 1: Status Peringatan & Petunjuk Aksi Tangkis */}
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 w-full">
                <span className="font-pixel text-[6px] xs:text-[7px] bg-yellow-400 text-black px-1.5 py-0.5 border border-black font-black animate-pulse shadow-[1px_1px_0px_#000]">
                  ! AWAS !
                </span>
                <span className="font-pixel text-[6px] xs:text-[7px] bg-black text-yellow-300 px-2 py-0.5 border border-yellow-400 font-bold tracking-wider shadow-[1px_1px_0px_#000]">
                  KLIK UNTUK TANGKIS (PARRY)
                </span>
              </div>

              {/* Baris 2: Nama Serangan Jurus Muzan (Terbaca Jelas, Lega & Tidak Dempet) */}
              <div className="text-center font-pixel text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white drop-shadow-[1px_1px_0px_#000] px-1 whitespace-nowrap">
                {muzanAttackType === 'shockwave'
                  ? 'MUZAN: GELOMBANG DARAH HITAM!'
                  : muzanAttackType === 'spikes'
                  ? 'MUZAN: DURI DARAH BUMI!'
                  : 'MUZAN: CAMBUK DAGING DARAH!'}
              </div>

              {/* Reaction Shrinking Countdown Progress Bar (0.95s window) */}
              <div className="w-full h-1 xs:h-1.5 bg-black/50 border border-black/60 overflow-hidden mt-0.5">
                <div className="h-full bg-yellow-300 anim-parry-timer" />
              </div>
            </div>
          </div>
        )}

        {/* Runner Arena Inner Row */}
        <div className="w-full flex items-end justify-between relative z-20 overflow-visible">
          {/* UJUNG KIRI: CHASE DUO (Hero Runner chasing Muzan Target - Grounded on Track) */}
          <div className={`flex items-end gap-8 xs:gap-11 sm:gap-16 relative transition-all duration-150 overflow-visible mb-[-1.5px] ${isRefreshing ? 'sprint-active' : ''}`}>
            {/* 1. Hero Runner in Place on Strip (Stable Speech Bubble & Fluid Sprite Stride) */}
            <div
              onClick={handleRunnerClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleRunnerClick();
              }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className="relative flex items-end cursor-pointer group pointer-events-auto select-none min-w-[50px] flex-shrink-0 overflow-visible"
              title={`${HERO_ROSTER[activeHero].name} (Klik untuk jurus serangan!)`}
            >
              {/* Speech / Action Bubble (Anchored on Left for Mobile, Staggered Floor Level) */}
              <div
                className={`absolute -top-6 xs:-top-7 left-0 xs:-left-1 sm:left-1/2 sm:-translate-x-1/2 font-pixel text-[5px] xs:text-[5.5px] sm:text-[6.5px] px-1.5 xs:px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-30 pointer-events-none transition-all duration-200 ${
                  isBossKO
                    ? 'opacity-100 scale-100 bg-emerald-400 text-black font-black animate-pulse'
                    : isHeroParrying
                    ? 'opacity-100 scale-100 bg-emerald-400 text-black font-black animate-bounce'
                    : isHeroStaggered
                    ? 'opacity-100 scale-100 bg-red-600 text-white font-black'
                    : runnerQuote || isRefreshing || isRunnerSlashing || isUltActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-85 group-hover:opacity-100 scale-95'
                } ${
                  isBossKO
                    ? ''
                    : isHeroParrying
                    ? 'bg-emerald-400 text-black font-black'
                    : isHeroStaggered
                    ? 'bg-red-600 text-white font-black'
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
                  : isHeroParrying
                  ? 'PERFECT PARRY!'
                  : isHeroStaggered
                  ? runnerQuote || 'TERKENA SERANGAN!'
                  : isUltActive
                  ? runnerQuote || HERO_ROSTER[activeHero].ultName
                  : isRunnerSlashing
                  ? runnerQuote || HERO_ROSTER[activeHero].quotes[0]
                  : isRefreshing
                  ? 'HASHIRA SYNC'
                  : runnerQuote || HERO_ROSTER[activeHero].badgeName}
              </div>

              {/* Distinct 8 Multi-Skill Visual FX Overlay (No identical crescent arcs!) */}
              {(isRunnerSlashing || isUltActive) && (
                <div className="absolute bottom-0 xs:bottom-0.5 left-7 xs:left-9 sm:left-12 pointer-events-none z-30 overflow-visible">
                  {/* 1. SEISEI RUTEN WATER DRAGON (Giyu) */}
                  {activeSkillFx === 'waterDragon' && (
                    <div className="fx-water-dragon w-[170px] xs:w-[210px] sm:w-[250px] overflow-visible">
                      <svg viewBox="0 0 240 90" className="w-full filter drop-shadow-[0_0_18px_#00ffff]">
                        <path d="M10,65 Q60,10 120,40 T210,20" fill="none" stroke="#00ffff" strokeWidth="16" strokeLinecap="round" opacity="0.85" />
                        <path d="M10,65 Q60,10 120,40 T210,20" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                        <polygon points="190,10 235,18 210,35 185,25" fill="#0284c7" stroke="#00ffff" strokeWidth="2" />
                        <polygon points="210,35 240,42 205,48 185,38" fill="#0284c7" stroke="#00ffff" strokeWidth="2" />
                        <circle cx="215" cy="22" r="3.5" fill="#ffffff" />
                        <circle cx="215" cy="22" r="2" fill="#00ffff" />
                        <path d="M225,20 Q240,10 235,0" fill="none" stroke="#ffffff" strokeWidth="2" />
                        <path d="M225,35 Q245,45 240,55" fill="none" stroke="#ffffff" strokeWidth="2" />
                      </svg>
                    </div>
                  )}

                  {/* 2. MIZU GURUMA 360° WATER WHEEL */}
                  {activeSkillFx === 'waterWheel' && (
                    <div className="fx-water-wheel w-[110px] xs:w-[135px] sm:w-[155px] h-[110px] xs:h-[135px] sm:h-[155px] -ml-5 sm:-ml-7 -mb-3 sm:-mb-4 overflow-visible">
                      <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_0_16px_#38bdf8]">
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#00ffff" strokeWidth="14" strokeDasharray="24,10" opacity="0.9" />
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="16,8" />
                        <circle cx="80" cy="80" r="42" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="20,12" />
                        <circle cx="80" cy="20" r="4" fill="#ffffff" />
                        <circle cx="140" cy="80" r="5" fill="#ffffff" />
                        <circle cx="80" cy="140" r="4" fill="#ffffff" />
                        <circle cx="20" cy="80" r="5" fill="#ffffff" />
                      </svg>
                    </div>
                  )}

                  {/* 3. NAGI DEAD CALM RIPPLE AURA */}
                  {activeSkillFx === 'deadCalm' && (
                    <div className="fx-dead-calm w-[180px] xs:w-[220px] sm:w-[260px] h-[90px] xs:h-[110px] sm:h-[130px] -ml-8 sm:-ml-12 -mb-2 overflow-visible">
                      <svg viewBox="0 0 280 140" className="w-full h-full filter drop-shadow-[0_0_20px_#06b6d4]">
                        <ellipse cx="140" cy="100" rx="130" ry="35" fill="rgba(6,182,212,0.22)" stroke="#00ffff" strokeWidth="2.5" />
                        <ellipse cx="140" cy="100" rx="90" ry="24" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                        <ellipse cx="140" cy="100" rx="50" ry="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        <circle cx="70" cy="95" r="2.5" fill="#ffffff" />
                        <circle cx="200" cy="102" r="3" fill="#ffffff" />
                      </svg>
                    </div>
                  )}

                  {/* 4. HINOKAMI SOLAR FIRE DRAGON */}
                  {activeSkillFx === 'solarDragon' && (
                    <div className="fx-solar-dragon w-[170px] xs:w-[210px] sm:w-[250px] overflow-visible">
                      <svg viewBox="0 0 240 90" className="w-full filter drop-shadow-[0_0_22px_#ff4500]">
                        <path d="M10,65 Q60,10 120,40 T210,20" fill="none" stroke="#ff4500" strokeWidth="18" strokeLinecap="round" opacity="0.9" />
                        <path d="M10,65 Q60,10 120,40 T210,20" fill="none" stroke="#ffe600" strokeWidth="7" strokeLinecap="round" />
                        <polygon points="190,8 240,18 215,36 185,25" fill="#dc2626" stroke="#ffe600" strokeWidth="2.5" />
                        <polygon points="215,36 245,45 205,50 185,40" fill="#dc2626" stroke="#ffe600" strokeWidth="2.5" />
                        <circle cx="218" cy="22" r="4" fill="#ffffff" />
                        <circle cx="218" cy="22" r="2" fill="#ffe600" />
                        <circle cx="50" cy="40" r="3.5" fill="#ffe600" />
                        <circle cx="100" cy="30" r="4" fill="#ffffff" />
                        <circle cx="150" cy="25" r="3" fill="#ff4500" />
                      </svg>
                    </div>
                  )}

                  {/* 5. HEKI-RA NO TEN VERTICAL SUN RING */}
                  {activeSkillFx === 'sunRing' && (
                    <div className="fx-sun-ring w-[110px] xs:w-[130px] sm:w-[150px] h-[120px] xs:h-[145px] sm:h-[165px] -ml-2 -mb-2 overflow-visible">
                      <svg viewBox="0 0 140 160" className="w-full h-full filter drop-shadow-[0_0_18px_#ff4500]">
                        <ellipse cx="70" cy="80" rx="55" ry="70" fill="none" stroke="#ff4500" strokeWidth="14" strokeDasharray="20,8" />
                        <ellipse cx="70" cy="80" rx="55" ry="70" fill="none" stroke="#ffe600" strokeWidth="5" />
                        <circle cx="70" cy="15" r="5" fill="#ffffff" />
                        <circle cx="70" cy="145" r="4.5" fill="#ffffff" />
                        <circle cx="18" cy="80" r="4" fill="#ffe600" />
                        <circle cx="122" cy="80" r="4" fill="#ffe600" />
                      </svg>
                    </div>
                  )}

                  {/* 6. HEKIREKI ROKUREN 6-FOLD LIGHTNING */}
                  {activeSkillFx === 'rokuren' && (
                    <div className="fx-rokuren-lightning w-[160px] xs:w-[190px] sm:w-[230px] overflow-visible">
                      <svg viewBox="0 0 220 90" className="w-full filter drop-shadow-[0_0_20px_#facc15]">
                        <path d="M10,80 L50,20 L90,70 L140,10 L170,85 L215,30" fill="none" stroke="#facc15" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10,80 L50,20 L90,70 L140,10 L170,85 L215,30" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="50" y1="20" x2="30" y2="60" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
                        <line x1="140" y1="10" x2="160" y2="50" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="50" cy="20" r="4" fill="#ffffff" />
                        <circle cx="140" cy="10" r="4" fill="#ffffff" />
                        <circle cx="215" cy="30" r="4.5" fill="#ffffff" />
                      </svg>
                    </div>
                  )}

                  {/* 7. KUIZAKI X-SLASH SERRATED SCISSORS */}
                  {activeSkillFx === 'xSlash' && (
                    <div className="fx-x-slash w-[120px] xs:w-[145px] sm:w-[170px] h-[95px] xs:h-[115px] sm:h-[130px] -ml-2 -mb-2 overflow-visible">
                      <svg viewBox="0 0 160 120" className="w-full h-full filter drop-shadow-[0_0_16px_#f59e0b]">
                        <line x1="15" y1="15" x2="145" y2="105" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                        <line x1="15" y1="15" x2="145" y2="105" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
                        <line x1="15" y1="105" x2="145" y2="15" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                        <line x1="15" y1="105" x2="145" y2="15" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
                        <circle cx="80" cy="60" r="7" fill="#ffffff" />
                      </svg>
                    </div>
                  )}

                  {/* 8. CHOU NO MAI WISTERIA BUTTERFLY TORNADO */}
                  {activeSkillFx === 'butterflyTornado' && (
                    <div className="fx-butterfly-tornado w-[130px] xs:w-[160px] sm:w-[185px] h-[105px] xs:h-[125px] sm:h-[145px] -ml-2 -mb-3 overflow-visible">
                      <svg viewBox="0 0 180 140" className="w-full h-full filter drop-shadow-[0_0_18px_#c084fc]">
                        <path d="M40,20 C20,30 20,50 45,45 C20,40 20,20 40,20 Z" fill="#c084fc" />
                        <path d="M90,40 C70,50 70,70 95,65 C70,60 70,40 90,40 Z" fill="#22d3ee" />
                        <path d="M140,25 C120,35 120,55 145,50 C120,45 120,25 140,25 Z" fill="#c084fc" />
                        <path d="M120,80 C100,90 100,110 125,105 C100,100 100,80 120,80 Z" fill="#e879f9" />
                        <circle cx="80" cy="70" r="3" fill="#ffffff" />
                        <circle cx="130" cy="50" r="3.5" fill="#ffffff" />
                        <circle cx="55" cy="35" r="2.5" fill="#22d3ee" />
                      </svg>
                    </div>
                  )}

                  {/* 9. BLADE WAVE (Default / Minamo Giri / Thrust) */}
                  {(activeSkillFx === 'bladeWave' || (!activeSkillFx && !isUltActive)) && (
                    <div className="fx-water-dragon w-[140px] xs:w-[170px] sm:w-[200px] overflow-visible">
                      <svg viewBox="0 0 180 60" className="w-full filter drop-shadow-[0_0_14px_#38bdf8]">
                        <path d="M10,48 Q70,8 140,22 T175,10" fill="none" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
                        <path d="M15,50 Q75,12 145,24 T178,12" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="50" cy="24" r="3" fill="#ffffff" />
                        <circle cx="105" cy="18" r="3.5" fill="#ffffff" />
                        <circle cx="150" cy="14" r="2.5" fill="#00ffff" />
                      </svg>
                    </div>
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
                  isHeroParrying
                    ? 'anim-hero-parry'
                    : isHeroStaggered
                    ? 'anim-hero-stagger'
                    : isBossKO
                    ? 'anim-victory-hop'
                    : isUltActive
                    ? 'anim-ult-lunge-sprint'
                    : isRunnerSlashing
                    ? 'anim-hero-charge'
                    : 'anim-real-run'
                }`}
              >
                {/* 1. GIYU TOMIOKA (Realistic Anime Vector) */}
                {activeHero === 'giyu' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.45" />
                    {/* Hakama Pants & White Leg Wraps (Kyahan) */}
                    <path d="M17,32 L23,32 L20,46 L15,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    <path d="M29,32 L35,32 L37,46 L32,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    <rect x="15" y="40" width="6" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <rect x="31" y="40" width="6" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    {/* Realistic Split Haori (Left Crimson Red, Right Green/Yellow Geometric) */}
                    <path d="M12,18 L26,18 L24,38 L10,38 Z" fill="#991b1b" stroke="#000" strokeWidth="1.4" />
                    <path d="M26,18 L40,18 L42,38 L28,38 Z" fill="#15803d" stroke="#000" strokeWidth="1.4" />
                    <rect x="29" y="21" width="4" height="4" fill="#eab308" />
                    <rect x="35" y="21" width="4" height="4" fill="#ea580c" />
                    <rect x="31" y="27" width="4" height="4" fill="#eab308" />
                    <rect x="37" y="27" width="4" height="4" fill="#ea580c" />
                    {/* White Kisatsutai Belt & Nichirin Katana with Tsuba */}
                    <rect x="18" y="30" width="16" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Realistic Anime Face & Deep Navy Blue Eyes */}
                    <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <ellipse cx="23" cy="15" rx="2.5" ry="2" fill="#0284c7" />
                    <circle cx="24" cy="14.5" r="0.8" fill="#ffffff" />
                    <line x1="21" y1="12.5" x2="26" y2="13.5" stroke="#000" strokeWidth="1" />
                    {/* Layered Ponytail Jet-Black Hair with Highlights */}
                    <path d="M17,6 C19,2 35,2 37,8 C39,14 36,18 34,19 C28,15 16,16 17,6 Z" fill="#0f172a" stroke="#000" strokeWidth="1.4" />
                    <path d="M14,13 Q10,20 12,28" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M15,14 Q12,20 13,26" fill="none" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                )}

                {/* 2. TANJIRO KAMADO (Realistic Anime Vector) */}
                {activeHero === 'tanjiro' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.45" />
                    <path d="M17,32 L23,32 L20,46 L15,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    <path d="M29,32 L35,32 L37,46 L32,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    {/* Checkered Green and Black Haori */}
                    <path d="M12,18 L40,18 L42,38 L10,38 Z" fill="#15803d" stroke="#000" strokeWidth="1.4" />
                    <rect x="14" y="20" width="5" height="5" fill="#0f172a" />
                    <rect x="24" y="20" width="5" height="5" fill="#0f172a" />
                    <rect x="34" y="20" width="5" height="5" fill="#0f172a" />
                    <rect x="19" y="26" width="5" height="5" fill="#0f172a" />
                    <rect x="29" y="26" width="5" height="5" fill="#0f172a" />
                    <rect x="18" y="30" width="16" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#ff4500" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Hanafuda Earring & Forehead Flame Mark */}
                    <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <polygon points="21,11 25,12 23,15" fill="#b91c1c" />
                    <rect x="17" y="16" width="2.5" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.6" />
                    <circle cx="18.2" cy="18" r="0.8" fill="#dc2626" />
                    <ellipse cx="24" cy="15" rx="2.5" ry="2" fill="#78350f" />
                    <circle cx="25" cy="14.5" r="0.8" fill="#ffffff" />
                    {/* Spiky Burgundy Hair */}
                    <path d="M16,10 C16,2 36,2 36,10 C38,5 34,14 31,16 C27,13 18,14 16,10 Z" fill="#450a0a" stroke="#000" strokeWidth="1.4" />
                    <path d="M22,5 C25,1 30,3 32,7" fill="none" stroke="#dc2626" strokeWidth="1" />
                  </svg>
                )}

                {/* 3. SMOL NEZUKO (Realistic Anime Vector) */}
                {activeHero === 'nezuko' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="14" ry="2.2" fill="#000000" opacity="0.45" />
                    {/* Dark Brown Haori & Pink Kimono */}
                    <path d="M12,18 L40,18 L43,44 L9,44 Z" fill="#271c19" stroke="#000" strokeWidth="1.4" />
                    <path d="M16,20 L36,20 L38,43 L14,43 Z" fill="#f472b6" stroke="#000" strokeWidth="1.2" />
                    {/* Red-and-White Checkered Obi Sash */}
                    <rect x="15" y="29" width="22" height="4" fill="#dc2626" stroke="#000" strokeWidth="0.8" />
                    <rect x="17" y="29" width="3" height="4" fill="#ffffff" />
                    <rect x="23" y="29" width="3" height="4" fill="#ffffff" />
                    <rect x="29" y="29" width="3" height="4" fill="#ffffff" />
                    <rect x="35" y="29" width="2" height="4" fill="#ffffff" />
                    {/* Flowing Long Hair with Bright Orange Tips */}
                    <path d="M8,16 Q4,30 8,42" fill="none" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M7,34 Q7,42 9,44" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M44,16 Q48,30 44,42" fill="none" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M45,34 Q45,42 43,44" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Face, Pink Eyes & Bamboo Muzzle */}
                    <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <ellipse cx="23" cy="14" rx="2.5" ry="2" fill="#f43f5e" />
                    <circle cx="24" cy="13.5" r="0.8" fill="#ffffff" />
                    <ellipse cx="29" cy="14" rx="2.5" ry="2" fill="#f43f5e" />
                    <circle cx="30" cy="13.5" r="0.8" fill="#ffffff" />
                    {/* Bamboo Muzzle */}
                    <rect x="20" y="17" width="12" height="4.5" fill="#84cc16" stroke="#000" strokeWidth="0.8" rx="2" />
                    <line x1="16" y1="19" x2="36" y2="19" stroke="#dc2626" strokeWidth="0.8" />
                    {/* Long Black Hair Top with Pink Ribbon */}
                    <path d="M16,10 C16,2 36,2 36,10 C38,14 34,16 32,17 C28,14 18,14 16,10 Z" fill="#18181b" stroke="#000" strokeWidth="1.4" />
                    <circle cx="19" cy="7" r="2.2" fill="#f43f5e" stroke="#000" strokeWidth="0.5" />
                  </svg>
                )}

                {/* 4. INOSUKE HASHIBIRA (Realistic Anime Vector) */}
                {activeHero === 'inosuke' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.45" />
                    {/* Muscular Bare Torso & Brown Fur Waist Pelt */}
                    <path d="M16,18 L36,18 L38,32 L14,32 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <line x1="26" y1="20" x2="26" y2="30" stroke="#d97706" strokeWidth="0.8" />
                    <line x1="20" y1="24" x2="32" y2="24" stroke="#d97706" strokeWidth="0.8" />
                    <path d="M12,30 L40,30 L42,39 L10,39 Z" fill="#78350f" stroke="#000" strokeWidth="1.4" />
                    <path d="M17,38 L23,38 L21,46 L15,46 Z" fill="#1e1b4b" stroke="#000" strokeWidth="1.2" />
                    <path d="M29,38 L35,38 L37,46 L32,46 Z" fill="#1e1b4b" stroke="#000" strokeWidth="1.2" />
                    {/* Dual Crossed Serrated Nichirin Katanas */}
                    <line x1="6" y1="12" x2="42" y2="42" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                    <line x1="6" y1="42" x2="42" y2="12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                    {/* Realistic Boar Mask with Curved Tusks */}
                    <rect x="15" y="6" width="22" height="15" fill="#94a3b8" stroke="#000" strokeWidth="1.4" rx="4" />
                    <circle cx="20" cy="11" r="2.8" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
                    <circle cx="21" cy="10" r="0.8" fill="#ffffff" />
                    <circle cx="32" cy="11" r="2.8" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
                    <circle cx="33" cy="10" r="0.8" fill="#ffffff" />
                    <polygon points="14,17 10,11 16,14" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <polygon points="38,17 42,11 36,14" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <ellipse cx="26" cy="16" rx="3.5" ry="2.2" fill="#f472b6" stroke="#000" strokeWidth="0.8" />
                  </svg>
                )}

                {/* 5. ZENITSU AGATSUMA (Realistic Anime Vector) */}
                {activeHero === 'zenitsu' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.45" />
                    <path d="M17,32 L23,32 L20,46 L15,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    <path d="M29,32 L35,32 L37,46 L32,46 Z" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
                    {/* Golden Yellow Haori with White Triangles */}
                    <path d="M12,18 L40,18 L42,38 L10,38 Z" fill="#facc15" stroke="#000" strokeWidth="1.4" />
                    <polygon points="16,22 19,27 13,27" fill="#ffffff" />
                    <polygon points="26,22 29,27 23,27" fill="#ffffff" />
                    <polygon points="36,22 39,27 33,27" fill="#ffffff" />
                    <polygon points="21,29 24,34 18,34" fill="#ffffff" />
                    <polygon points="31,29 34,34 28,34" fill="#ffffff" />
                    <rect x="18" y="30" width="16" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Focused Sleeping Concentration Face */}
                    <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <line x1="21" y1="16" x2="25" y2="16" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="28" y1="16" x2="32" y2="16" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
                    {/* Layered Yellow Chopped Hair with Orange Tips */}
                    <path d="M15,8 C17,2 35,2 37,8 C39,13 36,15 33,17 C28,14 18,14 15,8 Z" fill="#fde047" stroke="#000" strokeWidth="1.4" />
                    <polygon points="14,13 11,18 16,17" fill="#ea580c" />
                    <polygon points="38,13 41,18 36,17" fill="#ea580c" />
                    <polygon points="24,4 26,1 28,4" fill="#ea580c" />
                  </svg>
                )}

                {/* 6. SHINOBU KOCHO (Realistic Anime Vector) */}
                {activeHero === 'shinobu' && (
                  <svg
                    width="54"
                    height="50"
                    viewBox="0 0 54 50"
                    className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                  >
                    <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.45" />
                    {/* Lavender and Cyan Butterfly Wing Haori */}
                    <path d="M8,18 C6,9 18,7 24,15 C18,24 8,26 8,18 Z" fill="#c084fc" stroke="#000" strokeWidth="1.2" />
                    <path d="M44,18 C46,9 34,7 28,15 C34,24 44,26 44,18 Z" fill="#22d3ee" stroke="#000" strokeWidth="1.2" />
                    <path d="M16,18 L36,18 L38,36 L14,36 Z" fill="#18181b" stroke="#000" strokeWidth="1.2" />
                    <rect x="18" y="30" width="16" height="3" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="8" y1="36" x2="26" y2="29" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Gentle Smile Anime Face & Purple Eyes */}
                    <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#fde68a" stroke="#000" strokeWidth="1.2" />
                    <circle cx="23" cy="15" r="2" fill="#a855f7" />
                    <circle cx="24" cy="14" r="0.7" fill="#ffffff" />
                    <circle cx="29" cy="15" r="2" fill="#a855f7" />
                    <circle cx="30" cy="14" r="0.7" fill="#ffffff" />
                    <path d="M24,19 Q26,21 28,19" fill="none" stroke="#000" strokeWidth="0.8" />
                    {/* Butterfly Hair Ornament */}
                    <polygon points="14,4 11,1 18,3" fill="#c084fc" />
                    <polygon points="38,4 41,1 34,3" fill="#22d3ee" />
                    <path d="M17,6 C19,2 35,2 37,8 C39,12 36,15 33,16 C28,14 18,14 17,6 Z" fill="#18181b" stroke="#000" strokeWidth="1.2" />
                  </svg>
                )}
              </div>
            </div>

            {/* Parry Spark Flare Burst (Golden Starburst Flare on Nichirin Contact) */}
            {isHeroParrying && (
              <div className="absolute bottom-2 left-10 xs:left-12 sm:left-14 pointer-events-none z-40 w-10 h-10 xs:w-12 xs:h-12 anim-parry-spark">
                <svg viewBox="0 0 40 40" className="w-full h-full filter drop-shadow-[0_0_10px_#facc15]">
                  <polygon points="20,0 24,14 38,20 24,26 20,40 16,26 2,20 16,14" fill="#facc15" stroke="#ffffff" strokeWidth="1" />
                  <polygon points="20,6 23,15 32,20 23,25 20,34 17,25 8,20 17,15" fill="#ffffff" />
                  <circle cx="20" cy="20" r="4" fill="#ffffff" />
                </svg>
              </div>
            )}

            {/* 2. Muzan Demon King Target in Front of Hero (Iconic Fedora, Tuxedo & Blood Demon Mist) */}
            <div
              onClick={handleDemonClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDemonClick();
              }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className="relative flex items-end cursor-pointer group pointer-events-auto select-none min-w-[44px] flex-shrink-0 overflow-visible"
              title="Kibutsuji Muzan (Raja Iblis) - Klik untuk menyerang!"
            >
              {/* Muzan Badge Tag (Centered above fedora, Level with Hero Tag - Clean Neo-Brutalist Box) */}
              <div
                className={`absolute -top-6 xs:-top-7 left-1/2 -translate-x-1/2 font-pixel text-[5px] xs:text-[5.5px] sm:text-[6.5px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-30 pointer-events-none transition-all duration-200 ${
                  demonQuote || isDemonHit || isBossHurt || isBossKO
                    ? 'opacity-100 scale-100 bg-red-600 text-white font-black'
                    : 'opacity-90 group-hover:opacity-100 scale-95 sm:scale-100 bg-red-600 text-white font-bold'
                }`}
              >
                {demonQuote || (isBossKO ? 'K.O.!' : isBossHurt ? 'KISAMA!' : isDemonHit ? 'KISAMA!' : 'MUZAN')}
              </div>

              {/* Muzan Blood Demon Art Attack FX (Randomized: Whip, Shockwave, or Spikes) */}
              {isMuzanAttacking && muzanAttackType === 'whip' && (
                <div className="absolute bottom-1 right-7 xs:right-9 sm:right-11 pointer-events-none z-35 w-[115px] xs:w-[140px] sm:w-[170px] anim-whip-strike">
                  <svg viewBox="0 0 150 45" className="w-full filter drop-shadow-[0_0_12px_rgba(220,38,38,0.95)]">
                    <path d="M145,22 Q90,2 45,28 T5,20" fill="none" stroke="#7f1d1d" strokeWidth="6" strokeLinecap="round" />
                    <path d="M145,22 Q90,2 45,28 T5,20" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="85,12 92,7 90,16" fill="#ef4444" />
                    <polygon points="50,25 44,34 55,29" fill="#ef4444" />
                    <polygon points="24,20 16,28 20,16" fill="#ffffff" />
                    <circle cx="115" cy="12" r="3" fill="#dc2626" />
                    <circle cx="70" cy="20" r="2.5" fill="#f87171" />
                    <circle cx="30" cy="24" r="3" fill="#ffffff" />
                  </svg>
                </div>
              )}

              {isMuzanAttacking && muzanAttackType === 'shockwave' && (
                <div className="absolute bottom-0 right-7 xs:right-9 sm:right-11 pointer-events-none z-35 w-[120px] xs:w-[145px] sm:w-[175px] anim-shockwave-strike">
                  <svg viewBox="0 0 160 50" className="w-full filter drop-shadow-[0_0_14px_rgba(153,27,27,0.95)]">
                    <path d="M150,5 A 40 40 0 0 0 150,45" fill="none" stroke="#581c87" strokeWidth="7" strokeLinecap="round" opacity="0.6" />
                    <path d="M110,3 A 50 50 0 0 0 110,47" fill="none" stroke="#991b1b" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M70,2 A 60 60 0 0 0 70,48" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                    <path d="M30,4 A 70 70 0 0 0 30,46" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="110" cy="25" r="4" fill="#ffffff" />
                    <circle cx="70" cy="15" r="3" fill="#ffffff" />
                    <circle cx="70" cy="35" r="3" fill="#ffffff" />
                    <circle cx="30" cy="25" r="3.5" fill="#ffffff" />
                  </svg>
                </div>
              )}

              {isMuzanAttacking && muzanAttackType === 'spikes' && (
                <div className="absolute bottom-0 right-6 xs:right-8 sm:right-10 pointer-events-none z-35 w-[120px] xs:w-[145px] sm:w-[175px] anim-spikes-strike">
                  <svg viewBox="0 0 160 45" className="w-full filter drop-shadow-[0_0_12px_rgba(220,38,38,0.95)]">
                    <polygon points="140,45 146,12 152,45" fill="#991b1b" stroke="#000" strokeWidth="1" />
                    <polygon points="115,45 122,6 129,45" fill="#dc2626" stroke="#000" strokeWidth="1" />
                    <polygon points="85,45 92,2 99,45" fill="#ef4444" stroke="#000" strokeWidth="1" />
                    <polygon points="55,45 61,10 68,45" fill="#dc2626" stroke="#000" strokeWidth="1" />
                    <polygon points="25,45 31,4 38,45" fill="#b91c1c" stroke="#000" strokeWidth="1" />
                    <polygon points="5,45 10,16 16,45" fill="#991b1b" stroke="#000" strokeWidth="1" />
                    <line x1="122" y1="8" x2="124" y2="40" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="92" y1="4" x2="94" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="31" y1="6" x2="33" y2="40" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              {/* Panic Sweat Drop */}
              <div className="absolute -top-3 right-1 pointer-events-none z-30 anim-sweat-fx">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M5,1 C5,1 2,5 2,7 C2,8.5 3.5,9.5 5,9.5 C6.5,9.5 8,8.5 8,7 C8,5 5,1 5,1 Z" fill="#38bdf8" stroke="#000" strokeWidth="0.6" />
                  <circle cx="4" cy="6" r="0.7" fill="#fff" />
                </svg>
              </div>

              {/* Muzan Sprite Container (With Smooth Procedural Physics) */}
              <div
                className={`relative z-20 overflow-visible ${
                  isMuzanAttacking
                    ? 'anim-muzan-lunge'
                    : isBossKO
                    ? 'anim-demon-ko'
                    : isBossHurt
                    ? 'anim-demon-hurt'
                    : isDemonHit
                    ? 'anim-demon-hit-action'
                    : 'anim-demon-stride'
                }`}
              >
                <svg
                  width="54"
                  height="50"
                  viewBox="0 0 54 50"
                  className="w-[48px] h-[44px] xs:w-[54px] xs:h-[50px] sm:w-[60px] sm:h-[56px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
                >
                  <ellipse cx="27" cy="48" rx="16" ry="2.5" fill="#000000" opacity="0.5" />
                  {/* Kaki Celana Tuksedo & Sepatu Pantofel Mengkilap */}
                  <path d="M18,34 L23,34 L21,46 L16,46 Z" fill="#090d16" stroke="#000" strokeWidth="1.2" />
                  <path d="M29,34 L34,34 L36,46 L31,46 Z" fill="#090d16" stroke="#000" strokeWidth="1.2" />
                  <polygon points="15,46 22,46 21,48 14,48" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                  <polygon points="30,46 37,46 38,48 31,48" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                  {/* Jas Tuksedo Hitam Edwardian & Dasi Sutra Merah */}
                  <path d="M14,18 L38,18 L41,38 L11,38 Z" fill="#0f172a" stroke="#000" strokeWidth="1.4" />
                  <polygon points="23,18 27,30 31,18" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                  <polygon points="25,20 27,27 29,20" fill="#dc2626" />
                  <rect x="33" y="24" width="3" height="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                  {/* Wajah Bangsawan Porselen Pucat */}
                  <path d="M19,10 L33,10 L31,21 L26,24 L21,21 Z" fill="#f8fafc" stroke="#000" strokeWidth="1.2" />
                  {/* Mata Merah Kucing Slit Muzan Menyala */}
                  <ellipse cx="23" cy="15" rx="2.5" ry="1.8" fill="#dc2626" />
                  <line x1="23" y1="13.5" x2="23" y2="16.5" stroke="#000" strokeWidth="1" />
                  <ellipse cx="29" cy="15" rx="2.5" ry="1.8" fill="#dc2626" />
                  <line x1="29" y1="13.5" x2="29" y2="16.5" stroke="#000" strokeWidth="1" />
                  {/* Rambut Keriting Ikal Hitam Bangsawan */}
                  <path d="M16,10 C14,18 18,20 20,20 C18,17 17,14 18,11 Z" fill="#000000" />
                  <path d="M36,10 C38,18 34,20 32,20 C34,17 35,14 34,11 Z" fill="#000000" />
                  {/* Topi Fedora Putih Berbayang Pita Sutra Hitam */}
                  <ellipse cx="26" cy="10" rx="16" ry="4" fill="#f1f5f9" stroke="#000" strokeWidth="1.4" />
                  <path d="M16,3 L36,3 L35,10 L17,10 Z" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
                  <rect x="16.5" y="7" width="19" height="3" fill="#0f172a" stroke="#000" strokeWidth="0.6" />
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
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 35 }}
                    className="brutal-btn !absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-white dark:bg-zinc-800 text-black dark:text-white font-pixel text-xs font-black flex items-center justify-center hover:bg-[var(--color-yellow)] dark:hover:bg-yellow-500 transition-transform active:scale-90 shadow-[2px_2px_0px_var(--shadow-color)]"
                    title="Pahlawan Sebelumnya (Tombol Panah Kiri)"
                    aria-label="Pahlawan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white stroke-[2.5]" />
                  </button>

                  {/* Right Carousel Button (>) */}
                  <button
                    type="button"
                    onClick={handleNextHero}
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 35 }}
                    className="brutal-btn !absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-white dark:bg-zinc-800 text-black dark:text-white font-pixel text-xs font-black flex items-center justify-center hover:bg-[var(--color-yellow)] dark:hover:bg-yellow-500 transition-transform active:scale-90 shadow-[2px_2px_0px_var(--shadow-color)]"
                    title="Pahlawan Berikutnya (Tombol Panah Kanan)"
                    aria-label="Pahlawan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white stroke-[2.5]" />
                  </button>

                  {/* Speech Callout Balloon */}
                  {modalQuote && (
                    <div className="absolute top-4 z-20 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-none">
                      <div className="bg-black text-white px-2.5 py-1 font-pixel text-[8px] sm:text-[9px] border-2 border-yellow-300 shadow-[2px_2px_0px_#000] font-bold uppercase tracking-wider">
                        {modalQuote}
                      </div>
                    </div>
                  )}

                  {/* Realistic Character Art with Directional Transition */}
                  <div
                    key={previewHero}
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

                {/* Dedicated Navigation Strip (Between Stage and Thumbnails) */}
                <div className="flex items-center justify-between gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]">
                  <button
                    type="button"
                    onClick={handlePrevHero}
                    className="brutal-btn flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-[var(--color-yellow)] active:scale-95 text-[8.5px] sm:text-[9.5px] font-pixel shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                    title="Pahlawan Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>SEBELUMNYA</span>
                  </button>

                  <div className="px-2 py-0.5 text-center shrink-0">
                    <span className="font-pixel text-[8.5px] sm:text-[9.5px] font-black text-black dark:text-white">
                      0{HERO_KEYS.indexOf(previewHero) + 1} / 0{HERO_KEYS.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextHero}
                    className="brutal-btn flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-[var(--color-yellow)] active:scale-95 text-[8.5px] sm:text-[9.5px] font-pixel shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                    title="Pahlawan Berikutnya"
                  >
                    <span>BERIKUTNYA</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
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
