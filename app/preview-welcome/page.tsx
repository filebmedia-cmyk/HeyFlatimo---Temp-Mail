'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import WelcomeScreen from '@/components/WelcomeScreen';
import MainMailView from '@/components/MainMailView';
import { getSoundEnabled } from '@/lib/sound';

export default function PreviewWelcomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [soundActive, setSoundActive] = useState(true);

  useEffect(() => {
    setSoundActive(getSoundEnabled());
  }, [showWelcome]);

  return (
    <div className="relative min-h-screen">
      {/* Background/Underlying Web View with Welcome disabled to avoid duplicate overlay */}
      <MainMailView disableWelcome={true} />

      {/* Floating Welcome Screen Preview */}
      {showWelcome && (
        <WelcomeScreen
          appName="HeyFlatimo"
          autoDismissDelay={3000}
          isSoundEnabled={soundActive}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      {/* Replay Overlay Button if dismissed */}
      {!showWelcome && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setShowWelcome(true)}
            className="brutal-btn bg-[#ffe600] text-black font-mono-custom font-black px-4 py-2.5 border-3 border-black shadow-[4px_4px_0px_#000] text-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>PREVIEW ANIMASI LAGI</span>
          </button>
        </div>
      )}
    </div>
  );
}
