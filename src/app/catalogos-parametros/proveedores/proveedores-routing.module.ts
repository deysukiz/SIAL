import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'catalogos-parametros/proveedores',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'h9IhilMjvBtC7X64A0poFV26EL5xWAyM'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'h9IhilMjvBtC7X64A0poFV26EL5xWAyM'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'h9IhilMjvBtC7X64A0poFV26EL5xWAyM'}
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
export class ProveedoresRoutingModule { }

