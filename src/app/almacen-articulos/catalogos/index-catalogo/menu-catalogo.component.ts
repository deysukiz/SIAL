import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterModule,  RouterStateSnapshot } from '@angular/router';
import { BuscarModuloPipe } from '../../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'menu-catalogo',
  templateUrl: './menu-catalogo.component.html',
  styleUrls: ['./menu-catalogo.component.css']
})
export class MenuCatalogoComponent implements OnInit {

  usuario: any = {}

  @Input() modulo:string;
  @Input() icono:string;
  @Input() url:string;

  constructor() { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));


  }

}
