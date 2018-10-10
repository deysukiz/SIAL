import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../auth-guard.service';
import { PermisosGuard } from '../permisos.guard';

import { PedidosComponent } from './pedidos/pedidos.component';

const routes: Routes = [
  { path: 'administrador-proveedores', redirectTo: '/administrador-proveedores/pedidos', pathMatch: 'full' },
  {
    path: 'administrador-proveedores', 
    children: [
       { path: 'pedidos', component: PedidosComponent, canActivate: [PermisosGuard], data: { key: 'MrL06vIO12iNhchP14h57Puvg71eUmYb'} }
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorProveedoresRoutingModule { }
