import { TestBed, inject } from '@angular/core/testing';

import { ClavesBasicasService } from './claves-basicas.service';

describe('ClavesBasicasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClavesBasicasService]
    });
  });

  it('should be created', inject([ClavesBasicasService], (service: ClavesBasicasService) => {
    expect(service).toBeTruthy();
  }));
});
