// The tests' stand-in for vite-plugin-pwa's `virtual:pwa-register/react` (vitest.config.ts): no service worker.
export function useRegisterSW(_options?: unknown) {
  return {
    needRefresh: [false, () => {}] as [boolean, (value: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (value: boolean) => void],
    updateServiceWorker: async (_reload?: boolean) => {},
  };
}
