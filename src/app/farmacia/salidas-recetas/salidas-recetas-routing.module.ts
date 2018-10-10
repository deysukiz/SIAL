import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'almacen/salidas-recetas',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GPSDLmXckXcdfdj7lD4rdacwMivsTp9g'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GPSDLmXckXcdfdj7lD4rdacwMivsTp9g'}
      },
      {
        path: 'ver/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'GPSDLmXckXcdfdj7lD4rdacwMivsTp9g'}
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
export class SalidasRecetasRoutingModule { }

