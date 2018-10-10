import { TestBed, inject } from '@angular/core/testing';

import { AvanceService } from './avance.service';

describe('AvanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AvanceService]
    });
  });

  it('should be created', inject([AvanceService], (service: AvanceService) => {
    expect(service).toBeTruthy();
  }));
});
