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
 
	}
	

}