import { TestBed, inject } from '@angular/core/testing';

import { ActasService } from './actas.service';

describe('ActasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActasService]
    });
  });

  it('should be created', inject([ActasService], (service: ActasService) => {
    expect(service).toBeTruthy();
  }));
});
