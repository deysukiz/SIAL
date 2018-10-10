import { TestBed, inject } from '@angular/core/testing';

import { AsignacionProveedoresPedidosAlternosService } from './asignacion-proveedores-pedidos-alternos.service';

describe('AsignacionProveedoresPedidosAlternosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsignacionProveedoresPedidosAlternosService]
    });
  });

  it('should be created', inject([AsignacionProveedoresPedidosAlternosService], (service: AsignacionProveedoresPedidosAlternosService) => {
    expect(service).toBeTruthy();
  }));
});
