import { TestBed } from '@angular/core/testing';
import { pendingChangesGuard, PendingChangesComponent } from './pending-changes.guard';

describe('pendingChangesGuard', () => {
  it('should allow navigation when there are no pending changes', () => {
    const component = { hasPendingChanges: () => false } as PendingChangesComponent;

    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(component, null as any, null as any, null as any)
    );

    expect(result).toBeTrue();
  });

  it('should prompt user when there are pending changes', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const component = { hasPendingChanges: () => true } as PendingChangesComponent;

    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(component, null as any, null as any, null as any)
    );

    expect(window.confirm).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should block navigation when user cancels the prompt', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = { hasPendingChanges: () => true } as PendingChangesComponent;

    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(component, null as any, null as any, null as any)
    );

    expect(result).toBeFalse();
  });

  it('should handle null component gracefully', () => {
    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(null as any, null as any, null as any, null as any)
    );

    expect(result).toBeTrue();
  });
});
