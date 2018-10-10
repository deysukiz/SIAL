import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { VerComponent } from './ver/ver.component';
import { SurtirComponent } from './surtir/surtir.component';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  { path: 'almacen/transferencia-almacen', redirectTo: '/almacen/transferencia-almacen/por-surtir', pathMatch: 'full' },
  {
    path: 'almacen/transferencia-almacen',
    children: [
       { path: 'todos', component: ListaComponent},
       { path: 'borradores', component: ListaComponent},
       { path: 'por-surtir', component: ListaComponent},
       { path: 'en-transito', component: ListaComponent},
       { path: 'por-finalizar', component: ListaComponent},
       { path: 'finalizados', component: ListaComponent},
       { path: 'cancelados', component: ListaComponent},
       { path: 'ver/:id', component: VerComponent},
       { path: 'surtir/:id', component: SurtirComponent},
       // Akira:
       { path: 'nueva', component: TransferenciaComponent},
       { path: 'editar/:id', component: TransferenciaComponent},
       
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferenciaAlmacenRoutingModule { }
