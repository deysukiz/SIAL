import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuModule } from '../menu/menu.module';

import { OpcionesAvanzadasRoutingModule } from './opciones-avanzadas-routing.module';
import { ActualizarSistemaComponent } from './actualizar-sistema/actualizar-sistema.component';
import { BaseDatosComponent } from './base-datos/base-datos.component';

import { OpcionesAvanzadasService } from './opciones-avanzadas.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MenuModule,
    OpcionesAvanzadasRoutingModule
  ],
  declarations: [ActualizarSistemaComponent, BaseDatosComponent],
  providers:[OpcionesAvanzadasService]
})
export class OpcionesAvanzadasModule { }
