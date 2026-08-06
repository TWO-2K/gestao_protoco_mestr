const CODE_KEY = 'rabbit_research_edit_code_v1';

export function hasCode() { return !!localStorage.getItem(CODE_KEY); }
export function getCode() { return localStorage.getItem(CODE_KEY); }
export function setCode(code) { localStorage.setItem(CODE_KEY, code); }
export function verifyCode(code) { return getCode() === code; }

export function exportData(animais) {
  const dataStr = JSON.stringify(animais, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pesquisa_animal_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
