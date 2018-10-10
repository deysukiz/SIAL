import { TestBed, inject } from '@angular/core/testing';

import { CambiarFechaHoraService } from './cambiar-fecha-hora.service';

describe('CambiarFechaHoraService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CambiarFechaHoraService]
    });
  });

  it('should be created', inject([CambiarFechaHoraService], (service: CambiarFechaHoraService) => {
    expect(service).toBeTruthy();
  }));
});
