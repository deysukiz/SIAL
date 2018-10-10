import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexAlmacenArticulosComponent } from './index-almacen-articulos.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'almacen-articulos',
    component: IndexAlmacenArticulosComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexAlmacenArticulosRoutingModule { }
