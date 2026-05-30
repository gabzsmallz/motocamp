import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Dismissed before — don't show again this session
    if (sessionStorage.getItem('pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so it doesn't flash on first load
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setVisible(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  }

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2000] sm:left-auto sm:right-4 sm:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#141f14] border border-green-700/60 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-green-800">
            <img src="/pwa-192.png" alt="KenyaMotocamp" className="w-full h-full" />
          </div>

          <div className="flex-1 pr-4">
            <p className="text-sm font-semibold text-green-100">Install KenyaMotocamp</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Add to your home screen for offline access and faster loading.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Download size={14} /> Install
          </button>
          <button
            onClick={dismiss}
            className="px-4 py-2 bg-[#1e3320] border border-[#2d5a2e] text-gray-400 hover:text-gray-200 rounded-xl text-sm transition-colors"
          >
            Not now
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <Smartphone size={10} /> Works offline after install
        </p>
      </div>
    </div>
  );
}
