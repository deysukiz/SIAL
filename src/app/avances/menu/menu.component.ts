import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'avance-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  usuario: any = {};
  constructor() { }

  ngOnInit() {
  	this.usuario = JSON.parse(localStorage.getItem("usuario"));
  }

}
