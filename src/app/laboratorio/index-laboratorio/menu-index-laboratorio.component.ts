import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-menu-laboratorio',
  templateUrl: './menu-index-laboratorio.component.html',
  styleUrls: ['./menu-index-laboratorio.component.css']
})
export class MenuLaboratorioComponent implements OnInit {

  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario: any = {}

  /**
   * Variable que contiene el nombre del módulo.
   * @type string
   */
  @Input() modulo:string;
  /**
   * Variable que contiene el ícono del módulo.
   * @type string
   */
  @Input() icono:string;
  /**
   * Variable que contiene el URL del módulo.
   * @type string
   */
  @Input() url:string;

  /**
   * Variable que contiene la dirección a la que accede para ayuda.
   * @type string
   */
  @Input() urlAyuda= '';
  @Output() ayudaModal = new EventEmitter<String>();
  constructor() { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));


  }

  ayuda(evt) {
    this.ayudaModal.emit(evt);
    console.log(evt);
  }

}
