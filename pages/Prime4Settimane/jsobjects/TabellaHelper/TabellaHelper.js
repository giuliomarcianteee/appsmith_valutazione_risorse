export default {
  // Sincronizza triggeredRow con selectedRow
  syncSelection() {
    try {
      if (TabellaSettimane?.triggeredRow) {
        const data = TabellaSettimane.tableData || [];
        const triggeredRow = TabellaSettimane.triggeredRow;
        
        const rowIndex = data.findIndex(row => 
          row.IdSettimane === triggeredRow.IdSettimane
        );
        
        if (rowIndex >= 0) {
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
      this.syncSelection();
      
      if (!TabellaSettimane.triggeredRow?.IdSettimane) {
        showAlert("Seleziona prima un dipendente", "warning");
        return;
      }
      
      // Salva la settimana corrente nello store
      await storeValue('settimanaCorrente', 1, false);
      
      await Settimana1.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      
      // Salva la settimana corrente nello store
      await storeValue('settimanaCorrente', 2, false);
      
      await Settimana2.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      showModal('Settimana_2');
      
    } catch (error) {
      console.error("Errore nell'apertura della seconda settimana:", error);
      showAlert("Errore nel caricamento dei dati", "error");
    }
  },

  // Funzione per aprire la terza settimana
  async apriTerzaSettimana() {
    try {
      this.syncSelection();
      
      if (!TabellaSettimane.triggeredRow?.IdSettimane) {
        showAlert("Seleziona prima un dipendente", "warning");
        return;
      }
      
      // Salva la settimana corrente nello store
      await storeValue('settimanaCorrente', 3, false);
      
      await Settimana3.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      showModal('Settimana_3');
      
    } catch (error) {
      console.error("Errore nell'apertura della terza settimana:", error);
      showAlert("Errore nel caricamento dei dati", "error");
    }
  },

  // Funzione per aprire la quarta settimana
  async apriQuartaSettimana() {
    try {
      this.syncSelection();
      
      if (!TabellaSettimane.triggeredRow?.IdSettimane) {
        showAlert("Seleziona prima un dipendente", "warning");
        return;
      }
      
      // Salva la settimana corrente nello store
      await storeValue('settimanaCorrente', 4, false);
      
      await Settimana4.run({
        IdSettimane: TabellaSettimane.triggeredRow.IdSettimane
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      showModal('Settimana_4');
      
    } catch (error) {
      console.error("Errore nell'apertura della quarta settimana:", error);
      showAlert("Errore nel caricamento dei dati", "error");
    }
  },

  // Funzione generica per debug
  debugSelection() {
    console.log("=== DEBUG SELEZIONE TABELLA ===");
    console.log("triggeredRow:", TabellaSettimane?.triggeredRow);
    console.log("selectedRow:", TabellaSettimane?.selectedRow);
    console.log("tableData length:", TabellaSettimane?.tableData?.length);
    console.log("settimanaCorrente:", appsmith.store.settimanaCorrente);
  }
}