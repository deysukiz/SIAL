import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferenciasRecursosComponent } from './transferencias-recursos.component';

describe('TransferenciasRecursosComponent', () => {
  let component: TransferenciasRecursosComponent;
  let fixture: ComponentFixture<TransferenciasRecursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferenciasRecursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferenciasRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
