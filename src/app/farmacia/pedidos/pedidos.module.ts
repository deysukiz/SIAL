import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { BuscarInsumosModule } from '../buscar-insumos/buscar-insumos.module';
import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';

import { PedidosRoutingModule } from './pedidos-routing.module';

import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

import { PedidosComponent } from './pedidos.component';
import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';
import { ListaComponent } from './lista/lista.component';
import { PedidosService } from './pedidos.service';
import { ActasService } from './actas/actas.service';
import { AlmacenesService } from '../../catalogos/almacenes/almacenes.service';
import { StockService } from '../stock/stock.service';
import { RecepcionService } from './recepcion/recepcion.service';

import { VerComponent } from './ver/ver.component';
import { FormularioComponent } from './formulario/formulario.component';
import { RecepcionComponent } from './recepcion/recepcion.component';

import { ListaCluesComponent } from './lista-clues/lista-clues.component';

import { ListaComponent as ListaActasComponent } from './actas/lista/lista.component';
import { VerComponent as VerActaComponent } from './actas/ver/ver.component';

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
    NguiDatetimePickerModule,
    PedidosRoutingModule,
    IndexFarmaciaModule
  ],
  declarations: [PedidosComponent, MenuLateralComponent, ListaComponent, VerComponent, FormularioComponent, RecepcionComponent, ListaCluesComponent, ListaActasComponent, VerActaComponent],
  providers:[PedidosService,ActasService,AlmacenesService,StockService,RecepcionService]
})
export class PedidosModule { }
