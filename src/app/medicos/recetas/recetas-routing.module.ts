import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListaComponent } from './lista/lista.component';
import { NuevaComponent } from './nueva/nueva.component';
import { VerComponent } from './ver/ver.component';
import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  { path: 'medicos', redirectTo: '/medicos/recetas', pathMatch: 'full' },
  {
    path: 'medicos/recetas',
    children: [
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'nyMZvmCF2DQYSrulP5sKgEPN4CnJiixQ'} },
       { path: 'nuevo', component: NuevaComponent, canActivate: [PermisosGuard], data: { key: 'nyMZvmCF2DQYSrulP5sKgEPN4CnJiixQ'} },
       { path: 'ver/:id', component: VerComponent, canActivate: [PermisosGuard], data: { key: 'nyMZvmCF2DQYSrulP5sKgEPN4CnJiixQ'}},
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecetasRoutingModule { }
