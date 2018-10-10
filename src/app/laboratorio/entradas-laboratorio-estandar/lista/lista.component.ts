import { Component, OnInit, ViewChildren, NgZone } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import  * as FileSaver    from 'file-saver';
/**
 * Componente que lista las entradas estandar.
 */
@Component({
  selector: 'app-entradas-estandar-lista',
  templateUrl: './lista.component.html'
})
/**
 * @class ListaComponent que pertenece a Entradas Estandar
 */
export class ListaComponent {

  /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
    fecha_desde = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
    fecha_hasta = '';
  /**
   * Nombre o id de turno para filtro.
   * @type {string} */
    turno = '';
  /**
   * Nombre o id de servicio para filtro.
   * @type {string} */
    servicio = '';
  /**
   * Nombre de quien recibe para aplicarlo al filtro.
   * @type {string} */
    recibe = '';
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Variable que contiene un valor __true__ cuando está ocurriendo un proceso,
   * y __false__ cuando no hay procesos realizándose.
   * @type {boolean} */
    cargando;
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
  /**
   * Variable que contiene el valor del turno.
   */
  @ViewChildren('tr') tr;
  /**
   * Variable que contiene el valor del servicio.
   */
  @ViewChildren('sr') sr;
  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService,
    private notificacion: NotificationsService) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-estandar/entradas/lista-entradas-estandar.js');

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
   * Método que genera una lista general de los registros en formato EXCEL, con los filtros correspondientes
   * @returns archivo en formato EXCEL
   */
  export_excel() {
    let titulo = 'Entrada Estandar';
    let exportData = '<table><tr><th colspan=\'7\'><h1>' + titulo
    + '</h1></th></tr><tr><th>Desde: ' + this.fecha_desde + '</th><th>Hasta: ' + this.fecha_hasta + '</th>'
    + '</th><th>Recibe: ' + this.recibe + '</th></tr><tr><th colspan=\'7\'></th></tr></table>';

    exportData += document.getElementById('exportable').innerHTML;
    let blob = new Blob([exportData], { type: 'text/comma-separated-values;charset=utf-8' });
    try {
        FileSaver.saveAs(blob,  'Listado_entrada_de_almacen.xls');
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * Método que genera una lista general de los registros en formato PDF, con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    this.cargandoPdf = true;
    this.crudService.lista_general('entrada-almacen-standard?fecha_desde=' + this.fecha_desde
    + '&fecha_hasta=' + this.fecha_hasta + '&recibe=' + this.recibe).subscribe(
      resultado => {
              this.cargando = false;
              this.lista_impresion = resultado;
              try {
                let entrada_imprimir = {
                  lista: this.lista_impresion,
                  usuario: this.usuario,
                  fecha_desde: this.fecha_desde,
                  fecha_hasta: this.fecha_hasta,
                  recibe: this.recibe
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
