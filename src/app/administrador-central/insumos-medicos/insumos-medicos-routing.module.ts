import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
  {
    path: 'administrador-central/insumos-medicos',
    children: [       
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'X36qZL6YWSwvEaR2EH1TeSOotssAkrxu'} },        
       { path: 'nuevo', component: FormularioComponent, canActivate: [PermisosGuard], data: { key: 'jBCDyEZfGTteX7PdyuLPCdpbrCabseXy'} },
       { path: 'editar/:id', component: FormularioComponent, canActivate: [PermisosGuard], data: { key: 'LUSTiOJVbVzVkfCKLi2VcJk29UC0GCRZ'}},    
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsumosMedicosRoutingModule { }
