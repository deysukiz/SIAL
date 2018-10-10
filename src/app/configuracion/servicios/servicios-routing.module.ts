import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioComponent } from './formulario/formulario.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const usuario = JSON.parse(localStorage.getItem('usuario'));
const routes: Routes = [
  {
    path: 'configuracion',
    redirectTo: 'configuracion/servicios',
    pathMatch: 'full',
    canActivate: [PermisosGuard],
    data: { key: 'Ki9kBghgqYsY17kqL620GWYl0bpeU6TB'}
  },
  {
    path: 'configuracion/servicios',
    children: [
      {
        path: '',
        component: FormularioComponent,
        pathMatch: 'full',
        canActivate: [PermisosGuard],
        data: { key: 'Ki9kBghgqYsY17kqL620GWYl0bpeU6TB'}
      },
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ServiciosRoutingModule { }
