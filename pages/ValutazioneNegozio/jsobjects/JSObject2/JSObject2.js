export default {
	getPDFData() {
		const row = TablePdf1.selectedRow;

		if (!row) {
			showAlert('Seleziona una riga dalla tabella', 'error');
			return '';
		}

		try {
			const { jsPDF } = window.jspdf;
			const doc = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			let yPos = 20;
			const marginLeft = 15;
			const marginRight = 15;
			const pageWidth = 210;
			const maxWidth = pageWidth - marginLeft - marginRight;
			const lineHeight = 7;

			// HEADER
			doc.setFontSize(18);
			doc.setFont(undefined, 'bold');
			doc.text(`Report Negozio: ${row.Negozio}`, marginLeft, yPos);
			yPos += 10;

			doc.setFontSize(10);
			doc.setFont(undefined, 'normal');
			doc.text(`Data Passaggio: ${this.formatDate(row.DataPassaggio)}`, marginLeft, yPos);
			yPos += 5;
			doc.text(`Data Compilazione: ${this.formatDate(row.DataCompilazione)}`, marginLeft, yPos);
			yPos += 5;
			doc.text(`Compilato da: ${row.UtenteModifica}`, marginLeft, yPos);
			yPos += 10;

			doc.setDrawColor(200, 200, 200);
			doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
			yPos += 8;

			// SEZIONI
			yPos = this.aggiungiSezione(doc, 'POSIZIONE', row.Posizione, row.RatingPosizione, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'AFFLUENZA', row.Affluenza, row.RatingAffluenza, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'CLIENTELA', row.Clientela, row.RatingClientela, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'VENDITA MERCEOLOGICA', row.VenditaMerceologica, row.RatingVenditaMerceologica, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'ANALISI NEGOZIO', row.AnalisiNegozio, row.RatingAnalisiNegozio, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'PULIZIA NEGOZIO', row.PuliziaNegozio, row.RatingPuliziaNegozio, yPos, marginLeft, maxWidth, lineHeight);
			yPos = this.aggiungiSezione(doc, 'ESPOSIZIONE', row.Esposizione, row.RatingEsposizione, yPos, marginLeft, maxWidth, lineHeight);

			if (row.Altro && row.Altro.trim() !== '') {
				yPos = this.aggiungiSezione(doc, 'ALTRO', row.Altro, row.RatingAltro, yPos, marginLeft, maxWidth, lineHeight);
			}

			// FOOTER
			const pageCount = doc.internal.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(8);
				doc.setTextColor(150);
				doc.text(`ID: ${row.IdPassaggiNegozi}`, marginLeft, 287);
				doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - marginRight - 30, 287);
			}

			return doc.output('dataurlstring');

		} catch (error) {
			console.error('Errore:', error);
			showAlert('Errore: ' + error.message, 'error');
			return '';
		}
	},

	getPDFName() {
		const row = TablePdf1.selectedRow;
		if (!row) return 'report.pdf';
		return `Report_${row.Negozio}_${row.DataPassaggio}.pdf`;
	},

	aggiungiSezione(doc, titolo, contenuto, rating, yPos, marginLeft, maxWidth, lineHeight) {
		if (yPos > 250) {
			doc.addPage();
			yPos = 20;
		}

		doc.setFontSize(12);
		doc.setFont(undefined, 'bold');
		doc.setTextColor(0, 0, 0);
		doc.text(titolo, marginLeft, yPos);

		if (rating > 0) {
			const ratingText = this.creaStelle(rating);
			doc.setFontSize(10);
			doc.setTextColor(255, 140, 0); // Arancione
			doc.text(ratingText, marginLeft + 80, yPos);
		}

		yPos += 7;

		doc.setFontSize(10);
		doc.setFont(undefined, 'normal');
		doc.setTextColor(60, 60, 60);

		if (contenuto && contenuto.trim() !== '') {
			const lines = doc.splitTextToSize(contenuto, maxWidth);

			for (let i = 0; i < lines.length; i++) {
				if (yPos > 270) {
					doc.addPage();
					yPos = 20;
				}
				doc.text(lines[i], marginLeft, yPos);
				yPos += lineHeight;
			}
		} else {
			doc.setTextColor(150, 150, 150);
			doc.text('Nessuna informazione disponibile', marginLeft, yPos);
			yPos += lineHeight;
		}

		yPos += 5;
		return yPos;
	},

	creaStelle(rating) {
		return `(${rating}/4)`;
	},

	formatDate(dateString) {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}
}