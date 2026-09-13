import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { appReady } from '@stores/auth.store';

export const publicAuthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return toObservable(appReady).pipe(
    filter(ready => ready === true),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};