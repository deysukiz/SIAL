import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CumplimientoComponent } from './cumplimiento.component';

describe('CumplimientoComponent', () => {
  let component: CumplimientoComponent;
  let fixture: ComponentFixture<CumplimientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CumplimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CumplimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
