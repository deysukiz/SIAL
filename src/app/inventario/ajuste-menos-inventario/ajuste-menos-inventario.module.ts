import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { AjusteMenosInventarioRoutingModule } from './ajuste-menos-inventario-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthService } from '../../auth.service';

import { IndexInventarioModule } from '../index-inventario/index-inventario.module';
//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { SimpleNotificationsModule } from 'angular2-notifications';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AjusteMenosInventarioRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    IndexInventarioModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    SimpleNotificationsModule
  ],
  declarations: [
    ListaComponent,
    FormularioComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class AjusteMenosInventarioModule { }
