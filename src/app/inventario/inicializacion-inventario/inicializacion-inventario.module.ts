import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HubModule } from '../../hub/hub.module';
import { PerfilModule } from '../../perfil/perfil.module';
import { BloquearPantallaModule } from '../../bloquear-pantalla/bloquear-pantalla.module';
import { PaginacionModule } from '../../paginacion/paginacion.module';

//import { BuscarInsumosModule } from '../buscar-insumos/buscar-insumos.module';
import { IndexInventarioModule } from '../index-inventario/index-inventario.module';

import { InicializacionInventarioRoutingModule } from './inicializacion-inventario-routing.module';

import { InicializacionInventarioService } from './inicializacion-inventario.service';
import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
import { VerComponent } from './ver/ver.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HubModule,
    PerfilModule,
    BloquearPantallaModule,
    PaginacionModule,
    //BuscarInsumosModule,
    InicializacionInventarioRoutingModule,
    IndexInventarioModule
  ],
  declarations: [ListaComponent, FormularioComponent, VerComponent],
  providers:[InicializacionInventarioService]
})
export class InicializacionInventarioModule { }
