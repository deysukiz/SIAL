import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterStateSnapshot } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { ConfiguracionGeneralRoutingModule } from './configuracion-general-routing.module';
import { PaginacionModule } from '../parcial/paginacion/paginacion.module';

import { PipesModule }             from '../../pipes/pipes.module';
import { FormularioComponent } from './formulario/formulario.component';

import { AuthService } from '../../auth.service';

import { MenuPanelModule } from '.././../catalogos-parametros/menu/menu-panel.module';
import { MenuAsidePanelModule } from '.././../catalogos-parametros/menu-aside/menu-aside-panel.module';
import { IndexCatalogoParamsModule } from '.././../catalogos-parametros/index-catalogo-params/index-catalogo-params.module';

//crud
import { CrudService } from '../../crud/crud.service';
import { CrudModule } from '../../crud/crud.module';
import { ParcialModule } from '../parcial/parcial.module';
//fin crud
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';
import { Select2Module } from 'ng2-select2';
import { CKEditorModule } from 'ng2-ckeditor';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    PipesModule,
    MenuPanelModule,
    MenuAsidePanelModule,
    IndexCatalogoParamsModule,
    CrudModule,
    ParcialModule,
    ConfiguracionGeneralRoutingModule,
    NguiAutoCompleteModule,
    NguiAutoCompleteModule,
    NguiDatetimePickerModule,
    Select2Module,
    CKEditorModule
  ],
  declarations: [
    FormularioComponent
  ],
  providers: [ AuthService, CrudService ]
})
export class ConfiguracionGeneralModule { }
