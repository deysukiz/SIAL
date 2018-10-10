import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { SalidaRoutingModule } from './salida-routing.module';
import { PaginacionModule } from '../parcial/paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { FormularioComponent } from './formulario/formulario.component';
import { DevolucionComponent } from './formulario/devolucion.component';
import { ListaComponent } from './lista/lista.component';

import { AuthService } from '../../auth.service';

import { MenuPanelModule } from '../menu/menu-panel.module';
import { MenuAsidePanelModule } from '../menu-aside/menu-aside-panel.module';
import { IndexAlmacenArticulosModule } from '../index-almacen-articulos/index-almacen-articulos.module';

//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
import { ParcialModule } from '../parcial/parcial.module';
//fin crud

import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { Select2Module } from 'ng2-select2';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SalidaRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule, 
    ParcialModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    CrudModule,
    MenuPanelModule,
    MenuAsidePanelModule,
    IndexAlmacenArticulosModule,
    Select2Module
  ],
  declarations: [
    FormularioComponent,
    DevolucionComponent,
    ListaComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class SalidaModule { }
