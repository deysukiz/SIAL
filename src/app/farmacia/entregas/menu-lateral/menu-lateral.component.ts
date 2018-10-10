import { Component, OnInit } from '@angular/core';
import { EntregasService } from '../entregas.service';

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';


@Component({
  selector: 'menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css'],
  providers: [EntregasService]
})
export class MenuLateralComponent implements OnInit {
  
  cargando: boolean = false;
  stats: any = { 
    por_surtir: 0,
    finalizados: 0
  };


  // # SECCION: Cambios de Entorno
  cambiarEntornoSuscription: Subscription;
  // # FIN SECCION

  constructor( private entregasService: EntregasService, private cambiarEntornoService:CambiarEntornoService) { }

  ngOnInit() {
    
    
    this.cargarStats();

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.cargarStats();
    });
  }
  cargarStats(){
    this.cargando = true;
    this.entregasService.stats().subscribe(
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

}
