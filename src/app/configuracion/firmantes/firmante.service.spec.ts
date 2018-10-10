import { TestBed, inject } from '@angular/core/testing';

import { FirmanteService } from './firmante.service';

describe('FirmanteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirmanteService]
    });
  });

  it('should be created', inject([FirmanteService], (service: FirmanteService) => {
    expect(service).toBeTruthy();
  }));
});
