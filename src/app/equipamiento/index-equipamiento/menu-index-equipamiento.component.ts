import { Component, OnInit, Input } from '@angular/core';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'menu-equipamiento',
  templateUrl: './menu-index-equipamiento.component.html',
  styleUrls: ['./menu-index-equipamiento.component.css']
})
export class MenuEquipamientoComponent implements OnInit {

  usuario: any = {}

  @Input() modulo:string;
  @Input() icono:string;
  @Input() url:string;

  constructor() { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));


  }

}
