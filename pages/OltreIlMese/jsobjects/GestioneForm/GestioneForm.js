export default {
  openModal() {
    const nuovoId = TabellaSettimane.triggeredRow.IdDipendenti;
    const precedenteId = appsmith.store.IdMesiSelezionato;

    // Aggiorna sempre lo store
    storeValue("IdMesiSelezionato", nuovoId);

    if (nuovoId !== precedenteId) {
      NomeRisorsa.run();
      ResetForm.resetForm();
    }

    showModal("ModalInsert");
  }
}

