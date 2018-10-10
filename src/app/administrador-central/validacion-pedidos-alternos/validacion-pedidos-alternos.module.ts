import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ValidacionPedidosAlternosRoutingModule } from './validacion-pedidos-alternos-routing.module';

import { AdministradorCentralModule } from '../administrador-central.module';
import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { ListaComponent } from './lista/lista.component';
import { ValidarComponent } from './validar/validar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ValidacionPedidosAlternosRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,    
    AdministradorCentralModule
  ],
  declarations: [ListaComponent, ValidarComponent]
})
export class ValidacionPedidosAlternosModule { }
