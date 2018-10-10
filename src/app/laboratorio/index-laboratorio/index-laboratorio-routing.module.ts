import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexLaboratorioComponent } from './index-laboratorio.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'laboratorio',
    component: IndexLaboratorioComponent,
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexLaboratorioRoutingModule { }
