import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../perfil/cambiar-entorno.service';

/**
 * Componente que contiene las opciones de los módulos existentes en este módulo.
 */
@Component({
  selector: 'app-menu-almacen-estandar',
  templateUrl: './menu-almacen-estandar.component.html',
  styleUrls: ['./menu-almacen-estandar.component.css']
})
/**
 * Clase que muestra el menú de de la barra superior de navegación con sus opciones correspondientes.
 */
export class MenuAlmacenEstandarComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario: any = {};
  /**
   * Variable que contiene el nombre del módulo.
   * @type string
   */
  @Input() modulo: string;
  /**
   * Variable que contiene el ícono del módulo.
   * @type string
   */
  @Input() icono: string;
  /**
   * Variable que contiene el URL del módulo.
   * @type string
   */
  @Input() url: string;
  /**
   * Variable que contiene la dirección a la que accede para ayuda.
   * @type string
   */
  @Input() urlAyuda= '';

  /**
   * Variable que contiene el nombre del modal a abrir.
   */
  @Output() ayudaModal = new EventEmitter<String>();
  /**
   * Variable para cambiar de entorno
   */
  cambiarEntornoSuscription: Subscription;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(private cambiarEntornoService: CambiarEntornoService) { }
  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.usuario = JSON.parse(localStorage.getItem("usuario"));
    });
  }

  /**
   * Método que termina la suscripción a la variable cambiarEntornoSuscription
   */
  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }

  /**
   * Método para activar el modal de ayuda en los módulos.
   * @param evt activa el botón y contiene el nombre del modal.
   */
  ayuda(evt) {
    this.ayudaModal.emit(evt);
  }
}
