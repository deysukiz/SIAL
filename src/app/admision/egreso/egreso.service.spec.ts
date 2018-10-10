import { TestBed, inject } from '@angular/core/testing';

import { EgresoService } from './egreso.service';

describe('EgresoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EgresoService]
    });
  });

  it('should ...', inject([EgresoService], (service: EgresoService) => {
    expect(service).toBeTruthy();
  }));
});
