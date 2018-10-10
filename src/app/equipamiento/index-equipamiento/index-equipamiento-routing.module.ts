import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexEquipamientoComponent } from './index-equipamiento.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'equipamiento',
    component: IndexEquipamientoComponent,
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexEquipamientoRoutingModule { }
