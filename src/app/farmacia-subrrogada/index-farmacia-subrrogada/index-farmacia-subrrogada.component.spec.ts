/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IndexFarmaciaSubrrogadaComponent } from './index-farmacia-subrrogada.component';

describe('IndexFarmaciaComponent', () => {
  let component: IndexFarmaciaSubrrogadaComponent;
  let fixture: ComponentFixture<IndexFarmaciaSubrrogadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexFarmaciaSubrrogadaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexFarmaciaSubrrogadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
