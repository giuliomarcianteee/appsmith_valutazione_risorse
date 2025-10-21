export default {
  resetForm1() {
    // Rating da 1 a 17
    for (let i = 1; i <= 17; i++) {
      resetWidget(`Rating${i}`);
      resetWidget(`Input${i}`);
    }
  },

  resetForm2() {
    // Rating da 18 a 28
    for (let i = 18; i <= 28; i++) {
      resetWidget(`Rating${i}`);
      resetWidget(`Input${i}`);
    }
  }
}
