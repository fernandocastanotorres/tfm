import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private readonly iconMap: Record<ToastOptions['type'], SweetAlertIcon> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  show(options: ToastOptions): void {
    const { type, title, message, duration = 5000 } = options;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: this.iconMap[type],
      title: message ? `<strong>${title}</strong><br/><span style="font-size:0.85em">${message}</span>` : title,
      html: message ? `<strong>${title}</strong><br/><span style="font-size:0.85em">${message}</span>` : title,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      showCloseButton: true,
      customClass: {
        popup: 'toast-popup'
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  success(title: string, message?: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration: duration ?? 8000 });
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration: duration ?? 6000 });
  }

  info(title: string, message?: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }
}
