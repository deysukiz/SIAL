import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { BuscarInsumosComponent } from './buscar-insumos.component';

import { BuscarInsumosService } from './buscar-insumos.service';

@NgModule({
  imports: [
    CommonModule,
    PaginacionModule
  ],
  exports: [
    BuscarInsumosComponent
  ],
  declarations: [BuscarInsumosComponent],
  providers: [BuscarInsumosService]
})
export class BuscarInsumosModule { }
