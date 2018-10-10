import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admision-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  
  cargando:boolean = false;	
  constructor() { }

  ngOnInit() {
  }

}
