import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MenuComponent } from './menu.component';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';

import { MenuAsidePanelModule } from '../menu-aside/menu-aside-panel.module';
import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
@NgModule({
  imports: [
    CommonModule,
    HubModule,
    PerfilModule,
    MenuAsidePanelModule
  ],
  exports: [
    MenuComponent
  ],
  declarations: [ 
      MenuComponent
    ]
})
export class MenuPanelModule { }
