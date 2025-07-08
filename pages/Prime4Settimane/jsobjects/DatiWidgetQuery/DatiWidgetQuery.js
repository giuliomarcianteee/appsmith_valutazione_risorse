export default {
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
    // Prima prova dal widget\
    let idSettimane = DatiWidgetQuery.getValore('selectedWeekSettimana');
    
    // Se non c'è, prova dalla tabella
    if (!idSettimane && TabellaSettimane?.triggeredRow?.IdDipendenti) {
      idSettimane = TabellaSettimane.triggeredRow.IdDipendenti;
    }
    
    return idSettimane;
  },
	// Nuova funzione per verificare se ci sono modifiche pending
  hasEditedData() {
			const widgetName = "DettaglioSettimanaWidget";
			const widget = appsmith.store[widgetName] || window[widgetName];
			return widget?.model?.edited && 				Object.keys(widget.model.edited).length > 0;
		},	

 // Modifica preparaDatiPerQuery per utilizzare i dati corretti
  preparaDatiPerQuery() {
    if (!DatiWidgetQuery.isWidgetReady()) {
      showAlert("I dati non sono ancora pronti. Riprova.", "warning");
      return null;
    }

    // Usa getAllData che ora prioritizza allData del widget
    const allData = this.getAllData();
    const idSettimane = this.getIdSettimane();

    if (!idSettimane) {
      showAlert("ID Settimane mancante. Impossibile salvare.", "error");
      return null;
    }

    console.log("Dati utilizzati per la query:", allData);

// Lista completa dei campi
    const campi = [
"IdSettimane", "1ConoscenzaManualeFormativo", "1NoteConoscenzaManualeFormativo", "1ConoscenzaOrganizzazioneMerceologica", "1NoteConoscenzaOrganizzazioneMerceologica", "1AccoglienzaCliente", "1NoteAccoglienzaCliente", "1PresentazioneProdottoeSconti", "1NotePresentazioneProdottoeSconti", "1ConoscenzaBrandOreficeria", "1NoteConoscenzaBrandOreficeria", "1VenditaInSicurezza", "1NoteVenditaInSicurezza", "1FidelizzazioneCliente", "1NoteFidelizzazioneCliente", "1UtilizzoCassaPos", "1NoteUtilizzoCassaPos", "1MetodoScaricoVenditaFidelityOrari", "1NoteMetodoScaricoVenditaFidelityOrari", "1ConfezionamentoProdotto", "1NoteConfezionamentoProdotto", "1CongedoCliente", "1NoteCongedoCliente", "1Vetrine", "1NoteVetrine", "2ConoscenzaGioielleria", "2NoteConoscenzaGioielleria", "2ConoscenzaOrologi", "2NoteConoscenzaOrologi", "2TabletPerRicercaComunicazioniOrdini", "2NoteTabletPerRicercaComunicazioniOrdini", "2MetodoObiettiviRiparazioniPreventiviComproOroGaranzie", "2NoteMetodoObiettiviRiparazioniPreventiviComproOroGaranzie", "2PlanningSettimanale", "2NotePlanningSettimanale", "2UsoAgenda", "2NoteUsoAgenda", "2GestioneRipa", "2NoteGestioneRipa", "2AllestimentoNegozio", "2NoteAllestimentoNegozio", "2DisallestimentoNegozio", "2NoteDisallestimentoNegozio", "2AllarmeAlCollo", "2NoteGestioneAllarmeAlCollo", "2CellulareAziendale", "2NoteCellulareAziendale", "2ControlloCassa", "2NoteControlloCassa", "3PianificazioneLavoroDaSvolgere", "3NotePianificazioneLavoroDaSvolgere", "3ProceduraComproOro", "3NoteProceduraComproOro", "3TestSulMetallo", "3NoteTestSulMetallo", "3ConoscenzaOroDaInvestimento", "3NoteConoscenzaOroDaInvestimento", "3ProcedureGiroMerce", "3NoteProcedureGiroMerce", "3GestioneCambioTurno", "3NoteGestioneCambioTurno", "3MetodoCaricoScaricoComproOroPreventiviOroInvestimento", "3TabletComproOro", "3NoteTabletComproOro", "4AutonomiaAllarmiAperturaChiusura", "4NoteAutonomiaAllarmiAperturaChiusura", "4AutonomiaChiusraContabile", "4NoteAutonomiaChiusraContabile", "4CapacitaConfrontoColleghe", "4NoteCapacitaConfrontoColleghe", "4ConoscenzaCompletaComproOro", "4NoteConoscenzaCompletaComproOro", "4VenditaOroInvestimento", "4NoteVenditaOreInvestimento", "4RicercaProdottiSuTablet", "4NoteRicercaProdottiSuTablet", "4MetodoRistampaDocFediSchede", "4NoteMetodoRistampaDocFediSchede", "4MetodoDisimpegnoOggettiPrenotati", "4NoteMetodoDisimpegnoOggettiPrenotati"
    ];

    const datiQuery = {};
    campi.forEach(campo => {
      if (campo === 'IdSettimane') {
        datiQuery[campo] = idSettimane;
      } else {
        // Usa i dati da allData che contiene le modifiche
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
    
    // Priorità ai dati allData del widget se disponibili
    if (widget?.model?.allData) {
      console.log("Dati recuperati dal widget (allData):", widget.model.allData);
      return widget.model.allData;
    }
    
    // Fallback ai dati filtrati della tabella
    console.log("Fallback ai dati della tabella");
    return this.getFilteredTableData();
  },
	// Funzione dinamica per ricaricare i dati del modal in base alla settimana
  refreshModalData: async (settimana = 1) => {
    try {
      // Sempre ricaricare i dati dei dipendenti
      await DipendentiQuery.run();
      
      // Seleziona la query e il modal in base alla settimana
      let weekQuery;
      let modalName;
      
      switch(settimana) {
        case 1:
          weekQuery = Settimana1;
          modalName = 'Settimana_1';
          break;
        case 2:
          weekQuery = Settimana2;
          modalName = 'Settimana_2';
          break;
        case 3:
          weekQuery = Settimana3;
          modalName = 'Settimana_3';
          break;
        case 4:
          weekQuery = Settimana4;
          modalName = 'Settimana_4';
          break;
        default:
          weekQuery = Settimana1;
          modalName = 'Settimana_1';
          settimana = 1;
      }

      // Ricarica la query specifica della settimana
      await weekQuery.run();
      
      // Imposta la categoria corrente
      DatiWidgetQuery.setCurrentCategory(settimana);
      
      // Mostra il modal
      showModal(modalName);
      
      // Aggiorna lo store con i dati freschi
      if (weekQuery.data && weekQuery.data.length > 0) {
        await storeValue('selectedWeekDetails', weekQuery.data[0], false);
        
        // Aggiorna anche il widget con i nuovi dati
        const widgetName = "DettaglioSettimanaWidget";
        if (appsmith.store[widgetName] || window[widgetName]) {
          const widget = appsmith.store[widgetName] || window[widgetName];
          widget.updateModel({
            data: JSON.stringify(weekQuery.data[0]),
            edited: JSON.stringify({}),
            allData: weekQuery.data[0],
            isReady: true
          });
        }
      }
      
      console.log(`Dati settimana ${settimana} caricati con successo`);
      
    } catch (error) {
      console.error(`Errore nel ricaricare i dati del modal settimana ${settimana}:`, error);
      showAlert(`Errore nel caricamento dei dati: ${error.message}`, "error");
    }
  },

  // Funzioni specifiche per ogni settimana (per facilità d'uso)
  refreshSettimana1: async () => {
    return await DatiWidgetQuery.refreshModalData(1);
  },

  refreshSettimana2: async () => {
    return await DatiWidgetQuery.refreshModalData(2);
  },

  refreshSettimana3: async () => {
    return await DatiWidgetQuery.refreshModalData(3);
  },

  refreshSettimana4: async () => {
    return await DatiWidgetQuery.refreshModalData(4);
  },

  // Funzione per aprire una settimana specifica con validazione
  openWeekModal: async (settimana) => {
    // Verifica che ci sia un dipendente selezionato
    const idSettimane = DatiWidgetQuery.getIdSettimane();
    
    if (!idSettimane) {
      showAlert("Seleziona prima un dipendente dalla tabella.", "warning");
      return false;
    }
    
    try {
      showAlert(`Caricamento settimana ${settimana}...`, "info");
      await DatiWidgetQuery.refreshModalData(settimana);
      return true;
    } catch (error) {
      showAlert(`Errore nell'apertura della settimana ${settimana}: ${error.message}`, "error");
      return false;
    }
  },
	 aggiornaWeek: async () => {
    try {
			await DipendentiQuery.run();
      // Ricarica la query Settimana1 con i dati aggiornati
      await Settimana1.run();
     	
      // Aggiorna lo store con i dati freschi
      if (Settimana1.data && Settimana1.data.length > 0) {
        await storeValue('selectedWeekDetails', Settimana1.data[0], false);
      }
    } catch (error) {
      console.error('Errore nel ricaricare i dati del modal:', error);
    }
},
 // Modifica aggiornaValutazione per utilizzare preparaDatiPerQuery
  async aggiornaValutazione() {
    try {
      showAlert("Salvataggio in corso...", "info");

      // Prepara i dati utilizzando la funzione corretta
      const datiQuery = this.preparaDatiPerQuery();
      
      if (!datiQuery) {
        return false;
      }

      console.log("Dati preparati per la query:", datiQuery);

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

      // Assicurati che la query abbia accesso ai dati preparati
      // Se le query utilizzano parametri, passagli i dati
      if (updateQuery && typeof updateQuery.run === 'function') {
        await updateQuery.run(datiQuery);
      } else {
        await updateQuery.run();
      }

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