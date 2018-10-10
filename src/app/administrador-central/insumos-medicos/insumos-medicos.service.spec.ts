import { TestBed, inject } from '@angular/core/testing';

import { InsumosMedicosService } from './insumos-medicos.service';

describe('InsumosMedicosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InsumosMedicosService]
    });
  });

  it('should be created', inject([InsumosMedicosService], (service: InsumosMedicosService) => {
    expect(service).toBeTruthy();
  }));
});
