import { Component, OnInit, NgZone } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'app-programa-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent {
  /**
   * Variable que contiene un valor __true__ cuando está ocurriendo un proceso,
   * y __false__ cuando no hay procesos realizándose.
   * @type {boolean} */
    cargando;
  /**
   * Contiene el resultado de la consulta de la lista general de programas.
   * @type {any} */
    lista_impresion;
  /**
   * Variable que contiene un valor __true__ cuando está generando el pdf a imprimir
   * y __false__ cuando termina de generarlo.
   * @type {boolean} */
    cargandoPdf;
  /**
     * Variable para la seccion de reportes.
     * @type {Worker} */
      pdfworker: Worker;


  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService) { }

  ngOnInit() {
    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/panel-control/lista-programas.js');

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
   * Método que genera una lista general de los registros en formato PDF, con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    this.crudService.lista_general('movimientos?tipo=1').subscribe(
      resultado => {
              this.cargando = false;
              this.lista_impresion = resultado;
              try {
                this.cargandoPdf = true;
                let entrada_imprimir = {
                  lista: this.lista_impresion.data
                };
                this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
              } catch (e) {
                this.cargandoPdf = false;
              }
            },
            error => {
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
}
