import { TestBed, inject } from '@angular/core/testing';

import { EntregasService } from './entregas.service';

describe('EntregasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntregasService]
    });
  });

  it('should ...', inject([EntregasService], (service: EntregasService) => {
    expect(service).toBeTruthy();
  }));
});
