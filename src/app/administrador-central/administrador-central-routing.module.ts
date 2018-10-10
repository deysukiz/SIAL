import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastoComponent } from './abasto/abasto.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { TransferenciasRecursosComponent } from './transferencias-recursos/transferencias-recursos.component';
import { EntregasMesComponent } from './entregas-mes/entregas-mes.component';
import { CumplimientoComponent } from './cumplimiento/cumplimiento.component';
import { ReporteFinancieroComponent } from './reporte-financiero/reporte-financiero.component';
import { PenasConvencionalesComponent } from './penas-convencionales/penas-convencionales.component';

import { AuthGuard } from '../auth-guard.service';
import { PermisosGuard } from '../permisos.guard';

const routes: Routes = [
  { path: 'administrador-central', redirectTo: '/administrador-central/pedidos', pathMatch: 'full' },
  {
    path: 'administrador-central', 
    children: [
       { path: 'pedidos', component: PedidosComponent, canActivate: [PermisosGuard], data: { key: 'bsIbPL3qv6XevcAyrRm1GxJufDbzLOax'} },
       { path: 'abasto', component: AbastoComponent, canActivate: [PermisosGuard], data: { key: 'bwWWUufmEBRFpw9HbUJQUP8EFnagynQv'} },
       { path: 'transferencias-recursos', component: TransferenciasRecursosComponent, canActivate: [PermisosGuard], data: { key: 's8kSv2Gj9DZwRvClVRmZohp92Rtvi26i'}},
       { path: 'entregas-mes', component: EntregasMesComponent, canActivate: [PermisosGuard], data: { key: 'fWA5oDswZ2Ra4O8YaCy6nEY8OeCOxg9C'}},
       { path: 'cumplimiento', component: CumplimientoComponent, canActivate: [PermisosGuard], data: { key: 'BBg7HSOEmjjOsVl48s8wSz8AxXhmBXA1'}},
       { path: 'reporte-financiero', component: ReporteFinancieroComponent, canActivate: [PermisosGuard], data: { key: 'BBg7HSOEmjjOsVl48s8wSz8AxXhmBXA1'}},
       { path: 'penas-convencionales', component: PenasConvencionalesComponent, canActivate: [PermisosGuard], data: { key: 'bsIbPL3qv6XevcAyrRm1GxJufDbzLOax'}},
    ],
    canActivate: [AuthGuard]
  }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorCentralRoutingModule { }
