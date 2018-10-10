import { TestBed, inject } from '@angular/core/testing';

import { AlmacenesService } from './almacenes.service';

describe('AlmacenesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlmacenesService]
    });
  });

  it('should ...', inject([AlmacenesService], (service: AlmacenesService) => {
    expect(service).toBeTruthy();
  }));
});