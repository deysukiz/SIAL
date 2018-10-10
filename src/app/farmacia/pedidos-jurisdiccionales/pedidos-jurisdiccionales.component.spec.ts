/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PedidosJurisdiccionalesComponent } from './pedidos-jurisdiccionales.component';

describe('PedidosJurisdiccionalesComponent', () => {
  let component: PedidosJurisdiccionalesComponent;
  let fixture: ComponentFixture<PedidosJurisdiccionalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosJurisdiccionalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosJurisdiccionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
