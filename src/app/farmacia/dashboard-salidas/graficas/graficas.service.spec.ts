import { TestBed, inject } from '@angular/core/testing';

import { GraficasService } from './graficas.service';

describe('GraficasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GraficasService]
    });
  });

  it('should be created', inject([GraficasService], (service: GraficasService) => {
    expect(service).toBeTruthy();
  }));
});
