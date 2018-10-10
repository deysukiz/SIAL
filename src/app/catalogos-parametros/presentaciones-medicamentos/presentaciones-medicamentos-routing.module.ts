import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { PermisosGuard } from '../../permisos.guard';
import { AuthGuard } from '../../auth-guard.service';

const routes: Routes = [
  {
    path: 'catalogos-parametros/presentaciones-medicamentos',
    children: [
      {
        path: '',
        component: ListaComponent,
        canActivate: [PermisosGuard],
        data: { key: 'PtTJ9g7WGYcyuPjTxe5iaJILVzQedccG'}
      },
      {
        path: 'nuevo',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'PtTJ9g7WGYcyuPjTxe5iaJILVzQedccG'}
      },
      {
        path: 'editar/:id',
        component: FormularioComponent,
        canActivate: [PermisosGuard],
        data: { key: 'PtTJ9g7WGYcyuPjTxe5iaJILVzQedccG'}
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
export class PresentacionMedicamentoRoutingModule { }

