// jsdom no implementa matchMedia; SweetAlert2 (y otras libs) lo usan para animaciones/estilos.
// Sin este polyfill, cualquier componente que dispare un Swal.fire durante las pruebas
// (por ejemplo, al manejar un error de una llamada HTTP real sin mockear) truena con
// "window.matchMedia is not a function".
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
