import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ChartModule } from 'angular2-highcharts';


import { HubModule } from '../hub/hub.module';
import { PerfilModule } from '../perfil/perfil.module';
import { BloquearPantallaModule } from '../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../paginacion/paginacion.module';

import { AdministradorCentralRoutingModule } from './administrador-central-routing.module';
import { PedidosComponent } from './pedidos/pedidos.component';
import { AbastoComponent } from './abasto/abasto.component';
import { TransferenciasRecursosComponent } from './transferencias-recursos/transferencias-recursos.component';
import { MenuComponent } from './menu/menu.component';
import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';

import { AdministradorCentralService } from './administrador-central.service';
import { EntregasMesComponent } from './entregas-mes/entregas-mes.component';
import { CumplimientoComponent } from './cumplimiento/cumplimiento.component';
import { ReporteFinancieroComponent } from './reporte-financiero/reporte-financiero.component';
import { PenasConvencionalesComponent } from './penas-convencionales/penas-convencionales.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    AdministradorCentralRoutingModule,
    ChartModule
  ],
  exports: [
    MenuLateralComponent, MenuComponent
  ],
  declarations: [PedidosComponent, AbastoComponent, TransferenciasRecursosComponent, MenuComponent, MenuLateralComponent, EntregasMesComponent, CumplimientoComponent, ReporteFinancieroComponent, PenasConvencionalesComponent],
  providers: [ AdministradorCentralService ]
})
export class AdministradorCentralModule { }
