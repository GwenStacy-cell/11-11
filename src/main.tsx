import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-update Service Worker for installed PWA
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically claim clients and reload to show fresh deployment from Vercel
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[11:11 Walkie] App ready for offline use');
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // Whenever user unlocks screen or returns to the app, check Vercel for new deployment
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
      // Also poll every 10 minutes while app is running
      setInterval(() => {
        registration.update().catch(() => {});
      }, 10 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')!).render(<App />);
