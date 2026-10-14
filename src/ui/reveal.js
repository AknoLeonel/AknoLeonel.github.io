/**
 * Lazy reveal: seções marcadas com [data-reveal] entram uma única vez ao
 * chegarem perto da tela. O estado visual fica no CSS (opacidade, translate e blur).
 */
export function revealOnScroll(root, { reducedMotion }) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    for (const el of items) el.dataset.reveal = 'in';
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.dataset.reveal = 'in';
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  for (const el of items) io.observe(el);
}
