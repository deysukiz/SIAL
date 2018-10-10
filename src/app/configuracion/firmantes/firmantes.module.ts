import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

import { AuthService } from '../../auth.service';

import { MenuModule  } from './../menu/menu.module';

import { FirmantesRoutingModule } from './firmantes-routing.module';
import { FormularioComponent } from './formulario/formulario.component';
import { FirmanteService } from './firmante.service';

@NgModule({
  imports: [
    CommonModule,
    FirmantesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    MenuModule
  ],
  declarations: [FormularioComponent],
  providers: [ AuthService, FirmanteService ]
})
export class MisFirmantesModule { }
