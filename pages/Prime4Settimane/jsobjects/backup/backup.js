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

	getValore(campo, defaultValue = '') {
		const allData = DatiWidgetQuery.getAllData();
		const valore = allData[campo];

		// Restituisce il valore se esiste (anche se è 0, false, o stringa vuota)
		// Solo se è undefined o null usa il defaultValue
		return (valore !== undefined && valore !== null) ? valore : defaultValue;
	},

  getValoreNumerico(campo, defaultValue = 0) {
    const valore = DatiWidgetQuery.getValore(campo, defaultValue);
    const numero = parseInt(valore, 10);
    return isNaN(numero) ? defaultValue : numero;
  },

  // Ottiene l'ID settimana
  getIdSettimane() {
    // Prima prova dal widget
    let idSettimane = DatiWidgetQuery.getValore('selectedSettimanaId');
    
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
	// Funzione principale per aggiornare la valutazione
	async aggiornaValutazione() {
		try {
			showAlert("Salvataggio in corso...", "info");

			// Esegui la query di update
			await Settimana1_update.run();

			// Ricarica i dati
			await Promise.all([
				DipendentiQuery.run(),
				Settimana1.run()
			]);

			// Aggiorna lo store con i nuovi dati
			if (Settimana1.data && Settimana1.data.length > 0) {
				await storeValue('selectedWeekDetails', Settimana1.data[0], false);
			}

			showAlert('Dati salvati con successo!', 'success');

			// Chiudi il modal se esiste
			if (typeof closeModal !== 'undefined') {
				closeModal('Settimana_1');
			}

			return true;

		} catch (error) {
			console.error("Errore durante il salvataggio:", error);
			showAlert(`Errore durante il salvataggio: ${error.message}`, "error");
			return false;
		}
	}
	
}