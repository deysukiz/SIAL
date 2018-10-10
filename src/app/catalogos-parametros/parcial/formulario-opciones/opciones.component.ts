import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'formulario-opciones',
  templateUrl: './opciones.component.html'
})

export class FormularioOpcionesComponent {
  @Input() ctrl: any;
  /**
   * Contiene el nombre de la carpeta/hub donde se encuentra.
   * @type {string}
   */
  carpeta;
  /**
   * Contiene el nombre del módulo donde se encuentra.
   * @type {string}
   */
  modulo;
  /**
   * Contiene la ruta para crear un registro nuevo.
   * @type {string}
   */
  url_nuevo;
  /**
   * Contiene la ruta para ir al listado.
   * @type {string}
   */
  url_lista;

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    let url = location.href.split('/');
    this.carpeta = url[4];
    this.modulo = url[5];
    this.url_lista = '/' + this.carpeta + '/' + this.modulo;
    this.url_nuevo = '/' + this.carpeta + '/' + this.modulo + '/nuevo';
  }
}
