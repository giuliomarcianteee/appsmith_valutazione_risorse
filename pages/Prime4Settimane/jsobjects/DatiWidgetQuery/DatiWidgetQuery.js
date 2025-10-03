export default {
  // ------------------ UTIL DI SANITIZZAZIONE / ESCAPE ------------------
  _logNS: "[DatiWidgetQuery]",
  
  normalizeText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') return value;
    
    // Rimuove caratteri di controllo (0x00-0x1F esclusi tab (0x09), newline (0x0A), carriage return (0x0D))
    let cleaned = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    
    // Normalizza virgolette tipografiche e altri caratteri speciali
    cleaned = cleaned
      .replace(/[""«»]/g, '"')
      .replace(/['']/g, "'")
      // Gestisce altri caratteri Unicode problematici
      .replace(/[\u2018\u2019]/g, "'")  // Apostrofi curvi
      .replace(/[\u201C\u201D]/g, '"')  // Virgolette curve
      .replace(/[\u2013\u2014]/g, '-')  // Trattini lunghi
      .replace(/\u00A0/g, ' ')          // Spazi non-breaking
      .replace(/\u2026/g, '...')        // Ellipsis
      // Uniforma spazi multipli
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .replace(/\s{2,}/g, ' ');         // Riduce spazi multipli a singoli
    
    return cleaned.trim();
  },

  // Nuova funzione per gestire l'escape per JSON
  escapeForJson(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = String(value);
    
    return value
      .replace(/\\/g, '\\\\')   // Escape dei backslash
      .replace(/"/g, '\\"')     // Escape delle virgolette doppie
      .replace(/\n/g, '\\n')    // Escape dei newline
      .replace(/\r/g, '\\r')    // Escape dei carriage return
      .replace(/\t/g, '\\t')    // Escape dei tab
      .replace(/\f/g, '\\f')    // Escape dei form feed
      .replace(/\b/g, '\\b');   // Escape dei backspace
  },

	getValoreForSql(campo, defaultValue = '') {
		const raw = this.getValore(campo, defaultValue);
		if (raw === null || raw === undefined) return '';

		const normalized = this.safeNormalizeForDatabase(String(raw));
		// Sostituisce " con ' e \ con / per SQL
		return normalized
			.replace(/"/g, "'")   // " diventa '
			.replace(/\\/g, "/"); // \ diventa /
	},

  escapeSqlString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = String(value);
    
    // Prima normalizza il testo
    const normalized = this.normalizeText(value);
    
    // Poi gestisce l'escape per SQL (raddoppia gli apostrofi per MariaDB/MySQL)
    return normalized.replace(/'/g, "''");
  },

  // Nuova funzione per gestire caratteri speciali in modo sicuro
  safeNormalizeForDatabase(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = String(value);
    
    // Prima normalizza
    let cleaned = this.normalizeText(value);
    
    // Poi rimuove o sostituisce caratteri che potrebbero causare problemi
    cleaned = cleaned
      // Rimuove caratteri invisibili rimanenti
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
      .replace(/[\u00AD]/g, '')              // Soft hyphen
      // Gestisce caratteri matematici e simboli
      .replace(/[×]/g, 'x')
      .replace(/[÷]/g, '/')
      .replace(/[±]/g, '+/-')
      // Gestisce caratteri di valuta
      .replace(/[€]/g, 'EUR')
      .replace(/[£]/g, 'GBP')
      .replace(/[¥]/g, 'JPY');
    
    return cleaned;
  },

  getValoreEscaped(campo, defaultValue = '') {
    const raw = this.getValore(campo, defaultValue);
    if (raw === null || raw === undefined) return '';
    
    // Usa la nuova funzione di normalizzazione sicura
    const normalized = this.safeNormalizeForDatabase(String(raw));
    // Prima sostituisce " con ' poi fa l'escape SQL
    const withQuotesReplaced = normalized.replace(/"/g, "'");
    return this.escapeSqlString(withQuotesReplaced);
  },

  // Nuova funzione per preparare dati JSON in modo sicuro
  prepareJsonData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = {};
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Per le note, usa normalizzazione completa
        if (/Note/i.test(key)) {
          sanitized[key] = this.safeNormalizeForDatabase(value);
        } else {
          // Per altri campi stringa, usa normalizzazione base
          sanitized[key] = this.normalizeText(value);
        }
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  },

  // ------------------ STATO WIDGET ------------------
  isWidgetReady() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    return widget?.model?.isReady === true;
  },

  getValore(campo, defaultValue = '') {
    const allData = this.getAllData();
    const valore = allData ? allData[campo] : undefined;
    return (valore !== undefined && valore !== null) ? valore : defaultValue;
  },

  getValoreNumerico(campo, defaultValue = 0) {
    const valore = this.getValore(campo, defaultValue);
    const numero = parseInt(valore, 10);
    return isNaN(numero) ? defaultValue : numero;
  },

  getIdSettimane() {
    let idSettimane = this.getValore('selectedWeekSettimana');
    if (!idSettimane && TabellaSettimane?.triggeredRow?.IdDipendenti) {
      idSettimane = TabellaSettimane.triggeredRow.IdDipendenti;
    }
    return idSettimane;
  },

  hasEditedData() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    return widget?.model?.edited && Object.keys(widget.model.edited).length > 0;
  },

  preparaDatiPerQuery() {
    if (!this.isWidgetReady()) {
      showAlert("I dati non sono ancora pronti. Riprova.", "warning");
      return null;
    }
    const allData = this.getAllData();
    const idSettimane = this.getIdSettimane();

    if (!idSettimane) {
      showAlert("ID Settimane mancante. Impossibile salvare.", "error");
      return null;
    }

    console.log(this._logNS, "Dati utilizzati per la query:", allData);

    const campi = [
      "IdSettimane","1ConoscenzaManualeFormativo","1NoteConoscenzaManualeFormativo","1ConoscenzaOrganizzazioneMerceologica","1NoteConoscenzaOrganizzazioneMerceologica",
      "1AccoglienzaCliente","1NoteAccoglienzaCliente","1PresentazioneProdottoESconti","1NotePresentazioneProdottoESconti","1ConoscenzaBrandOreficeria","1NoteConoscenzaBrandOreficeria",
      "1VenditaInSicurezza","1NoteVenditaInSicurezza","1FidelizzazioneCliente","1NoteFidelizzazioneCliente","1UtilizzoCassaPos","1NoteUtilizzoCassaPos","1MetodoScaricoVenditaFidelityOrari",
      "1NoteMetodoScaricoVenditaFidelityOrari","1ConfezionamentoProdotto","1NoteConfezionamentoProdotto","1CongedoCliente","1NoteCongedoCliente","1Vetrine","1NoteVetrine",
      "2ConoscenzaGioielleria","2NoteConoscenzaGioielleria","2ConoscenzaOrologi","2NoteConoscenzaOrologi","2TabletPerRicercaComunicazioniOrdini","2NoteTabletPerRicercaComunicazioniOrdini",
      "2MetodoObiettiviRiparazioniPreventiviComproOroGaranzie","2NoteMetodoObiettiviRiparazioniPreventiviComproOroGaranzie","2PlanningSettimanale","2NotePlanningSettimanale","2UsoAgenda",
      "2NoteUsoAgenda","2GestioneRipa","2NoteGestioneRipa","2AllestimentoNegozio","2NoteAllestimentoNegozio","2DisallestimentoNegozio","2NoteDisallestimentoNegozio","2AllarmeAlCollo",
      "2NoteGestioneAllarmeAlCollo","2CellulareAziendale","2NoteCellulareAziendale","2ControlloCassa","2NoteControlloCassa","3PianificazioneLavoroDaSvolgere","3NotePianificazioneLavoroDaSvolgere",
      "3ProceduraComproOro","3NoteProceduraComproOro","3TestSulMetallo","3NoteTestSulMetallo","3ConoscenzaOroDaInvestimento","3NoteConoscenzaOroDaInvestimento","3ProcedureGiroMerce",
      "3NoteProcedureGiroMerce","3GestioneCambioTurno","3NoteGestioneCambioTurno","3MetodoCaricoScaricoComproOroPreventiviOroInvestimento","3TabletComproOro","3NoteTabletComproOro",
      "4AutonomiaAllarmiAperturaChiusura","4NoteAutonomiaAllarmiAperturaChiusura","4AutonomiaChiusraContabile","4NoteAutonomiaChiusraContabile","4CapacitaConfrontoColleghe",
      "4NoteCapacitaConfrontoColleghe","4ConoscenzaCompletaComproOro","4NoteConoscenzaCompletaComproOro","4VenditaOroInvestimento","4NoteVenditaOreInvestimento","4RicercaProdottiSuTablet",
      "4NoteRicercaProdottiSuTablet","4MetodoRistampaDocFediSchede","4NoteMetodoRistampaDocFediSchede","4MetodoDisimpegnoOggettiPrenotati","4NoteMetodoDisimpegnoOggettiPrenotati"
    ];

    const datiQuery = {};
    campi.forEach(campo => {
      if (campo === 'IdSettimane') {
        datiQuery[campo] = idSettimane;
      } else {
        const rawValue = (allData && allData[campo] !== undefined && allData[campo] !== null)
          ? allData[campo]
          : '';
        
        // Applica normalizzazione sicura ai valori
        if (typeof rawValue === 'string' && rawValue !== '') {
          let normalizedValue = this.safeNormalizeForDatabase(rawValue);
          
          // Se è un campo Note, sostituisce " con ' per SQL
          if (/Note/i.test(campo)) {
            normalizedValue = normalizedValue.replace(/"/g, "'");
          }
          
          datiQuery[campo] = normalizedValue;
        } else {
          datiQuery[campo] = rawValue;
        }
      }
    });

    return datiQuery;
  },

  getTableDataByCategory(categoria) {
    return appsmith.store.selectedWeekDetails;
  },

  async clearStoredSettimana() {
    await storeValue('selectedWeekDetails', null, false);
    console.log(this._logNS, "selectedWeekDetails pulito");
  },

  modalAggiornamento(parametro){
    switch(parametro) {
      case 1:
        this.setCurrentCategory(parametro);
        this.aggiornaWeek1();
        showModal(Settimana_1.name);
        break;
      case 2:
        this.setCurrentCategory(parametro);
        this.aggiornaWeek2();
        showModal(Settimana_1.name);
        break;
      case 3:
        this.setCurrentCategory(parametro);
        this.aggiornaWeek3();
        showModal(Settimana_1.name);
        break;
      case 4:
        this.setCurrentCategory(parametro);
        this.aggiornaWeek4();
        showModal(Settimana_1.name);
        break;
      default:
        console.log(this._logNS, "Parametro non valido");
        break;
    }
  },

  setCurrentCategory(categoria) {
    storeValue('currentCategory', categoria, false);
  },

  getCurrentCategory() {
    return appsmith.store.currentCategory || 1;
  },

  getFilteredTableData() {
    const currentCategory = this.getCurrentCategory();
    return this.getTableDataByCategory(currentCategory);
  },

  getAllData() {
    const widgetName = "DettaglioSettimanaWidget";
    const widget = appsmith.store[widgetName] || window[widgetName];
    if (widget?.model?.allData) {
      return widget.model.allData;
    }
    return this.getFilteredTableData() || {};
  },

  // ------------------ REFRESH SETTIMANE ------------------
  refreshModalData: async (settimana = 1) => {
    try {
      await DipendentiQuery.run();

      let weekQuery;
      let modalName;

      switch(settimana) {
        case 1: weekQuery = Settimana1; modalName = 'Settimana_1'; break;
        case 2: weekQuery = Settimana2; modalName = 'Settimana_2'; break;
        case 3: weekQuery = Settimana3; modalName = 'Settimana_3'; break;
        case 4: weekQuery = Settimana4; modalName = 'Settimana_4'; break;
        default: weekQuery = Settimana1; modalName = 'Settimana_1'; settimana = 1;
      }

      await weekQuery.run();
      this.setCurrentCategory(settimana);
      showModal(modalName);

      if (weekQuery.data && weekQuery.data.length > 0) {
        const record = weekQuery.data[0];
        
        // Usa la nuova funzione di preparazione JSON
        const sanitized = this.prepareJsonData(record);

        await storeValue('selectedWeekDetails', sanitized, false);

        const widgetName = "DettaglioSettimanaWidget";
        const widget = appsmith.store[widgetName] || window[widgetName];
        if (widget) {
          widget.updateModel({
            data: JSON.stringify(sanitized),  // Manteniamo doppia serializzazione (richiesta)
            edited: JSON.stringify({}),
            allData: sanitized,
            isReady: true,
            version: 2
          });
        }
      }

      console.log(this._logNS, `Dati settimana ${settimana} caricati con successo`);
    } catch (error) {
      console.error(this._logNS, `Errore ricarico dati settimana ${settimana}:`, error);
      showAlert(`Errore nel caricamento dei dati: ${error.message}`, "error");
    }
  },

  refreshSettimana1: async () => await this.refreshModalData(1),
  refreshSettimana2: async () => await this.refreshModalData(2),
  refreshSettimana3: async () => await this.refreshModalData(3),
  refreshSettimana4: async () => await this.refreshModalData(4),

  aggiornaWeek1: async () => {
    try {
      storeJS.storeIdSettimana();
      await DipendentiQuery.run();
      await Settimana1.run();
      // Applica normalizzazione prima di salvare
      const sanitized = this.prepareJsonData(Settimana1.data[0]);
      await storeValue('selectedWeekDetails', sanitized, false);
    } catch (error) {
      console.error(this._logNS, 'Errore nel ricaricare i dati del modal:', error);
    }
  },

  aggiornaWeek2: async () => {
    try {
      storeJS.storeIdSettimana();
      await DipendentiQuery.run();
      await Settimana2.run();
      const sanitized = this.prepareJsonData(Settimana2.data[0]);
      await storeValue('selectedWeekDetails', sanitized, false);
    } catch (error) {
      console.error(this._logNS, 'Errore nel ricaricare i dati del modal:', error);
    }
  },

  aggiornaWeek3: async () => {
    try {
      storeJS.storeIdSettimana();
      await DipendentiQuery.run();
      await Settimana3.run();
      const sanitized = this.prepareJsonData(Settimana3.data[0]);
      await storeValue('selectedWeekDetails', sanitized, false);
    } catch (error) {
      console.error(this._logNS, 'Errore nel ricaricare i dati del modal:', error);
    }
  },

  aggiornaWeek4: async () => {
    try {
      storeJS.storeIdSettimana();
      await DipendentiQuery.run();
      await Settimana4.run();
      const sanitized = this.prepareJsonData(Settimana4.data[0]);
      await storeValue('selectedWeekDetails', sanitized, false);
    } catch (error) {
      console.error(this._logNS, 'Errore nel ricaricare i dati del modal:', error);
    }
  },

  updateSettimana: async () => {
    try {
      const currentCategory = this.getCurrentCategory();
      let updateQuery;
      switch(currentCategory) {
        case 1: updateQuery = Settimana1_update; break;
        case 2: updateQuery = Settimana2_update; break;
        case 3: updateQuery = Settimana3_update; break;
        case 4: updateQuery = Settimana4_update; break;
        default:
          showAlert('Errore: categoria settimana non valida', 'error');
          return;
      }

      await updateQuery.run();
      showAlert(`Dati settimana ${currentCategory} salvati con successo!`, 'success');
      await DipendentiQuery.run();
      switch(currentCategory) {
        case 1: await Settimana1.run(); break;
        case 2: await Settimana2.run(); break;
        case 3: await Settimana3.run(); break;
        case 4: await Settimana4.run(); break;
      }
      closeModal(Settimana_1.name);

      const refreshed = (currentCategory === 1 ? Settimana1.data :
                        currentCategory === 2 ? Settimana2.data :
                        currentCategory === 3 ? Settimana3.data :
                        Settimana4.data) || [];

      if (refreshed.length > 0) {
        const sanitized = this.prepareJsonData(refreshed[0]);
        await storeValue('selectedWeekDetails', sanitized, false);
      }
    } catch (error) {
      showAlert('Errore durante il salvataggio: ' + error.message, 'error');
      console.error(this._logNS, 'Errore update:', error);
    }
  }
}