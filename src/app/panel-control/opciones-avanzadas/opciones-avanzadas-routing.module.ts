import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ActualizarSistemaComponent } from './actualizar-sistema/actualizar-sistema.component';
import { BaseDatosComponent } from './base-datos/base-datos.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'panel-control/opciones-avanzadas',
    children: [
       { path: '',  redirectTo: '/panel-control/opciones-avanzadas/actualizar-sistema', pathMatch: 'full' },
       { path: 'actualizar-sistema', component: ActualizarSistemaComponent , canActivate: [PermisosGuard], data: { key: 'tFcVVgwywaPvfj4ZdOoCZfBpcTtZAST0'} },
       { path: 'base-datos', component: BaseDatosComponent , canActivate: [PermisosGuard], data: { key: 'WcIjPIhPWGJbLyb4OiYe91sRKP7NGTAK'} },
       
       
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpcionesAvanzadasRoutingModule { }
