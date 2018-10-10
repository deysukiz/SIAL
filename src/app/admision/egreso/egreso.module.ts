import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PaginacionModule } from '../../paginacion/paginacion.module';

import { AuthService } from '../../auth.service';
import { MenuModule } from '../menu/menu.module';
import { MenuLateralModule } from '../menu-lateral/menu-lateral.module';

import { EgresoRoutingModule } from './egreso-routing.module';
import { ListaComponent } from './lista/lista.component';

import { PacienteEgresoService  } from './paciente-egreso.service';
import { EgresoService  } from './egreso.service';

import { EgresoComponent } from './egreso/egreso.component';
import { IngresoComponent } from './ingreso/ingreso.component';
import { VerificacionComponent } from './verificacion/verificacion.component';

@NgModule(
{
  imports: [
    CommonModule,
    EgresoRoutingModule,
    MenuModule,
    MenuLateralModule,
    PaginacionModule,
    ReactiveFormsModule
    ],
  declarations: [ListaComponent, EgresoComponent, IngresoComponent, VerificacionComponent],
  providers: [ AuthService, PacienteEgresoService, EgresoService ],
})
export class EgresoModule { }
