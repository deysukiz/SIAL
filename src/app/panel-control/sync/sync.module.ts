import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MenuModule } from '../menu/menu.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { SyncRoutingModule } from './sync-routing.module';
import { EstatusComponent } from './estatus/estatus.component';
import { LocalComponent } from './local/local.component';
import { LogComponent } from './log/log.component';

import { SyncService } from './sync.service';
import { CentralComponent } from './central/central.component';
import { ServidoresComponent } from './servidores/servidores.component';
import { NuevoComponent } from './servidores/nuevo/nuevo.component';
import { EditarComponent } from './servidores/editar/editar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SyncRoutingModule,   
    MenuModule,
    PaginacionModule
  ],
  declarations: [ EstatusComponent, LocalComponent, LogComponent, CentralComponent, ServidoresComponent, NuevoComponent, EditarComponent],
  providers:[SyncService]
})
export class SyncModule { }
