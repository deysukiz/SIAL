import { Component, OnInit, Input, NgZone } from '@angular/core';
import { CrudService } from '../../../crud/crud.service';
import  * as FileSaver    from 'file-saver';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../../../environments/environment';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-tabla-opciones-laboratorio',
  templateUrl: './opciones.component.html'
})

export class TablaOpcionesComponent {
    /**
     * Contiene un valor _true_ si va a mostrarse la opción de exportar la lista en formato excel.
     */
    @Input() excel_export: true;
    @Input() ctrl: any;
    @Input() nombre: any;
    /**
     * Contiene valor _true_ si debe mostrarse el nombre del módulo, _false_ en caso contrario.
     * @type {string}
     */
    @Input() mostrar_nombre= true;
    /**
     * Contiene valor _true_ si puede verse la opción de nuevo, false en caso contrario.
     * @type {string}
     */
    @Input() nuevo= true;
    /**
     * Variable que contiene un valor _true_ si debe mostrarse el input de búsqueda.
     */
    @Input() busqueda: true;
    /**
     * Contiene la cadena de fontAwesome para insertar ícono
     */
    @Input() icono= 'fa fa-list';
    /**
     * Contiene la ruta a la cual se hará la consulta a la API para imprimir el PDF.
     * @type {string} */
    @Input() ruta: string;
    /**
     * Contiene la ruta donde se encuentra el archvio javascript que genera el PDF.
     * @type {string} */
    @Input() ruta_pdf: string;
    /**
     * Buscar claves en todas las claves o las claves pertenecientes a la clue
     */
    buscar_en = 'TODAS_LAS_CLAVES';
    /**
     * Contiene el tipo de búsqueda de caducidades (Todo, optima, media, pronta, caducado)
     */
    tipo_busqueda = 'TODO';
    /**
     * Contiene el tipo de insumo hemos de buscar relacionado a CAUSES (TODO, CAUSES, NO_CAUSES).
     */
    tipo_causes = 'TODO';
    /**
     * Contiene el tipo de insumo que hemos de buscar relacionado a si es MEDICAMENTO, MATERIAL DE CURACION o TODO.
     */
    tipo_insumo = 'TODO';
    /**
     * Contiene la descirpcion o clave de insumo que se busca.
     */
    clave_insumo = '';
    /**
     * Contiene el parametro de búsqueda por existencia, no existencia o todos.
     */
    seleccionar = 'TODO';
    /**
     * Contiene el tipo de insumo de laboratorio.
     */
    tipo_sustancia = 'TODO';
    /**
     * Contiene los datos de inicio de sesión del usuario.
     * @type {any} */
    usuario;
    /**
     * Variable que contiene la configuracion default para mostrar las notificaciones.
     * Posición abajo izquierda, tiempo 2 segundos
     */
    options = {
        position: ['top', 'right'],
        timeOut: 5000,
        lastOnBottom: true
    };
    /**
     * Variable que muestra las notificaciones.
     * @type {Mensaje}
     */
    mensajeResponse: Mensaje = new Mensaje(true);

    url_nuevo: string = '';
    carpeta;
    modulo;
    controlador;
    modulo_actual;

  /**
   * Contiene el resultado de la consulta de la lista general de programas.
   * @type {any} */
    lista_impresion;
  /**
   * Variable para la seccion de reportes.
   * @type {Worker} */
    pdfworker: Worker;
    /**
   * Variable que contiene un valor __true__ cuando está generando el pdf a imprimir
   * y __false__ cuando termina de generarlo.
   * @type {boolean} */
    cargandoPdf;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private _ngZone: NgZone,
    private crudService: CrudService,
    private notificacion: NotificationsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    let url = location.href.split('/');
    this.carpeta = url[4];
    this.modulo = url[5];

    this.url_nuevo = '/' + this.carpeta + '/' + this.modulo + '/nuevo';
    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/' + this.ruta_pdf);

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
    this.activatedRoute.params.subscribe((params: Params) => {
        this.tipo_busqueda = params['tipo_busqueda'];
      });
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
    let query = 'token=' + localStorage.getItem('token');
    window.open(`${environment.API_URL}/caducidad-insumos?${query}${cadena_url}&
    seleccionar=${this.seleccionar}&tipo=${this.tipo_sustancia}&clave_insumo=${this.clave_insumo}`);
  }

  /**
   * Método que genera una lista general de los registros en formato PDF, con los filtros correspondientes
   * @returns archivo en formato PDF
   */
  imprimir() {
    this.cargandoPdf = true;
    this.crudService.lista_general(this.ruta).subscribe(
      resultado => {
        this.lista_impresion = resultado;
        try {
          let imprimir = {
            usuario: this.usuario,
            lista: this.lista_impresion,
            buscar_en: this.buscar_en,
            tipo_busqueda: this.tipo_busqueda,
            tipo_sustancia: this.tipo_sustancia,
            seleccionar: this.seleccionar,
            clave_insumo: this.clave_insumo
          };
          this.pdfworker.postMessage(JSON.stringify(imprimir));
        } catch (e) {
          this.cargandoPdf = false;
        }
      },
        error => {
            this.cargandoPdf = false;
            this.mensajeResponse.mostrar = true;
            try {
                let e = error.json();
                if (error.status === 401) {
                    this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                    this.mensajeResponse.clase = 'danger';
                    this.mensaje(2);
                }
                if (error.status === 404) {
                    this.mensajeResponse.texto = 'Página no encontrada, contacte al administrador.';
                    this.mensajeResponse.clase = 'danger';
                    this.mensaje(2);
                }
            } catch (e) {
                if (error.status == 500) {
                    this.mensajeResponse.texto = '500 (Error interno del servidor)';
                } else {
                    this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
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
        if (this.mensajeResponse.titulo == '')
            this.mensajeResponse.titulo = this.nombre;

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
