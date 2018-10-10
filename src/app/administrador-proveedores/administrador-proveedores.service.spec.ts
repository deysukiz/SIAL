import { TestBed, inject } from '@angular/core/testing';

import { AdministradorProveedoresService } from './administrador-proveedores.service';

describe('AdministradorProveedoresService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdministradorProveedoresService]
    });
  });

  it('should ...', inject([AdministradorProveedoresService], (service: AdministradorProveedoresService) => {
    expect(service).toBeTruthy();
  }));
});
