import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexInventarioComponent } from './index-inventario.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'inventario',
    component: IndexInventarioComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexInventarioRoutingModule { }
