import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { AlmacenesRoutingModule } from './almacenes-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthService } from '../../auth.service';

//import { MenuPanelModule } from '../menu/menu-panel.module';
//import { MenuAsidePanelModule } from '../menu/menu-aside/menu-aside-panel.module';
import { MenuModule  } from './../menu/menu.module';

//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
//fin crud

import { NguiAutoCompleteModule } from '@ngui/auto-complete';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlmacenesRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    MenuModule,
    //MenuPanelModule, 
    //MenuAsidePanelModule,
    CrudModule,
    NguiAutoCompleteModule
  ],
  declarations: [ 
    ListaComponent,   
    FormularioComponent 
  ],
  providers: [ AuthService, CrudService ]
})
export class MisAlmacenesModule { }
