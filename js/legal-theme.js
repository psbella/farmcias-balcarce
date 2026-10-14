// Tema claro/oscuro para privacidad.html y terminos.html:
// usa el tema guardado y, si no hay, la preferencia del sistema.
(function () {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light') {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  } else if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add(prefersDark ? 'dark' : 'light');
  }
})();
