import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';
import Swal from 'sweetalert2';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeAll(() => {
    spyOn(Swal, 'fire').and.resolveTo({ isConfirmed: true } as any);
  });

  afterAll(() => {
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.remove();
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmDialogService]
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should return true when user confirms', async () => {
    const result = await service.confirm('Eliminar?', 'Seguro?');
    expect(result).toBeTrue();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Eliminar?', icon: 'warning' })
    );
  });

  it('should return false when user cancels', async () => {
    (Swal.fire as jasmine.Spy).and.resolveTo({ isConfirmed: false } as any);
    const result = await service.confirm('Salir?', 'Perderas datos');
    expect(result).toBeFalse();
  });
});