import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioComponent } from './formulario/formulario.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const usuario = JSON.parse(localStorage.getItem('usuario'));
const routes: Routes = [
  {
    path: 'configuracion/documentos',
    children: [
      {
        path: '',
        component: FormularioComponent,
        pathMatch: 'full',
        canActivate: [PermisosGuard],
        data: { key: 'FQGogjvknDtZCTbyzHvFrmxpYilD6vj7'}
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
export class DocumentosRoutingModule { }
