import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesComponent {
  hasPendingChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (component) => {
  if (!component?.hasPendingChanges()) {
    return true;
  }
  return window.confirm('Tienes cambios sin guardar. Si sales ahora, se perderan.');
};
