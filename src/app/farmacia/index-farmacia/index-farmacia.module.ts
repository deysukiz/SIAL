import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexFarmaciaRoutingModule } from './index-farmacia-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexFarmaciaComponent } from './index-farmacia.component';
import { MenuFarmaciaComponent } from './menu-farmacia.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexFarmaciaRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuFarmaciaComponent
  ],
  declarations: [IndexFarmaciaComponent, MenuFarmaciaComponent]
})
export class IndexFarmaciaModule { }
