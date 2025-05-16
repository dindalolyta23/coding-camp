import CONFIG from "../config";

const BASE_URL = CONFIG.BASE_URL;

const api = {
  async register({ name, email, password }) {
    const response = await fetch(`${BASE_URL}register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const response = await fetch(`${BASE_URL}stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  async addGuestStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const response = await fetch(`${BASE_URL}stories/guest`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  async getAllStories({ token, page, size, location = 0 }) {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (size) params.append("size", size);
    if (location !== undefined) params.append("location", location);

    const response = await fetch(`${BASE_URL}stories?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async getStoryDetail({ token, id }) {
    const response = await fetch(`${BASE_URL}stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async subscribeNotification({ token, endpoint, keys }) {
    const response = await fetch(`${BASE_URL}notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint,
        keys,
      }),
    });
    return response.json();
  },

  async unsubscribeNotification({ token, endpoint }) {
    const response = await fetch(`${BASE_URL}notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  },
};

export default api;
