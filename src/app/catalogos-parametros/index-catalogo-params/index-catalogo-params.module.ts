import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexCatalogoParamsRoutingModule } from './index-catalogo-params-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexCatalogoParamsComponent } from './index-catalogo-params.component';
import { MenuCatalogoParamsComponent } from './menu-catalogo-params.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexCatalogoParamsRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuCatalogoParamsComponent
  ],
  declarations: [IndexCatalogoParamsComponent, MenuCatalogoParamsComponent]
})
export class IndexCatalogoParamsModule { }
