import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import  * as FileSaver    from 'file-saver';

/**
 * Componente que lista las salidas estandar.
 */ 
@Component({
  selector: 'app-salidas-almacen-lista',
  templateUrl: './lista.component.html'
})
/**
 * Clase que lista las salidas estandar.
 */
export class ListaComponent implements OnInit {

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
   * @type {String} */
    turno: String = '';
  /**
   * Nombre o id de servicio para filtro.
   * @type {string} */
    servicio: String = '';
  /**
   * Nombre de quien recibe para aplicarlo al filtro.
   * @type {string} */
    recibe: String = '';
  /**
   * Variable para identificar si se está cargando algunos componentes o datos del módulo.
   * @type {boolean} */
    cargando: boolean;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
    usuario;
  /**
   * Contiene la lista general de los datos para enviarlo al PDF.
   * @type {any} */
    lista_impresion;

  // # SECCION: Reportes
    /**
     * Objeto para los reportes con web Webworkers.
     * @type {Worker} */
      pdfworker: Worker;
    /**
     * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
     * @type {boolean} */
      cargandoPdf: boolean = false;
  // # FIN SECCION

  /**
     * Variable que obtiene el valor de:
     * ```html
     * <select *ngIf="ctrl.dato" class="select is-medium" [(ngModel)]="turno" #tr>
     * ```
     * también le asignamos valores desde el ts al campo select.
     * @type {ViewChildren} */
    @ViewChildren('tr') tr;

  /**
     * Variable que obtiene el valor de:
     * ```html
     * <select *ngIf="ctrl.dato" class="select is-medium" [(ngModel)]="servicio" #sr>
     * ```
     * también le asignamos valores desde el ts al campo select.
     * @type {ViewChildren} */
    @ViewChildren('sr') sr;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService) { }
  /**
   * Método ngOnInit
   */
  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-estandar/salidas/lista-salidas-estandar.js');

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
   * Método que genera una lista general en formato EXCEL de los registros con los filtros correspondientes
   * @returns archivo en formato EXCEL
   */
  export_excel() {
    let titulo = 'Salida Estandar';
    let turno = this.tr.first.nativeElement.options;
    let servicio = this.sr.first.nativeElement.options;
    turno = turno[turno.selectedIndex].text;
    servicio = servicio[servicio.selectedIndex].text;
    let exportData = '<table><tr><th colspan=\'7\'><h1>' + titulo
    + '</h1></th></tr><tr><th>Desde: ' + this.fecha_desde + '</th><th>Hasta: ' + this.fecha_hasta + '</th>'
    + '<th>Turno: ' + turno + '</th><th>Servicio: ' + servicio + '</th><th>Recibe: '
    + this.recibe + '</th></tr><tr><th colspan=\'7\'></th></tr></table>';

    exportData += document.getElementById('exportable').innerHTML;
    let blob = new Blob([exportData], { type: 'text/comma-separated-values;charset=utf-8' });
    try {
        FileSaver.saveAs(blob,  'salida_estandar.xls');
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Método que genera una lista general en formato PDF de los registros con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    try {
      this.cargandoPdf = true;
      let turno = this.tr.first.nativeElement.options;
      let servicio = this.sr.first.nativeElement.options;
      turno = turno[turno.selectedIndex].text;
      servicio = servicio[servicio.selectedIndex].text;

      this.crudService.lista_general('salida-almacen-standard?tipo=2&fecha_desde=' + this.fecha_desde
      + '&fecha_hasta=' + this.fecha_hasta + '&turno=' + this.turno + '&servicio=' + this.servicio + '&recibe=' + this.recibe).subscribe(
        resultado => {
                this.cargando = false;
                this.lista_impresion = resultado;
                let entrada_imprimir = {
                  lista: this.lista_impresion,
                  usuario: this.usuario,
                  fecha_desde: this.fecha_desde,
                  fecha_hasta: this.fecha_hasta,
                  turno: turno,
                  servicio: servicio,
                  recibe: this.recibe
                };
                this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
              },
              error => {
              }
      );
    } catch (e) {
      this.cargandoPdf = false;
    }
  }
/**
 * Este método
 * @param base64 Pendiente
 * @param type Nombre del archivo
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
