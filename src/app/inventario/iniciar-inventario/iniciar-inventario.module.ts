import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

// import { BuscarInsumosModule } from '../buscar-insumos/buscar-insumos.module';
import { IndexInventarioModule } from '../index-inventario/index-inventario.module';

import { IniciarInventarioServiceRoutingModule } from './iniciar-inventario-routing.module';

import { IniciarInventarioService } from './iniciar-inventario.service';
import { ListaComponent } from './lista/lista.component';
import { InicialComponent } from './formulario/formulario.component';
// import { VerComponent } from './ver/ver.component';
//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
import { TextMaskModule } from 'angular2-text-mask';
import { MomentModule   } from 'angular2-moment';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HubModule,
    PerfilModule,
    CrudModule,
    BloquearPantallaModule,
    PaginacionModule,
    // BuscarInsumosModule,
    IniciarInventarioServiceRoutingModule,
    IndexInventarioModule,
    TextMaskModule,
    MomentModule,
    NguiDatetimePickerModule,
    CurrencyMaskModule,
    SimpleNotificationsModule.forRoot()
  ],
  declarations: [
    ListaComponent,
    InicialComponent,
    // VerComponent
  ],
  providers: [
    IniciarInventarioService,
    CrudService
  ]
})
export class IniciarInventarioModule { }
