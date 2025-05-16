import api from "../data/api";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleLoginForm(email, password) {
    try {
      this.validateInput(email, password);

      const response = await api.login({ email, password });

      if (!response.error) {
        this.handleSuccess(response);
        return true;
      }
      throw new Error(response.message);
    } catch (error) {
      this.view.showError(`Gagal login: ${error.message}`);
      return false;
    }
  }

  validateInput(email, password) {
    const errors = [];
    if (!email) errors.push("email");
    if (!password) errors.push("password");

    if (errors.length > 0) {
      throw new Error(`Harap isi ${errors.join(" dan ")}!`);
    }
  }

  handleSuccess(response) {
    // Simpan data user
    localStorage.setItem("token", response.loginResult.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: response.loginResult.name,
        email: response.loginResult.email,
      })
    );

    // Update navigasi
    if (this.view.app && typeof this.view.app.updateNavigation === "function") {
      this.view.app.updateNavigation();
    }

    // Feedback & redirect
    this.view.showSuccess(`Selamat datang ${response.loginResult.name}!`, "#/");
  }
}
