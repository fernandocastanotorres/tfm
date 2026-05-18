import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  const mockSwalFire = jasmine.createSpy('fire');

  beforeEach(() => {
    // Mock SweetAlert2
    (window as any).swalMock = {
      fire: mockSwalFire
    };

    TestBed.configureTestingModule({
      providers: [ConfirmDialogService]
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    mockSwalFire.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should call Swal.fire with correct options', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Delete item?', 'Are you sure?', 'Delete');

      expect(mockSwalFire).toHaveBeenCalledWith({
        title: 'Delete item?',
        text: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
      });
    });

    it('should return true when confirmed', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      const result = await service.confirm('Title', 'Text');

      expect(result).toBeTrue();
    });

    it('should return false when not confirmed', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: false }));

      const result = await service.confirm('Title', 'Text');

      expect(result).toBeFalse();
    });

    it('should use default confirm button text', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          confirmButtonText: 'Confirmar'
        })
      );
    });

    it('should use custom confirm button text', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text', 'Yes, proceed');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          confirmButtonText: 'Yes, proceed'
        })
      );
    });

    it('should always set cancelButtonText to "Cancelar"', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          cancelButtonText: 'Cancelar'
        })
      );
    });

    it('should always set icon to "warning"', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning'
        })
      );
    });

    it('should always set reverseButtons to true', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reverseButtons: true
        })
      );
    });

    it('should always set focusCancel to true', async () => {
      mockSwalFire.and.returnValue(Promise.resolve({ isConfirmed: true }));

      await service.confirm('Title', 'Text');

      expect(mockSwalFire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          focusCancel: true
        })
      );
    });
  });
});
