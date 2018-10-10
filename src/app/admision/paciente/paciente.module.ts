import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PaginacionModule } from '../../paginacion/paginacion.module';

import { AuthService } from '../../auth.service';
import { MenuModule } from '../menu/menu.module';
import { MenuLateralModule } from '../menu-lateral/menu-lateral.module';

import { PacienteRoutingModule } from './paciente-routing.module';
import { ListaComponent } from './lista/lista.component';

import { PacienteService  } from './paciente.service';
import { NuevoComponent } from './nuevo/nuevo.component';
import { EditarComponent } from './editar/editar.component';
import { HistorialComponent } from './historial/historial.component';

@NgModule({
  imports: [
    CommonModule,
    PacienteRoutingModule,
    ReactiveFormsModule,
    PaginacionModule,
    MenuModule,
    MenuLateralModule
  ],
  declarations: [ListaComponent, NuevoComponent, EditarComponent, HistorialComponent],
  providers: [ AuthService, PacienteService ],
})
export class PacienteModule { }
