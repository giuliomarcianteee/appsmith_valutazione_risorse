export default {
  getColor() {
    const r = TabellaSettimane.triggeredRow;
    const keys = [
      "1ManualeFormativo",
      "1OrganizzazioneMerceologica",
      "1Saluto",
      "1ProdottoeSconti",
      "1ConoscenzaBrandOreficeria",
      "1VenditaInSicurezza",
      "1Fidelity",
      "1CassaPos",
      "1Metodo",
      "1Pacchetto",
      "1Congedo",
      "1Vetrine",
      "1ControlloCassa",
      "1Tablet",
      "1Agenda",
      "1AllarmeAlCollo",
      "1CambioTurno"
    ];

    const values = keys.map(k => r[k]);
    const hasNulls = values.some(v => v === null || v === undefined);
    const total = values.reduce((sum, v) => sum + (parseInt(v) || 0), 0);

    if (hasNulls) return "default";
    if (total === 51) return "green";
    if (total < 51) return "red";
    return "default";
  }
}
