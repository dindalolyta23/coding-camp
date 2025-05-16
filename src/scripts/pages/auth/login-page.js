import LoginPresenter from "../../presenters/LoginPresenter";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter(this);
    this.app = document.querySelector("main")?.app; // Null check untuk instance app
  }

  async render() {
    return /*html*/ `
      <section class="container auth-container">
        <h1><i data-feather="lock"></i> Login</h1>
        <form id="loginForm" class="auth-form">
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
              placeholder="Password"
            >
          </div>
          <button type="submit" class="submit-button">
            <i data-feather="log-in"></i> Masuk
          </button>
        </form>
        <p class="auth-link">
          Belum punya akun? <a href="#/register"><i data-feather="user-plus"></i> Daftar di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    feather.replace(); // Update ikon
    const form = document.getElementById("loginForm");
    if (!form) {
      console.error("Login form tidak ditemukan!");
      return;
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      await this.presenter.handleLoginForm(email, password);
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
