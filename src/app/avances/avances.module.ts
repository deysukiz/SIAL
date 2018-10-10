import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../auth.service';
import { AvanceService  } from './avance.service';
import { PaginacionModule } from '../paginacion/paginacion.module';
import { MenuModule } from './menu/menu.module';

import { AvancesRoutingModule } from './avances-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DetalleComponent } from './detalle/detalle.component';

@NgModule({
  imports: [
    CommonModule,
    AvancesRoutingModule,
    PaginacionModule,
    MenuModule,
    ReactiveFormsModule
  ],
  declarations: [ListaComponent, DetalleComponent],
  providers: [AuthService, AvanceService]
})
export class AvancesModule { }
