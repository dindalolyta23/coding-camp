export default class NotFoundPage {
  async render() {
    return `
      <section class="container">
        <div class="not-found">
          <h1><i data-feather="alert-circle"></i> 404 - Halaman Tidak Ditemukan</h1>
          <p>Maaf, halaman yang Anda cari tidak ada.</p>
          <a href="#/" class="home-link">
            <i data-feather="home"></i> Kembali ke Beranda
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    feather.replace();
  }
}