import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule    } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { SincronizarRecetasRoutingModule } from './sincronizar-recetas-routing.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { PipesModule         } from '../../pipes/pipes.module';
import { ListaComponent      } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { ListaSincronizacionesComponent }  from './lista-sincronizaciones/lista-sincronizaciones.component';
import { CargarComponent     } from './formulario/cargar.component';

import { AuthService } from '../../auth.service';

import { IndexFarmaciaSubrrogadaModule } from '../index-farmacia-subrrogada/index-farmacia-subrrogada.module';
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
    SincronizarRecetasRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    IndexFarmaciaSubrrogadaModule,
    CrudModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    SimpleNotificationsModule.forRoot()
  ],
  declarations: [ 
    ListaComponent,   
    FormularioComponent,
    ListaSincronizacionesComponent,
    CargarComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class SincronizarRecetasModule { }
