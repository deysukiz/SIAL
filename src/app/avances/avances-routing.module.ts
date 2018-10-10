import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { DetalleComponent } from './detalle/detalle.component';

import { AuthGuard } from '../auth-guard.service';
import { PermisosGuard } from '../permisos.guard';

const routes: Routes = [
	{
	path: 'temas',
	    children: [
	       { path: '', component: ListaComponent},
	       { path: 'avances/:id', component: DetalleComponent}
	    ],
	    canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvancesRoutingModule { }
