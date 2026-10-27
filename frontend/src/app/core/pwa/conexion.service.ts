import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConexionService {
  readonly enLinea = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.enLinea.set(true));
    window.addEventListener('offline', () => this.enLinea.set(false));
  }
}
