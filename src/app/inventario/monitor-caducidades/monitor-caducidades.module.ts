import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { MonitorCaducidadesRoutingModule } from './monitor-caducidades-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';

import { AuthService } from '../../auth.service';

import { IndexInventarioModule } from '../index-inventario/index-inventario.module';
import { MenuAsidePanelModule } from '../menu-aside/menu-aside-panel.module';
//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
import { ParcialModule } from '../parcial-inventario/parcial.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MonitorCaducidadesRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    ParcialModule,
    PipesModule,
    IndexInventarioModule,
    MenuAsidePanelModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule
  ],
  declarations: [ 
    ListaComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class MonitorCaducidadesModule { }
