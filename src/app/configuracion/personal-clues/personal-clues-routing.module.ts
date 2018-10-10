import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'configuracion/personal-clues',
    canActivate: [
      AuthGuard,
      PermisosGuard
    ],
    data: { key: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3'},
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3'}
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PersonalCluesRoutingModule { }

