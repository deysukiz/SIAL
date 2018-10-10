import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { BuscarInsumosModule } from '../../farmacia/buscar-insumos/buscar-insumos.module';
import { IndexFarmaciaModule } from '../../farmacia/index-farmacia/index-farmacia.module';
// import { BuscarInsumosModule } from '../farmacia/buscar-insumos/buscar-insumos.module';
// import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';

import { PedidosRoutingModule } from './pedidos-routing.module';

import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

import { PedidosComponent           } from './pedidos.component';
import { MenuLateralComponent       } from './menu-lateral/menu-lateral.component';
import { ListaComponent             } from './lista/lista.component';
import { PedidosEstandarService     } from './pedidos.service';
import { AlmacenesService           } from '../../catalogos/almacenes/almacenes.service';
import { IndexAlmacenEstandarModule } from '../index-almacen-estandar/index-almacen-estandar.module';
import { StockService } from './stock/stock.service';
import { RecepcionEstandarService   } from './recepcion/recepcion.service';

import { VerComponent } from './ver/ver.component';
import { FormularioComponent } from './formulario/formulario.component';
import { RecepcionComponent } from './recepcion/recepcion.component';

import { ListaCluesComponent } from './lista-clues/lista-clues.component';
import { from } from 'rxjs/observable/from';

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
    IndexAlmacenEstandarModule,
    IndexFarmaciaModule
  ],
  declarations: [
    PedidosComponent,
    MenuLateralComponent,
    ListaComponent,
    VerComponent,
    FormularioComponent,
    RecepcionComponent,
    ListaCluesComponent
  ],
  providers: [
    PedidosEstandarService,
    AlmacenesService,
    StockService,
    RecepcionEstandarService
  ]
})
export class PedidosEstandarModule { }
