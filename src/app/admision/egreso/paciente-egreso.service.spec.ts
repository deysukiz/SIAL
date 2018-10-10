import { TestBed, inject } from '@angular/core/testing';

import { PacienteEgresoService } from './paciente-egreso.service';

describe('PacienteEgresoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PacienteEgresoService]
    });
  });

  it('should ...', inject([PacienteEgresoService], (service: PacienteEgresoService) => {
    expect(service).toBeTruthy();
  }));
});
