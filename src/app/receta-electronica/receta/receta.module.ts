import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { RecetaRoutingModule } from './receta-routing.module';
import { IndexRecetaModule } from '../index-receta/index-receta.module';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { MenuRecetaComponent } from '../index-receta/menu-receta.component';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

import { RecetaService } from './receta.service';

@NgModule({
  imports: [
    CommonModule,
    RecetaRoutingModule,
    FormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
    IndexRecetaModule,
    NguiDatetimePickerModule,
    ReactiveFormsModule,
    PaginacionModule
  ],
  exports: [],
  providers: [ RecetaService ],
  declarations: [ListaComponent, FormularioComponent]
})
export class RecetaModule { }
