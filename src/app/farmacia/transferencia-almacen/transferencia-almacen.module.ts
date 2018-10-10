import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { BuscarInsumosModule } from '../buscar-insumos/buscar-insumos.module';
import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';

import { TransferenciaAlmacenRoutingModule } from './transferencia-almacen-routing.module';
import { TransferenciaAlmacenService } from './transferencia-almacen.service';
import { ListaComponent } from './lista/lista.component';
import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';
import { SurtirComponent } from './surtir/surtir.component';

import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';

import { TextMaskModule } from 'angular2-text-mask';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { TransferenciaComponent } from './transferencia/transferencia.component';
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
    BuscarInsumosModule,
    IndexFarmaciaModule,
    CrudModule,
    TextMaskModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    SimpleNotificationsModule,
    TransferenciaAlmacenRoutingModule
  ],
  declarations: [ListaComponent, MenuLateralComponent, SurtirComponent, TransferenciaComponent, VerComponent],
  providers:[TransferenciaAlmacenService, CrudService]
})
export class TransferenciaAlmacenModule { }