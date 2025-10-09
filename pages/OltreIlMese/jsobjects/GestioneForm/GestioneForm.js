export default {
  openModal() {
    if (currentRow.IdDipendenti === StoredValue.text) {
      storeValue("IdMesiSelezionato", currentRow.IdDipendenti);
      NomeRisorsa.run();
      showModal("ModalInsert");
    } else {
      ResetForm.resetForm();
      showModal("ModalInsert");
    }
  }
}
