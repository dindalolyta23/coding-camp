import RegisterPresenter from "../../presenters/RegisterPresenter";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter(this);
    this.app = document.querySelector("main")?.app; // Null check untuk instance app
  }

  async render() {
    return /*html*/ `
      <section class="container auth-container">
        <h1><i data-feather="user-plus"></i> Registrasi</h1>
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="name"><i data-feather="user"></i> Nama</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              placeholder="Nama lengkap"
            >
          </div>
          <div class="form-group">
            <label for="email"><i data-feather="mail"></i> Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              placeholder="email@contoh.com"
            >
          </div>
          <div class="form-group">
            <label for="password"><i data-feather="key"></i> Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required
              placeholder="Minimal 6 karakter"
            >
          </div>
          <button type="submit" class="submit-button">
            <i data-feather="edit"></i> Daftar
          </button>
        </form>
        <p class="auth-link">
          Sudah punya akun? <a href="#/login"><i data-feather="log-in"></i> Login di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    feather.replace(); // Render ikon
    const form = document.getElementById("registerForm");
    if (!form) {
      console.error("Register form tidak ditemukan!");
      return;
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      await this.presenter.handleRegistration(name, email, password);
    });
  }

  // UI FEEDBACK METHODS ====================================
  showError(message) {
    alert(`❌ ${message}`);
  }

  showSuccess(message, redirectUrl) {
    alert(`🎉 ${message}`);
    if (redirectUrl) {
      window.location.hash = redirectUrl;
    }
  }
}
