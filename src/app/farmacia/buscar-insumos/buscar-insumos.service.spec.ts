/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BuscarInsumosService } from './buscar-insumos.service';

describe('BuscarInsumosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuscarInsumosService]
    });
  });

  it('should ...', inject([BuscarInsumosService], (service: BuscarInsumosService) => {
    expect(service).toBeTruthy();
  }));
});
