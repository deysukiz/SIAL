import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HubModule } from '../hub/hub.module';
import { PerfilModule } from '../perfil/perfil.module';
import { BloquearPantallaModule } from '../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../paginacion/paginacion.module';

//import { MenuComponent } from './menu/menu.component';
//import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';

import { AdministradorProveedoresRoutingModule } from './administrador-proveedores-routing.module';
import { AdministradorProveedoresService } from './administrador-proveedores.service';

import { PedidosComponent } from './pedidos/pedidos.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    AdministradorProveedoresRoutingModule
  ],
  declarations: [PedidosComponent, MenuComponent],
  providers: [ AdministradorProveedoresService ]
})
export class AdministradorProveedoresModule { }