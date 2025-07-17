export default {
  // Funzione per aprire il PDF in una nuova pagina web
  async onPDFDownload() {
    try {
      // Recupera i dati dal widget
      const widgetData = DettaglioSettimanaWidget.model.allData;
      
      if (!widgetData) {
        showAlert("Errore: Nessun dato disponibile per il PDF", "error");
        return;
      }

      console.log("Dati widget per PDF:", widgetData);

      // Prepara i dati per il PDF
      const pdfData = this.preparePDFData(widgetData);
      
      // Genera il contenuto HTML per il PDF
      const htmlContent = this.generatePDFHTML(pdfData);
      
      // Salva il contenuto HTML nello store di Appsmith
      await storeValue("pdfContent", htmlContent);
      await storeValue("pdfData", pdfData);
      
      // Crea parametri per la nuova pagina
      const pdfParams = {
        nome: pdfData.header.nome,
        settimana: pdfData.header.settimana,
        timestamp: pdfData.generatedAt
      };
      
      // Naviga verso la pagina PDF in una nuova finestra
      navigateTo("PDFViewer", pdfParams, "NEW_WINDOW");
      
      showAlert("PDF aperto in una nuova finestra!", "success");
      
    } catch (error) {
      console.error("Errore durante l'apertura del PDF:", error);
      showAlert("Errore durante l'apertura del PDF: " + error.message, "error");
    }
  },

  // Funzione per scaricare direttamente il PDF sul PC
  async downloadPDFDirect() {
    try {
      // Recupera i dati dal widget
      const widgetData = DettaglioSettimanaWidget.model.allData;
      
      if (!widgetData) {
        showAlert("Errore: Nessun dato disponibile per il PDF", "error");
        return;
      }

      console.log("Scaricamento PDF diretto...");

      // Prepara i dati per il PDF
      const pdfData = this.preparePDFData(widgetData);
      
      // Genera il contenuto HTML per il PDF
      const htmlContent = this.generatePDFHTML(pdfData);
      
      // Crea il nome del file
      const fileName = `valutazione_${pdfData.header.nome}_settimana_${pdfData.header.settimana}.html`;
      
      // Utilizza l'API di download di Appsmith
      await download(htmlContent, fileName, "text/html");
      
      showAlert("PDF scaricato con successo!", "success");
      
    } catch (error) {
      console.error("Errore durante il download del PDF:", error);
      showAlert("Errore durante il download del PDF: " + error.message, "error");
    }
  },

  // Funzione per creare un PDF tramite API esterna (opzionale)
  async downloadPDFViaPrintAPI() {
    try {
      const widgetData = DettaglioSettimanaWidget.model.allData;
      
      if (!widgetData) {
        showAlert("Errore: Nessun dato disponibile per il PDF", "error");
        return;
      }

      const pdfData = this.preparePDFData(widgetData);
      const htmlContent = this.generatePDFHTML(pdfData);
      
      // Utilizza un'API di conversione HTML to PDF
      const pdfBlob = await this.convertHTMLToPDF(htmlContent);
      
      const fileName = `valutazione_${pdfData.header.nome}_settimana_${pdfData.header.settimana}.pdf`;
      
      await download(pdfBlob, fileName, "application/pdf");
      
      showAlert("PDF scaricato come file PDF!", "success");
      
    } catch (error) {
      console.error("Errore durante la conversione PDF:", error);
      showAlert("Errore durante la conversione PDF: " + error.message, "error");
    }
  },

  // Funzione helper per convertire HTML in PDF tramite API
  async convertHTMLToPDF(htmlContent) {
    try {
      // Esempio usando una API di conversione HTML to PDF
      const response = await fetch('https://api.html-to-pdf.net/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY' // Sostituire con la propria API key
        },
        body: JSON.stringify({
          html: htmlContent,
          options: {
            format: 'A4',
            margin: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Errore nella conversione PDF');
      }
      
      return await response.blob();
      
    } catch (error) {
      console.error("Errore conversione HTML to PDF:", error);
      throw error;
    }
  },

  // Funzione per preparare i dati per il PDF
  preparePDFData(rawData) {
    const currentDate = new Date();
    
    const pdfData = {
      header: {
        nome: rawData.Nome || 'N/A',
        neg: rawData.Neg || 'N/A',
        dataAssunzione: this.formatDate(rawData.DataAssunzione),
        dataFineContratto: this.formatDate(rawData.DataFineContratto),
        settimana: this.detectWeek(rawData),
        dataGenerazione: currentDate.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      valutazioni: this.extractEvaluations(rawData),
      statistiche: this.calculateStatistics(rawData),
      generatedAt: currentDate.toISOString(),
      generatedBy: appsmith.user.username || 'giuliomarcianteee'
    };

    return pdfData;
  },

  // Funzione per estrarre le valutazioni dal dataset
  extractEvaluations(data) {
    const evaluations = [];
    const processedFields = new Set();
    
    console.log("Dati grezzi per estrazione valutazioni:", data);
    
    Object.keys(data).forEach(key => {
      const match = key.match(/^([1234])(.+)/);
      if (match && !processedFields.has(key)) {
        const week = match[1];
        const fieldName = match[2];
        
        let weekGroup = evaluations.find(e => e.week === week);
        if (!weekGroup) {
          weekGroup = { week: week, fields: [] };
          evaluations.push(weekGroup);
        }
        
        const isNote = fieldName.toLowerCase().includes('note');
        
        if (!isNote) {
          const displayName = this.formatFieldName(fieldName);
          
          // Prova diverse varianti per trovare la nota
          const possibleNoteKeys = [
            week + fieldName + 'Note',
            week + fieldName + 'note',
            week + fieldName + 'NOTE',
            week + fieldName + 'Notes',
            week + fieldName + 'notes'
          ];
          
          let noteValue = '';
          let foundNoteKey = '';
          
          // Cerca la nota tra le possibili chiavi
          for (const noteKey of possibleNoteKeys) {
            if (data[noteKey] !== null && data[noteKey] !== undefined && data[noteKey] !== 'null') {
              noteValue = String(data[noteKey]);
              foundNoteKey = noteKey;
              break;
            }
          }
          
          // Se non trova con il pattern esatto, cerca in modo più flessibile
          if (!noteValue) {
            const flexibleNoteKey = Object.keys(data).find(k => 
              k.toLowerCase().includes(week.toLowerCase()) && 
              k.toLowerCase().includes(fieldName.toLowerCase()) && 
              k.toLowerCase().includes('note')
            );
            
            if (flexibleNoteKey && data[flexibleNoteKey] !== null && data[flexibleNoteKey] !== undefined && data[flexibleNoteKey] !== 'null') {
              noteValue = String(data[flexibleNoteKey]);
              foundNoteKey = flexibleNoteKey;
            }
          }
          
          console.log(`Campo ${key}: cercando nota con chiavi ${possibleNoteKeys.join(', ')}`);
          console.log(`Nota trovata: "${noteValue}" con chiave: ${foundNoteKey}`);
          
          const fieldData = {
            name: displayName,
            rating: parseInt(data[key]) || 0,
            ratingText: this.getRatingText(parseInt(data[key]) || 0),
            ratingColor: this.getRatingColor(parseInt(data[key]) || 0),
            note: noteValue || '',
            originalKey: key,
            noteKey: foundNoteKey || possibleNoteKeys[0]
          };
          
          weekGroup.fields.push(fieldData);
          processedFields.add(key);
          
          // Aggiungi tutte le possibili chiavi note ai campi processati
          possibleNoteKeys.forEach(nk => processedFields.add(nk));
          if (foundNoteKey) processedFields.add(foundNoteKey);
        }
      }
    });
    
    evaluations.sort((a, b) => parseInt(a.week) - parseInt(b.week));
    evaluations.forEach(week => {
      week.fields.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log("Valutazioni estratte:", evaluations);
    
    return evaluations;
  },

  // Funzione per calcolare le statistiche
  calculateStatistics(data) {
    const ratingFields = Object.keys(data).filter(key => 
      key.match(/^[1234](?!.*Note)/i)
    );
    
    const ratings = ratingFields.map(key => parseInt(data[key]) || 0);
    const validRatings = ratings.filter(r => r > 0);
    const totalScore = ratings.reduce((sum, rating) => sum + rating, 0);
    const maxScore = ratingFields.length * 4; // Cambiato da 5 a 4
    const averageScore = validRatings.length > 0 ? totalScore / validRatings.length : 0;
    
    const halfMaxScore = maxScore / 2;
    let status, statusColor;
    
    if (totalScore === 0) {
      status = 'NON VALUTATO';
      statusColor = '#FFA500';
    } else if (totalScore > halfMaxScore) {
      status = 'IDONEO';
      statusColor = '#28a745';
    } else {
      status = 'NON IDONEO';
      statusColor = '#dc3545';
    }
    
    return {
      totalScore,
      maxScore,
      averageScore: Math.round(averageScore * 100) / 100,
      completedFields: validRatings.length,
      totalFields: ratingFields.length,
      percentageComplete: Math.round((validRatings.length / ratingFields.length) * 100),
      status,
      statusColor,
      ratingDistribution: this.calculateRatingDistribution(validRatings)
    };
  },

  // Funzione per calcolare la distribuzione dei rating
  calculateRatingDistribution(ratings) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 }; // Cambiato da 5 a 4
    ratings.forEach(rating => {
      if (rating >= 1 && rating <= 4) { // Cambiato da 5 a 4
        distribution[rating]++;
      }
    });
    return distribution;
  },

  // Funzione per rilevare la settimana corrente
  detectWeek(data) {
    for (let i = 1; i <= 4; i++) {
      const hasDataForWeek = Object.keys(data).some(key => 
        key.startsWith(i.toString())
      );
      if (hasDataForWeek) {
        return i;
      }
    }
    return 1;
  },

  // Funzione per formattare le date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  },

  // Funzione per formattare i nomi dei campi
  formatFieldName(fieldName) {
    let processedName = fieldName;
    
    if (fieldName.length > 0 && /^[0-9]/.test(fieldName)) {
      processedName = fieldName.substring(1);
    }
    
    return processedName.replace(/([A-Z])/g, (match, letter, index) => {
      return index === 0 ? letter : ' ' + letter;
    });
  },

  // Funzione per ottenere il testo descrittivo del rating (4 stelle)
  getRatingText(rating) {
    const ratingTexts = {
      1: "Non lo sa fare",
      2: "Sta ancora imparando", 
      3: "Lo sa fare",
      4: "Lo sa insegnare"
    };
    return ratingTexts[rating] || 'Non valutato';
  },

  // Funzione per ottenere il colore del rating (4 stelle)
  getRatingColor(rating) {
    if (rating === 1) return '#dc3545'; // Rosso
    if (rating === 2) return '#fd7e14'; // Arancione
    if (rating === 3 || rating === 4) return '#28a745'; // Verde
    return '#dee2e6';
  },

  // Funzione per generare le stelle HTML (4 stelle)
  generateStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 4; i++) { // Cambiato da 5 a 4
      if (i <= rating) {
        starsHTML += '<span style="color: ' + this.getRatingColor(rating) + ';">&#9733;</span>';
      } else {
        starsHTML += '<span style="color: #dee2e6;">&#9734;</span>';
      }
    }
    return starsHTML;
  },

  // Funzione per escaping HTML (senza usare document)
  escapeHtml(text) {
    if (!text) return '';
    
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // Funzione per generare la legenda delle stelline
  generateStarLegend() {
    const legends = [
      { stars: 1, text: "Non lo sa fare", color: "#dc3545" },
      { stars: 2, text: "Sta ancora imparando", color: "#fd7e14" },
      { stars: 3, text: "Lo sa fare", color: "#28a745" },
      { stars: 4, text: "Lo sa insegnare", color: "#28a745" }
    ];

    return legends.map(legend => {
      const starsHTML = '&#9733;'.repeat(legend.stars) + '&#9734;'.repeat(4 - legend.stars);
      return `
        <div style="display: flex; align-items: center; margin: 8px 0; justify-content: flex-start;">
          <span style="color: ${legend.color}; font-size: 16px; margin-right: 12px; min-width: 80px;">${starsHTML}</span>
          <span style="color: #495057; font-size: 14px; font-weight: 500;">${legend.text}</span>
        </div>
      `;
    }).join('');
  },

  // Funzione per generare l'HTML del PDF
  generatePDFHTML(data) {
    const distributionHTML = Object.entries(data.statistiche.ratingDistribution)
      .map(([rating, count]) => {
        if (count > 0) {
          return `<div style="display: flex; align-items: center; margin: 5px 0;">
            <span style="margin-right: 10px;">${rating} stelle:</span>
            <span style="color: ${this.getRatingColor(parseInt(rating))}; font-size: 16px;">${'&#9733;'.repeat(parseInt(rating))}${'&#9734;'.repeat(4-parseInt(rating))}</span>
            <span style="margin-left: 10px; font-weight: bold;">${count} valutazioni</span>
          </div>`;
        }
        return '';
      }).join('');

    const evaluationsHTML = data.valutazioni.map(week => {
      const weekFields = week.fields.map(field => {
        const noteText = field.note && field.note.trim() !== '' ? this.escapeHtml(field.note) : '<em style="color: #999;">Nessuna nota</em>';
        
        return `
        <tr>
          <td style="font-weight: 500; padding: 12px 15px; border-bottom: 1px solid #dee2e6; vertical-align: top;">
            ${this.escapeHtml(field.name)}
          </td>
          <td style="text-align: center; padding: 12px 15px; border-bottom: 1px solid #dee2e6; vertical-align: top;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;">
              <span style="font-size: 18px;">${this.generateStarsHTML(field.rating)}</span>
              <span style="font-size: 12px; color: ${field.ratingColor}; font-weight: bold; 
                         background: ${field.ratingColor}20; padding: 2px 8px; border-radius: 12px;">
                ${this.escapeHtml(field.ratingText)}
              </span>
            </div>
          </td>
          <td style="font-style: italic; color: #666; max-width: 300px; padding: 12px 15px; border-bottom: 1px solid #dee2e6; vertical-align: top; word-wrap: break-word;">
            ${noteText}
          </td>
        </tr>
        `;
      }).join('');

      return `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 15px;">
            ${week.week}&deg; Settimana di Valutazione
          </h3>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 15px; text-align: left; font-size: 14px; font-weight: 600;">COMPETENZA</th>
                <th style="padding: 15px; text-align: center; font-size: 14px; font-weight: 600;">VALUTAZIONE</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; font-weight: 600;">NOTE</th>
              </tr>
            </thead>
            <tbody>
              ${weekFields}
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valutazione ${this.escapeHtml(data.header.nome)} - ${data.header.settimana}&deg; Settimana</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8f9fa;
    }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; }
    .header h1 { margin: 0 0 10px 0; font-size: 24px; font-weight: 700; }
    .header h2 { margin: 0 0 15px 0; font-size: 20px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box { padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6; }
    .info-box h3 { margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 600; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
    .info-box p { margin: 8px 0; font-size: 14px; }
    .stats { 
      background: ${data.statistiche.statusColor}; 
      color: white; 
      padding: 20px; 
      border-radius: 8px; 
      margin-bottom: 30px; 
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .stats h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: 600; opacity: 0.9; }
    .stats h2 { margin: 0 0 15px 0; font-size: 24px; font-weight: 700; }
    .stats-legend { 
      background: rgba(255,255,255,0.1); 
      padding: 15px; 
      border-radius: 8px; 
      margin-top: 15px; 
      width: 100%;
    }
    .stats-legend h4 { 
      margin: 0 0 12px 0; 
      font-size: 14px; 
      font-weight: 600; 
      color: rgba(255,255,255,0.9); 
      text-align: center; 
    }
    .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); width: ${data.statistiche.percentageComplete}%; }
    .distribution { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px; }
    .distribution h4 { margin: 0 0 10px 0; color: #495057; font-size: 14px; }
    .footer { margin-top: 50px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 3px solid #007bff; }
    .footer p { margin: 5px 0; font-size: 12px; color: #666; }
    .action-buttons { position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px; }
    .action-btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .print-btn { background: #007bff; color: white; }
    .download-btn { background: #28a745; color: white; }
    .close-btn { background: #6c757d; color: white; }
    @media print { 
      body { background: white !important; padding: 0 !important; } 
      .container { box-shadow: none !important; border-radius: 0 !important; }
      .action-buttons { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="action-buttons">
    <button class="action-btn print-btn" onclick="window.print()">🖨️ Stampa</button>
    <button class="action-btn download-btn" onclick="downloadHTML()">💾 Scarica HTML</button>
    <button class="action-btn close-btn" onclick="window.close()">✕ Chiudi</button>
  </div>
  
  <div class="container">
    <div class="header">
      <h1>Valutazione ${data.header.settimana}&deg; Settimana</h1>
      <h2>${this.escapeHtml(data.header.nome)}</h2>
      <p><strong>Negozio:</strong> ${this.escapeHtml(data.header.neg)} | <strong>Assunzione:</strong> ${data.header.dataAssunzione} | <strong>Scadenza:</strong> ${data.header.dataFineContratto}</p>
    </div>
    
    <div class="info-grid">
      <div class="info-box">
        <h3>Statistiche Generali</h3>
        <p><strong>Punteggio Totale:</strong> ${data.statistiche.totalScore}/${data.statistiche.maxScore} punti</p>
        <p><strong>Punteggio Medio:</strong> ${data.statistiche.averageScore}/4.0</p>
        <p><strong>Completamento:</strong> ${data.statistiche.completedFields}/${data.statistiche.totalFields} campi</p>
        <div class="progress-bar"><div class="progress-fill"></div></div>
        <p style="text-align: center; margin: 5px 0; font-size: 12px; color: #666;">${data.statistiche.percentageComplete}% completato</p>
        ${distributionHTML ? `<div class="distribution"><h4>Distribuzione Valutazioni:</h4>${distributionHTML}</div>` : ''}
      </div>
      
      <div class="stats">
        <h3>ESITO FINALE</h3>
        <h2>${data.statistiche.status}</h2>
        <p style="margin: 10px 0; font-size: 14px; opacity: 0.9;">
          ${data.statistiche.status === 'IDONEO' ? 'Il dipendente ha superato la valutazione' : 
            data.statistiche.status === 'NON IDONEO' ? 'Il dipendente non ha superato la valutazione' : 
            'Valutazione non ancora completata'}
        </p>
        
        <div class="stats-legend">
          <h4>Legenda Valutazioni</h4>
          ${this.generateStarLegend()}
        </div>
      </div>
    </div>
    
    <div class="evaluations">${evaluationsHTML}</div>
    
    <div class="footer">
      <p><strong>Documento generato il ${data.header.dataGenerazione}</strong></p>
      <p>Generato da: ${data.generatedBy}</p>
      <p>Sistema di valutazione aziendale - Versione PDF</p>
    </div>
  </div>

  <script>
    function downloadHTML() {
      const content = document.documentElement.outerHTML;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'valutazione_${this.escapeHtml(data.header.nome)}_settimana_${data.header.settimana}.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
  }
}