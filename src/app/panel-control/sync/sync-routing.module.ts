import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstatusComponent } from './estatus/estatus.component';
import { LocalComponent } from './local/local.component';
import { LogComponent } from './log/log.component';
import { CentralComponent } from './central/central.component';
import { ServidoresComponent } from './servidores/servidores.component';
import { NuevoComponent as NuevoServidorComponent} from './servidores/nuevo/nuevo.component';
import { EditarComponent as EditarServidorComponent } from './servidores/editar/editar.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  { path: 'panel-control', redirectTo: '/panel-control/sync/estatus', pathMatch: 'full' },
  {
    path: 'panel-control/sync',
    children: [
       { path: '',  redirectTo: '/panel-control/sync/estatus', pathMatch: 'full' },
       { path: 'estatus', component: EstatusComponent },
       { path: 'log', component: LogComponent , canActivate: [PermisosGuard], data: { key: 'NNN3YYcmuXdZYVSGCk0CJFjcx3ATnRQ5'} },
       { path: 'local', component: LocalComponent , canActivate: [PermisosGuard], data: { key: 'NNN3YYcmuXdZYVSGCk0CJFjcx3ATnRQ5'} },
       { path: 'central', component: CentralComponent, canActivate: [PermisosGuard], data: { key: '3DMVRdBv4cLGzdfAqXO7oqTvAMbEdhI7'}  },
       { path: 'servidores', component: ServidoresComponent, canActivate: [PermisosGuard], data: { key: '8DDwGNuZOZfoFfaDOsQvBBhVzmnlU4PA'}  },
       { path: 'servidores/nuevo', component: NuevoServidorComponent, canActivate: [PermisosGuard], data: { key: 'Txy4Qi7mIekBNDG3T3vnJmLdMpiLQCeu'}  },
       { path: 'servidores/editar/:id', component: EditarServidorComponent, canActivate: [PermisosGuard], data: { key: 'C9I92bngLlDGuSpW9sHahdNx9f8zad3B'}  },
       
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyncRoutingModule { }
