import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexDamRoutingModule } from './index-dam-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexDamComponent } from './index-dam.component';
import { MenuDamComponent } from './menu-dam.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexDamRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuDamComponent
  ],
  declarations: [
    IndexDamComponent,
    MenuDamComponent
  ]
})
export class IndexDamModule { }
