import { leaves, byId } from './curriculum';
export const STORAGE_KEY = 'knowledge-atlas.mastery.v1';
export function validateData(data) {
 if (!data || data.schemaVersion !== 1 || !data.scores || typeof data.scores !== 'object' || Array.isArray(data.scores)) throw new Error('Định dạng hoặc phiên bản dữ liệu không hợp lệ.');
 const result = {};
 for (const [id, entry] of Object.entries(data.scores)) {
  if (!byId.has(id) || byId.get(id).nodeType !== 'leaf') throw new Error(`Mã lá không hợp lệ: ${id}`);
  if (!entry || !Number.isInteger(entry.score) || entry.score < 0 || entry.score > 100 || entry.assessed !== true || typeof entry.updatedAt !== 'string' || !Number.isFinite(Date.parse(entry.updatedAt))) throw new Error(`Điểm không hợp lệ: ${id}`);
  result[id] = {score:entry.score, assessed:true, updatedAt:entry.updatedAt};
 }
 return result;
}
export function loadScores() {
 const raw=localStorage.getItem(STORAGE_KEY);
 if (!raw) return {};
 return validateData(JSON.parse(raw));
}
export function saveScores(scores) { localStorage.setItem(STORAGE_KEY, JSON.stringify({schemaVersion:1,scores})); }
export function exportScores(scores) { return JSON.stringify({schemaVersion:1, exportedAt:new Date().toISOString(), scores},null,2); }
