import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { PerfilComponent } from './perfil.component';
import { CambiarEntornoService } from './cambiar-entorno.service';
import { CambiarFechaHoraService } from './cambiar-fecha-hora.service';
import { EditarPerfilService } from './editar-perfil.service';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
      PerfilComponent
  ],
  providers: [CambiarEntornoService, CambiarFechaHoraService, EditarPerfilService],
  declarations: [PerfilComponent]

})
export class PerfilModule { }
