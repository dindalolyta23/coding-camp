import api from "../data/api";
import { storyDB } from "../data/idb";

const VAPID_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

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

        if (response.listStory) {
          response.listStory.forEach((story) => {
            storyDB.saveStory({
              ...story,
              id: story.id || story.createdAt,
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
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      this.view.showError("Browser tidak mendukung push notification");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const permission = await Notification.requestPermission();

      switch (permission) {
        case "granted":
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(VAPID_KEY),
          });
          await this.handleSubscription(subscription);
          break;

        case "denied":
          this.view.showError("Izin notifikasi ditolak. Silakan aktifkan manual.");
          break;

        default:
          console.log("Izin notifikasi ditunda");
      }
    } catch (error) {
      console.error("Push notification error:", error);
      this.view.showError("Gagal mengaktifkan notifikasi");
    }
  }

  async handleSubscription(subscription) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const response = await api.subscribeNotification({
        token,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });

      if (response.error) throw new Error(response.message);

      console.log("Berhasil subscribe:", response);
    } catch (error) {
      console.error("Subscription error:", error);
      await subscription.unsubscribe(); // rollback jika gagal
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }
}
