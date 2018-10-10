import { NgModule } from '@angular/core';
import { CommonModule  }  from '@angular/common';
import { GraficasModule}  from './graficas/graficas.module';

import { DashboardSalidasRoutingModule } from './dashboard-salidas-routing.module';
import { DashboardSalidasComponent     } from './dashboard-salidas.component';

import { AuthService } from '../../auth.service';
import { IndexFarmaciaModule } from '../index-farmacia/index-farmacia.module';

@NgModule({
  imports: [
    CommonModule,
    DashboardSalidasRoutingModule,
    GraficasModule,
    IndexFarmaciaModule
  ],
  declarations: [
    DashboardSalidasComponent
  ],
  providers: [ AuthService ]
})
export class DashboardSalidasModule { }
