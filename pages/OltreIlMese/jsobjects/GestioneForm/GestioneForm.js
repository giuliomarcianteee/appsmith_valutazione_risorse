export default {
  async openModal() {
    const nuovoId = TabellaSettimane.triggeredRow.IdDipendenti;
    const precedenteId = appsmith.store.IdMesiSelezionato;

    // Aggiorna sempre lo store
    storeValue("IdMesiSelezionato", nuovoId);

    if (nuovoId !== precedenteId) {
      await NomeRisorsa.run();
      ResetForm.resetForm();
    }

    // Esegui ValutazioniSelect e controlla se ha almeno una riga
    await ValutazioniSelect.run();

    if (ValutazioniSelect.data && ValutazioniSelect.data.length > 0) {
      showModal("ModalChoose");
    } else {
      showModal("ModalInsert");
    }
  }
}
