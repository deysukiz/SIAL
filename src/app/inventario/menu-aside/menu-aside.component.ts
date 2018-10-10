import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'panel-control-menu-aside',
  templateUrl: './menu-aside.component.html',
  styleUrls: ['./menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {
  /**
   * Calcula el tamaño de la 
   * @type {number}
   */
  tamano = document.body.clientHeight;
  /**
   * Contiene los datos de sesión del ususario
   * @type {any}
   */
  usuario: any = {};
  menu: any[] = [];
  menuAutorizado: any[] = [];
  constructor() { }

  ngOnInit() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|');

    this.menu = [
      {
        titulo: 'Caducidades',
        modulos: [
          {
            permiso: 'xYbpHsWi4HGSXQDUmG7fcJT8ZzcZKqyb', icono: 'assets/icono-todo.svg',
            titulo: 'Todo', url: '/inventario/monitor-caducidades/TODO' },
          {
            permiso: 'xYbpHsWi4HGSXQDUmG7fcJT8ZzcZKqyb', icono: 'assets/icono-green.svg',
            titulo: 'Óptima', url: '/inventario/monitor-caducidades/OPTIMA'},
          {
            permiso: 'xYbpHsWi4HGSXQDUmG7fcJT8ZzcZKqyb', icono: 'assets/icono-yellow.svg',
            titulo: 'Media', url: '/inventario/monitor-caducidades/MEDIA'},
          {
            permiso: 'xYbpHsWi4HGSXQDUmG7fcJT8ZzcZKqyb', icono: 'assets/icono-red.svg',
            titulo: 'Próxima a caducar', url: '/inventario/monitor-caducidades/PROXIMA'},
          {
            permiso: 'xYbpHsWi4HGSXQDUmG7fcJT8ZzcZKqyb', icono: 'assets/icono-black.svg',
            titulo: 'Caducados', url: '/inventario/monitor-caducidades/CADUCADO'},
        ]
      },
    ];
    
    
    if (permisos.length > 0){    
      for (var i in this.menu){
       
        for (var j in this.menu[i].modulos){
          siguienteItemProtegido: 
          for (var k in permisos){
            if (permisos[k] == this.menu[i].modulos[j].permiso){
              var item = this.initMenuAutorizadoPorItem(this.menu[i].titulo)
              item.modulos.push(this.menu[i].modulos[j]);      

              break siguienteItemProtegido;
            }           
          }
        }

      }
    } 
  }

  initMenuAutorizadoPorItem(titulo: string){
     for (var i in this.menuAutorizado){
       if (titulo == this.menuAutorizado[i].titulo){
        return this.menuAutorizado[i];
       }
     }
     
     this.menuAutorizado.push({ titulo: titulo, modulos: []})
     return this.menuAutorizado[this.menuAutorizado.length - 1];
     
  }

}
