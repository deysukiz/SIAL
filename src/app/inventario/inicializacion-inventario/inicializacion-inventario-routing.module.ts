import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent} from './formulario/formulario.component';
import { VerComponent} from './ver/ver.component';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'inventario/inicializacion-inventario',
    children: [
      { path: '', component: ListaComponent},
      { path: 'inicializar', component: FormularioComponent},
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
export class InicializacionInventarioRoutingModule { }