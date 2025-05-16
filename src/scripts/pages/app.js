import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  updateNavigation() {
    const authItem = document.querySelector(".auth-item");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      // Update navigasi dengan Feather Icons
      authItem.innerHTML = `
        <a href="#/logout" class="logout-button">
          <i data-feather="log-out"></i> Logout | <i data-feather="user"></i> ${user.name}
        </a>
      `;

      // Tambahkan event listener untuk logout
      const logoutLink = authItem.querySelector("a");
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        this.updateNavigation();
        window.location.hash = "#/login";
      });
    } else {
      // Update navigasi untuk pengguna belum login
      authItem.innerHTML = `
        <a href="#/login">
          <i data-feather="log-in"></i> Login/Register
        </a>
      `;
    }

    // Render ulang Feather Icons setelah update DOM
    feather.replace();
  }

  _setupDrawer() {
    // Event listener untuk toggle drawer
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    // Event listener untuk close drawer saat klik di luar
    document.body.addEventListener("click", (event) => {
      const isClickInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isClickOnDrawerButton = this.#drawerButton.contains(event.target);

      if (!isClickInsideDrawer && !isClickOnDrawerButton) {
        this.#navigationDrawer.classList.remove("open");
      }

      // Close drawer saat klik link navigasi
      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  // Ganti kode renderPage di app.js
  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    try {
      // Animasi keluar halaman lama
      if (this.#content) {
        const exitAnimation = this.#content.animate(
          [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(20px)" },
          ],
          {
            duration: 300,
            easing: "ease-in-out",
          }
        );
        await exitAnimation.finished;
      }

      // Render halaman baru
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      // Animasi masuk halaman baru
      const enterAnimation = this.#content.animate(
        [
          { opacity: 0, transform: "translateY(-20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 300,
          easing: "ease-in-out",
        }
      );
      await enterAnimation.finished;

      this.updateNavigation();
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  }
}

export default App;
