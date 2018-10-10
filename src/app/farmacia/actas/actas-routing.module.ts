import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { VerComponent } from './ver/ver.component';

import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  { path: 'farmacia/actas', redirectTo: '/farmacia/actas/pendientes', pathMatch: 'full' },
  {
    path: 'farmacia/actas',
    children: [
       
       { path: 'abiertas', component: ListaComponent},
       { path: 'en-espera', component: ListaComponent},
       { path: 'pendientes', component: ListaComponent},
       { path: 'en-camino', component: ListaComponent},
       { path: 'fianlizadas', component: ListaComponent},
       { path: 'fianlizadas/completas', component: ListaComponent},
       { path: 'fianlizadas/incompletas', component: ListaComponent},
       { path: 'nueva', component: FormularioComponent},
       { path: 'editar/:id', component: FormularioComponent},
       { path: 'ver/:id', component: VerComponent},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ActasRoutingModule { }
