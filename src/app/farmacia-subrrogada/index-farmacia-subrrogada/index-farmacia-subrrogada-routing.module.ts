import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexFarmaciaSubrrogadaComponent } from './index-farmacia-subrrogada.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'farmacia-subrrogada',
    component: IndexFarmaciaSubrrogadaComponent,
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexFarmaciaSubrrogadaRoutingModule { }
