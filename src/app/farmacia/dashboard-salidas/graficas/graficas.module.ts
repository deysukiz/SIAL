import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexFarmaciaModule } from '../../index-farmacia/index-farmacia.module';
/**
 * Se debe agregar el ChartModule y HighchartsStatic para poder usar la gráfica
 * INICIO
 */
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import { GraficasComponent } from '../graficas/graficas.component';

import { AuthService     } from '../../../auth.service';
import { GraficasService } from '../graficas/graficas.service';

import { NguiDatetimePickerModule, NguiDatetime } from '@ngui/datetime-picker';


declare var require: any;
export function highchartsFactory() {
  return require('highcharts');
}/**FIN*/

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    IndexFarmaciaModule,
    NguiDatetimePickerModule
  ],
  providers: [
      AuthService,
      GraficasService,
    { // Propiedad de la gráfica
      provide: HighchartsStatic,
      useFactory: highchartsFactory,
    }
  ],
  declarations: [
    GraficasComponent
  ],
  exports: [
    GraficasComponent
  ]
})
export class GraficasModule { }
