import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardSalidasComponent } from './dashboard-salidas.component';
import { AuthGuard } from '../../auth-guard.service';


const routes: Routes = [
  {
    path: 'almacen/dashboard-salidas',
    children: [
       { path: '', component: DashboardSalidasComponent},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardSalidasRoutingModule { }
