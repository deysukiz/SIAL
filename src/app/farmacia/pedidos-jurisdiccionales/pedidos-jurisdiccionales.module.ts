import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { BuscarInsumosModule } from '../buscar-insumos/buscar-insumos.module';
import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';

import { PedidosJurisdiccionalesRoutingModule } from './pedidos-jurisdiccionales-routing.module';

import { PedidosJurisdiccionalesComponent } from './pedidos-jurisdiccionales.component';
import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';
import { ListaComponent } from './lista/lista.component';
import { PedidosJurisdiccionalesService } from './pedidos-jurisdiccionales.service';
import { AlmacenesService } from '../../catalogos/almacenes/almacenes.service';
import { StockService } from '../stock/stock.service';
import { RecepcionService } from './recepcion/recepcion.service';

import { VerComponent } from './ver/ver.component';
import { FormularioComponent } from './formulario/formulario.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { ListaCluesComponent } from './lista-clues/lista-clues.component';

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
    PedidosJurisdiccionalesRoutingModule,
    IndexFarmaciaModule
  ],
  declarations: [PedidosJurisdiccionalesComponent, MenuLateralComponent, ListaComponent, VerComponent, FormularioComponent, RecepcionComponent, ListaCluesComponent],
  providers:[PedidosJurisdiccionalesService,AlmacenesService,StockService,RecepcionService]
})
export class PedidosJurisdiccionalesModule { }
