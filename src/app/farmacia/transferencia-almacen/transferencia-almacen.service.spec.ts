import { TestBed, inject } from '@angular/core/testing';

import { TransferenciaAlmacenService } from './transferencia-almacen.service';

describe('TransferenciaAlmacenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransferenciaAlmacenService]
    });
  });

  it('should be created', inject([TransferenciaAlmacenService], (service: TransferenciaAlmacenService) => {
    expect(service).toBeTruthy();
  }));
});
