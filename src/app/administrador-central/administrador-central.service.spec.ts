import { TestBed, inject } from '@angular/core/testing';

import { AdministradorCentralService } from './administrador-central.service';

describe('AdministradorCentralService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdministradorCentralService]
    });
  });

  it('should ...', inject([AdministradorCentralService], (service: AdministradorCentralService) => {
    expect(service).toBeTruthy();
  }));
});
