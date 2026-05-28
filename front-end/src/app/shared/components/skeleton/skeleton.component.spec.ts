import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with pulse animation and role="status"', () => {
    const el = element.firstElementChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.classList.contains('animate-pulse')).toBeTrue();
  });

  it('should apply text variant classes by default', () => {
    const el = element.firstElementChild as HTMLElement;
    expect(el.classList.contains('h-4')).toBeTrue();
    expect(el.classList.contains('rounded')).toBeTrue();
  });

  it('should apply rectangular variant classes', () => {
    component.variant = 'rectangular';
    fixture.detectChanges();
    const el = element.firstElementChild as HTMLElement;
    expect(el.classList.contains('rounded-lg')).toBeTrue();
    expect(el.classList.contains('h-4')).toBeFalse();
  });

  it('should apply circular variant with full rounded-full', () => {
    component.variant = 'circular';
    fixture.detectChanges();
    const el = element.firstElementChild as HTMLElement;
    expect(el.classList.contains('rounded-full')).toBeTrue();
  });

  it('should accept custom width and height', () => {
    component.width = '200px';
    component.height = '100px';
    fixture.detectChanges();
    const el = element.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('100px');
  });

  it('should have accessible aria-label', () => {
    component.ariaLabel = 'Cargando dashboard...';
    fixture.detectChanges();
    const el = element.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Cargando dashboard...');
  });

  it('should use default aria-label when none provided', () => {
    const el = element.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Cargando...');
  });
});
