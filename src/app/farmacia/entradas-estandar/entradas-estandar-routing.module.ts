import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaEntradasComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'almacen/entradas-estandar',
    children: [
      {
        path: '',
        component: ListaEntradasComponent,
        canActivate: [PermisosGuard],
        data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
      },
      {
        path: 'ver/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
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
export class EntradasEstandarRoutingModule { }

