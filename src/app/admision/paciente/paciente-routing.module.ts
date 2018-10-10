import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';
import { HistorialComponent } from './historial/historial.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = 
[
	{
	    path: 'paciente',
	    children: [
	       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'XE1pZJV6ZprLc0vP45Pkkpm2UlOJEBqV'}},
	       { path: 'nuevo', component: NuevoComponent, canActivate: [PermisosGuard], data: { key: 'XE1pZJV6ZprLc0vP45Pkkpm2UlOJEBqV'} },
	       { path: 'editar/:id', component: EditarComponent, canActivate: [PermisosGuard], data: { key: 'XE1pZJV6ZprLc0vP45Pkkpm2UlOJEBqV'}},
	       { path: 'historial/:id', component: HistorialComponent, canActivate: [PermisosGuard], data: { key: 'XE1pZJV6ZprLc0vP45Pkkpm2UlOJEBqV'}},
	    ],
	    canActivate: [AuthGuard]
  	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacienteRoutingModule { }
