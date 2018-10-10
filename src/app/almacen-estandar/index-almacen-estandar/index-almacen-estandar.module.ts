import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexAlmacenEstandarRoutingModule } from './index-almacen-estandar-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexAlmacenEstandarComponent } from './index-almacen-estandar.component';
import { MenuAlmacenEstandarComponent } from './menu-almacen-estandar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexAlmacenEstandarRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuAlmacenEstandarComponent
  ],
  declarations: [
    IndexAlmacenEstandarComponent,
    MenuAlmacenEstandarComponent
  ]
})
export class IndexAlmacenEstandarModule { }
