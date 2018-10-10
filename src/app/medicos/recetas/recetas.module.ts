import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';
import { PipesModule }             from '../../pipes/pipes.module';

import { ListaComponent } from './lista/lista.component';
import { NuevaComponent } from './nueva/nueva.component';

import { MenuModule } from '../menu/menu.module';

import { ModalTurnosComponent}  from  './nueva/modal-turnos.component';
//import { IndexFarmaciaModule } from '../../farmacia/index-farmacia/index-farmacia.module';


//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

import { AuthService } from '../../auth.service';
import { RecetasRoutingModule } from './recetas-routing.module';
import { VerComponent } from './ver/ver.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    MenuModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    RecetasRoutingModule
  ],
  declarations: [ListaComponent, NuevaComponent, ModalTurnosComponent, VerComponent]
})
export class RecetasModule { }
