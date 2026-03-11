const KEY = 'happybird_scores';

function _load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    // Backwards-compat: plain numbers become objects
    return raw.map(e => (typeof e === 'object' ? e : { score: e, ts: null }));
  } catch { return []; }
}

export function addScore(score) {
  const scores = _load();
  scores.push({ score, ts: Date.now() });
  scores.sort((a, b) => b.score - a.score);
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
