import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { EgresoComponent } from './egreso/egreso.component';
import { IngresoComponent } from './ingreso/ingreso.component';
import { VerificacionComponent } from './verificacion/verificacion.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';


const routes: Routes = [
	{
	path: 'pacientes/modulo',
	    children: [
	       { path: 'egreso', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'CKXlt7sNZCiWBhvk33xqWEVTnv2lP022'}},
	       { path: 'egreso/:id', component: EgresoComponent, canActivate: [PermisosGuard], data: { key: 'CKXlt7sNZCiWBhvk33xqWEVTnv2lP022'} },
	       { path: 'ingreso/:id', component: IngresoComponent, canActivate: [PermisosGuard], data: { key: 'eS7qbng49qtMSs88wsflDnzMBVUfVMlc'}},
	       { path: 'verificacion', component: VerificacionComponent, canActivate: [PermisosGuard], data: { key: 'eS7qbng49qtMSs88wsflDnzMBVUfVMlc'}},
	    ],
	    canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EgresoRoutingModule { }
