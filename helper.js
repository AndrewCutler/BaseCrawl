// TODO: convert to typescript

const logTest = () => 'THIS IS ONLY A TEST';
const getStandardSeasonRows = (years) => years.map((year) => document.getElementById(`batting_standard.${year}`));

window.getStandardSeasonRows = getStandardSeasonRows;
window.logTest = logTest;