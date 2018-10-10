import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthGuard } from '../../auth-guard.service';
import { PermisosGuard } from '../../permisos.guard';

const routes: Routes = [
   {
    path: 'administrador-central/claves-basicas',
    children: [
       { path: '', component: ListaComponent, canActivate: [PermisosGuard], data: { key: 'r1RX6Yq7fc4CRRI2OJXIPxeBLW3lFP59'} },
       { path: 'nueva', component: FormularioComponent, canActivate: [PermisosGuard], data: { key: 'N9tkWbLzXzdoAyBzcgLc85JPXqvRNvUh'} },
       { path: 'editar/:id', component: FormularioComponent, canActivate: [PermisosGuard], data: { key: 'ityO3IAU1jhIlXnr9WPhINvdr09pQJry'}},
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClavesBasicasRoutingModule { }
