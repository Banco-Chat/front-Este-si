import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import Swal from 'sweetalert2';

export function handleApiError(error: HttpErrorResponse | TimeoutError, customFallback?: string) {
  if (error instanceof TimeoutError) {
    return;
  }

  const httpError = error as HttpErrorResponse;
  const errBody = httpError.error;

  let htmlMsg = '';
  const fallbackMsg = customFallback || 'Algo salió mal. Por favor intenta de nuevo.';

  if (errBody?.errors && typeof errBody.errors === 'object' && errBody.errors !== null) {
    const errorArrays = Object.values(errBody.errors) as any[];
    const flatErrors = errorArrays.flat();

    const validationMessages = flatErrors.map(err => {
      if (typeof err === 'string') return err;
      return err?.message || JSON.stringify(err);
    });

    if (validationMessages.length > 0) {
      htmlMsg = validationMessages
        .map(msg => `<div class="w-full mb-1 text-center leading-relaxed">${msg}</div>`)
        .join('');
    }
  }

  if (!htmlMsg) {
    const generalMsg = errBody?.msg || errBody?.message;
    if (typeof generalMsg === 'string') {
      htmlMsg = `<div class="w-full text-center leading-relaxed">${generalMsg}</div>`;
    }
  }

  Swal.fire({
    title: 'Error',
    html: htmlMsg || fallbackMsg,
    icon: 'error',
    confirmButtonColor: 'var(--primary-color)',
    confirmButtonText: 'Aceptar'
  });
}