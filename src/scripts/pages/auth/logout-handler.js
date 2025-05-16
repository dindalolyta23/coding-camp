export default class LogoutHandler {
  async render() {
    return `<div class="logout-processing">Memproses logout...</div>`;
  }

  async afterRender() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Tambahkan delay untuk feedback visual
    setTimeout(() => {
      window.location.hash = "#/login";
    }, 1000);
  }
}
