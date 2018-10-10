import { Component, OnInit, NgZone, ViewChildren} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Headers     } from '@angular/http';
import { CrudService } from '../../../crud/crud.service';
import { environment } from '../../../../environments/environment';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import  * as FileSaver    from 'file-saver';
/**
 * Componente que muestra la lista de entradas del almacén de artículos.
 */
@Component({
  selector: 'inventario-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent{
  /**
   * Variable que contiene la altura de la pantalla.
   */
  tamano;
  usuario;
  dato;
  lista;
  lotes_insumo;
  clave_insumo = '';
  cargando;
  buscar_en = 'TODAS_LAS_CLAVES';
  seleccionar = 'TODO';
  insumo;
  tipo = 'TODO';
  es_unidosis;
  unidad_medida;
  lista_impresion;

  @ViewChildren('t') t;
  @ViewChildren('s') s;
  @ViewChildren('claves') claves;

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
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  constructor(
    private crudService: CrudService,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone,
    private notificacion: NotificationsService) {}

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.tamano = document.body.clientHeight;
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/inventario/lista-existencias.js');

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

  export_excel() {
    let titulo = 'Existencias';
    let tipo_insumo = this.t.first.nativeElement.options;
    let existencia = this.s.first.nativeElement.options;
    let claves = this.buscar_en === 'TODAS_LAS_CLAVES' ? 'Todas las claves' : 'Mis claves';
    tipo_insumo = tipo_insumo[tipo_insumo.selectedIndex].text;
    existencia = existencia[existencia.selectedIndex].text;
    let exportData = '<table><tr><th colspan=\'7\'><h1>' + titulo + '</h1></th></tr>'
    + '<tr><th>Claves: ' + claves + '</th><th>Insumo: ' + tipo_insumo + '</th><th>Existencia: ' + existencia + '</th></tr>'
    + '<tr><th colspan=\'7\'></th></tr></table>';

    exportData += document.getElementById('exportable').innerHTML;
    let blob = new Blob([exportData], { type: 'text/comma-separated-values;charset=utf-8' });
    try {
        FileSaver.saveAs(blob,  'Lista_existencias.xls');
    } catch (e) {
      console.log(e);
    }
  }
  imprimirExcel() {
    let cadena_url;
    let usuario_actual = JSON.parse(localStorage.getItem('usuario'));
    if (usuario_actual.clues_activa) {
      cadena_url = '&clues=' + usuario_actual.clues_activa.clues;
    }
    if (usuario_actual.almacen_activo) {
      cadena_url += '&almacen=' + usuario_actual.almacen_activo.id;
    }
    console.log(usuario_actual);
    let query = 'token=' + localStorage.getItem('token');
    window.open(`${environment.API_URL}/inventario-articulos-excel?${query}${cadena_url}&buscar_en=${this.buscar_en}&seleccionar=${this.seleccionar}&tipo=${this.tipo}&clave_insumo=${this.clave_insumo}`);
  }

  imprimirPdf() {
    // this.cargandoPdf = true;
    // let usuario_actual = JSON.parse(localStorage.getItem('usuario'));
    // // this.abrirModal('imprimirModal');
    // this.crudService.lista_general( 'inventario-insumos?buscar_en=' + this.buscar_en
    // + '&seleccionar=' + this.seleccionar + '&tipo=' + this.tipo).subscribe(
    //   resultado => {
    //             this.cargando = false;
    //             this.lista_impresion = resultado;
    //             let tipo_insumo = this.t.first.nativeElement.options;
    //             let existencia = this.s.first.nativeElement.options;
    //             tipo_insumo = tipo_insumo[tipo_insumo.selectedIndex].text;
    //             existencia = existencia[existencia.selectedIndex].text;
    //             try {

    //               let existencia_imprimir = {
    //                 lista: this.lista_impresion,
    //                 usuario: usuario_actual,
    //                 buscar_en: this.buscar_en,
    //                 seleccionar: existencia,
    //                 tipo: tipo_insumo
    //               };
    //               this.pdfworker.postMessage(JSON.stringify(existencia_imprimir));
    //             } catch (e) {
    //               this.cargandoPdf = false;
    //             }
    //         },
    //         error => {
    //           try {
    //                 let e = error.json();
    //                 if (error.status == 401) {
    //                     this.mensajeResponse.texto = "No tiene permiso para hacer esta operación.";
    //                     this.mensajeResponse.clase = 'danger';
    //                     this.mensaje(2);
    //                 }
    //             } catch (e) {
    //                 if (error.status == 500) {
    //                     this.mensajeResponse.texto = '500 (Error interno del servidor)';
    //                 } else {
    //                     this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
    //                 }
    //                 this.mensajeResponse.clase = 'danger';
    //                 this.mensaje(2);
    //             }

    //         }
    // );

  }

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
