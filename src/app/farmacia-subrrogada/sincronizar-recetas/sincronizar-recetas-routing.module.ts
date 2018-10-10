import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { ListaSincronizacionesComponent }  from './lista-sincronizaciones/lista-sincronizaciones.component';
import { CargarComponent } from './formulario/cargar.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'farmacia-subrrogada/sincronizar-recetas',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: '6sTjs3q8rhHslelQgTUI4hdkNSbiwyhf'}
      },
      {
        path: 'nuevo',
        component: CargarComponent,
        canActivate: [PermisosGuard],
        data: { key: '6sTjs3q8rhHslelQgTUI4hdkNSbiwyhf'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: '6sTjs3q8rhHslelQgTUI4hdkNSbiwyhf'}
      },
      {
        path: 'lista-sincronizaciones/:pedido_id',
        component: ListaSincronizacionesComponent,
        canActivate: [PermisosGuard],
        data: { key: '6sTjs3q8rhHslelQgTUI4hdkNSbiwyhf'}
      }
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SincronizarRecetasRoutingModule { }

