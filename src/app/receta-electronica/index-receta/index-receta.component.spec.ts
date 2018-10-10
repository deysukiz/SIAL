import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexRecetaComponent } from './index-receta.component';

describe('IndexRecetaComponent', () => {
  let component: IndexRecetaComponent;
  let fixture: ComponentFixture<IndexRecetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexRecetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
