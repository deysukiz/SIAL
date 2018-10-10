import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'inventario/movimientos-generales',
    children: [
       {
         path: '',
         component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'arxliSoSCp1HEYcgr2pEeyeHP0u4TbWd'}
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
export class MovimientosGeneralesRoutingModule { }

