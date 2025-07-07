export default {
  // Verifica se il widget è pronto
  isWidgetReady() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    return widget?.model?.isReady === true;
  },
	getValore(campo, defaultValue = '') {
		const allData = DatiWidgetQuery.getAllData();
		const valore = allData[campo];

		// Gestisci NULL e undefined
		if (valore === null || valore === undefined || valore === '') {
			return defaultValue;
		}

		return valore;
	},

  getValoreNumerico(campo, defaultValue = 0) {
  const valore = DatiWidgetQuery.getValore(campo, defaultValue);
  
  // Se è stringa vuota o null, ritorna defaultValue
  if (valore === '' || valore === null || valore === undefined) {
    return defaultValue;
  }
  
  const numero = parseInt(valore, 10);
  return isNaN(numero) ? defaultValue : numero;
},

		// Ottiene l'ID settimana
	getIdSettimane() {
		// Prima prova dal widget
		let idSettimane = DatiWidgetQuery.getValore('IdSettimane');

		// Se non c'è, prova selectedSettimanaId
		if (!idSettimane) {
			idSettimane = DatiWidgetQuery.getValore('selectedSettimanaId');
		}

		// Se ancora non c'è, prova dalla tabella
		if (!idSettimane && TabellaSettimane?.triggeredRow?.IdSettimane) {
			idSettimane = TabellaSettimane.triggeredRow.IdSettimane;
		}

		// Come ultima risorsa, prova IdDipendenti (nel caso sia lo stesso)
		if (!idSettimane && TabellaSettimane?.triggeredRow?.IdDipendenti) {
			idSettimane = TabellaSettimane.triggeredRow.IdDipendenti;
		}

		console.log("ID Settimane trovato:", idSettimane);
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
"IdSettimane", "1ConoscenzaManualeFormativo", "1NoteConoscenzaManualeFormativo", "1ConoscenzaOrganizzazioneMerceologica", "1NoteConoscenzaOrganizzazioneMerceologica", "1AccoglienzaCliente", "1NoteAccoglienzaCliente", "1PresentazioneProdottoeSconti", "1NotePresentazioneProdottoeSconti", "1ConoscenzaBrandOreficeria", "1NoteConoscenzaBrandOreficeria", "1VenditaInSicurezza", "1NoteVenditaInSicurezza", "1FidelizzazioneCliente", "1NoteFidelizzazioneCliente", "1UtilizzoCassaPos", "1NoteUtilizzoCassaPos", "1MetodoScaricoVenditaFidelityOrari", "1NoteMetodoScaricoVenditaFidelityOrari", "1ConfezionamentoProdotto", "1NoteConfezionamentoProdotto", "1CongedoCliente", "1NoteCongedoCliente", "1Vetrine", "1NoteVetrine", "2ConoscenzaGioielleria", "2NoteConoscenzaGioielleria", "2ConoscenzaOrologi", "2NoteConoscenzaOrologi", "2TabletPerRicercaComunicazioniOrdini", "2NoteTabletPerRicercaComunicazioniOrdini", "2MetodoObiettiviRiparazioniPreventiviComproOroGaranzie", "2NoteMetodoObiettiviRiparazioniPreventiviComproOroGaranzie", "2PlanningSettimanale", "2NotePlanningSettimanale", "2UsoAgenda", "2NoteUsoAgenda", "2GestioneRipa", "2NoteGestioneRipa", "2AllestimentoNegozio", "2NoteAllestimentoNegozio", "2DisallestimentoNegozio", "2NoteDisallestimentoNegozio", "2AllarmeAlCollo", "2NoteGestioneAllarmeAlCollo", "2CellulareAziendale", "2NoteCellulareAziendale", "2ControlloCassa", "2NoteControlloCassa", "3PianificazioneLavoroDaSvolgere", "3NotePianificazioneLavoroDaSvolgere", "3ProceduraComproOro", "3NoteProceduraComproOro", "3TestSulMetallo", "3NoteTestSulMetallo", "3ConoscenzaOroDaInvestimento", "3NoteConoscenzaOroDaInvestimento", "3ProcedureGiroMerce", "3NoteProcedureGiroMerce", "3GestioneCambioTurno", "3NoteGestioneCambioTurno", "3MetodoCaricoScaricoComproOroPreventiviOroInvestimento", "3TabletComproOro", "3NoteTabletComproOro", "4AutonomiaAllarmiAperturaChiusura", "4NoteAutonomiaAllarmiAperturaChiusura", "4AutonomiaChiusraContabile", "4NoteAutonomiaChiusraContabile", "4CapacitaConfrontoColleghe", "4NoteCapacitaConfrontoColleghe", "4ConoscenzaCompletaComproOro", "4NoteConoscenzaCompletaComproOro", "4VenditaOroInvestimento", "4NoteVenditaOreInvestimento", "4RicercaProdottiSuTablet", "4NoteRicercaProdottiSuTablet", "4MetodoRistampaDocFediSchede", "4NoteMetodoRistampaDocFediSchede", "4MetodoDisimpegnoOggettiPrenotati", "4NoteMetodoDisimpegnoOggettiPrenotati"
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
	 // Funzione per ottenere i dati dalla tabella filtrati per categoria
  getTableDataByCategory(categoria) {
    // Ottieni i dati dalla tabella (come facevi prima)
    const tableData = TabellaSettimane.triggeredRow;
    
    if (!tableData || !categoria) {
      return tableData; // Restituisce tutti i dati se non c'è categoria
    }

    const filteredData = {};
    const categoryPrefix = categoria.toString();

    // Mantieni sempre i campi essenziali
    Object.keys(tableData).forEach(key => {
      // Mantieni i campi che non iniziano con numeri (IdSettimane, etc.)
      if (!key.match(/^[1-4]/)) {
        filteredData[key] = tableData[key];
      }
      // Mantieni solo i campi della categoria selezionata
      else if (key.startsWith(categoryPrefix)) {
        filteredData[key] = tableData[key];
      }
    });

    return filteredData;
  },

  // Funzione per impostare la categoria corrente
  setCurrentCategory(categoria) {
    storeValue('currentCategory', categoria, false);
  },

  // Funzione per ottenere la categoria corrente
  getCurrentCategory() {
    return appsmith.store.currentCategory || 1;
  },

 // Funzione per ottenere i dati filtrati per la categoria corrente
  getFilteredTableData() {
    const currentCategory = this.getCurrentCategory();
    return this.getTableDataByCategory(currentCategory);
  },

  // Modifica getAllData per usare i dati filtrati se necessario
  getAllData() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    
    if (!widget?.model?.allData) {
      // Se il widget non ha dati, usa i dati filtrati della tabella
      return this.getFilteredTableData();
    }
    
    console.log("Dati recuperati dal widget:", widget.model.allData);
    return widget.model.allData;
  },

  // Modifica la funzione di aggiornamento per gestire diverse categorie
  async aggiornaValutazione() {
    try {
      showAlert("Salvataggio in corso...", "info");

      const currentCategory = this.getCurrentCategory();
      
      // Seleziona la query corretta in base alla categoria
      let updateQuery;
      let dataQuery;
      let modalName;
      
      switch(currentCategory) {
        case 1:
          updateQuery = Settimana1_update;
          dataQuery = Settimana1;
          modalName = 'Settimana_1';
          break;
        case 2:
          updateQuery = Settimana2_update;
          dataQuery = Settimana2;
          modalName = 'Settimana_2';
          break;
        case 3:
          updateQuery = Settimana3_update;
          dataQuery = Settimana3;
          modalName = 'Settimana_3';
          break;
        case 4:
          updateQuery = Settimana4_update;
          dataQuery = Settimana4;
          modalName = 'Settimana_4';
          break;
        default:
          updateQuery = Settimana1_update;
          dataQuery = Settimana1;
          modalName = 'Settimana_1';
      }

      // Esegui la query di update specifica
      await updateQuery.run();

      // Ricarica i dati
      await Promise.all([
        DipendentiQuery.run(),
        dataQuery.run()
      ]);

      // Aggiorna lo store con i nuovi dati
      if (dataQuery.data && dataQuery.data.length > 0) {
        await storeValue('selectedWeekDetails', dataQuery.data[0], false);
      }

      showAlert('Dati salvati con successo!', 'success');

      // Chiudi il modal se esiste
      if (typeof closeModal !== 'undefined') {
        closeModal(modalName);
      }

      return true;

    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      showAlert(`Errore durante il salvataggio: ${error.message}`, "error");
      return false;
    }
  }
	
}