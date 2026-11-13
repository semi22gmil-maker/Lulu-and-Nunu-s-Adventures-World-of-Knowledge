export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  scope: string | null;
  warmedAssetsCount: number;
  error: string | null;
}

function collectLoadedAppAssets(): string[] {
  if (typeof document === 'undefined') return [];
  const urls = new Set<string>(['/', '/index.html', '/manifest.webmanifest', '/icon.svg']);

  document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((el) => {
    try {
      const u = new URL(el.src, window.location.origin);
      if (u.origin === window.location.origin) urls.add(u.pathname + u.search);
    } catch {
      // ignore invalid URL
    }
  });

  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]').forEach((el) => {
    try {
      const u = new URL(el.href, window.location.origin);
      if (u.origin === window.location.origin) urls.add(u.pathname + u.search);
    } catch {
      // ignore invalid URL
    }
  });

  return Array.from(urls);
}

function warmAssetsViaWorker(worker: ServiceWorker, urls: string[]): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve(), 2500);
    channel.port1.onmessage = () => {
      window.clearTimeout(timer);
      resolve();
    };
    worker.postMessage({ type: 'CACHE_ASSETS', urls }, [channel.port2]);
  });
}

export async function registerOfflineServiceWorker(): Promise<ServiceWorkerStatus> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      supported: false,
      registered: false,
      scope: null,
      warmedAssetsCount: 0,
      error: 'Service Worker غير مدعوم',
    };
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const assets = collectLoadedAppAssets();
    const targetWorker = reg.active || navigator.serviceWorker.controller;
    if (targetWorker && assets.length > 0) {
      await warmAssetsViaWorker(targetWorker, assets);
    }

    return {
      supported: true,
      registered: true,
      scope: reg.scope,
      warmedAssetsCount: assets.length,
      error: null,
    };
  } catch (err) {
    return {
      supported: true,
      registered: false,
      scope: null,
      warmedAssetsCount: 0,
      error: err instanceof Error ? err.message : 'تعذر تسجيل Service Worker',
    };
  }
}
