import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { FormularioOpcionesComponent } from './formulario-opciones/opciones.component';
import { TablaOpcionesComponent } from './tabla-opciones/opciones.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [FormularioOpcionesComponent, TablaOpcionesComponent],
  exports: [FormularioOpcionesComponent, TablaOpcionesComponent]
})
export class ParcialModule { }
