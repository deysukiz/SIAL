import { Component, OnInit } from '@angular/core';

import { TransferenciaAlmacenService } from '../transferencia-almacen.service';

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

@Component({
  selector: 'menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  cargando: boolean = false;

  soloLectura: boolean = false;

  stats: any = {
    todos:0,
    borradores:0,
    por_surtir:0,
    en_transito:0,
    por_finalizar:0,
    finalizados:0,
    cancelados:0
  };

  presupuesto: any = {
    causes_y_material: 0,
    no_causes:0
  };

  cambiarEntornoSuscription: Subscription;

  constructor(private transferenciaAlmacenService:TransferenciaAlmacenService, private cambiarEntornoService:CambiarEntornoService) { }

  ngOnInit() {
    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.stats = {
        todos:0,
        borradores:0,
        por_surtir:0,
        en_transito:0,
        por_finalizar:0,
        finalizados:0,
        cancelados:0
      };
      this.presupuesto = {
        causes_y_material: 0,
        no_causes: 0
      }
      this.cargarStatsTransferencias();

      var usuario =  JSON.parse(localStorage.getItem("usuario"));
      this.soloLectura = usuario.solo_lectura;
    });
    this.cargarStatsTransferencias();

    var usuario =  JSON.parse(localStorage.getItem("usuario"));
    this.soloLectura = usuario.solo_lectura;
  }

  cargarStatsTransferencias(){
    this.cargando = true;
    this.transferenciaAlmacenService.stats().subscribe(
      response => {
        console.log(response);
        this.stats = response.stats;
        this.presupuesto.causes_y_material = (response.presupuesto.causes_y_material)?+response.presupuesto.causes_y_material:0;
        this.presupuesto.no_causes = (response.presupuesto.no_causes)?+response.presupuesto.no_causes:0;

        this.cargando = false;
      },
      error => {
        this.cargando = false;
        console.log(error);
      }
    );
  }

  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }

}
