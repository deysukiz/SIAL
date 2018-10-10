import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AyudaSialRoutingModule } from './ayuda-sial-routing.module';
import { AyudaComponent         } from './ayuda/ayuda.component';

@NgModule({
  imports: [
    CommonModule,
    AyudaSialRoutingModule
  ],
  declarations: [
    AyudaComponent
  ]
})
export class AyudaSialModule { }
