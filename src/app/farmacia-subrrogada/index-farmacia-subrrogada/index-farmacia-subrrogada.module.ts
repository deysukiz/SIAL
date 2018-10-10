import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexFarmaciaSubrrogadaRoutingModule } from './index-farmacia-subrrogada-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexFarmaciaSubrrogadaComponent } from './index-farmacia-subrrogada.component';
import { MenuFarmaciaSubComponent } from './menu-farmacia-sub.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexFarmaciaSubrrogadaRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuFarmaciaSubComponent
  ],
  declarations: [IndexFarmaciaSubrrogadaComponent, MenuFarmaciaSubComponent]
})
export class IndexFarmaciaSubrrogadaModule { }
