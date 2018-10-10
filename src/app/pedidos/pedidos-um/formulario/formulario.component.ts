import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, FormsModule, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { CrudService } from '../../../crud/crud.service';
import * as moment from 'moment';
import  * as FileSaver    from 'file-saver';
import { createAutoCorrectedDatePipe, createNumberMask } from 'text-mask-addons';

import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { error, inspect } from 'util';

@Component({
  selector: 'app-inicial-formulario',
  templateUrl: './formulario.component.html',
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})

export class FormularioComponent {
  /**
   * Variable que contiene un valor _true_ si
   */
  error_formulario= false;
  /**
   * Variable que tiene un valor verdadero mientras cargan los datos del inventario.
   */
  cargarPedido = false;
  /**
   * Variable que contienen el total de la suma de los precios de los insumos más iva_importe.
   * @type {Number}
   */
  total_precio: Number = 0;
  /**
   * Variable que contienen el total del iva_importe de los insumos que son material de curación.
   * @type {Number}
   */
  total_iva: Number = 0;
  /**
   * Variable que contienen el total de la suma de los precios sin iva_importe.
   * @type {Number}
   */
  subtotal_precios: Number = 0;
  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API.
   * @type {FormGroup}
   */
  dato: FormGroup;
  /**
   * Contiene los datos del modelo que se enviarán a la API.
   */
  form_dato;
  /**
   * Contiene la clave del programa elegido por el usuario, nos sirve para hacer comparaciones en caso
   * de que el usuario intente cambiar el programa cuando hay insumos capturados.
   * @type {any}
   */
  programa_elegido;
  /**
  * Contiene la información del insumo elegido por el usuario, y que posteriormente será agregado a la lista de insumos médicos
  * de la entrada estándar, los valores se asignan a los campos correspondientes del formulario reactivo.
  */
 insumo;
  /**
   * Contiene el index del lote a borrar.
   */
  index_borrar;
 /**
  * Variable que contiene un valor _true_ si el medicamento tiene valor unidosis y _false_ en caso contrario.
  * @type {boolean}
  */
 es_unidosis = false;
  /**
   * Contiene la lista de artículos restultados de la consulta a la API.
   */
  json_articulos;

  /**
   * Variable que contiene un valor _true_ cuando está ejecutándose algun proceso y 
   */
  cargando: boolean = false;
  /**
   * Calcula el tamaño de la pantalla
   */
  tamano = document.body.clientHeight;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Variable que contiene un valor _true_ o _false_.
   * @type {boolean}
   */
  time_cambio_cantidad_stoc;
  /**
   * Contiene la lista de programas
   * @type {any}
   */
  lista_programas= [];
  /**
   * Se tuvo que crear la variable debido a que se debe hacer referencia únicamente cuando se esté actualizando
   * el catálogo de programas y no cada vez que se esté cargando otros elementos.
   */
  cargandoCatalogo = false;
  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioComponent#res_busq_insumos}
   * @type {string} */
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;
  /**
   * Contiene la lista general de insumos, para hacer una búsqueda más rápida
   */
  lista_insumos = [];
  /**
   * Guarda el resultado de la búsqueda de insumos médicos.
   * @type {array} */
  res_busq_insumos= [];
  /**
   * Objeto que contiene la configuracion default para mostrar los mensajes,
   * mostrar barra de progreso, si pasa el mouse encima se mantiene el mensaje,
   * click para cerrar mensaje, tiempo 3 segundos.
   * @type {Object}
   */
  objeto = {
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 3000
  };
  /**
   * Objeto que contiene la configuracion default para mostrar los mensajes,
   * posicion abajo izquierda, tiempo 5 segundos.
   * @type {Object}
   */
  public options = {
    position: ['bottom', 'left'],
    timeOut: 5000,
    lastOnBottom: true
  };
  /**
   * Variable que muestra las notificaciones al usuario.
   * @type {Mensaje}
   */
  mensajeResponse: Mensaje = new Mensaje();
  guardado = false;
  error = false;

  /**
   * Contiene el valor de la tecla presionada por el usuario cuando se llama a la función handleKeyboardEvents(event: KeyboardEvent)
   */
  key;
  /**
   * Pipe que formate la fecha que ingresa el usuario
   * @type {any}
   */
  autoCorrectedDatePipe: any = createAutoCorrectedDatePipe('yyyy-mm-dd');
  /**
   * Máscara para validar la entrada de la fecha de caducidad con el formato siguiente AAAA-MM-DD
   * @type {array}
   */
  mask = [/[2]/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  /**
   * Se crea la máscara que contiene la configuración deseada.
   */
  numberMask: any = createNumberMask({
    prefix: '',
    includeThousandsSeparator: false,
    allowLeadingZeroes: false
  });
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean} */
  tieneid = false;
  /**
    * Contiene la fecha MÍNIMA que puede ingresar el usuario para la fecha que fue hecha la salida de almacen.
    * @type {Date} */
  MinDate = new Date();
  /**
    * Contiene la fecha MÁXIMA que puede ingresar el usuario para la fecha que fue hecha la salida de almacen.
    * @type {Date} */
  MaxDate = new Date();
  /**
    * Contiene la fecha MINIMA que puede ingresar el usuario para la fecha limite de captura.
    * @type {Date} */
   capturaDate = new Date();
  /**
   * Contiene la fecha del día de hoy y es la que automáticamente se asigna a la fecha del movimiento, aunque el usuario puede
   * cambiarla hay un límite de una fecha mínima [MinDate]{@link FormularioComponent#MinDate} y
   * fecha máxima [MaxDate]{@link FormularioComponent#MaxDate}
   * @type {Date} */
  fecha_actual;

  /**
   * Variable para el enlace en las secciones de ayuda
   */
  enlaceAyuda = '';

  /**
   * Variable que contiene el id del programa a mostrar
   */
  i_programa;

  /**-------------------IMPRESION-------------------------- */
  /**
   * Objeto para los reportes con web Webworkers.
   * @type {Worker} */
  pdfworker: Worker;
  /**
   * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
   * @type {boolean} */
  cargandoPdf = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificacion: NotificationsService,
    private route: ActivatedRoute,
    private crudService: CrudService,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone) {

      /**
       * Para poder ir a las secciones de ayuda.
       **/
      router.events.subscribe(s => {
        if (s instanceof NavigationEnd) {
          const tree = router.parseUrl(router.url);
          if (tree.fragment) {
            const element = document.querySelector('#' + tree.fragment);
            if (element) { element.scrollIntoView(true); }
          }
        }
      });
  
    }

  ngOnInit() {
    // obtener los datos del usiario logueado almacen
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.form_dato = {
      id	:	'',
      estatus	:	'BR',
      incremento	:	'',
      servidor_id	:	'',
      clues	:	'', // this.usuario.clues_activa.clues,
      clues_destino	:	'',
      tipo_insumo_id	:	null,
      tipo_pedido_id	:	'PCC',
      descripcion	:	'',
      pedido_padre	:	null,
      folio	:	'',
      fecha	:	'',
      fecha_concluido	:	null,
      fecha_expiracion	:	null,
      fecha_cancelacion	:	null,
      almacen_solicitante	:	null,
      almacen_proveedor	:	null,
      organismo_dirigido	:	null,
      acta_id	:	null,
      recepcion_permitida	:	null,
      observaciones	:	null,
      usuario_validacion	:	null,
      proveedor_id	:	null,
      total_monto_solicitado	:	null,
      total_monto_recibido	:	null,
      total_claves_solicitadas	:	null,
      total_claves_recibidas	:	null,
      total_cantidad_solicitada	:	null,
      total_cantidad_recibida	:	null,
      encargado_almacen_id	:	null,
      director_id	:	null,
      usuario_id	:	'',
      created_at	:	null,
      updated_at	:	null,
      deleted_at	:	null,
      insumos : [],
      metadato_compra_consolidada: {
        programa_id: '',
        fecha_limite_captura: '',
        lugar_entrega: '',
        presupuesto_compra: 0,
        presupuesto_causes: 0,
        presupuesto_no_causes: 0,
        presupuesto_causes_asignado: 0,
        presupuesto_no_causes_asignado: 0,
        presupuesto_causes_disponible: 0,
        presupuesto_no_causes_disponible: 0
      },
      unidad_medica: {
        clues	:	'',
        jurisdiccion_id	:	'',
        tipo	:	'',
        nombre	:	'',
        activa	:	'',
        director_id	:	''
      },
    };

    this.cargarCatalogo('programa', 'lista_programas', 'estatus');

    let date = new Date();

    this.MinDate = new Date(date.getFullYear() - 1, 0, 1);
    this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.capturaDate = new Date(date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate());
    // this.MinDateCaducidad = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();

    // si es nuevo poner la fecha actual si no poner la fecha con que se guardo
    if (this.form_dato.fecha_inicio === '') {
      this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
      this.form_dato.fecha_inicio = this.fecha_actual;
      this.form_dato.fecha = this.fecha_actual;
    } else {
      this.fecha_actual = this.form_dato.fecha_inicio;
      this.form_dato.fecha = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
    }
    // this.cargarDatos();

    /* **********************IMPRIMIR******************************* */
        // Inicializamos el objeto para los reportes con web Webworkers
        this.pdfworker = new Worker('web-workers/pedidos-cc/pedido-cc-um.js');

        // Este es un hack para poder usar variables del componente dentro de una funcion del worker
        var self = this;
        var $ngZone = this._ngZone;

        this.pdfworker.onmessage = function( evt ) {
          // Esto es un hack porque estamos fuera de contexto dentro del worker
          // Y se usa esto para actualizar alginas variables
          $ngZone.run(() => {
             self.cargandoPdf = false;
          });
          FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
        };
    this.enlaceAyuda = '/pedidos/UM/editar/' + this.form_dato.id;
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
        this.cargarPedido = true;
        this.cargarDatos(params['id']);
      }
    });
  }

  /**
   * Función local para cargar el catalogo de programas, no se utilizó el cargarCatalogo del CRUD,
   * debido a que este catálogo no existen 'mis-programas', sino que es un catálogo general y se agregan
   * al arreglo únicamente aquellos programas que se encuentran activos (estatus = 1).
   * @param url Contiene la cadena con la URL de la API a consultar para cargar el catalogo del select.
   * @param modelo Contiene el nombre de la variable en la que se guardan los resultados de la consulta a la API.
   * @param estado Contiene el valor de la variable que representa el estado de cada item.
   */
  cargarCatalogo(url, modelo, estado) {
    this[modelo] = [];
    this.cargandoCatalogo = true;
    this.crudService.lista_general(url).subscribe(
      resultado => {
        this.cargandoCatalogo = false;
        let contador = 0;
        for (let item of resultado) {
          if (item[estado] === 1 || item[estado] === '1') {
            this[modelo].push(item);
          }
        }
      }
    );
    this.crudService.busquedaInsumos('', 'insumos-auto').subscribe(
      resultado => {
        this.cargando = false;
        this.lista_insumos = resultado;
        if (this.lista_insumos.length === 0) {
          this.notificacion.warn('Insumos', 'Problema en', this.objeto);
        }
      }
    );
  }

  /**
   * Metodo que calcula el preupuesto global.
   */
  calcular_presupuesto_asignado() {
    // this.form_dato.metadato_compra_consolidada.presupuesto_compra = this.form_dato.metadato_compra_consolidada.presupuesto_causes + this.form_dato.metadato_compra_consolidada.presupuesto_no_causes;
    this.total_precio = Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado) + Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado);

    this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible = Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes) - Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado);
    this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible = Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes) - Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado);
  }
  /**
   * Debido a que la librería no acepta null o NaN, debemos sustituirlo por un valor 0.
   * @param campo_nombre Cadena que contiene el nombre del campo.
   */
  validar_input_currency(campo_nombre) {
    if (this.form_dato.metadato_compra_consolidada[campo_nombre] === '' || isNaN(this.form_dato.metadato_compra_consolidada[campo_nombre])) {
      this.form_dato.metadato_compra_consolidada[campo_nombre] = 0;
    }
  }
  /**
   * Método para inciar el formulario reactivo del array de programas
   */
  arrayPrograma(): FormGroup {
    return this.fb.group({
      id: ['', Validators.required],
      clave: ['', Validators.required],
      nombre: ['', Validators.required],
      insumos: this.fb.array([ ]),
    });
  }

  /**
   * Método que valida si la fecha de caducidad tiene un formato válido y si es mayor al periodo mínimo de caducidad (14 días).
   * @param fecha Variable que contiene la fecha de caducidad ingresada por el usuario para el insumo y lote correspondiente.
   * @param i Index de la posición del insumo al que corresponde la fecha de caducidad.
   */
  validar_fecha(fecha, i_programa, i_insumo, i_lote) {

    let fecha_hoy = moment();
    if (!moment(fecha, 'YYYY-MM-DD', true).isValid()) {
      this.notificacion.alert('Fecha inválida', 'Debe ingresar una fecha válida', this.objeto);
      this.form_dato.programas[i_programa].insumos[i_insumo].lotes[i_lote].fecha_caducidad = '';
      // ctrlLotes.controls['fecha_caducidad'].patchValue('');
    } else {
      if (moment(fecha, 'YYYY-MM-DD', true) <= fecha_hoy.add(14, 'days')) {
        // ctrlLotes.controls['fecha_caducidad'].patchValue('');
        this.form_dato.programas[i_programa].insumos[i_insumo].lotes[i_lote].fecha_caducidad = '';
        this.notificacion.alert('Fecha inválida', 'La fecha de caducidad debe ser mayor al ' +
         fecha_hoy.format('YYYY-MM-DD'), this.objeto);
      }
    }
  }

  /**
   * Este método permite que el focus del cursor vuelva al buscador de insumos una vez presionada la tecla enter
   * @param event Parametro que contiene el valor de la tecla presionada
   * @return void
   */
  handleKeyboardEvents(event: KeyboardEvent) {
    this.key = event.which || event.keyCode;
    if (event.keyCode === 13) {
      event.preventDefault();
      return false;
    }
  }

  /**
   * Método de búsqueda de insumos en la API.
   * @param keyword Contiene la palabra que se va a buscar.
   */
  enviarAutocomplete(keyword: any) {
    this.cargando = true;
    let cabecera = '';
    if (this.usuario.clues_activa) {
      cabecera += '&clues=' + this.usuario.clues_activa.clues;
    }
    if (this.usuario.almacen_activo) {
      cabecera += '&almacen=' + this.usuario.almacen_activo.id;
    }
    let url: string = '' + environment.API_URL + '/insumos-auto?term=' + keyword + cabecera;
    this.crudService.busquedaInsumos(keyword, 'insumos-auto').subscribe(
      resultado => {
        this.cargando = false;
        this.res_busq_insumos = resultado;
        if (this.res_busq_insumos.length === 0) {
          this.notificacion.warn('Insumos', 'No hay resultados que coincidan', this.objeto);
        }
      }
    );
  }

  /**
   * Este método valida que en el campo de la existencia no pueda escribir puntos o signo negativo
   * @param event Parametro que contiene el valor de la tecla presionada
   * @return void
   */
  quitar_punto(event) {
    if (this.is_numeric(event.key ) ) {
      return true;
    }else {
      return false;
    }
  }

  /**
   * Método que evalúa las teclas presionadas en los campos de existencia y precio unitario para
   * mandar a llamar la función calcular_importes (item, pos) si son valores válidos.
   * @param event Parametro que contiene el valor de la tecla presionada.
   * @param item Variable que contiene el objeto del insumo al que pertenece el precio y la existencia.
   * @param pos Contiene la posición a la que pertenece el insumo.
   */
  cambio_cantidad_stock_key(event, item, i_insumo) {
      if (event.key == 'Backspace' || event.key == 'Delete') {
      this.calcular_importes(item, i_insumo);
      this.calcularSubtotal();
    }
    if (event.key != 'Backspace'
      && event.key != 'Delete'
      && event.key != 'ArrowLeft'
      && event.key != 'ArrowRight'
      && event.key != 'ArrowUp'
      && event.key != 'ArrowDown'
      && event.key != '.') {
      clearTimeout(this.time_cambio_cantidad_stoc);
      this.time_cambio_cantidad_stoc = setTimeout(() => {
        this.calcular_importes(item, i_insumo);
        this.calcularSubtotal();
      }, 800);
    }
  }

    /**
   * Método para calcular subtotal del insumo.
   * @param item Variable que contiene el objeto del insumo al que pertenece el precio y la existencia.
   * @param pos Contiene la posición del arreglo a la que se agregará la existencia.
   */
  calcular_importes (item, i_insumo) {
    let iva = 1;
    if (item.precio_unitario === '' || item.precio_unitario == null) {
      this.form_dato.insumos[i_insumo].monto_solicitado = 0;
    } if (item.cantidad_solicitada  === '' || item.cantidad_solicitada == null) {
      this.form_dato.insumos[i_insumo].monto_solicitado = 0;
    } else {
      if (item.info_insumo.tipo === 'MC') {
        iva = 1.16;
      }
      let temporal = Number(item.cantidad_solicitada) * Number(item.precio_unitario) * iva;
      this.form_dato.insumos[i_insumo].monto_solicitado = temporal;
    }
  }

  /**
   * Método para calcular los subtotales de cada insumo
   */
  calcularSubtotal() {
    let total_asignado_causes_insumos = 0, total_asignado_no_causes_insumos = 0, total_insumo = 0;

    for (let c = 0; c < this.form_dato.insumos.length; c++) {
      if (this.form_dato.insumos[c].info_insumo.es_causes === 1 || this.form_dato.insumos[c].info_insumo.es_causes === '1' || this.form_dato.insumos[c].info_insumo.es_causes === true) {
        total_asignado_causes_insumos = total_asignado_causes_insumos + Number(this.form_dato.insumos[c].monto_solicitado);
      }
      if (this.form_dato.insumos[c].info_insumo.es_causes === 0 || this.form_dato.insumos[c].info_insumo.es_causes === '0' || this.form_dato.insumos[c].info_insumo.es_causes === false) {
        total_asignado_no_causes_insumos = total_asignado_no_causes_insumos + Number(this.form_dato.insumos[c].monto_solicitado);
      }
    }
    this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado = total_asignado_no_causes_insumos;
    this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado = total_asignado_causes_insumos;
    //   this.form_dato.programas[i_prog].insumos[i_insumo].subtotal  = Number(temporal_subtotal_precios) + Number(temporal_total_iva);
    this.calcular_presupuesto_asignado();
    this.sumaTotal();
  }

  /**
   * Método en el que se hace la suma de los precios de los insumos, debemos sacar el iva_importe en caso de que sea Material de Curación
   * y sumar todo para obtener el total de la factura.
   */
  sumaTotal() {

    // this.form_dato.metadato_compra_consolidada.presupuesto_compra
    this.total_precio = this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado + this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado;

  }

  /**
   * Devuelve un valor Boolean que indica si existe o no un patrón en una cadena de búsqueda.
   * @param str Valor de la tecla presionada por el usuario.
   */
  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * Compureba que los presupuestos asignados no sean mayores a los presupuestos autorizados.
   * Abre el modal 'finalizarPedidoUM' para confirmar que guarda el pedido como finalizado,
   * sin poder hacer cambios posteriormente.
   */
  finalizar_pedido() {
    if (
    this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado > this.form_dato.metadato_compra_consolidada.presupuesto_causes
    || this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado > this.form_dato.metadato_compra_consolidada.presupuesto_no_causes
  ) {
      this.notificacion.warn('Presupuesto', 'El presupuesto asignado rebasa el presupuesto Autorizado', this.objeto);
    }else {
      document.getElementById('finalizarPedidoUM').classList.add('is-active');
    }
  }


  /**********************************************INICIA AUTOCOMPLETE************************************************ */

    /**
     * Este método formatea los resultados de la busqueda en el autocomplte
     * @param data resultados de la busqueda
     * @return void
     */
    autocompleListFormatInsumo = (data: any) => {
      let html = `
      <div class="card">
          <div class="card-content">
              <div class="media">
                  <div class="media-content">
                      <p class="title is-5" style="color: black;">
                        <i class="fa fa-medkit" aria-hidden="true"></i>
                        &nbsp; ${data.clave}
                      </p>
                      <p class="subtitle is-6" style="color: black;">
                          <strong style="color: black;">&nbsp; Nombre: </strong>
                          <span style="color: black;"> ${data.descripcion ? data.descripcion : 'No disponible'} </span>
                      </p>
                  </div>
              </div>
          </div>
      </div>`;
      return this._sanitizer.bypassSecurityTrustHtml(html);
  }

    /**
     * Este método carga los datos de un elemento de la api con el id que se pase por la url
     * @param data json con los datos del objeto seleccionado del autocomplete
     * @return void
     */
    select_insumo_autocomplete(data) {
      this.insumo = data;
      if (data.precio_unitario == null) {
        this.mensajeResponse.texto = 'La clave ' + `<strong>${data.clave}</strong>` + ' no tiene precio unitario.';
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'warning';
        this.mensaje(0);
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
      } else {
        this.agregarInsumo();
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
      }
    }

    /*************************************************FINALIZA AUTOCOMPLETE************************************************************* */

  /**
   * Método para agregar programas al formulario reactivo
   */
  agregarInsumo() {
    let existe = false;

    /*** Forma para agregar a modelo ***/
    let ob_temporal = {
      insumo_medico_clave: this.insumo.clave,
      nombre: '',
      info_insumo : {
        descripcion: this.insumo.descripcion,
        es_causes: this.insumo.es_causes,
        tipo: this.insumo.tipo
      },
      es_unidosis: '',
      cantidad_x_envase: '',
      tipo: this.insumo.tipo,
      precio_unitario: this.insumo.precio_unitario,
      cantidad_solicitada: '',
      monto_solicitado: 0
    };

    for (let c = 0; c < this.form_dato.insumos.length; c++) {
      if (this.form_dato.insumos[c].insumo_medico_clave === this.insumo.clave) {
        existe = true;
        this.mensajeResponse.texto = 'La clave ' + `<strong>${this.insumo.clave}</strong>` + ' ya fue capturada.';
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'warning';
        this.mensaje(0);
        break;
      }
    }
    if (!existe) {
      let start_index = 0;
      let number_of_elements_to_remove = 0;
      this.form_dato.insumos.splice(start_index, number_of_elements_to_remove, ob_temporal);
    }
  }
  /**
   * Modelo para limpiar el formulario y cargar los datos de la API.
   */
  reset_form() {
    this.form_dato = {
      id	:	'',
      estatus	:	'BR',
      incremento	:	'',
      servidor_id	:	'',
      clues	:	'', // this.usuario.clues_activa.clues,
      clues_destino	:	'',
      tipo_insumo_id	:	null,
      tipo_pedido_id	:	'PCC',
      descripcion	:	'',
      pedido_padre	:	null,
      folio	:	'',
      fecha	:	'',
      fecha_concluido	:	null,
      fecha_expiracion	:	null,
      fecha_cancelacion	:	null,
      almacen_solicitante	:	null,
      almacen_proveedor	:	null,
      organismo_dirigido	:	null,
      acta_id	:	null,
      recepcion_permitida	:	null,
      observaciones	:	null,
      usuario_validacion	:	null,
      proveedor_id	:	null,
      total_monto_solicitado	:	null,
      total_monto_recibido	:	null,
      total_claves_solicitadas	:	null,
      total_claves_recibidas	:	null,
      total_cantidad_solicitada	:	null,
      total_cantidad_recibida	:	null,
      encargado_almacen_id	:	null,
      director_id	:	null,
      usuario_id	:	'',
      created_at	:	null,
      updated_at	:	null,
      deleted_at	:	null,
      insumos : [],
      metadato_compra_consolidada: {
        programa_id: '',
        fecha_limite_captura: '',
        lugar_entrega: '',
        presupuesto_compra: 0,
        presupuesto_causes: 0,
        presupuesto_no_causes: 0,
        presupuesto_causes_asignado: 0,
        presupuesto_no_causes_asignado: 0,
        presupuesto_causes_disponible: 0,
        presupuesto_no_causes_disponible: 0
      },
      unidad_medica: {
        clues	:	'',
        jurisdiccion_id	:	'',
        tipo	:	'',
        nombre	:	'',
        activa	:	'',
        director_id	:	''
      },
    };

    return true;

  }
  /**
   * Este método quita un formgrupo a un formarray, para crear un formulario dinamico
   * ejemplo <code>(click)="ctrl.quitar_form_array(ctrl.dato.controls.almacen_tipos_movimientos, i)"</code>
   * @param modelo Nombre del modelo donde se guarda el dato obtenido
   * @param i Posicion del elemento a eliminar
   * @return void
   */
  quitar_form_array(modelo, i: number) {
    modelo.splice(i, 1);

    // this.calcular_presupuesto_asignado();
    this.calcularSubtotal();
  }
  /**
   * Este método abre una modal
   * @param id identificador del elemento de la modal
   * @return void
   */
  abrirModal(id, index?) {
    if (index !== undefined && index !== '' && index !== null) {
      this.index_borrar = index;
    }
    document.getElementById(id).classList.add('is-active');
  }

  probarModal(arg) {
    console.log(arg);
  }

  /**
   * Este método cierra una modal.
   * @param id Identificador del elemento de la modal
   * @return void
   */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
    if (id === 'guardarMovimiento') {
      this.dato.controls.estatus.patchValue('BR');
    }
  }
  /**
   * Método que nos ayuda a comprobar que todos los campos de inicialización seean válidos, y a confirmar que se inicialice.
   */
  finalizar () {
    this.error_formulario = false;

    let txt;
    let person;
    let error_detener_envio = false;
    if (this.form_dato.estatus === '' || this.form_dato.estatus == null || this.form_dato.estatus === undefined) {
      this.mensajeResponse.texto = 'Formulario no enviado';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }
    if (this.form_dato.fecha === '' || this.form_dato.fecha == null || this.form_dato.fecha === undefined) {
      this.mensajeResponse.texto = 'Error en captura de la fecha';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.programa_id === '' ||
        this.form_dato.metadato_compra_consolidada.programa_id == null ||
        this.form_dato.metadato_compra_consolidada.programa_id === undefined) {
      this.mensajeResponse.texto = 'Programa no capturado';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.fecha_limite_captura === '' ||
        this.form_dato.metadato_compra_consolidada.fecha_limite_captura == null ||
        this.form_dato.metadato_compra_consolidada.fecha_limite_captura === undefined) {
      this.mensajeResponse.texto = 'Capturar la Fecha límite de captura';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
      this.form_dato.metadato_compra_consolidada.fecha_limite_captura = '';
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_compra === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_compra == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_compra === undefined ||
        this.form_dato.metadato_compra_consolidada.presupuesto_compra === 0) {
      this.mensajeResponse.texto = 'Error en el presupuesto de compra';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_causes === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto CAUSES';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_no_causes === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto NO CAUSES';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto CAUSES asignado';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(2);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto CAUSES asignado';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto NO CAUSES asignado';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto CAUSES disponible';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }
    if (this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible === '' ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible == null ||
        this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible === undefined) {
      this.mensajeResponse.texto = 'Error en el presupuesto NO CAUSES disponible';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    }

    if (this.form_dato.insumos.length === 0) {
      this.mensajeResponse.texto = 'Debe capturar al menos un insumo';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'warning';
      this.mensaje(0);
      error_detener_envio = true;
    } else {
      for (let c = 0; c < this.form_dato.insumos.length; c++) {
        if (this.form_dato.insumos[c].insumo_medico_clave === '' ||
            this.form_dato.insumos[c].insumo_medico_clave == null ||
            this.form_dato.insumos[c].insumo_medico_clave === undefined) {
              this.mensajeResponse.texto = 'Error en el listado de insumos';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'warning';
              this.mensaje(0);
              error_detener_envio = true;
            }
      }
    }
    if (error_detener_envio === true) {
      this.mensajeResponse.texto = 'Completar los datos requeridos';
      this.mensajeResponse.mostrar = true;
      this.mensajeResponse.clase = 'error';
      this.mensaje(3);
      this.error_formulario = true;
    } else {
      person = prompt('Por favor ingresa la palabra FINALIZAR PEDIDO, para continuar:', '');
      if (person === 'FINALIZAR PEDIDO') {
        this.form_dato.estatus = 'FI';  // y llamar a la función
        this.enviar();
          txt = 'User cancelled the prompt.';
      } else {
        this.mensajeResponse.texto = 'Formulario no enviado. La frase capturada no coincide con FINALIZAR PEDIDO';
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'warning';
        this.mensaje(3);
      }
    }
  }


  /**
   * Método para enviar el modelo a la API según si es para crear un nuevo registro o para actualizarlo.
   */
  enviar() {
    if (this.form_dato.id) {
      this.actualizarDatos(this.form_dato.id);
    } else {
      this.guardarDatos();
    }
  }
  /**
   * Metodo que envia la peticion a la API para crear un nuevo registro.
   */
  guardarDatos() {
    this.cargando = true;
    this.crudService.crear(this.form_dato, 'pedidos-cc-um').subscribe(
      resultado => {
        this.cargando = false;
        this.form_dato.id = resultado.id;
        this.cargarDatos(resultado.id);
        if (this.form_dato.estatus === 'BR') {
          this.router.navigate(['/pedidos/UM/editar', resultado.id]);
          this.cargarDatos(resultado.id);
        }

        this.mensajeResponse.texto = 'Se han guardado los cambios.';
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'success';
        this.mensaje(2);

      },
      error => {
        this.cargando = false;
        this.form_dato.estatus = 'BR';
        if (error.status === 500) {
            this.mensajeResponse.texto = '500 (Error interno del servidor)';
            this.mensajeResponse.mostrar = true;
            this.mensajeResponse.clase = 'error';
            this.mensaje(3);
        }

        try {
            let e = error.json();
            if (error.status == 401) {
                this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
            }
            // Problema de validación
            if (error.status === 409) {
                try {
                    for (let input in e.error) {
                        if (e.error.hasOwnProperty(input)) {
                            for (let i in e.error[input]) {
                                if (e.error[input].hasOwnProperty(i)) {
                                    for (let a in e.error[input][i]) {
                                        if (e.error[input][i].hasOwnProperty(a)) {
                                            this.mensajeResponse.titulo = a;
                                            this.mensajeResponse.texto = e.error[input][i][a];
                                            this.mensajeResponse.clase = 'error';
                                            this.mensaje(3);
                                        } else {
                                            this.mensajeResponse.titulo = input;
                                            this.mensajeResponse.texto = e.error[input][i];
                                            this.mensajeResponse.clase = 'error';
                                            this.mensaje(3);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    this.mensajeResponse.texto = 'Por favor verfique los campos marcados en rojo.';
                    this.mensajeResponse.clase = 'warning';
                    this.mensaje(8);
                }
            }
        } catch (e) {
            this.mensajeResponse.texto = 'No especificado.';
            this.mensajeResponse.mostrar = true;
            this.mensajeResponse.clase = 'error';
            this.mensaje(3);
            console.log(e);

            if (error.status == 500) {
                this.mensajeResponse.texto = '500 (Error interno del servidor)';
            } else {
                this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
            }
        }

      }
    );
  }

  /**
     * Este método envia los datos para actualizar un elemento con el id
     * que se envia por la url
     * @return void
     */
    actualizarDatos(id) {
      let editar = '/pedidos/UM';
      this.cargando = true;

      this.crudService.editar(id, this.form_dato, 'pedidos-cc-um').subscribe(
           resultado => {
              this.reset_form();
              if (resultado.estatus === 'FI') {
                  this.router.navigate([editar]);
              }
              if (resultado.estatus === 'BR') {
                  this.router.navigate(['/pedidos/UM/editar', resultado.id]);
                  this.cargarDatos(resultado.id);
              }
              this.cargando = false;

              this.mensajeResponse.texto = 'Se han guardado los cambios.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);
          },
          error => {
              this.cargando = false;
              this.form_dato.estatus = 'BR';

              this.mensajeResponse.texto = 'No especificado.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'alert';
              this.mensaje(2);
              try {
                  let e = error.json();
                  if (error.status == 401) {
                      this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                      this.mensajeResponse.clase = 'error';
                      this.mensaje(2);
                  }
                  // Problema de validación
                  if (error.status == 409) {
                      this.mensajeResponse.texto = 'Por favor verfique los campos marcados en rojo.';
                      this.mensajeResponse.clase = 'error';
                      this.mensaje(8);
                      for (let input in e.error) {
                          // Iteramos todos los errores
                          for (let i in e.error[input]) {
                              this.mensajeResponse.titulo = input;
                              this.mensajeResponse.texto = e.error[input][i];
                              this.mensajeResponse.clase = 'error';
                              this.mensaje(3);
                          }
                      }
                  }
              } catch (e) {
                  if (error.status == 500) {
                      this.mensajeResponse.texto = '500 (Error interno del servidor)';
                  } else {
                      this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                  }
                  this.mensajeResponse.clase = 'error';
                  this.mensaje(2);
              }

          }
      );
  }

  /**
   * Este método carga los datos de un elemento de la api con el id que se pase por la url
   * en la api, abre una ventana modal para confirmar la acción
   * @return void
   */
  cargarDatos(id) {
    if (this.reset_form()) {
      try {
          this.cargando = true;

          this.crudService.ver(id, 'pedidos-cc-um').subscribe(
              resultado => {
                this.form_dato = resultado;
                if (!this.form_dato.insumos || this.form_dato.insumos == null) {
                  this.form_dato.insumos = [];
                }
                if(this.form_dato.estatus === 'FI') {
                  this.enlaceAyuda = '/pedidos/UM/ver/' + this.form_dato.id;
                }
                if(this.form_dato.estatus === 'BR') {
                  this.enlaceAyuda = '/pedidos/UM/editar/' + this.form_dato.id;
                }

                if (this.form_dato.metadato_compra_consolidada == null) {
                  this.form_dato.metadato_compra_consolidada = {
                    programa_id: '',
                    fecha_limite_captura: '',
                    lugar_entrega: '',
                    presupuesto_compra: 0,
                    presupuesto_causes: 0,
                    presupuesto_no_causes: 0,
                    presupuesto_causes_asignado: 0,
                    presupuesto_no_causes_asignado: 0,
                    presupuesto_causes_disponible: 0,
                    presupuesto_no_causes_disponible: 0
                  };
                }
                this.form_dato.metadato_compra_consolidada.presupuesto_compra = this.form_dato.metadato_compra_consolidada.presupuesto_compra == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_compra);
                this.form_dato.metadato_compra_consolidada.presupuesto_causes = this.form_dato.metadato_compra_consolidada.presupuesto_causes == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes);
                this.form_dato.metadato_compra_consolidada.presupuesto_no_causes = this.form_dato.metadato_compra_consolidada.presupuesto_no_causes == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes);
                this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado = this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes_asignado);
                this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado = this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_asignado);
                this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible = this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_causes_disponible);
                this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible = this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible == null ? 0 : Number(this.form_dato.metadato_compra_consolidada.presupuesto_no_causes_disponible);
                                    
                this.cargando = false;
                this.cargarPedido = false;
                this.calcular_presupuesto_asignado();
                this.calcularSubtotal();

                this.mensajeResponse.titulo = 'Modificar';
                this.mensajeResponse.texto = 'Los datos se cargaron';
                this.mensajeResponse.clase = 'success';
                this.mensaje(2);
              },
              error => {
                  this.cargando = false;
                  this.cargarPedido = false;

                  this.mensajeResponse = new Mensaje(true);
                  this.mensajeResponse = new Mensaje(true);
                  this.mensajeResponse.mostrar;

                  try {
                      let e = error.json();
                      if (error.status == 401) {
                          this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                          this.mensajeResponse.clase = 'success';
                          this.mensaje(2);
                      }

                  } catch (e) {

                      if (error.status == 500) {
                          this.mensajeResponse.texto = '500 (Error interno del servidor)';
                      } else {
                          this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                      }
                      this.mensajeResponse.clase = 'error';
                      this.mensaje(2);
                  }

              }
          );
      } catch (e) {
          console.log(0, e);
      }
    }
  }
/**************************************NOTIFICATIONS******************************* */
/**
   * Este método muestra los mensajes resultantes de los llamados de la api
   * @param cuentaAtras numero de segundo a esperar para que el mensaje desaparezca solo
   * @param posicion  array de posicion [vertical, horizontal]
   * @return void
   */
  mensaje(cuentaAtras: number = 6, posicion: any[] = ['bottom', 'left']): void {
    let objeto = {
      showProgressBar: true,
      pauseOnHover: false,
      clickToClose: true,
      maxLength: this.mensajeResponse.texto.length
  };

  this.options = {
      position: posicion,
      // timeOut: cuentaAtras * 1000,
      timeOut: 0,
      lastOnBottom: true
  };
    if (this.mensajeResponse.titulo === '') {
        this.mensajeResponse.titulo = 'Pedido DAM';
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

  /*************************************IMPRESION DE REPORTES******************************** */

  /**
   *  Método que permite imprimir la salida manual de medicamentos por PDF.
   */
  imprimir() {
    try {
      this.cargandoPdf = true;
      let impresion_inicializacion = {
        datos: this.form_dato,
        lista: this.form_dato.insumos,
        usuario: this.usuario
      };
      this.pdfworker.postMessage(JSON.stringify(impresion_inicializacion));
    } catch (e) {
      this.cargandoPdf = false;
    }
  }

  base64ToBlob( base64, type ) {
      let bytes = atob( base64 ), len = bytes.length;
      let buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }
}