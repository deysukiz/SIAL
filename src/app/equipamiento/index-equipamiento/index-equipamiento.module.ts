import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexEquipamientoRoutingModule } from './index-equipamiento-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexEquipamientoComponent } from './index-equipamiento.component';
import { MenuEquipamientoComponent } from './menu-index-equipamiento.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexEquipamientoRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuEquipamientoComponent
  ],
  declarations: [IndexEquipamientoComponent, MenuEquipamientoComponent]
})
export class IndexEquipamientoModule { }
