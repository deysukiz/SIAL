import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCluesComponent } from './lista-clues.component';

describe('ListaCluesComponent', () => {
  let component: ListaCluesComponent;
  let fixture: ComponentFixture<ListaCluesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaCluesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
