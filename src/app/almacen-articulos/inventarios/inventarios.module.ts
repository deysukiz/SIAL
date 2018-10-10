import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { InventariosRoutingModule } from './inventarios-routing.module';
import { PaginacionModule } from '../parcial/paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthService } from '../../auth.service';

import { MenuPanelModule } from '../menu/menu-panel.module';
import { MenuAsidePanelModule } from '../menu-aside/menu-aside-panel.module';
import { IndexAlmacenArticulosModule } from '../index-almacen-articulos/index-almacen-articulos.module';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
import { ParcialModule } from '../parcial/parcial.module';
//fin crud


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InventariosRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    MenuPanelModule,
    MenuAsidePanelModule,
    IndexAlmacenArticulosModule,
    NguiDatetimePickerModule,
    CrudModule,
    ParcialModule
  ],
  declarations: [
    ListaComponent,
    FormularioComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class InventariosModule { }
