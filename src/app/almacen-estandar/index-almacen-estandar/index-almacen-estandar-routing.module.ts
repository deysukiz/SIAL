import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexAlmacenEstandarComponent } from './index-almacen-estandar.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'almacen-estandar',
    component: IndexAlmacenEstandarComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexAlmacenEstandarRoutingModule { }
