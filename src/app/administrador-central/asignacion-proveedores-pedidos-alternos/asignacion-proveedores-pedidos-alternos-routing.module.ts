import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { AsignarComponent } from './asignar/asignar.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'administrador-central/asignacion-proveedores-pedidos-alternos',
    children: [       
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'ICmOKw3HxhgRna4a78OP0QmKrIX0bNsp'} },       
       { path: ':id', component: AsignarComponent},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionProveedoresPedidosAlternosRoutingModule { }
