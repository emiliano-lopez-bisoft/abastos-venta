import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CrearTicketInput, TicketDto } from '@abastos/shared';
import { firstValueFrom } from 'rxjs';

const URL = '/api/tickets';

/** En la app les decimos "vales" (como los que imprime tu tío); en el API son tickets. */
@Injectable({ providedIn: 'root' })
export class ValesApi {
  private readonly http = inject(HttpClient);

  crear(datos: CrearTicketInput): Promise<TicketDto> {
    return firstValueFrom(this.http.post<TicketDto>(URL, datos));
  }
}
