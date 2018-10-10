import { TestBed, inject } from '@angular/core/testing';

import { ContratosService } from './contratos.service';

describe('ContratosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContratosService]
    });
  });

  it('should be created', inject([ContratosService], (service: ContratosService) => {
    expect(service).toBeTruthy();
  }));
});
