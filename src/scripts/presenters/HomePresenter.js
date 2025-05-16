import api from "../data/api";
import { storyDB } from "../data/idb";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.searchQuery = "";
  }

  async initialize() {
    await this.loadAllStories();
    this.initializePushNotifications();
  }

  async loadAllStories() {
    try {
      this.view.showLoading();

      const token = localStorage.getItem("token");

      if (!token) {
        // Jika tidak ada token, coba ambil data offline
        const offlineStories = await storyDB.getAllStories();
        if (offlineStories.length > 0) {
          this.view.displayStories(offlineStories);
          this.view.showOfflineWarning();
        } else {
          this.view.showAuthWarning();
        }
        return;
      }

      try {
        const response = await api.getAllStories({
          token,
          location: this.view.showLocationStories ? 1 : 0,
          search: this.searchQuery,
        });

        this.handleResponse(response);

        // Simpan data ke IndexedDB untuk akses offline
        if (response.listStory) {
          response.listStory.forEach((story) => {
            storyDB.saveStory({
              ...story,
              id: story.id || story.createdAt, // fallback ID
            });
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data online:", error);
        const offlineStories = await storyDB.getAllStories();
        if (offlineStories.length > 0) {
          this.view.displayStories(offlineStories);
          this.view.showOfflineWarning();
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }

  handleResponse(response) {
    const items = [
      ...(response?.data?.stories || []),
      ...(response?.listStory || []),
      ...(response?.stories || []),
    ];

    if (!Array.isArray(items)) {
      throw new Error("Format data story tidak valid");
    }

    this.view.displayStories(items);
  }

  async initializePushNotifications() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",
          });

          await this.handleSubscription(subscription);
        }
      } catch (error) {
        console.error("Push notification initialization failed:", error);
      }
    }
  }

  async handleSubscription(subscription) {
    try {
      await api.subscribeNotification({
        token: localStorage.getItem("token"),
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    } catch (error) {
      console.error("Subscription error:", error);
    }
  }
}
