import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';
/**
 * Componente que muestra los módulos disponibles para esta sección.
 */
@Component({
  selector: 'app-index-almacen-estandar',
  templateUrl: './index-almacen-estandar.component.html',
  styleUrls: ['./index-almacen-estandar.component.css']
})
/**
 * Clase que muestra los módulos autorizados y disponibles del almacén.
 */
export class IndexAlmacenEstandarComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   */
  usuario: any = {};
  /**
   * Contiene el término de búsqueda que ingresa el usuario.
   * @type {string}
   */
  busqueda = '';

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
  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(private title: Title) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle('Almacén estandar');
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.modulos = [
      {
        permiso: 'J1mYtHwF7WVbie5dCZhFptvYzNEtqHXQ',
        icono: 'assets/icono-entradas.svg', titulo: 'Entrada de insumos',
        url: '/almacen-estandar/entradas'
      },
      {
        permiso: 'fO4NLBvm5IAv5zouJ24rS0qVI2cHpm44',
        icono: 'assets/icono-salidas.svg', titulo: 'Salida de insumos',
        url: '/almacen-estandar/salidas'
      },
      {
        permiso: 'fO4NLBvm5IAv5zouJ24rS0qVI2cHpm44--',
        icono: 'assets/icono-pagina-lista.svg', titulo: 'Pedido de insumos',
        url: '/almacen-estandar/pedidos'
      },
    ];

    this.accesosDirectos = [
    ];

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    let permisos =  usuario.permisos.split('|');

    if (permisos.length > 0) {

      for (var i in this.modulos) {
        siguienteItemProtegido:
        for(var j in permisos){

          if(permisos[j] == this.modulos[i].permiso){
            
            this.modulosAutorizados.push(this.modulos[i]);
            break siguienteItemProtegido;
          }           
        }
      }

      for(var i in this.accesosDirectos){
        siguienteItemProtegido:
        for(var j in permisos){
          if(permisos[j] == this.accesosDirectos[i].permiso){
            this.accesosDirectosAutorizados.push(this.accesosDirectos[i]);
            break siguienteItemProtegido;
          }           
        }        
      }
      
    }

  }

}
