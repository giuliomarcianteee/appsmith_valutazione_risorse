export default {
  // Funzione per mappare i dati dal widget alla query
  mapDatiPerQuery: function() {
    // Controlla se il widget esiste e ha dati
    if (!DettaglioSettimanaWidget || !DettaglioSettimanaWidget.model) {
      return { data: {}, edited: {} };
    }
    
    // Ottieni i dati originali dal widget
    const datiWidget = DettaglioSettimanaWidget.model.data || {};
    const editedWidget = DettaglioSettimanaWidget.model.edited || {};
    
    // Formatta i dati come DettaglioSettimanaWidget.model.data
    return {
      data: datiWidget,
      edited: editedWidget
    };
  },
  
  // Questa funzione sostituisce il DettaglioSettimanaWidget originale
  get model() {
    return this.mapDatiPerQuery();
  },
  
  // Funzione per ottenere valori numerici sicuri
  getValoreIntero: function(nomeCampo, defaultValue = 0) {
    try {
      // Verifica se il widget esiste
      if (!DettaglioSettimanaWidget || !DettaglioSettimanaWidget.model) {
        return defaultValue;
      }
      
      // Controlla prima nei valori modificati, poi nei dati originali
      let valore;
      
      if (DettaglioSettimanaWidget.model.edited && DettaglioSettimanaWidget.model.edited[nomeCampo] !== undefined) {
        valore = DettaglioSettimanaWidget.model.edited[nomeCampo];
      } else if (DettaglioSettimanaWidget.model.data && DettaglioSettimanaWidget.model.data[nomeCampo] !== undefined) {
        valore = DettaglioSettimanaWidget.model.data[nomeCampo];
      } else {
        return defaultValue;
      }
      
      // Converti in numero
      const numero = parseInt(valore, 10);
      
      // Se la conversione fallisce o risulta NaN, usa il valore predefinito
      return isNaN(numero) ? defaultValue : numero;
    } catch (e) {
      console.error("Errore in getValoreIntero:", e);
      return defaultValue;
    }
  },
  
  // Funzione per ottenere valori di testo
  getValoreStringa: function(nomeCampo, defaultValue = '') {
    try {
      // Verifica se il widget esiste
      if (!DettaglioSettimanaWidget || !DettaglioSettimanaWidget.model) {
        return defaultValue;
      }
      
      // Controlla prima nei valori modificati, poi nei dati originali
      if (DettaglioSettimanaWidget.model.edited && DettaglioSettimanaWidget.model.edited[nomeCampo] !== undefined) {
        return DettaglioSettimanaWidget.model.edited[nomeCampo] || defaultValue;
      } else if (DettaglioSettimanaWidget.model.data && DettaglioSettimanaWidget.model.data[nomeCampo] !== undefined) {
        return DettaglioSettimanaWidget.model.data[nomeCampo] || defaultValue;
      }
      
      return defaultValue;
    } catch (e) {
      console.error("Errore in getValoreStringa:", e);
      return defaultValue;
    }
  },
  
  // Ottiene l'ID settimane
  getIdSettimane: function() {
    try {
      if (DettaglioSettimanaWidget && DettaglioSettimanaWidget.model && 
          DettaglioSettimanaWidget.model.data && DettaglioSettimanaWidget.model.data.IdSettimane) {
        return DettaglioSettimanaWidget.model.data.IdSettimane;
      }
      
      if (TabellaSettimane && TabellaSettimane.triggeredRow && TabellaSettimane.triggeredRow.IdDipendenti) {
        return TabellaSettimane.triggeredRow.IdDipendenti;
      }
      
      return null;
    } catch (e) {
      console.error("Errore in getIdSettimane:", e);
      return null;
    }
  },
  
  // Funzione per ottenere i valori corretti dal widget originale
  getValoriPerQuery: function() {
    // Verifica se i widget esistono
    if (!DettaglioSettimanaWidget || !DettaglioSettimanaWidget.model) {
      return {}; 
    }
    
    // Oggetto che conterrà tutti i valori da usare nella query
    const valori = {};
    
    // Elenco dei campi da processare
    const campi = [
      "IdSettimane",
      "1ConoscenzaManualeFormativo",
      "1NoteConoscenzaManualeFormativo",
      "1ConoscenzaOrganizzazioneMerceologica",
      "1NoteConoscenzaOrganizzazioneMerceologica",
      "1AccoglienzaCliente",
      "1NoteAccoglienzaCliente",
      "1PresentazioneProdottoeSconti",
      "1NotePresentazioneProdottoeSconti",
      "1ConoscenzaBrandOreficeria",
      "1NoteConoscenzaBrandOreficeria",
      "1VenditaInSicurezza",
      "1NoteVenditaInSicurezza",
      "1FidelizzazioneCliente",
      "1NoteFidelizzazioneCliente",
      "1UtilizzoCassaPos",
      "1NoteUtilizzoCassaPos",
      "1MetodoScaricoVenditaFidelityOrari",
      "1NoteMetodoScaricoVenditaFidelityOrari",
      "1ConfezionamentoProdotto",
      "1NoteConfezionamentoProdotto",
      "1CongedoCliente",
      "1NoteCongedoCliente",
      "1Vetrine",
      "1NoteVetrine",
      "2ConoscenzaGioielleria",
      "2NoteConoscenzaGioielleria",
      "2ConoscenzaOrologi",
      "2NoteConoscenzaOrologi",
      "2TabletPerRicercaComunicazioniOrdini",
      "2NoteTabletPerRicercaComunicazioniOrdini",
      "2MetodoObiettiviRiparazioniPreventiviComproOroGaranzie",
      "2NoteMetodoObiettiviRiparazioniPreventiviComproOroGaranzie",
      "2PlanningSettimanale",
      "2NotePlanningSettimanale",
      "2UsoAgenda",
      "2NoteUsoAgenda",
      "2GestioneRipa",
      "2NoteGestioneRipa",
      "2AllestimentoNegozio",
      "2NoteAllestimentoNegozio",
      "2DisallestimentoNegozio",
      "2NoteDisallestimentoNegozio",
      "2AllarmeAlCollo",
      "2NoteGestioneAllarmeAlCollo",
      "2CellulareAziendale",
      "2NoteCellulareAziendale",
      "2ControlloCassa",
      "2NoteControlloCassa"
    ];
    
    // Per ogni campo, prendi prima il valore modificato, altrimenti quello originale
    campi.forEach(campo => {
      valori[campo] = 
        (DettaglioSettimanaWidget.model.edited && DettaglioSettimanaWidget.model.edited[campo]) || 
        (DettaglioSettimanaWidget.model.data && DettaglioSettimanaWidget.model.data[campo]) || 
        '';
    });
    
    // Per l'ID usa quello dalla tabella se manca nel widget
    if (!valori.IdSettimane && TabellaSettimane.triggeredRow) {
      valori.IdSettimane = TabellaSettimane.triggeredRow.IdDipendenti;
    }
    
    return valori;
  },
  
  // Funzione per eseguire la query
  aggiornaValutazione: function() {
    // Esegue la query di aggiornamento
    return Settimana1_update.run();
  }
}