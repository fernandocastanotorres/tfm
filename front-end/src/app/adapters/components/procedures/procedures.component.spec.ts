import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProceduresComponent } from './procedures.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ProceduresComponent', () => {
  let component: ProceduresComponent;
  let fixture: ComponentFixture<ProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProceduresComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
