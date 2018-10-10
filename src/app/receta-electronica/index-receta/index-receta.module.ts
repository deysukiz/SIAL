import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexRecetaRoutingModule } from './index-receta-routing.module';
import { IndexRecetaComponent } from './index-receta.component';
import { MenuRecetaComponent } from './menu-receta.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexRecetaRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuRecetaComponent
  ],
  declarations: [IndexRecetaComponent, MenuRecetaComponent]
})
export class IndexRecetaModule { }
