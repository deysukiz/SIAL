import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'catalogos-parametros/almacenes',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GVnLtL6maGUSPmaiLlCgAT4FzlzHKkN0'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GVnLtL6maGUSPmaiLlCgAT4FzlzHKkN0'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GVnLtL6maGUSPmaiLlCgAT4FzlzHKkN0'}
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
export class AlmacenesRoutingModule { }

