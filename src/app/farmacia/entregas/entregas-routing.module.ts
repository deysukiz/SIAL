import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../auth-guard.service';

import { ListaComponent } from './lista/lista.component';
import { HistorialComponent } from './historial/historial.component';
import { SurtirComponent } from './surtir/surtir.component';
import { VerComponent } from './ver/ver.component';

const routes: Routes = [
  { path: 'almacen/entregas', redirectTo: '/almacen/entregas/por-surtir', pathMatch: 'full' },
  {
    path: 'almacen/entregas',
    children: [
       { path: 'por-surtir', component: ListaComponent},
       { path: 'finalizadas', component: ListaComponent},
       { path: 'finalizadas/completas', component: ListaComponent},
       { path: 'finalizadas/incompletas', component: ListaComponent},
       { path: 'finalizadas/canceladas', component: ListaComponent},       
       { path: 'historial', component: HistorialComponent},
       { path: 'surtir/:id', component: SurtirComponent},
       { path: 'ver/:id', component: VerComponent},
    ],
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntregasRoutingModule { }
