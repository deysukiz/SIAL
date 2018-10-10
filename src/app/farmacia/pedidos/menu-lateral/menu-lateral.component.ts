import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PedidosService } from '../pedidos.service';

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

@Component({
  selector: 'menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  usuario:any;
  presupuestos: any[];
  presupuestoSeleccionado: number;
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

  @Output() onCambiarPresupuesto = new EventEmitter<void>();

  cambiarEntornoSuscription: Subscription;

  constructor(private pedidosService:PedidosService, private cambiarEntornoService:CambiarEntornoService) { }

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
      this.cargarPresupuestos();
      this.usuario = JSON.parse(localStorage.getItem("usuario"));
    });
    let presupuesto_seleccionado = localStorage.getItem('presupuestoSeleccionado');
    if(presupuesto_seleccionado){
      this.presupuestoSeleccionado = +presupuesto_seleccionado;
    }
    this.cargarStatsPedidos();
    this.cargarPresupuestos();
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
  }

  cargarPresupuestos(){
    this.pedidosService.presupuestos().subscribe(
      response => {
        this.presupuestos = response.data;
        let presupuesto_seleccionado = localStorage.getItem('presupuestoSeleccionado');
        if(!presupuesto_seleccionado){
          for (let i in this.presupuestos) {
            if(this.presupuestos[i].activo){
              localStorage.setItem('presupuestoSeleccionado',this.presupuestos[i].id);
              this.presupuestoSeleccionado = this.presupuestos[i].id;
              break;
            }
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  cambioPresupuesto(){
    localStorage.setItem('presupuestoSeleccionado',this.presupuestoSeleccionado.toString());
    this.cargarStatsPedidos();
    this.onCambiarPresupuesto.emit();
  }

  cargarStatsPedidos(){
    this.cargando = true;
    let presupuesto = +localStorage.getItem('presupuestoSeleccionado');
    this.pedidosService.stats(presupuesto).subscribe(
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
