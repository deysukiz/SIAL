import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarSistemaComponent } from './actualizar-sistema.component';

describe('ActualizarSistemaComponent', () => {
  let component: ActualizarSistemaComponent;
  let fixture: ComponentFixture<ActualizarSistemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualizarSistemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
