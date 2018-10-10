import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from '../salidas-estandar/lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'almacen/salidas-estandar',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
      },
      {
        path: 'ver/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG'}
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
export class SalidasEstandarRoutingModule { }

