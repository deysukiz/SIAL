import { Component, OnInit, Input, NgZone, ElementRef, ViewChild, ViewChildren  } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import  * as FileSaver    from 'file-saver';
/**
 * Componente que contiene la lista de salidas del almacén de artículos.
 */
@Component({
  selector: 'salida-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent{
  tamano;
  titulo= 'Salida articulo';
  public clues_term = `${environment.API_URL}/clues-auto?term=:keyword`;
  tieneid = false;
  foto = '';
  resultado_clues;
  clues;

  /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
  fecha_desde: String = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
  fecha_hasta: String = '';
  /**
   * /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
  clues_destino: String = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
  persona_recibe: String = '';
  
  /**
    * Contiene los datos de inicio de sesión del usuario.
    * @type {any} */
  usuario;
  /**
    * Contiene el resultado de la consulta de la lista general de programas.
    * @type {any} */
  lista_impresion;

  // # SECCION: Reportes
    /**
     * Variable para la seccion de reportes.
     * @type {Worker} */
      pdfworker: Worker;
    /**
     * Identifica su el archivo se está cargando.
     * @type {boolean} */
    cargandoPdf = false;
  // # FIN SECCION

  /**
   * Variable que muestra las notificaciones.
   * @type {Mensaje}
   */
  mensajeResponse: Mensaje = new Mensaje();
  
  /**
   * Variable que contiene la configuracion default para mostrar las notificaciones.
   * Posición abajo izquierda, tiempo 2 segundos
   */
  public options = {
    position: ['bottom', 'right'],
    timeOut: 2000,
    lastOnBottom: true
  };

  constructor(private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone,
    private notificacion: NotificationsService) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    this.tamano = document.body.clientHeight;
    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-articulos/lista-salida-articulos.js');

    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    let self = this;
    let $ngZone = this._ngZone;

    this.pdfworker.onmessage = function( evt ) {
      // Esto es un hack porque estamos fuera de contexto dentro del worker
      // Y se usa esto para actualizar alginas variables
      $ngZone.run(() => {
         self.cargandoPdf = false;
      });

      FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
      // open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };
  }

  /**
   * Este método formatea los resultados de la busqueda en el autocomplte
   * @param data resultados de la busqueda
   * @return void
   */
  autocompleListFormatter = (data: any) => {
    let html = `
    <div class="card">
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-4" style="color: black;">
                        <i class="fa fa-hospital-o" aria-hidden="true"></i> &nbsp; ${data.clues}
                    </p>
                    <p class="subtitle is-6" style="color: black;">
                        <strong style="color: black;">Nombre: </strong> ${data.nombre}
                        <strong style="color: black;">&nbsp; Jurisdicción: </strong>
                        <span style="color: black;"> ${data.jurisdiccion ? data.jurisdiccion.numero : 'No disponible'} -
                          ${data.jurisdiccion ? data.jurisdiccion.nombre : 'No disponible'}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Este método carga los datos de un elemento de la api con el id que se pase por la url
   * @param data json con los datos del objetop seleccionado del autocomplete
   * @return void
   */
  select_clues_autocomplete(data) {

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.clues_destino = data.clues;
  }

  /**
   * Método que genera una lista general de los registros en formato PDF, con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    this.cargandoPdf = true;
    this.crudService.lista_general(
      'salida-articulo?tipo_movimiento_id=12&fecha_desde=' + this.fecha_desde
      + '&fecha_hasta=' + this.fecha_hasta + '&clues_destino=' + this.clues_destino 
      +'&persona_recibe='+this.persona_recibe
    ).subscribe(
      resultado => {
              this.lista_impresion = resultado;
              try {
                let entrada_imprimir = {
                  lista: this.lista_impresion,
                  usuario: this.usuario,
                  fecha_desde: this.fecha_desde,
                  fecha_hasta: this.fecha_hasta,
                  clues_destino: this.clues_destino,
                  persona_recibe: this.persona_recibe
                };
                this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
              } catch (e) {
                this.cargandoPdf = false;
              }
            },
            error => {
              this.cargandoPdf = false;
              this.mensajeResponse.mostrar = true;
              try {
                  let e = error.json();
                  if (error.estatus === 401) {
                      this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                      this.mensajeResponse.clase = 'danger';
                      this.mensaje(2);
                  }
              } catch (e) {
                  if (error.estatus === 500) {
                      this.mensajeResponse.texto = '500 (Error interno del servidor)';
                  } else {
                      this.mensajeResponse.texto =
                        'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                  }
                  this.mensajeResponse.clase = 'danger';
                  this.mensaje(2);
              }
            }
    );
  }
/**
 * Método que nos ayuda a convertir un archivo para poder guardarlo
 * @param base64 pendiente
 * @param type pendiente
 */
  base64ToBlob( base64, type ) {
      let bytes = atob( base64 ), len = bytes.length;
      let buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( let i = 0 ; i < len ; i++ ) {
        view[i] = bytes.charCodeAt(i) & 0xff;
      }
      return new Blob( [ buffer ], { type: type } );
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
      if (this.mensajeResponse.titulo === '') {
          this.mensajeResponse.titulo = 'Entradas de medicamentos';
        }
      if (this.mensajeResponse.clase === 'alert') {
          this.notificacion.alert(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'success') {
          this.notificacion.success(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'info') {
          this.notificacion.info(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'warning' || this.mensajeResponse.clase === 'warn') {
          this.notificacion.warn(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'error' || this.mensajeResponse.clase === 'danger') {
          this.notificacion.error(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
  }

}
