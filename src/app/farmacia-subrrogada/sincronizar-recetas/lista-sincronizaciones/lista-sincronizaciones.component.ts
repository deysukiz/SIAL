import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import { ActivatedRoute, Params } from '@angular/router';
import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'salidas-recetas-lista',
  templateUrl: './lista-sincronizaciones.component.html'
})

export class ListaSincronizacionesComponent implements OnInit {
  usuario;
  dato;
  cargando;
  lista_impresion;
  pedido_id;
  json_vista;
  error_json;
   // Datos enviados en URL para filtros
  fecha_desde = '';
  fecha_hasta = '';
  folio = '';

  // # SECCION: Reportes
  pdfworker: Worker;
  cargandoPdf = false;
  // # FIN SECCION

  @ViewChildren('tr') tr;
  @ViewChildren('sr') sr;
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['pedido_id']) {
        this.pedido_id = params['pedido_id'];
      }
    });
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/farmacia-subrrogada/lista-sincronizaciones.js');

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
     * Este método abre una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  abrirModal(id, json_sincro?) {
    document.getElementById(id).classList.add('is-active');
    if (json_sincro) {
      // var json = JSON.parse(string);
      this.json_vista = JSON.parse(json_sincro);
    } else {
      this.error_json = true;
    }
  }
    /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
  }
  /******************************************IMPRESION DE REPORTES************************************ */

  imprimir() {

    try {
      this.cargandoPdf = true;
      let turno = this.tr.first.nativeElement.options;
      let servicio = this.sr.first.nativeElement.options;
      turno = turno[turno.selectedIndex].text;
      servicio = servicio[servicio.selectedIndex].text;

      this.crudService.lista_general('movimientos?tipo=2&fecha_desde=' + this.fecha_desde
      + '&fecha_hasta=' + this.fecha_hasta + '&folio=' + this.folio).subscribe(
        resultado => {
                this.cargando = false;
                this.lista_impresion = resultado.data;
                let entrada_imprimir = {
                  lista: this.lista_impresion,
                  usuario: this.usuario,
                  fecha_desde: this.fecha_desde,
                  fecha_hasta: this.fecha_hasta,
                  turno: turno,
                  servicio: servicio
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

  base64ToBlob( base64, type ) {
      let bytes = atob( base64 ), len = bytes.length;
      let buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( let i = 0 ; i < len ; i++ ) {
        view[i] = bytes.charCodeAt(i) & 0xff;
      }
      return new Blob( [ buffer ], { type: type } );
  }
}
