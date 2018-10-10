import { TestBed, inject } from '@angular/core/testing';

import { ValidacionPedidosAlternosService } from './validacion-pedidos-alternos.service';

describe('ValidacionPedidosAlternosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidacionPedidosAlternosService]
    });
  });

  it('should be created', inject([ValidacionPedidosAlternosService], (service: ValidacionPedidosAlternosService) => {
    expect(service).toBeTruthy();
  }));
});
