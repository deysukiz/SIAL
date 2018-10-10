import { Component, OnInit } from '@angular/core';
import { PedidosEstandarService } from '../pedidos.service';

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

@Component({
  selector: 'menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  cargando: boolean = false;
  stats: any = {
    todos: 0, 
    borradores: 0,
    solicitados: 0,
    en_transito: 0,
    por_surtir: 0,
    finalizados: 0,
    expirados: 0,
    expirados_cancelados: 0,
    farmacia: 0,
    alternos: 0,
  };

  cambiarEntornoSuscription: Subscription;

  constructor(private pedidosService:PedidosEstandarService, private cambiarEntornoService:CambiarEntornoService) { }

  ngOnInit() {
    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.stats = {
        todos: 0, 
        borradores: 0,
        solicitados: 0,
        en_transito: 0,
        por_surtir: 0,
        finalizados: 0,
        expirados: 0,
        expirados_cancelados: 0,
        farmacia: 0,
        alternos: 0,
        actas:0
      };
      this.cargarStatsPedidos();
    });
    this.cargarStatsPedidos();
  }

  cargarStatsPedidos(){
    this.cargando = true;
    this.pedidosService.stats().subscribe(
      response => {
        this.cargando = false;
        this.stats = response;
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
