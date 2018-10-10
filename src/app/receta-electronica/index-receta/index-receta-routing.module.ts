import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexRecetaComponent } from './index-receta.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
	{
		path: 'receta-electronica', component: IndexRecetaComponent, canActivate: [AuthGuard],
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexRecetaRoutingModule { }
