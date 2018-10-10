import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'panel-control/usuarios',
    children: [
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'mGKikN0aJaeF2XrHwwYK3XNw0f9CSZDe'} },
       { path: 'nuevo', component: NuevoComponent, canActivate: [PermisosGuard], data: { key: 'xJqy3csU5WyOX7pmXL7VBs680uTVGxU3'} },
       { path: 'editar/:id', component: EditarComponent, canActivate: [PermisosGuard], data: { key: 'dlV1H4gX0nqEgHauHC8BRIlwl6SGUoUt'}},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class UsuariosRoutingModule { }

