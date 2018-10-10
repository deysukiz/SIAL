import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexInventarioRoutingModule } from './index-inventario-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexInventarioComponent } from './index-inventario.component';
import { MenuInventarioComponent } from './menu-inventario.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexInventarioRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuInventarioComponent
  ],
  declarations: [IndexInventarioComponent, MenuInventarioComponent]
})
export class IndexInventarioModule { }
