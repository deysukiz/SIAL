import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MenuLateralComponent } from './menu-lateral.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [MenuLateralComponent],
  exports: [MenuLateralComponent]
})
export class MenuLateralModule { }
