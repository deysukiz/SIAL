import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../auth-guard.service';
import { PermisosGuard } from '../permisos.guard';
import { AyudaComponent } from 'app/ayuda-sial/ayuda/ayuda.component';

const routes: Routes = [
  {
    path: 'almacen/entradas-estandar',
    children: [
      {
        path: 'lista-ayuda',
        component: AyudaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
      },
      // {
      //   path: 'nuevo-ayuda',
      //   component: '',
      //   canActivate: [PermisosGuard],
      //   data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
      // }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'almacen/salidas-estandar',
    children: [
      {
        path: 'ayuda',
        component: AyudaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
      }
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AyudaSialRoutingModule { }