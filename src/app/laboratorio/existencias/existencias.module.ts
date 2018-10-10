import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { ExistenciasRoutingModule } from './existencias-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { ListaComponent } from './lista/lista.component';

import { AuthService } from '../../auth.service';

import { IndexLaboratorioModule } from '../index-laboratorio/index-laboratorio.module';
//crud
import { CrudService    } from '../../crud/crud.service';
import { CrudModule     } from '../../crud/crud.module';
import { ParcialModule  } from '../parcial-laboratorio/parcial.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExistenciasRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    IndexLaboratorioModule,
    CrudModule,
    ParcialModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule
  ],
  declarations: [ 
    ListaComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class ExistenciasModule { }
