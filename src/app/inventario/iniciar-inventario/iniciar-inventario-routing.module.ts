import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { InicialComponent } from './formulario/formulario.component';
// import { VerComponent} from './ver/ver.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'inventario/iniciar-inventario',
    children: [
      { path: '', component: ListaComponent},
      { path: 'nuevo', component: InicialComponent},
      { path: ':id', component: InicialComponent},
      {
        path: 'editar/:id',
        component: InicialComponent,
        // canActivate: [PermisosGuard],
        // data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
      },
      {
        path: 'ver/:id',
        component: InicialComponent,
        // canActivate: [PermisosGuard],
        // data: { key: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw'}
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
export class IniciarInventarioServiceRoutingModule { }