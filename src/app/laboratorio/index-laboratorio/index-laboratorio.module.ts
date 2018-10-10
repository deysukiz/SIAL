import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexLaboratorioRoutingModule } from './index-laboratorio-routing.module';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PipesModule } from '../../pipes/pipes.module';


import { IndexLaboratorioComponent } from './index-laboratorio.component';
import { MenuLaboratorioComponent } from './menu-index-laboratorio.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IndexLaboratorioRoutingModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PipesModule,
  ],
  exports: [
    MenuLaboratorioComponent
  ],
  declarations: [IndexLaboratorioComponent, MenuLaboratorioComponent]
})
export class IndexLaboratorioModule { }
