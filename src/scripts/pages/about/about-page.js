export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1><i data-feather="user"></i> Tentang Pembuat</h1>
        
        <div class="bio-container">
          <div class="bio-item">
            <i data-feather="user"></i>
            <span class="bio-label">Nama :</span>
            <span class="bio-value">Taufiq Hidayatullah</span>
          </div>

          <div class="bio-item">
            <i data-feather="book"></i>
            <span class="bio-label">Asal Universitas :</span>
            <span class="bio-value">Universitas Amikom Yogyakarta</span>
          </div>

          <div class="bio-item">
            <i data-feather="award"></i>
            <span class="bio-label">Program Studi :</span>
            <span class="bio-value">S1-Informatika</span>
          </div>

          <div class="bio-item">
            <i data-feather="heart"></i>
            <span class="bio-label">Minat :</span>
            <span class="bio-value">Web Development, Data Mining</span>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Inisialisasi Feather Icons
    feather.replace();
  }
}