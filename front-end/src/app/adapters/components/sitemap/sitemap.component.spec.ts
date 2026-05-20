import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { SitemapComponent } from './sitemap.component';

describe('SitemapComponent', () => {
  let component: SitemapComponent;
  let fixture: ComponentFixture<SitemapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitemapComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SitemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 sections', () => {
    expect(component.sections.length).toBe(4);
  });

  it('should have public section with links', () => {
    const publicSection = component.sections.find(s => s.id === 'public');
    expect(publicSection).toBeTruthy();
    expect(publicSection!.links.length).toBe(5);
  });

  it('should have institutional section with links', () => {
    const instSection = component.sections.find(s => s.id === 'institutional');
    expect(instSection).toBeTruthy();
    expect(instSection!.links.length).toBe(4);
  });

  it('should have resources section with links', () => {
    const resSection = component.sections.find(s => s.id === 'resources');
    expect(resSection).toBeTruthy();
    expect(resSection!.links.length).toBe(4);
  });

  it('should have authenticated section with links', () => {
    const authSection = component.sections.find(s => s.id === 'authenticated');
    expect(authSection).toBeTruthy();
    expect(authSection!.links.length).toBe(10);
  });

  it('should have correct routes for public links', () => {
    const publicSection = component.sections.find(s => s.id === 'public');
    const routes = publicSection!.links.map(l => l.route);
    expect(routes).toContain('/sede');
    expect(routes).toContain('/sede/procedimientos');
    expect(routes).toContain('/sede/faq');
    expect(routes).toContain('/sede/contacto');
    expect(routes).toContain('/sede/estado');
  });

  it('should have correct routes for authenticated links', () => {
    const authSection = component.sections.find(s => s.id === 'authenticated');
    const routes = authSection!.links.map(l => l.route);
    expect(routes).toContain('/sede/login');
    expect(routes).toContain('/sede/registro');
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/perfil');
    expect(routes).toContain('/notificaciones');
  });

  it('should have titleKey for each section', () => {
    component.sections.forEach(section => {
      expect(section.titleKey).toBeTruthy();
      expect(section.titleKey).toContain('SITEMAP.');
    });
  });

  it('should have labelKey for each link', () => {
    component.sections.forEach(section => {
      section.links.forEach(link => {
        expect(link.labelKey).toBeTruthy();
        expect(link.labelKey).toContain('SITEMAP.');
      });
    });
  });
});
