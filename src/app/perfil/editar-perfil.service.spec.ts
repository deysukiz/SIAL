import { TestBed, inject } from '@angular/core/testing';

import { EditarPerfilService } from './editar-perfil.service';

describe('EditarPerfilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditarPerfilService]
    });
  });

  it('should be created', inject([EditarPerfilService], (service: EditarPerfilService) => {
    expect(service).toBeTruthy();
  }));
});
