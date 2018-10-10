import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule,  RouterStateSnapshot } from '@angular/router';
import { IndexCatalogoRoutingModule } from './index-catalogo-routing.module';

import { HubModule } from '../../../hub/hub.module';
import { PerfilModule } from '../../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../../pipes/pipes.module';


import { IndexCatalogoComponent } from './index-catalogo.component';
import { MenuCatalogoComponent } from './menu-catalogo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexCatalogoRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
    RouterModule
  ],
  exports: [
    MenuCatalogoComponent
  ],
  declarations: [IndexCatalogoComponent, MenuCatalogoComponent]
})
export class IndexCatalogoModule { }
