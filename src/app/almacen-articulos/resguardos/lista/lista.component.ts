import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';

import { Subject } from 'rxjs/Subject';
import { Mensaje } from '../../../mensaje';

import { NotificationsService } from 'angular2-notifications';
/**
 * Componente que contiene la lista de resguardos del almacén de artículos.
 */
@Component({
  selector: 'resguardos-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent{

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private notificacion: NotificationsService
  ) {}

  tamano;
  json_devolucion;
  persona_recibe: String = '';

  mensajeResponse: Mensaje = new Mensaje(true);

  public options = {
    position: ["top", "right"],
    timeOut: 5000,
    lastOnBottom: true
  };

  ngOnInit() {
    this.tamano = document.body.clientHeight;
  }

  abrirModal(id) {
    document.getElementById(id).classList.add("is-active");
  }

  /**
   * Este método cierra una modal
   * @param id identificador del elemento de la modal
   * @return void
   */
  cancelarModal(id) {
    document.getElementById(id).classList.remove("is-active");
  }

  confirmar_devolucion(item)  {
    document.getElementById('borrar').classList.add("is-active");
    this.json_devolucion = {};
    this.json_devolucion  = item;

  }

  devolver()  {
    this.json_devolucion.persona_recibe = this.persona_recibe;
    // console.log((this.json_devolucion))
    this.crudService.crear(this.json_devolucion, 'resguardos-articulo/devolucion').subscribe(
      resultado => {
        this.persona_recibe = '';
        this.json_devolucion = {};

        this.mensajeResponse.texto = 'Se han guardado los cambios.';
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'success';
        this.mensaje(2);

        document.getElementById('lista').click();
     },
     error => {
         this.mensajeResponse.texto = 'Error al intentar devolver.';
         this.mensajeResponse.mostrar = true;
         this.mensajeResponse.clase = 'alert';
         this.mensaje(2);
        }
    );
  }

  /**
   * Este método muestra los mensajes resultantes de los llamados de la api
   * @param cuentaAtras numero de segundo a esperar para que el mensaje desaparezca solo
   * @param posicion  array de posicion [vertical, horizontal]
   * @return void
   */
    mensaje(cuentaAtras: number = 6, posicion: any[] = ['bottom', 'left']): void {
      var objeto = {
          showProgressBar: true,
          pauseOnHover: false,
          clickToClose: true,
          maxLength: this.mensajeResponse.texto.length
      };

      this.options = {
          position: posicion,
          timeOut: cuentaAtras * 1000,
          lastOnBottom: true
      };
      if (this.mensajeResponse.titulo == '')
          this.mensajeResponse.titulo = 'Búsqueda de salidas';

      if (this.mensajeResponse.clase == 'alert')
          this.notificacion.alert(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

      if (this.mensajeResponse.clase == 'success')
          this.notificacion.success(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

      if (this.mensajeResponse.clase == 'info')
          this.notificacion.info(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

      if (this.mensajeResponse.clase == 'warning' || this.mensajeResponse.clase == 'warn')
          this.notificacion.warn(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

      if (this.mensajeResponse.clase == 'error' || this.mensajeResponse.clase == 'danger')
          this.notificacion.error(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

  }
}
