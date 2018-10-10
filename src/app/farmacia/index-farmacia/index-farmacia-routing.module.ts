import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexFarmaciaComponent } from './index-farmacia.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'almacen',
    component: IndexFarmaciaComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexFarmaciaRoutingModule { }
