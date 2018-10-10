import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuAsideComponent } from './menu-aside.component';
import { Router, RouterModule,  RouterStateSnapshot } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    MenuAsideComponent
  ],
  declarations: [MenuAsideComponent]
})
export class MenuAsidePanelModule { }