export default {
// Funzione per storare IdSettimana dalla tabella TabellaSettimane
 storeIdSettimana: async () => {
  try {
    // Ottieni la riga selezionata dalla tabella
    const triggeredRow = TabellaSettimane.triggeredRow;
    
    // Verifica che ci sia una riga selezionata
    if (!triggeredRow) {
      console.warn("Nessuna riga selezionata nella tabella TabellaSettimane");
      return null;
    }
    
    // Ottieni IdSettimana dalla riga selezionata
    const idSettimana = triggeredRow.IdSettimane;
    
    // Verifica che IdSettimana esista
    if (!idSettimana) {
      console.warn("IdSettimana non trovato nella riga selezionata");
      return null;
    }
    
    // Stora il valore con nome storedIdSettimana
    await storeValue('storedIdSettimana', idSettimana, false);
    
    console.log("IdSettimana storato con successo:", idSettimana);
    return idSettimana;
    
  } catch (error) {
    console.error("Errore durante lo store di IdSettimana:", error);
    return null;
  }
},
	
// Funzione per pulire il valore storato
 clearStoredIdSettimana: async () => {
  await storeValue('storedIdSettimana', null, false);
  console.log("storedIdSettimana pulito");
}

}