import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
    { path: 'panel-control', redirectTo: '/panel-control/roles', pathMatch: 'full' },
    {
      path: 'panel-control/roles',
      children: [
        { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'ICmOKw3HxhgRna4a78OP0QmKrIX0bNsp'} },
        { path: 'nuevo', component: NuevoComponent, canActivate: [PermisosGuard], data: { key: 'hA2wLCnNDQ5Z1OtvdW8lgX5D6wkM6zBE'} },
        { path: 'editar/:id', component: EditarComponent, canActivate: [PermisosGuard], data: { key: '9Z9XwxmNbrISFyF5sJkU3HyGUssSPfU5'}},
      ],
      canActivate: [AuthGuard]
    }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})

export class RolesRoutingModule { }

