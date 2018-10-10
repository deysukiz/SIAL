import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'pedidos/dam',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: '3WPZ93a8W0346y1hlpwLUVo3VRF5TVI4'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: '3WPZ93a8W0346y1hlpwLUVo3VRF5TVI4'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: '3WPZ93a8W0346y1hlpwLUVo3VRF5TVI4'}
      },
      {
        path: 'ver/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: '3WPZ93a8W0346y1hlpwLUVo3VRF5TVI4'}
      },
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PedidosDamCCRoutingModule { }

