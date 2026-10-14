// Botón flotante "Ir arriba": aparece al bajar más de 300px.
export function agregarBotonIrArriba() {
  if (document.querySelector('.scroll-top-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 4v16M12 4l-4 4M12 4l4 4"/></svg>`;
  btn.setAttribute('aria-label', 'Ir arriba');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
