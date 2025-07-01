export default {
  // Sincronizza triggeredRow con selectedRow
  syncSelection() {
    try {
      if (TabellaSettimane?.triggeredRow) {
        // Trova l'indice della riga triggeredRow nei dati della tabella
        const data = TabellaSettimane.tableData || [];
        const triggeredRow = TabellaSettimane.triggeredRow;
        
        // Trova l'indice basandoti su un campo unico (es. IdSettimane)
        const rowIndex = data.findIndex(row => 
          row.IdSettimane === triggeredRow.IdSettimane
        );
        
        if (rowIndex >= 0) {
          // Imposta la riga come selezionata
          TabellaSettimane.setSelectedRowIndex(rowIndex);
          console.log(`Riga ${rowIndex} selezionata automaticamente`);
        }
      }
    } catch (error) {
      console.error("Errore nella sincronizzazione:", error);
    }
  },

  // Funzione combinata per aprire la prima settimana
  async apriPrimaSettimana() {
    try {
      // 1. Sincronizza la selezione
      this.syncSelection();
      
      // 2. Verifica che ci sia una riga selezionata
      if (!TabellaSettimane.triggeredRow?.IdSettimane) {
        showAlert("Seleziona prima un dipendente", "warning");
        return;
      }
      
      // 3. Carica i dati per quella specifica settimana
      await Settimana1.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      // 4. Aspetta un momento per il caricamento
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 5. Apri il modal
      showModal('Settimana_1');
      
    } catch (error) {
      console.error("Errore nell'apertura della settimana:", error);
      showAlert("Errore nel caricamento dei dati", "error");
    }
  },

  // Funzione per aprire la seconda settimana
  async apriSecondaSettimana() {
    try {
      this.syncSelection();
      
      if (!TabellaSettimane.triggeredRow?.IdSettimane) {
        showAlert("Seleziona prima un dipendente", "warning");
        return;
      }
      
      await Settimana1.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      showModal('Settimana_2');
      
    } catch (error) {
      console.error("Errore nell'apertura della seconda settimana:", error);
      showAlert("Errore nel caricamento dei dati", "error");
    }
  },

  // Funzione generica per debug
  debugSelection() {
    console.log("=== DEBUG SELEZIONE TABELLA ===");
    console.log("triggeredRow:", TabellaSettimane?.triggeredRow);
    console.log("selectedRow:", TabellaSettimane?.selectedRow);
    console.log("selectedRowIndex:", TabellaSettimane?.selectedRowIndex);
    console.log("tableData length:", TabellaSettimane?.tableData?.length);
  }
}