import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermisosService  } from './permisos.service';

import { PermisosComponent } from './permisos.component';
import { NuevoComponent} from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  { path: 'panel-control', redirectTo: '/panel-control/sync/estatus', pathMatch: 'full' },
  {
    path: 'panel-control/permisos',
    children: [
       { path: '', component: PermisosComponent, canActivate: [PermisosGuard], data: { key: 'DYwQAxJbpHWw07zT09scEogUeFKFdGSu'}  },
       { path: 'nuevo', component: NuevoComponent, canActivate: [PermisosGuard], data: { key: 'dsvilCCjRtFJ9QXuunzbR1CYLKJQ5MYA'}  },
       { path: 'editar/:id', component: EditarComponent, canActivate: [PermisosGuard], data: { key: 'l4SBZlAj2SYrdFi747wo8yuvJ0sAE0U9'}  },
       
    ],
    canActivate: [AuthGuard]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PermisosService]
})
export class PermisosRoutingModule { }
