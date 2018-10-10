import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'administrador-central-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  mostrarMenuLateral: boolean = false;
  usuario: any = {};
  constructor() { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
  }
  toggleMenuLateral() {
    this.mostrarMenuLateral = !this.mostrarMenuLateral;
  }

}
