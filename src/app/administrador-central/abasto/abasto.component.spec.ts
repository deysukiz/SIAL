import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbastoComponent } from './abasto.component';

describe('AbastoComponent', () => {
  let component: AbastoComponent;
  let fixture: ComponentFixture<AbastoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbastoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
