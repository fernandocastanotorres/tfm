import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  it('should call show with success type', () => {
    const showSpy = spyOn(service, 'show');
    service.success('Hecho', 'OK');
    expect(showSpy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'success', title: 'Hecho' }));
  });

  it('should call show with error type and 8s duration', () => {
    const showSpy = spyOn(service, 'show');
    service.error('Error', 'Msg');
    expect(showSpy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'error', duration: 8000 }));
  });

  it('should call show with warning type and 6s duration', () => {
    const showSpy = spyOn(service, 'show');
    service.warning('Cuidado');
    expect(showSpy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'warning', duration: 6000 }));
  });

  it('should call show with info type', () => {
    const showSpy = spyOn(service, 'show');
    service.info('Info');
    expect(showSpy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'info' }));
  });
});