import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDatosComponent } from './base-datos.component';

describe('BaseDatosComponent', () => {
  let component: BaseDatosComponent;
  let fixture: ComponentFixture<BaseDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
