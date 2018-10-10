import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { SalidasRecetasRoutingModule } from './salidas-recetas-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { ModalTurnosComponent}  from  './formulario/modal-turnos.component';

import { AuthService } from '../../auth.service';

import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';
//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SalidasRecetasRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    IndexFarmaciaModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule
  ],
  declarations: [ 
    ListaComponent,
    FormularioComponent,
    ModalTurnosComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class SalidasRecetasModule { }
