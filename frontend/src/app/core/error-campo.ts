import { Component, computed, input } from '@angular/core';

/** Lo mínimo que necesitamos de un campo de Signal Forms para mostrar su error. */
type CampoConErrores = () => {
  touched(): boolean;
  errors(): readonly { message?: string }[];
};

/** Muestra el primer error de un campo, solo después de que el usuario lo tocó. */
@Component({
  selector: 'app-error-campo',
  template: `
    @if (mensaje(); as m) {
      <span class="campo__error" role="alert">{{ m }}</span>
    }
  `,
})
export class ErrorCampo {
  readonly campo = input.required<CampoConErrores>();

  protected readonly mensaje = computed(() => {
    const estado = this.campo()();
    if (!estado.touched()) return null;
    return estado.errors()[0]?.message ?? null;
  });
}
