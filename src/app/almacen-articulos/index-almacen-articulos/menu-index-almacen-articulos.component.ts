import { Component, OnInit, Input } from '@angular/core';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';
/**
 * Componente que contiene el menú del almacén de artículos.
 */
@Component({
  selector: 'menu-almacen-articulos',
  templateUrl: './menu-index-almacen-articulos.component.html',
  styleUrls: ['./menu-index-almacen-articulos.component.css']
})
export class MenuFarmaciaSubComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type any
   */
  usuario: any = {};
  /**
   * Variable que contiene el nombre del módulo.
   * @type string
   */
  @Input() modulo: string;
  /**
   * Variable que contiene la cadena que representa al ícono del módulo.
   * @type string
   */
  @Input() icono: string;
  /**
   * Variable que contiene la URL del módulo.
   * @type string
   */
  @Input() url: string;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor() { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

  }

}
