import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ProceduresComponent } from './procedures.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../application/services/toast.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { CommonModule } from '@angular/common';

describe('ProceduresComponent', () => {
  let component: ProceduresComponent;
  let fixture: ComponentFixture<ProceduresComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let toastSpy: jasmine.SpyObj<ToastService>;
  const baseUrl = 'http://localhost:8080/api/v1';

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);

    await TestBed.configureTestingModule({
    imports: [CommonModule, TranslateModule.forRoot(), HttpClientTestingModule, ProceduresComponent, LoadingSkeletonComponent],
    providers: [
        { provide: ToastService, useValue: toastSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([])
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ProceduresComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load procedures on init', () => {
    const mockProcedures = [
      { id: 'proc-1', name: 'License', description: 'Apply for a license', category: 'Licenses', fee: 0, deadline: 30, status: 'active' },
      { id: 'proc-2', name: 'Permit', description: 'Request a permit', category: 'Permits', fee: 50, deadline: 15, status: 'active' }
    ];

    fixture.detectChanges();

    const req = httpMock.expectOne(`${baseUrl}/citizen/procedures/catalog`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProcedures);

    expect(component.procedures.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should show toast error with custom message when API returns error.message', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${baseUrl}/citizen/procedures/catalog`);
    req.flush({ message: 'Service unavailable' }, { status: 500, statusText: 'Server Error' });

    expect(toastSpy.error).toHaveBeenCalledWith('Error', 'Service unavailable');
    expect(component.isLoading).toBeFalse();
  });

  it('should show toast error with default message when no error.message', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${baseUrl}/citizen/procedures/catalog`);
    req.error(new ProgressEvent('Network error'));

    expect(toastSpy.error).toHaveBeenCalledWith('Error', 'No se han podido cargar los procedimientos.');
    expect(component.isLoading).toBeFalse();
  });

  it('startProcedure should navigate to new expediente route', () => {
    spyOn(router, 'navigate');
    const procedure = { id: 'license-application', name: 'License' } as any;

    component.startProcedure(procedure);

    expect(router.navigate).toHaveBeenCalledWith(['/sede/expedientes/nuevo', 'license-application']);
  });
});
