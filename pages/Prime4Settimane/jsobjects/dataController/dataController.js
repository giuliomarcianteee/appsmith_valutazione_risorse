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

    // Prima esegui la query per ottenere i dati aggiornati
    await Settimana1.run();
    
    // Poi salva l'oggetto della riga selezionata nello store di Appsmith.
    // Il terzo parametro 'false' indica che il dato non deve persistere
    // tra le sessioni (viene cancellato al refresh della pagina).
    await storeValue('selectedWeekDetails', selectedRow, false);
  },

    // Nuova funzione per gestire l'update
  updateSettimana1: async () => {
    try {
      // Esegui la query di update
      await Settimana1_update.run();
      
      // Mostra un messaggio di successo
      showAlert('Dati salvati con successo!', 'success');
      
      // Ricarica i dati della tabella principale per riflettere le modifiche
      await DipendentiQuery.run();
      
      // IMPORTANTE: Ricarica anche i dettagli della settimana E aggiorna lo store
      await Settimana1.run();
      
			closeModal(Settimana_1.name);
			
      // Aggiorna lo store con i nuovi dati
      if (Settimana1.data && Settimana1.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana1.data[0], false);
      }
			
      
    } catch (error) {
      // Gestisci gli errori
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error('Errore update:', error);
    }
		
  },
	  updateSettimana2: async () => {
    try {
      // Esegui la query di update
      await Settimana1_update.run();
      
      // Mostra un messaggio di successo
      showAlert('Dati salvati con successo!', 'success');
      
      // Ricarica i dati della tabella principale per riflettere le modifiche
      await DipendentiQuery.run();
      
      // IMPORTANTE: Ricarica anche i dettagli della settimana E aggiorna lo store
      await Settimana2.run();
      
			closeModal(Settimana_1.name);
			
      // Aggiorna lo store con i nuovi dati
      if (Settimana2.data && Settimana2.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana2.data[0], false);
      }
			
      
    } catch (error) {
      // Gestisci gli errori
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error('Errore update:', error);
    }
		
  },
	  updateSettimana3: async () => {
    try {
      // Esegui la query di update
      await Settimana3_update.run();
      
      // Mostra un messaggio di successo
      showAlert('Dati salvati con successo!', 'success');
      
      // Ricarica i dati della tabella principale per riflettere le modifiche
      await DipendentiQuery.run();
      
      // IMPORTANTE: Ricarica anche i dettagli della settimana E aggiorna lo store
      await Settimana3.run();
      
			closeModal(Settimana_1.name);
			
      // Aggiorna lo store con i nuovi dati
      if (Settimana3.data && Settimana3.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana3.data[0], false);
      }
			
      
    } catch (error) {
      // Gestisci gli errori
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error('Errore update:', error);
    }
		
  },
	  updateSettimana4: async () => {
    try {
      // Esegui la query di update
      await Settimana1_update.run();
      
      // Mostra un messaggio di successo
      showAlert('Dati salvati con successo!', 'success');
      
      // Ricarica i dati della tabella principale per riflettere le modifiche
      await DipendentiQuery.run();
      
      // IMPORTANTE: Ricarica anche i dettagli della settimana E aggiorna lo store
      await Settimana4.run();
      
			closeModal(Settimana_1.name);
			
      // Aggiorna lo store con i nuovi dati
      if (Settimana4.data && Settimana4.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana4.data[0], false);
      }
			
      
    } catch (error) {
      // Gestisci gli errori
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error('Errore update:', error);
    }
		
  },
	updateSettimanaSwitch: async () => {
  const category = appsmith.store.currentCategory;
  
  switch(category) {
    case 1:
      await this.updateSettimana1();
      break;
    case 2:
      await this.updateSettimana2();
      break;
    case 3:
      await this.updateSettimana3();
      break;
    case 4:
      await this.updateSettimana4();
      break;
    default:
      console.log("Categoria non valida:", category);
      showAlert('Errore: categoria settimana non valida', 'error');
      break;
  }
},

  // Nuova funzione per ricaricare i dati quando si riapre il modal
  refreshModalData: async () => {
    try {
			await DipendentiQuery.run();
      // Ricarica la query Settimana1 con i dati aggiornati
      await Settimana1.run();
     	
			showModal(Settimana_1.name);
      // Aggiorna lo store con i dati freschi
      if (Settimana1.data && Settimana1.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana1.data[0], false);
      }
    } catch (error) {
      console.error('Errore nel ricaricare i dati del modal:', error);
    }
  }
}