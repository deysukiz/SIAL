import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PedidosUMRoutingModule } from './pedidos-um-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule             } from '../../pipes/pipes.module';
import { ListaComponent          } from './lista/lista.component';
import { FormularioComponent     } from './formulario/formulario.component';

import { AuthService } from '../../auth.service';

import { IndexDamModule } from '../index-dam/index-dam.module';
//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { TextMaskModule } from 'angular2-text-mask';
import { MomentModule   } from 'angular2-moment';
import { from } from 'rxjs/observable/from';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PedidosUMRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    IndexDamModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    TextMaskModule,
    MomentModule,
    SimpleNotificationsModule,
    CurrencyMaskModule
  ],
  declarations: [
    ListaComponent,
    FormularioComponent,
  ],
  providers: [ AuthService, CrudService ]
})
export class PedidosUMModule { }
