import api from "../data/api";

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleRegistration(name, email, password) {
    try {
      this.validateInput(name, email, password);

      // Proses registrasi
      const registerResponse = await api.register({ name, email, password });
      if (registerResponse.error) throw new Error(registerResponse.message);

      // Auto-login setelah registrasi berhasil
      const loginResponse = await api.login({ email, password });
      if (loginResponse.error) throw new Error(loginResponse.message);

      this.handleSuccess(loginResponse);
      return true;
    } catch (error) {
      this.view.showError(`Gagal registrasi: ${error.message}`);
      return false;
    }
  }

  validateInput(name, email, password) {
    const errors = [];
    if (!name) errors.push("nama");
    if (!email) errors.push("email");
    if (!password) errors.push("password");

    if (errors.length > 0) {
      throw new Error(`Harap isi ${errors.join(", ")}!`);
    }

    if (password.length < 6) {
      throw new Error("Password minimal 6 karakter!");
    }
  }

  handleSuccess(loginResponse) {
    // Simpan data user
    localStorage.setItem("token", loginResponse.loginResult.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: loginResponse.loginResult.name,
        email: loginResponse.loginResult.email,
      })
    );

    // Update navigasi
    if (this.view.app && typeof this.view.app.updateNavigation === "function") {
      this.view.app.updateNavigation();
    }

    // Feedback & redirect
    this.view.showSuccess("Registrasi berhasil! Anda sudah login", "#/");
  }
}
