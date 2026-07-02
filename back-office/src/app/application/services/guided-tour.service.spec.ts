import { TestBed } from '@angular/core/testing';
import { GuidedTourService } from './guided-tour.service';

describe('GuidedTourService', () => {
  let service: GuidedTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuidedTourService]
    });
    service = TestBed.inject(GuidedTourService);
  });

  it('should not throw when elements exist', () => {
    document.body.innerHTML = '<div data-tour="bo-sidebar"></div><div data-tour="bo-header"></div>';
    expect(() => service.startBackofficeTour()).not.toThrow();
  });

  it('should not throw when no elements match', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => service.startBackofficeTour()).not.toThrow();
  });
});