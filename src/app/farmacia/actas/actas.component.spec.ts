/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ActasComponent } from './actas.component';

describe('ActasComponent', () => {
  let component: ActasComponent;
  let fixture: ComponentFixture<ActasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
