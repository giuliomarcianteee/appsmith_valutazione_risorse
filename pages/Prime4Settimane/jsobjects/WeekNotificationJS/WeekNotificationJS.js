export default {
  async runWeeklyNotifications() {
    const rows = await getPendingWeekNotifications.run();
    
    let sent = 0;
    for (const r of rows) {
      if (!r.CoordinatorEmail) {
        // Se manca email coordinatore salto (log eventuale)
        console.log(`Nessuna email per coordinatore ${r.CoordinatorName} (dipendente ${r.IdDipendenti})`);
        continue;
      }
      
      const subject = `Settimana ${r.WeekNo} raggiunta - ${r.NomeDipendente}`;
      const body = `
        <div style="font-family: Arial, sans-serif; font-size:14px; line-height:1.4">
          <p>Buongiorno ${r.CoordinatorName || ''},</p>
          <p>Il dipendente <strong>${r.NomeDipendente}</strong> (Negozio: <strong>${r.Neg}</strong>) ha raggiunto la settimana <strong>${r.WeekNo}</strong> dalla data di assunzione (${new Date(r.DataAssunzione).toLocaleDateString('it-IT')}).</p>
          <p>Giorni trascorsi: ${r.DaysDiff}.</p>
          <p>Questa è una notifica automatica. Non rispondere a questa email.</p>
        </div>
      `;
      
      try {
        await sendEmail.run({
          to: r.CoordinatorEmail,
            subject,
          body
        });
        
        try {
          await insertWeekNotification.run({
            IdDipendenti: r.IdDipendenti,
            WeekNo: r.WeekNo
          });
        } catch (e) {
          // In caso di race condition/duplicato
          if (!String(e).toLowerCase().includes('duplicate')) {
            throw e;
          }
        }
        sent++;
      } catch (err) {
        console.error(`Errore invio email per ${r.IdDipendenti}:`, err);
      }
    }
    
    return `${sent} email inviate (su ${rows.length} candidati)`;
  }
};