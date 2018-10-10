import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';
/**
 * Componente que muestra los módulos disponibles para esta sección.
 */
@Component({
  selector: 'app-index-almacen-articulos',
  templateUrl: './index-almacen-articulos.component.html',
  styleUrls: ['./index-almacen-articulos.component.css']
})
export class IndexAlmacenArticulosComponent implements OnInit {
  /**
   * Contiene los datos de sesión del usuario.
   * @type {any}
   */
  usuario: any = {};
  /**
   * Contiene el término de búsqueda que ingresa el usuario.
   * @type {string}
   */
  busqueda: string = '';

  /**
   * Contiene la lista de los módulos en general que se agregan en este archivo.
   * @type {array}
   */
  modulos: any[] = [];
  /**
   * Contiene los módulos que van a mostrarse en la vista de acuerdo a los permisos.
   * @type {array}
   */
  modulosAutorizados: any[] = [];
  /**
   * Contiene la lista de los módulos que se agregan a la lista de accesos directos.
   * @type {array}
   */
  accesosDirectos: any[] = [];
  /**
   * Contiene la lista de los módulos con acceso directo que se mostrarán en la vista
   * de acuerdo al rol del usuario.
   * @type {array}
   */
  accesosDirectosAutorizados: any[] = [];

  constructor(private title: Title) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle('Almacén / Artículos');
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.modulos = [
      {
        permiso: 'VmObT0aDFLEXDMer0yvfKo76gBsGNdcR', icono: 'assets/icono-inventario-general.svg',
        titulo: 'Inventario', url: '/almacen-articulos/inventarios'
      },
      {
        permiso: '8u2HduKCBo53Vwa2DiMh1ujytqdL9c7M', icono: 'assets/icono-entradas-general.svg',
        titulo: 'Entradas', url: '/almacen-articulos/entradas'
      },
      {
        permiso: '5Pnh7DTayhrND0GyB7bzfbdFK2kA6bgM', icono: 'assets/icono-salidas-general.svg',
        titulo: 'Salidas', url: '/almacen-articulos/salidas'
      },
      {
        permiso: 'aUYWDYq2gV9RqGaIe6XdRfd2QjZOeRSP', icono: 'assets/catalogo-servidor.svg',
        titulo: 'Resguardos', url: '/almacen-articulos/resguardos'
      },
    ];
    this.accesosDirectos = [
      {
        permiso: 'fMKARTchWDT56hgX0sNJnmTD9wcwTwK0', icono: 'assets/icono-catalogos.svg',
        titulo: 'Categorias', url: '/almacen-articulos/categoria'},
      {
        permiso: '1giAayqzxUGwhGYQgGD6PTYkPin1edAs', icono: 'assets/icono-catalogos.svg',
        titulo: 'Articulos', url: '/almacen-articulos/articulos'}
    ];

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|');

    if (permisos.length > 0) {
        
      for (var i in this.modulos){
        siguienteItemProtegido:
        for (var j in permisos){
          
          if (permisos[j] == this.modulos[i].permiso){
            
            this.modulosAutorizados.push(this.modulos[i]);
            break siguienteItemProtegido;
          }
        }
      }

      for (var i in this.accesosDirectos){
        siguienteItemProtegido:             
        for (var j in permisos){
          if (permisos[j] == this.accesosDirectos[i].permiso){
            this.accesosDirectosAutorizados.push(this.accesosDirectos[i]);              
            break siguienteItemProtegido;
          }           
        }        
      }
      
    }

  }

}
