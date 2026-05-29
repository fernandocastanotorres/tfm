import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentVerificationComponent } from './document-verification.component';
import { SignatureApiService } from '../../../application/services/signature-api.service';

describe('DocumentVerificationComponent', () => {
  let component: DocumentVerificationComponent;
  let fixture: ComponentFixture<DocumentVerificationComponent>;
  let signatureSpy: jasmine.SpyObj<SignatureApiService>;

  beforeEach(async () => {
    signatureSpy = jasmine.createSpyObj('SignatureApiService', ['verifyPublicFile', 'verifyByCsv']);
    await TestBed.configureTestingModule({
    imports: [FormsModule, DocumentVerificationComponent],
    providers: [
        { provide: SignatureApiService, useValue: signatureSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DocumentVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should verify CSV successfully', () => {
    signatureSpy.verifyByCsv.and.returnValue(of({
      valid: true,
      message: 'ok',
      csvCode: 'ABC',
      documentId: 'd1',
      caseId: 'c1',
      signedAt: new Date().toISOString(),
      digest: 'deadbeef'
    }));
    component.csvCode = 'ABC';

    component.verifyCsv();

    expect(signatureSpy.verifyByCsv).toHaveBeenCalledWith('ABC');
    expect(component.csvVerificationResult?.valid).toBeTrue();
  });

  it('should handle CSV verification error', () => {
    signatureSpy.verifyByCsv.and.returnValue(throwError(() => new Error('fail')));
    component.csvCode = 'BAD';

    component.verifyCsv();

    expect(component.errorMessage).toBeTruthy();
  });
});
