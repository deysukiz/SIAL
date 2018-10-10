import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth.service';
import { RolesService  } from './roles.service';
import { PermisosService  } from '../permisos/permisos.service';
import { ListaComponent } from './lista/lista.component';

import { MenuModule } from '../menu/menu.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { RolesRoutingModule } from './roles-routing.module';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MenuModule,
    PaginacionModule,
    RolesRoutingModule
  ],
  declarations: [ListaComponent, NuevoComponent, EditarComponent],
  providers: [RolesService, PermisosService]
})
export class RolesModule { }
