import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import  * as FileSaver    from 'file-saver';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-correcciones-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent implements OnInit {
  usuario;
  fecha_desde = '';
  fecha_hasta = '';
  turno = '';
  servicio = '';
  clave_insumo = '';
  movimiento = '';
  dato;
  datos_insumo;
  cargando;
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  // # SECCION: Reportes
  pdfworker: Worker;
  cargandoPdf = false;
  // # FIN SECCION

  @ViewChildren('tr') tr;
  @ViewChildren('sr') sr;
  @ViewChildren('mov') mov;
  constructor(
    private _ngZone: NgZone,
    private _sanitizer: DomSanitizer,
    private crudService: CrudService) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/inventario/lista-correcciones.js');

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
    console.log(data);
    let html = `
    <div class="card">
      <div class="card-content">
        <div class="media">          
          <div class="media-content">
            <p class="title is-4" style="color:black;"> <small>${data.descripcion}</small></p>
            <p class="subtitle is-6" style="color:black;">
              <strong style="color:black;">Clave: </strong> ${data.clave}
              `;

              if (data.es_causes == 1)
                html += `<label class="tag is-success" style="color:black;"><strong style="color:black;">Cause </strong></label>`;
              if(data.es_causes == 0)
              html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);"><strong style="color:black;">No Cause </strong> </label>`; 
              if(data.es_unidosis == 1)                                                                 
              html += `<label class="tag is-warning" ><strong style="color:black;">Unidosis</strong></label>`;
              
    html += `
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
  select_insumo_autocomplete(data) {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.clave_insumo = data.clave;
    this.cargando = true;

    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + usuario.almacen_activo.id + '&clave=' + data.clave).subscribe(
      resultado => {
        this.datos_insumo = resultado;
        // limpiar el autocomplete
        // (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
        this.cargando = false;
      },
      error => {
        this.cargando = false;
      });
  }
  /*************************** IMPRESION DE REPORTES ********************************************* */

  export_excel() {
    let titulo = 'Lista de correcciones';
    let turno = this.tr.first.nativeElement.options;
    let servicio = this.sr.first.nativeElement.options;
    let movimiento = this.mov.first.nativeElement.options;
    turno = turno[turno.selectedIndex].text;
    servicio = servicio[servicio.selectedIndex].text;
    movimiento = movimiento[movimiento.selectedIndex].text;
    let exportData = '<table><tr><th colspan=\'7\'><h1>' + titulo
    + '</h1></th></tr><tr><th>Desde: ' + this.fecha_desde + '</th><th>Hasta: ' + this.fecha_hasta + '</th>'
    + '<th>Movimiento: ' + movimiento + '</th><th>Turno: ' + turno + '</th><th>Servicio: ' + servicio + '</th>' +
    '<th>Insumo: ' + this.clave_insumo + '</th></tr><tr><th colspan=\'7\'></th></tr></table>';

    exportData += document.getElementById('exportable').innerHTML;
    let blob = new Blob([exportData], { type: 'text/comma-separated-values;charset=utf-8' });
    try {
        FileSaver.saveAs(blob,  'salida_estandar.xls');
    } catch (e) {
      console.log(e);
    }
  }

  imprimir() {
    try {
      this.cargandoPdf = true;
      let turno = this.tr.first.nativeElement.options;
      let servicio = this.sr.first.nativeElement.options;
      let movimiento = this.mov.first.nativeElement.options;
      turno = turno[turno.selectedIndex].text;
      servicio = servicio[servicio.selectedIndex].text;
      movimiento = movimiento[movimiento.selectedIndex].text;

      let entrada_imprimir = {
        lista: this.dato,
        usuario: this.usuario,
        fecha_desde: this.fecha_desde,
        fecha_hasta: this.fecha_hasta,
        turno: turno,
        servicio: servicio,
        clave_insumo: this.clave_insumo,
        movimiento: movimiento
      };
      this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
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
