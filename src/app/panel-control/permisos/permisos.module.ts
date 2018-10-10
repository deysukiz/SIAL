import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth.service';
import { PermisosService  } from '../permisos/permisos.service';

import { MenuModule } from '../menu/menu.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';


import { PermisosRoutingModule } from './permisos-routing.module';
import { PermisosComponent } from './permisos.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MenuModule,
    PaginacionModule,
    PermisosRoutingModule
  ],
  declarations: [PermisosComponent, NuevoComponent, EditarComponent],
  providers: [ PermisosService]
})
export class PermisosModule { }
