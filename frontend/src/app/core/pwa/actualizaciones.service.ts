import { inject, Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

const INTERVALO_REVISION_MS = 30 * 60 * 1000; //30 minutos

@Injectable({ providedIn: 'root' })
export class ActualizacionesService {
  private readonly sw = inject(SwUpdate);

  readonly hayNuevaVersion = signal(false);

  iniciar(): void {
    if (!this.sw.isEnabled) return;

    this.sw.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.hayNuevaVersion.set(true));

    this.sw.unrecoverable.subscribe(() => location.reload());

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.revisar();
    });
    setInterval(() => this.revisar(), INTERVALO_REVISION_MS);
  }

  actualizar(): void {
    location.reload();
  }

  private revisar(): void {
    if (!navigator.onLine) return;
    this.sw.checkForUpdate().catch(() => {
      // Sin red o error temporal: se reintenta en la siguiente revisión
    });
  }
}
