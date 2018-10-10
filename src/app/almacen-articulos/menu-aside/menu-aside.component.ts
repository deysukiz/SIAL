import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'panel-control-menu-aside',
  templateUrl: './menu-aside.component.html',
  styleUrls: ['./menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any}
   */
  usuario: any = {};
  /**
   * Contiene los módulos en general agregados en este archivo.
   * @type {array}
   */
  menu: any[] = [];
  /**
   * Contiene los módulos que se mostrarán al usuario de acuerdo a
   * los permisos que tenga su rol.
   * @type {array}
   */
  menuAutorizado: any[] = [];
  constructor() { }

  ngOnInit() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|');

    this.menu = [
      {
        titulo: 'Accesos directos',
        modulos: [
          {
            permiso: 'fMKARTchWDT56hgX0sNJnmTD9wcwTwK0', icono: 'assets/catalogo-servidor.svg',
            titulo: 'Categorias', url: '/almacen-articulos/categoria'
          },
          {
            permiso: '1giAayqzxUGwhGYQgGD6PTYkPin1edAs', icono: 'assets/catalogo-servidor.svg',
            titulo: 'Articulos', url: '/almacen-articulos/articulos'
          },
          /*{
            permiso: 'VmObT0aDFLEXDMer0yvfKo76gBsGNdcR', icono: 'assets/catalogo-servidor.svg',
            titulo: 'Inventario', url: '/almacen-articulos/inventarios'
          },
          {
            permiso: '8u2HduKCBo53Vwa2DiMh1ujytqdL9c7M', icono: 'assets/catalogo-servidor.svg',
            titulo: 'Entradas', url: '/almacen-articulos/entradas'
          },
          {
            permiso: '5Pnh7DTayhrND0GyB7bzfbdFK2kA6bgM', icono: 'assets/catalogo-servidor.svg',
            titulo: 'Salidas', url: '/almacen-articulos/salidas'
          },*/
          // { permiso: 'aUYWDYq2gV9RqGaIe6XdRfd2QjZOeRSP', icono: 'assets/catalogo-servidor.svg', 
          // titulo:"Resguardos", url:"/almacen-articulos/resguardos" },
        ]
      }
    ];

    if (permisos.length > 0) {
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
  /**
   * Método
   * @param titulo Título del módulo, variable que se compara y si existe se agrega a la lista que se mostrará.
   */
  initMenuAutorizadoPorItem(titulo: string) {
     for (let i in this.menuAutorizado) {
       if (titulo == this.menuAutorizado[i].titulo) {
        return this.menuAutorizado[i];
       }
     }

     this.menuAutorizado.push({ titulo: titulo, modulos: []});
     return this.menuAutorizado[this.menuAutorizado.length - 1];
  }

}
