import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'salidas-recetas-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent implements OnInit {
  /**
   * Variable que contiene un valor _true_ cuando se está realizando un proceso
   * @type {boolean}
   */
  cargando;
  /**
   * Contiene la lista general de los datos para enviarlo al PDF.
   * @type {any}
   */
  lista_impresion;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any}
   */
  usuario;
  /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
  fecha_desde: String = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
  fecha_hasta: String = '';
  /**
   * Nombre o id de turno para filtro.
   * @type {String}
   */
  turno = '';

  // # SECCION: Reportes
  /**
   * Objeto para los reportes con web Webworkers.
   * @type {Worker}
   */
  pdfworker: Worker;
  /**
   * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
   * @type {boolean}
   */
  cargandoPdf = false;
  // # FIN SECCION
  /**
   * Variable para obtener el valor del DOM de la variable #tr
   * ```html
   *    <select *ngIf="ctrl.dato" class="select is-medium" [(ngModel)]="turno" #tr>
   * html```
   */
  @ViewChildren('tr') tr;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/farmacia/movimientos/lista-recetas.js');

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

  /***************************************IMPRESION DE REPORTES*************************************************/

  /**
   * Método que genera una lista general en formato PDF de los registros con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    this.cargandoPdf = true;
    let turno = this.tr.first.nativeElement.options;
    turno = turno[turno.selectedIndex].text;

    this.crudService.lista_general('movimientos?tipo=5&fecha_desde=' + this.fecha_desde
    + '&fecha_hasta=' + this.fecha_hasta + '&turno=' + this.turno).subscribe(
      resultado => {
        this.cargando = false;
        this.lista_impresion = resultado;
        try {
          let entrada_imprimir = {
            lista: this.lista_impresion,
            usuario: this.usuario,
            turno: turno,
            fecha_desde: this.fecha_desde,
            fecha_hasta: this.fecha_hasta,
          };
          this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
        } catch (e) {
          this.cargandoPdf = false;
        }
      },
      error => {});
  }

  /**
   * Método que realiza una conversión de base64 a Blob
   * @param base64 Formato en el que llega el dato
   * @param type Tipo al que se convertira.
   */
  base64ToBlob( base64, type ) {
      let bytes = atob( base64 );
      let len = bytes.length;
      let buffer = new ArrayBuffer( len );
      let view = new Uint8Array( buffer );

      for ( let i = 0 ; i < len ; i++ ) {
        view[i] = bytes.charCodeAt(i) & 0xff;
      }
      return new Blob( [ buffer ], { type: type } );
  }

  /**
   * Método que genera una lista general en formato EXCEL de los registros con los filtros correspondientes
   * @returns archivo en formato EXCEL
   */
  export_excel() {
    let titulo = 'Salida por Receta';
    let exportData =  '<table>' +
                        '<tr><th colspan=\'7\'><h1>' + titulo + '</h1></th></tr>' +
                        '<tr><th></th></tr>' +
                        '<tr><th colspan=\'7\'></th></tr>' +
                      '</table>';

    exportData += document.getElementById('exportable').innerHTML;
    let blob = new Blob([exportData], { type: 'text/comma-separated-values;charset=utf-8' });
    try {
        FileSaver.saveAs(blob,  'Listado_salida_por_receta.xls');
    } catch (e) {
      console.log(e);
    }
  }
}
