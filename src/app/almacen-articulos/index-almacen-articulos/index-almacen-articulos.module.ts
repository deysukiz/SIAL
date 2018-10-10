import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexAlmacenArticulosRoutingModule } from './index-almacen-articulos-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexAlmacenArticulosComponent } from './index-almacen-articulos.component';
import { MenuFarmaciaSubComponent } from './menu-index-almacen-articulos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexAlmacenArticulosRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuFarmaciaSubComponent
  ],
  declarations: [IndexAlmacenArticulosComponent, MenuFarmaciaSubComponent]
})
export class IndexAlmacenArticulosModule { }
