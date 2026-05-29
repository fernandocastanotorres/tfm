import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  async confirm(title: string, text: string, confirmButtonText = 'Confirmar'): Promise<boolean> {
    const { default: Swal } = await import('sweetalert2');
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });
    return result.isConfirmed;
  }
}
