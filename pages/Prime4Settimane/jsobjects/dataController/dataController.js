export default {
  formatObjectForTable: () => {
    const details = appsmith.store.selectedWeekDetails;
    if (!details) {
      return; // La tabella si aspetta un array
    }

    // Trasforma l'oggetto {k1: v1, k2: v2} in un array [{Proprietà: k1, Valore: v1},...]
    return Object.keys(details).map(key => {
      return { "Proprietà": key, "Valore": details[key] };
    });
  },
	
  onRowSelect: async (selectedRow) => {
    // Qui è possibile eseguire validazioni o trasformazioni sui dati.
    // Esempio: formattare una data o calcolare un nuovo campo.
    if (!selectedRow) {
      // Se la riga viene deselezionata, pulisce lo store.
      await removeValue('selectedWeekDetails');
      return;
    }

    // Salva l'oggetto della riga selezionata nello store di Appsmith.
    // Il terzo parametro 'false' indica che il dato non deve persistere
    // tra le sessioni (viene cancellato al refresh della pagina).
    await storeValue('selectedWeekDetails', selectedRow, false);
  },

  // Nuova funzione per gestire l'update
  updateSettimana: async () => {
    try {
      // Esegui la query di update
      await Settimana1_update.run();
      
      // Mostra un messaggio di successo
      showAlert('Dati salvati con successo!', 'success');
      
      // Ricarica i dati della tabella principale per riflettere le modifiche
      await DipendentiQuery.run();
      
      // Opzionalmente, ricarica anche i dettagli della settimana
      await Settimana1.run();
      
    } catch (error) {
      // Gestisci gli errori
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error('Errore update:', error);
    }
  }
}