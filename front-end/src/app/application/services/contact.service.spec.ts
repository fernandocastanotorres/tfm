import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContactService } from './contact.service';
import { of } from 'rxjs';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactService]
    });
    service = TestBed.inject(ContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOffices', () => {
    it('should return an Observable of ContactOffice[]', (done) => {
      service.getOffices().subscribe({
        next: (offices) => {
          expect(Array.isArray(offices)).toBeTrue();
          expect(offices.length).toBeGreaterThan(0);
          done();
        }
      });
    });

    it('should return offices with required properties', (done) => {
      service.getOffices().subscribe({
        next: (offices) => {
          const office = offices[0];
          expect(office.id).toBeDefined();
          expect(office.nameKey).toBeDefined();
          expect(office.addressKey).toBeDefined();
          expect(office.phone).toBeDefined();
          expect(office.email).toBeDefined();
          expect(office.scheduleKey).toBeDefined();
          done();
        }
      });
    });

    it('should return multiple offices', (done) => {
      service.getOffices().subscribe({
        next: (offices) => {
          expect(offices.length).toBeGreaterThanOrEqual(2);
          done();
        }
      });
    });

    it('should have offices with unique IDs', (done) => {
      service.getOffices().subscribe({
        next: (offices) => {
          const ids = offices.map(o => o.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
          done();
        }
      });
    });

    it('should emit after a delay', fakeAsync(() => {
      let emitted = false;
      service.getOffices().subscribe({
        next: () => { emitted = true; }
      });
      expect(emitted).toBeFalse();
      tick(300);
      expect(emitted).toBeTrue();
    }));
  });

  describe('getChannels', () => {
    it('should return an Observable of ContactChannel[]', (done) => {
      service.getChannels().subscribe({
        next: (channels) => {
          expect(Array.isArray(channels)).toBeTrue();
          expect(channels.length).toBeGreaterThan(0);
          done();
        }
      });
    });

    it('should return channels with required properties', (done) => {
      service.getChannels().subscribe({
        next: (channels) => {
          const channel = channels[0];
          expect(channel.id).toBeDefined();
          expect(channel.nameKey).toBeDefined();
          expect(channel.descriptionKey).toBeDefined();
          expect(channel.icon).toBeDefined();
          done();
        }
      });
    });

    it('should include common channel types', (done) => {
      service.getChannels().subscribe({
        next: (channels) => {
          const channelIds = channels.map(c => c.id);
          expect(channelIds).toContain('phone');
          expect(channelIds).toContain('email');
          done();
        }
      });
    });

    it('should emit after a delay', fakeAsync(() => {
      let emitted = false;
      service.getChannels().subscribe({
        next: () => { emitted = true; }
      });
      expect(emitted).toBeFalse();
      tick(300);
      expect(emitted).toBeTrue();
    }));
  });
});
