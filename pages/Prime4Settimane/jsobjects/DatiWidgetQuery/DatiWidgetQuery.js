export default {
  // Ottiene tutti i dati dal widget (originali + modificati)
  getAllData() {
    // CAMBIA QUESTO: usa il nome corretto del tuo widget
    // Sostituisci "DettaglioSettimanaWidget" con il nome effettivo del tuo widget
    const widgetName = "DettaglioSettimanaWidget"; // O il nome che usi effettivamente
   	const widget = appsmith.store[widgetName] || window[widgetName];
    
    if (!widget?.model?.allData) {
      return {};
    }
    
    console.log("Dati recuperati dal widget:", widget.model.allData);
    return widget.model.allData;
  },

  // Verifica se il widget è pronto
  isWidgetReady() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    return widget?.model?.isReady === true;
  },

  // Resto del codice rimane uguale...
  getValore(campo, defaultValue = '') {
    const allData = DatiWidgetQuery.getAllData();
    return allData[campo] !== undefined ? allData[campo] : defaultValue;
  },

  getValoreNumerico(campo, defaultValue = 0) {
    const valore = DatiWidgetQuery.getValore(campo, defaultValue);
    const numero = parseInt(valore, 10);
    return isNaN(numero) ? defaultValue : numero;
  },

  // Ottiene l'ID settimana
  getIdSettimane() {
    // Prima prova dal widget
    let idSettimane = DatiWidgetQuery.getValore('IdSettimane');
    
    // Se non c'è, prova dalla tabella
    if (!idSettimane && TabellaSettimane?.triggeredRow?.IdDipendenti) {
      idSettimane = TabellaSettimane.triggeredRow.IdDipendenti;
    }
    
    return idSettimane;
  },

  // Prepara tutti i dati per la query di aggiornamento
  preparaDatiPerQuery() {
    if (!DatiWidgetQuery.isWidgetReady()) {
      showAlert("I dati non sono ancora pronti. Riprova.", "warning");
      return null;
    }

    const allData = DatiWidgetQuery.getAllData();
    const idSettimane = DatiWidgetQuery.getIdSettimane();

    if (!idSettimane) {
      showAlert("ID Settimane mancante. Impossibile salvare.", "error");
      return null;
    }

    // Lista completa dei campi
    const campi = [
      "IdSettimane",
      "1ConoscenzaManualeFormativo", "1NoteConoscenzaManualeFormativo",
      "1ConoscenzaOrganizzazioneMerceologica", "1NoteConoscenzaOrganizzazioneMerceologica",
      "1AccoglienzaCliente", "1NoteAccoglienzaCliente",
      "1PresentazioneProdottoeSconti", "1NotePresentazioneProdottoeSconti",
      "1ConoscenzaBrandOreficeria", "1NoteConoscenzaBrandOreficeria",
      "1VenditaInSicurezza", "1NoteVenditaInSicurezza",
      "1FidelizzazioneCliente", "1NoteFidelizzazioneCliente",
      "1UtilizzoCassaPos", "1NoteUtilizzoCassaPos",
      "1MetodoScaricoVenditaFidelityOrari", "1NoteMetodoScaricoVenditaFidelityOrari",
      "1ConfezionamentoProdotto", "1NoteConfezionamentoProdotto",
      "1CongedoCliente", "1NoteCongedoCliente",
      "1Vetrine", "1NoteVetrine",
      "2ConoscenzaGioielleria", "2NoteConoscenzaGioielleria",
      "2ConoscenzaOrologi", "2NoteConoscenzaOrologi",
      "2TabletPerRicercaComunicazioniOrdini", "2NoteTabletPerRicercaComunicazioniOrdini",
      "2MetodoObiettiviRiparazioniPreventiviComproOroGaranzie", "2NoteMetodoObiettiviRiparazioniPreventiviComproOroGaranzie",
      "2PlanningSettimanale", "2NotePlanningSettimanale",
      "2UsoAgenda", "2NoteUsoAgenda",
      "2GestioneRipa", "2NoteGestioneRipa",
      "2AllestimentoNegozio", "2NoteAllestimentoNegozio",
      "2DisallestimentoNegozio", "2NoteDisallestimentoNegozio",
      "2AllarmeAlCollo", "2NoteGestioneAllarmeAlCollo",
      "2CellulareAziendale", "2NoteCellulareAziendale",
      "2ControlloCassa", "2NoteControlloCassa"
    ];

    const datiQuery = {};
    campi.forEach(campo => {
      if (campo === 'IdSettimane') {
        datiQuery[campo] = idSettimane;
      } else {
        datiQuery[campo] = allData[campo] || '';
      }
    });

    return datiQuery;
  },
  // Funzione principale per aggiornare la valutazione
  async aggiornaValutazione() {
    try {
      showAlert("Salvataggio in corso...", "info");
      
      const datiQuery = DatiWidgetQuery.preparaDatiPerQuery();
      if (!datiQuery) {
        return false;
      }

      console.log("Dati da salvare:", datiQuery);

      // Esegui la query di aggiornamento
      const result = await Settimana1_update.run();
      
      if (result) {
        showAlert("Dati salvati con successo!", "success");
        
        // Opzionale: chiudi il modal se esiste
        if (typeof closeModal !== 'undefined') {
          closeModal('Settimana_1');
        }
        
        return true;
      } else {
        throw new Error("La query non ha restituito un risultato valido");
      }
      
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      showAlert(`Errore durante il salvataggio: ${error.message}`, "error");
      return false;
    }
  }
	
}