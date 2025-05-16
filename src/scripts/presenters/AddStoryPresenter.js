import api from "../data/api";

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.selectedLocation = null;
  }

  handleMapClick(latlng) {
    this.selectedLocation = latlng;
  }

  async handleFormSubmit(description, photo) {
    try {
      this.validateInput(description, photo);

      const response = await api.addStory({
        token: localStorage.getItem("token"),
        description,
        photo,
        lat: this.selectedLocation?.lat,
        lon: this.selectedLocation?.lng,
      });

      if (!response.error) {
        this.view.showSuccess();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  validateInput(description, photo) {
    const errors = [];

    if (!description) errors.push("deskripsi");
    if (!photo) errors.push("foto");
    if (!this.selectedLocation) errors.push("lokasi peta");

    if (errors.length > 0) {
      throw new Error(`Harap isi ${errors.join(", ")}!`);
    }
  }
}
