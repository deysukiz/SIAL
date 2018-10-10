import { Component, OnInit, NgZone, ViewChildren} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Headers     } from '@angular/http';
import { CrudService } from '../../../crud/crud.service';
import { environment } from '../../../../environments/environment';
import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'inventario-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent implements OnInit {
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
  pdfworker: Worker;
  cargandoPdf = false;
  // # FIN SECCION
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  constructor(
    private crudService: CrudService,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone) {}

  ngOnInit() {
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
            <p class="title is-4" style="color:black;"> <small>${data.descripcion}</small></p>
            <br>
            <p class="subtitle is-6" style="color:black;">
              <strong style="color:black;">Clave: </strong> ${data.clave}
            </p>
            <p>
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

    var usuario = JSON.parse(localStorage.getItem('usuario'));
    if (data.clave_insumo_medico) {
      this.clave_insumo = data.clave_insumo_medico;
    } else {
      this.clave_insumo = data.clave;
    }
    this.cargando = true;
    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + usuario.almacen_activo.id + '&clave=' + this.clave_insumo).subscribe(
      resultado => {
      
        let unidosis_temporal: Number; 
        let normal_temporal: Number;

        this.lotes_insumo = resultado;
        this.es_unidosis = data.es_unidosis;
        this.unidad_medida = data.unidad_medida;

        let html = ``;
        if(data.es_causes == 1)
          html += `<label class="tag is-success" ><strong>Causes </strong></label>`;
        if(data.es_causes == 0)
          html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);"><strong>No Causes </strong> </label>`; 
        if(data.es_unidosis == 1)                                                                 
          html += `<label class="tag is-warning" ><strong>Unidosis</strong></label>`;

        //poner el titulo a la modal                
        document.getElementById('tituloModal').innerHTML = ` ${data.descripcion} <br>
          <p aling="justify" style="font-size:14px">${this.clave_insumo}</p> 
          <p aling="justify" style="font-size:12px"> CANTIDAD POR ENVASE: ${data.cantidad_x_envase ? data.cantidad_x_envase : 'Sin especificar' } </p>
          <br>
          `+html;
        
        this.cargando = false;
        this.abrirModal('verLotes');
      },
      error => {
        this.cargando = false;
      }
    );
  }
  
  /**
     * Este método abre una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  abrirModal(id) {
    document.getElementById(id).classList.add('is-active');
  }
  
  /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
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
    if (this.usuario.clues_activa) {
      cadena_url = '&clues=' + this.usuario.clues_activa.clues;
    }
    if (this.usuario.almacen_activo) {
      cadena_url += '&almacen=' + this.usuario.almacen_activo.id;
    }
    let query = 'token=' + localStorage.getItem('token');
    window.open(`${environment.API_URL}/inventario-excel?${query}${cadena_url}&buscar_en=${this.buscar_en}&seleccionar=${this.seleccionar}&tipo=${this.tipo}&clave_insumo=${this.clave_insumo}`);
  }

  imprimir() {
    this.cargandoPdf = true;
    // this.abrirModal('imprimirModal');
    this.crudService.lista_general( 'inventario?buscar_en=' + this.buscar_en
    + '&seleccionar=' + this.seleccionar + '&tipo=' + this.tipo).subscribe(
      resultado => {
                this.cargando = false;
                this.lista_impresion = resultado;
                let tipo_insumo = this.t.first.nativeElement.options;
                let existencia = this.s.first.nativeElement.options;
                tipo_insumo = tipo_insumo[tipo_insumo.selectedIndex].text;
                existencia = existencia[existencia.selectedIndex].text;
                try {

                  let entrada_imprimir = {
                    lista: this.lista_impresion,
                    usuario: this.usuario,
                    buscar_en: this.buscar_en,
                    seleccionar: existencia,
                    tipo: tipo_insumo
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

  base64ToBlob( base64, type ) {
      let bytes = atob( base64 ), len = bytes.length;
      let buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( let i = 0 ; i < len ; i++ ) {
        view[i] = bytes.charCodeAt(i) & 0xff;
      }
      return new Blob( [ buffer ], { type: type } );
  }
}
