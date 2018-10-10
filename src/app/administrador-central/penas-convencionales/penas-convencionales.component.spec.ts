import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PenasConvencionalesComponent } from './penas-convencionales.component';

describe('PenasConvencionalesComponent', () => {
  let component: PenasConvencionalesComponent;
  let fixture: ComponentFixture<PenasConvencionalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PenasConvencionalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenasConvencionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
