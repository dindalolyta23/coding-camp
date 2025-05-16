import AddStoryPresenter from "../../presenters/AddStoryPresenter";

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.map = null;
    this.marker = null;
    this.mediaStream = null;
    this.capturedPhoto = null;
    this.cameraElements = {
      openButton: null,
      captureButton: null,
      previewPlaceholder: null,
    };
  }

  async render() {
    return /*html*/ `
      <section class="container add-story-container">
        <h1><i data-feather="edit-3"></i> Buat Cerita Baru</h1>
        <form id="storyForm" class="story-form">
          <div class="form-group">
            <label for="description"><i data-feather="align-left"></i> Deskripsi Cerita</label>
            <textarea 
              id="description" 
              name="description" 
              required
              rows="4"
              placeholder="Ceritakan momen spesialmu..."
            ></textarea>
          </div>

          <div class="media-container">
            <div class="camera-preview" id="cameraPreview">
              <p class="preview-placeholder"><i data-feather="video"></i> Kamera belum diaktifkan</p>
            </div>
            
            <div class="media-buttons">
              <button type="button" id="openCamera" class="camera-button">
                <i data-feather="camera"></i> Buka Kamera
              </button>
              
              <button type="button" id="captureButton" class="capture-button" style="display: none;">
                <i data-feather="aperture"></i> Ambil Foto
              </button>
              
              <input type="file" id="photo" name="photo" accept="image/*" hidden />
              <label for="photo" class="upload-button">
                <i data-feather="upload"></i> Unggah Foto
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><i data-feather="map"></i> Pilih Lokasi</label>
            <div id="map" class="story-map"></div>
            <div class="coordinates">
              <span><i data-feather="map-pin"></i> Latitude: <span id="latValue">-</span></span>
              <span><i data-feather="map-pin"></i> Longitude: <span id="lonValue">-</span></span>
            </div>
          </div>

          <button type="submit" class="submit-button">
            <i data-feather="send"></i> Publikasikan Cerita
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    feather.replace();
    this.initMap();
    this.setupEventListeners();
  }

  // UI METHODS ==============================================
  initMap() {
    this.map = L.map("map", {
      center: [-2.5489, 118.0149],
      zoom: 5,
      zoomControl: false,
      preferCanvas: true,
    });

    // ================== TILE LAYER DENGAN API KEY ANDA ==================
    // Layer 1: OpenStreetMap (Default)
    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      }
    );

    // Layer 2: MapTiler Topography (Menggunakan API key Anda)
    const maptilerTopo = L.tileLayer(
      `https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=phKlUR2uQ7LzZPu21Y47`,
      {
        attribution:
          '<a href="https://www.maptiler.com/copyright/">MapTiler</a>',
      }
    );

    // Tambahkan layer default
    osmLayer.addTo(this.map);

    // ================== LAYER CONTROL ==================
    const baseLayers = {
      OpenStreetMap: osmLayer,
      Topography: maptilerTopo,
    };

    L.control
      .layers(baseLayers, null, {
        position: "bottomright",
        collapsed: false,
      })
      .addTo(this.map);

    // Click handler
    this.map.on("click", (e) => {
      this.presenter.handleMapClick(e.latlng);
      this.updateMapMarker(e.latlng);
    });
  }

  updateMapMarker(latlng) {
    if (this.marker) this.marker.remove();
    this.marker = L.marker(latlng, { draggable: false })
      .addTo(this.map)
      .bindPopup("📍 Lokasi Dipilih");

    document.getElementById("latValue").textContent = latlng.lat.toFixed(5);
    document.getElementById("lonValue").textContent = latlng.lng.toFixed(5);
  }

  setupEventListeners() {
    const cameraPreview = document.getElementById("cameraPreview");
    const openCameraBtn = document.getElementById("openCamera");
    const captureBtn = document.getElementById("captureButton");
    const photoInput = document.getElementById("photo");

    // Camera handlers
    openCameraBtn.addEventListener("click", () => this.startCamera());
    captureBtn.addEventListener("click", () => this.capturePhoto());
    photoInput.addEventListener("change", (e) => this.handleFileUpload(e));

    // Form submission
    document.getElementById("storyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.presenter.handleFormSubmit(
        e.target.description.value.trim(),
        this.capturedPhoto || photoInput.files[0]
      );
    });
  }

  // CAMERA METHODS ==========================================
  async startCamera() {
    try {
      // 1. Hentikan kamera sebelumnya jika ada
      this.stopCamera();

      // 2. Dapatkan elemen UI
      const cameraPreview = document.getElementById("cameraPreview");
      if (!cameraPreview) {
        this.showError("Elemen kamera tidak ditemukan");
        return;
      }

      // 3. Request akses kamera
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // 4. Update UI sebelum inisialisasi video
      this.toggleCameraUI(true);

      // 5. Setup video preview
      cameraPreview.innerHTML =
        '<video class="live-camera" autoplay playsinline></video>';
      const video = cameraPreview.querySelector("video");

      if (video && this.mediaStream) {
        video.srcObject = this.mediaStream;

        // 6. Tunggu hingga video siap
        video.onloadedmetadata = () => {
          video.play().catch((error) => {
            this.handleCameraError(error);
          });
        };
      }
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  handleCameraError(error) {
    let message = "Gagal mengakses kamera!";

    // Handle error spesifik
    if (error.name === "NotAllowedError") {
      message +=
        "\n\n🔒 Tolong berikan izin akses kamera di pengaturan browser!";
    } else if (error.name === "NotFoundError") {
      message += "\n\n📷 Tidak ditemukan perangkat kamera!";
    } else {
      message += `\n\nKode error: ${error.name}`;
    }

    // Reset UI
    this.toggleCameraUI(false);
    this.showError(message);
  }

  toggleCameraUI(isCameraActive) {
    // Dapatkan referensi elemen
    const openBtn = document.getElementById("openCamera");
    const captureBtn = document.getElementById("captureButton");
    const placeholder = document.querySelector(".preview-placeholder");

    // Null check bertingkat
    if (!openBtn || !captureBtn || !placeholder) {
      console.error("Elemen UI kamera tidak ditemukan!");
      return;
    }

    // Update tampilan
    openBtn.style.display = isCameraActive ? "none" : "flex";
    captureBtn.style.display = isCameraActive ? "flex" : "none";
    placeholder.style.display = isCameraActive ? "none" : "block";

    // Force reflow untuk animasi
    void openBtn.offsetHeight;
  }

  capturePhoto() {
    try {
      const video = document.querySelector(".live-camera");
      if (!video || video.readyState !== 4) {
        this.showError("Video belum siap direkam");
        return;
      }

      // Buat canvas
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Ambil frame
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Konversi ke blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            this.showError("Gagal mengambil foto");
            return;
          }

          try {
            // Simpan foto
            this.capturedPhoto = new File([blob], "story.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Tampilkan preview
            this.showPhotoPreview(URL.createObjectURL(blob));

            // Matikan kamera
            this.stopCamera();
            this.toggleCameraUI(false);
          } catch (error) {
            this.handleCameraError(error);
          }
        },
        "image/jpeg",
        0.85 // Kualitas 85%
      );
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  showPhotoPreview(imageUrl) {
    const cameraPreview = document.getElementById("cameraPreview");
    if (!cameraPreview) return;

    // Update tampilan
    cameraPreview.innerHTML = `
    <img src="${imageUrl}" class="captured-image">
    <button class="retake-button">⟳ Ambil Ulang</button>
  `;

    // Tambahkan event listener untuk tombol retake
    cameraPreview
      .querySelector(".retake-button")
      .addEventListener("click", () => {
        cameraPreview.innerHTML =
          '<p class="preview-placeholder">🎥 Kamera belum diaktifkan</p>';
        this.capturedPhoto = null;
        this.toggleCameraUI(false);
      });
  }

  stopCamera() {
    try {
      if (this.mediaStream) {
        // Hentikan semua track
        this.mediaStream.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
            track.enabled = false;
          }
        });
        this.mediaStream = null;
      }

      // Hapus video element
      const video = document.querySelector(".live-camera");
      if (video) {
        video.srcObject = null;
        video.remove();
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  }

  async handleFileUpload(event) {
    try {
      // Hentikan kamera jika aktif
      this.stopCamera();

      const file = event.target.files[0];

      if (!file) return;

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        throw new Error("File harus berupa gambar");
      }

      // Simpan file yang diupload
      this.capturedPhoto = file;

      // Tampilkan preview
      const preview = document.getElementById("cameraPreview");
      if (preview) {
        this.showPhotoPreview(URL.createObjectURL(file));
      }
    } catch (error) {
      this.showError(error.message);
      event.target.value = ""; // Reset input file
    }
  }

  // UI FEEDBACK =============================================
  showError(message) {
    alert(`❌ Error: ${message}`);
  }

  showSuccess() {
    alert("🎉 Cerita berhasil dipublikasikan!");
    window.location.hash = "#/";
  }

  // CLEANUP =================================================
  destroy() {
    this.stopCamera();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
