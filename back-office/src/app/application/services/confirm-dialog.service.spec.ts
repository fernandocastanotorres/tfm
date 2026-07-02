import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';
import Swal from 'sweetalert2';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmDialogService]
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should return true when user confirms', async () => {
    spyOn(Swal, 'fire').and.resolveTo({ isConfirmed: true } as any);
    const result = await service.confirm('Eliminar?', 'Seguro?');
    expect(result).toBeTrue();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Eliminar?', icon: 'warning' })
    );
  });

  it('should return false when user cancels', async () => {
    spyOn(Swal, 'fire').and.resolveTo({ isConfirmed: false } as any);
    const result = await service.confirm('Salir?', 'Perderas datos');
    expect(result).toBeFalse();
  });
});