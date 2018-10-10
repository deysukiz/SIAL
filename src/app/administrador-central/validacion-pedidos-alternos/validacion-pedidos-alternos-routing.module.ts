import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { ValidarComponent } from './validar/validar.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'administrador-central/validacion-pedidos-alternos',
    children: [
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'ICmOKw3HxhgRna4a78OP0QmKrIX0bNsp'} },       
       { path: ':id', component: ValidarComponent},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidacionPedidosAlternosRoutingModule { }
