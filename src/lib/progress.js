/**
 * Progresso "trickle" para carregamentos sem total conhecido (como um iframe):
 * avança rápido no início e desacelera perto de 90%, sem nunca passar disso
 * até o carregamento terminar de fato.
 */
export function trickle(current, cap = 0.9) {
  if (current >= cap) return cap;
  const step = (cap - current) * 0.12;
  return Math.min(cap, current + Math.max(step, 0.004));
}
