import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioComponent } from './formulario/formulario.component';
import { DevolucionComponent } from './formulario/devolucion.component';
import { ListaComponent } from './lista/lista.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'almacen-articulos/resguardos',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'aUYWDYq2gV9RqGaIe6XdRfd2QjZOeRSP'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'aUYWDYq2gV9RqGaIe6XdRfd2QjZOeRSP'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: '5Pnh7DTayhrND0GyB7bzfbdFK2kA6bgM'}
      },
      {
        path: 'devolucion/:id',
        component: DevolucionComponent,
        canActivate: [PermisosGuard],
        data: { key: '5Pnh7DTayhrND0GyB7bzfbdFK2kA6bgM'}
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
export class ResguardosRoutingModule { }
