import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntregasMesComponent } from './entregas-mes.component';

describe('EntregasMesComponent', () => {
  let component: EntregasMesComponent;
  let fixture: ComponentFixture<EntregasMesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntregasMesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntregasMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
