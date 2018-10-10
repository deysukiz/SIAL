import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexCatalogoParamsComponent } from './index-catalogo-params.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'catalogos-parametros',
    component: IndexCatalogoParamsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexCatalogoParamsRoutingModule { }
