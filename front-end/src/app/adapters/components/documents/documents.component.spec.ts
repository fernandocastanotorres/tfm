import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentsComponent } from './documents.component';
import { DocumentsService } from '../../../application/services/documents.service';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentsComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [DocumentsService]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load documents', () => {
    expect(component.documents.length).toBeGreaterThan(0);
  });

  it('should filter pending documents', () => {
    component.setFilter('pending');
    expect(component.filteredDocuments.every((doc) => doc.statusKey === 'DOCUMENT_STATUS.PENDING')).toBeTrue();
  });
});
