"use client";

import { useState, useEffect } from "react";

// TypeScript interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function PWATestPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if running as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Online/Offline status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check for service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setServiceWorkerRegistration(registration);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

  const testNotification = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("JalRakshak PWA", {
          body: "PWA features are working correctly!",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          PWA Test Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Installation Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Installation Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  PWA Installed:
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    isInstalled
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isInstalled ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Install Available:
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    installPrompt
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {installPrompt ? "Yes" : "No"}
                </span>
              </div>
              {installPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Install PWA
                </button>
              )}
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Network Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Connection:
                </span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isOnline ? "All features available" : "Using cached content"}
              </div>
            </div>
          </div>

          {/* Service Worker Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Service Worker
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    serviceWorkerRegistration
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {serviceWorkerRegistration ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {serviceWorkerRegistration
                  ? "Caching enabled for offline use"
                  : "No service worker detected"}
              </div>
            </div>
          </div>

          {/* PWA Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              PWA Features Test
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Responsive Design
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Works on all devices
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Offline Support
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Cached for offline use
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Push Notifications
                </h3>
                <button
                  onClick={testNotification}
                  className="text-sm text-purple-600 hover:text-purple-800 mt-1"
                >
                  Test Notification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manifest Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            App Manifest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Basic Info
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <strong>Name:</strong> JalRakshak - Digital Health
                  Surveillance
                </li>
                <li>
                  <strong>Short Name:</strong> JalRakshak
                </li>
                <li>
                  <strong>Theme Color:</strong> #0891b2
                </li>
                <li>
                  <strong>Display Mode:</strong> Standalone
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✅ Web App Manifest</li>
                <li>✅ Service Worker</li>
                <li>✅ Responsive Icons</li>
                <li>✅ Offline Support</li>
                <li>✅ Install Prompt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
