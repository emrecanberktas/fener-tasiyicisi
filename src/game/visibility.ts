/** Sayfa arka plana geçtiğinde onHidden çağırır; dönen fonksiyon dinlemeyi bırakır. */
export function watchVisibility(doc: Document, onHidden: () => void): () => void {
  const handler = () => { if (doc.visibilityState === 'hidden') onHidden(); };
  doc.addEventListener('visibilitychange', handler);
  return () => doc.removeEventListener('visibilitychange', handler);
}
