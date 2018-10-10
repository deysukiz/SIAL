import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscarModuloPipe } from './buscar-modulo.pipe';
import { GroupByPipe  } from './groupBy.pipe';
import { FilterPipe  } from './filter.pipe';
@NgModule({
  imports: [
    CommonModule
  ],
  exports:[
    BuscarModuloPipe,
    GroupByPipe,
    FilterPipe
  ],
  declarations: [BuscarModuloPipe, GroupByPipe, FilterPipe]
})
export class PipesModule { }
