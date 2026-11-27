type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown>;

/** Küçük DOM yardımcısı: h('button', { class: 'x', 'data-a': '', onclick }, 'metin'). */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'hidden') el.hidden = Boolean(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;

/** Kök üzerine bir katman ekler; dönen fonksiyon katmanı kaldırır. */
export function mount(root: HTMLElement, el: HTMLElement): () => void {
  root.append(el);
  return () => el.remove();
}
