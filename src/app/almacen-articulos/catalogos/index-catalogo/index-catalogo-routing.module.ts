import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexCatalogoComponent } from './index-catalogo.component';

import { AuthGuard } from '../../../auth-guard.service';

const routes: Routes = [
  {
    path: 'almacen-articulos/catalogos/index',
    component: IndexCatalogoComponent,
    canActivate: [AuthGuard]
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class IndexCatalogoRoutingModule { }
