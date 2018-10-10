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

  ngOnInit() {
    let url = location.href.split('/');
    this.carpeta = url[4];
    this.modulo = url[5];
    this.url_nuevo = '/' + this.carpeta + '/' + this.modulo + '/nuevo';
  }
}
