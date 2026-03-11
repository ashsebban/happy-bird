const KEY = 'happybird_scores';

function _load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function addScore(score) {
  const scores = _load();
  scores.push(score);
  scores.sort((a, b) => b - a);
  const top = scores.slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(top));
  return top;
}

export function getTopScores() {
  return _load();
}

export function clearScores() {
  localStorage.removeItem(KEY);
}
