import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { createAutoCorrectedDatePipe } from 'text-mask-addons';
import * as moment from 'moment';
import  * as FileSaver    from 'file-saver';

import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
/**
 * Componente que muestra el formulario para crear una entrada estandar.
 */
@Component({
  selector: 'salidas-estandar-formulario',
  templateUrl: './formulario.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}'],
  host: {
        '(document:keydown)': 'handleKeyboardEvents($event)'
    }
})

export class FormularioComponent {
  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API,
   * y son los mismos datos que podemos ver al consultar una entrada de almacén.
   * @type {FormGroup}
   */
  dato: FormGroup;
  /**
   * Variable global que contiene el valor del índice del elemento a borrar,
   * cuando el modal que se va a abrir es un modal de confirmación de borrado.
   * Se hizo de manera global para poder conservar el valor del index hasta su eliminación.
   */
  index_borrar;
  /**
   * Varible que nos  muestra si está ocurriendo un proceso y ayuda a mostrar un gráfico en la vista
   * como retroalimentación al usuario.
   * @type {boolean}
   */
  cargando = false;
  /**
   * Contiene el valor de la tecla presionada por el usuario cuando se llama a la función handleKeyboardEvents(event: KeyboardEvent)
   */
  key;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Variable que muestra las notificaciones al usuario.
   * @type {Mensaje}
   */
  mensajeResponse: Mensaje = new Mensaje();
  /**
   * Pipe que formate la fecha que ingresa el usuario
   * @type {any}
   */
  autoCorrectedDatePipe: any = createAutoCorrectedDatePipe('yyyy-mm-dd');
  /**
   * Contiene la fecha MÍNIMA que puede ingresar el usuario para la fecha que fue hecha el movimiento.
   * @type {Date} */
  MinDate = new Date();
  /**
   * Contiene la fecha mínima de caducidad que puede tener medicamento para ingresarlo
   * @type {any}
   */
  MinDateCaducidad;
  /**
   * Contiene la fecha MÁXIMA que puede ingresar el usuario para la fecha que fue hecha el movimiento.
   * @type {Date} */
  MaxDate = new Date();
  /**
   * Contiene la fecha del día de hoy y es la que automáticamente se asigna a la fecha del movimiento, aunque el usuario puede
   * cambiarla hay un límite de una fecha mínima [MinDate]{@link FormularioComponent#MinDate} y
   * fecha máxima [MaxDate]{@link FormularioComponent#MaxDate}
   * @type {Date} */
  fecha_actual;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean} */
  tieneid = false;
  /**
   * Variable que nos sirve para identificar si estamos editando una entrada. Debido a
   * que la estructura del JSON de una entrada finalizada y un borrador son diferentes,
   * es necesario la variable. Cuando se intenta finalizar la entrada a partir de un borrador
   * si no se tiene la variable marca error porque al actualizar el valor del __status__ intenta mostrar la sección.
   * ```html
   * <section *ngIf="tieneid && ctrl.dato.get('estatus').value == 'FI' && estoymodificando == false">
   * ```
   * @type {boolean}
   */
  estoymodificando = false;
  /**
   * Se tuvo que crear la variable debido a que se debe hacer referencia únicamente cuando se esté actualizando
   * el catálogo de programas y no cada vez que se esté cargando otros elementos.
   */
  cargandoProgramas = false;

  /**
   * Variable que contiene un valor _true_ para mostrar la opción de cancelar entrada.
   */
  mostrarCancelado;
  /**
   * Objeto para los reportes con web Webworkers.
   * @type {Worker} */
  pdfworker: Worker;
  /**
   * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
   * @type {boolean} */
  cargandoPdf = false;
  insumo;
  /**
   * Variable que contiene un valor _true_ si el medicamento tiene valor unidosis y _false_ en caso contrario.
   * @type {boolean}
   */
  es_unidosis = false;
  lotes_insumo;

  /**
   * Guarda el resultado de la búsqueda de insumos médicos.
   * @type {array} */
  res_busq_insumos= [];

  /**
   * Contiene la lista de programas
   * @type {any} */
  lista_programas= [];

  /**
   * Contiene un valor __true__ cuando estamos llenando el formulario del borrador de una entrada
   * en caso de tener una entrada nueva o finalizada el valor es __false__.
   * @type {boolean} */
  llenando_formulario = true;

  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioComponent#res_busq_insumos}
   * @type {string} */
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  /**
   * Máscara para validar la entrada de la fecha de caducidad con el formato siguiente AAAA-MM-DD
   * @type {array}
   */
  mask = [/[2]/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];

  /**
   * Contiene los permisos del usuario, que posteriormente sirven para verificar si puede realizar o no
   * algunas acciones en este módulo.
   * @type {any} */
  permisos: any = [];

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
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone
    ) {}

  ngOnInit() {

    // obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    this.permisos = this.usuario.permisos;

    if (this.usuario.clues_activa) {
      this.insumos_term += '&clues=' + this.usuario.clues_activa.clues;
    }
    if (this.usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + this.usuario.almacen_activo.id;
    }

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/farmacia/movimientos/imprimir-entrada.js');

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

    // inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      actualizar: [false],
      tipo_movimiento_id: [1, [Validators.required]],
      estatus: ['FI'],
      fecha_movimiento: ['', [Validators.required]],
      observaciones: [''],
      programa_id: [''],
      cancelado: [''],
      observaciones_cancelacion: [''],
      movimiento_metadato: this.fb.group({
        persona_recibe: ['', [Validators.required]],
        servicio_id: [null],
        turno_id: [null],
      }),
      insumos: this.fb.array([])
    });

    // Identificar si se reciben el parámetro ID
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
      }
    });

    // nos suscribimos para saber si es un borrador, nueva entrada o una entrada finalizada
    this.dato.controls.id.valueChanges.subscribe(
      val => {
          if (val) {
            this.llenando_formulario = true;
            setTimeout(() => {
              if (this.dato.controls.estatus.value === 'BR') {
                this.llenarFormulario();
              }else {
                this.llenando_formulario = false;
              }
            }, 500);
          }
      }
    );
    if (!this.tieneid) {
      this.llenando_formulario = false;
    }

    // inicializar el data picker minimo y maximo
    let date = new Date();

    this.MinDate = new Date(date.getFullYear() - 1, 0, 1);
    this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.MinDateCaducidad = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();

    // si es nuevo poner la fecha actual si no poner la fecha con que se guardo
    if (!this.dato.get('fecha_movimiento').value) {
      this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
      this.dato.get('fecha_movimiento').patchValue(this.fecha_actual);
    } else {
      this.fecha_actual = this.dato.get('fecha_movimiento').value;
    }
    this.cargarCatalogo('programa');
  }
  /**
   * Función local para cargar el catalogo de programas, no se utilizó el cargarCatalogo del CRUD,
   * debido a que este catálogo no existen 'mis-programas', sino que es un catálogo general y se agregan
   * al arreglo únicamente aquellos programas que se encuentran activos (estatus = 1).
   * @param url Contiene la cadena con la URL de la API a consultar para cargar el catalogo del select.
   */
  cargarCatalogo(url) {
    this.cargandoProgramas = true;
    this.crudService.lista_general(url).subscribe(
      resultado => {
        this.cargandoProgramas = false;
        let contador = 0;
        for (let item of resultado) {
          if (item.estatus === 1 || item.estatus === '1') {
            this.lista_programas.push(item);
          }
        }
      }
    );
  }

  /**
   * Método que nos sirve para reacomodar los elementos en el formulario
   * para editarlos, en el avance de una entrada.
   * Se reordena el json recibido al formulario reactivo, los insumos que contienen un
   * array de lotes se reordenan colocando los campos para el formulario reactivo y cada
   * lote es parte de un solo insumo.
   */
  llenarFormulario() {
    const insumos_temporal = this.fb.array([]);
    const control_insumos = <FormArray>this.dato.controls['insumos'];

    let lotes;
    for ( let item of control_insumos.value) {
      if (item.lotes) {
        for (let lotes_item of item.lotes) {
          lotes = {
            'clave': item.clave,
            'nombre': item.nombre,
            'descripcion': item.descripcion,
            'es_causes': item.es_causes,
            'es_unidosis': item.es_unidosis,
            'lote': [lotes_item.lote, [Validators.required]],
            'id': lotes_item.id,
            'codigo_barras': [lotes_item.codigo_barras, [Validators.required]],
            'fecha_caducidad': [lotes_item.fecha_caducidad, [Validators.required]],
            'cantidad': [Number(lotes_item.cantidad), [Validators.required]],
            'cantidad_x_envase': Number(item.detalles.informacion_ampliada.cantidad_x_envase),
            'cantidad_surtida': 1,
            'movimiento_insumo_id': [lotes_item.movimiento_insumo_id],
            'stock_id': [lotes_item.stock_id],
          };
          insumos_temporal.insert(0, this.fb.group(lotes));
        }
      }
    }
    this.dato.controls['insumos'] = this.fb.array([]);

    const control_insumos2 = <FormArray>this.dato.controls['insumos'];
    for (let item of insumos_temporal.value) {
      control_insumos2.insert(0, this.fb.group(item));
    }
    this.llenando_formulario = false;
  }

  /**
   * Este método permite que el focus del cursor vuelva al buscador de insumos una vez presionada la tecla enter
   * @param event Parametro que contiene el valor de la tecla presionada
   * @return void
   */
  handleKeyboardEvents(event: KeyboardEvent) {
    this.key = event.which || event.keyCode;
    if (event.keyCode === 13) {
      document.getElementById('buscarInsumo').focus();
      event.preventDefault();
      return false;
    }
  }

  /**
   * Este método abre una modal.
   * @param id Identificador del elemento de la modal
   * @param index Variable que se recibe opcionalmente y contiene el valor del índice del elemento a borrar,
   * cuando el modal que se va a abrir es un modal de confirmación de borrado.
   */
  abrirModal(id, index?) {
    if (index || index === 0) {
      this.index_borrar = index;
    }
    document.getElementById(id).classList.add('is-active');
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
   * Este método formatea los resultados de la busqueda en el autocomplte
   * @param data resultados de la busqueda.
   * @return void
   */
  autocompleListFormatter = (data: any) => {
    let html = `
    <div class="card">
      <div class="card-content">
        <div class="media">          
          <div class="media-content">
            <p class="title is-4"><small>${data.descripcion}</small></p>
            <p class="subtitle is-6">
              <strong>Clave: </strong> ${data.clave}) 
              `;
              if(data.es_causes == 1)
                html += `<label class="tag is-success" ><strong>Cause </strong></label>`;
              if(data.es_causes == 0)
                html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);"><strong>No Cause </strong> </label>`; 
              if(data.es_unidosis == 1)
                html += `<label class="tag is-warning" ><strong>Unidosis</strong> </label>`;
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
    this.cargando = true;
    this.insumo = data;
    this.agregarLoteIsumo();
    (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
    this.res_busq_insumos = [];
    this.es_unidosis = data.es_unidosis;
    this.cargando = false;
  }

  /**
   * Este método agrega los lotes del modal a el modelo que se envía a la API.
   * @return void
   */
  agregarLoteIsumo() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];

    // comprobar que el isumo no este en la lista cargada
    var existe = false;
    /*comentamos esta comprobacion porque se pueden agregar más de un insumo con la misma clave
    for (let item of control.value) {
      if (item.clave == this.insumo.clave) {
        existe = true;
        break;
      }
    }*/
    // crear el json que se pasara al formulario reactivo tipo insumos
    let temporal_cantidad_x_envase;
    if (this.insumo.cantidad_x_envase == null){
      temporal_cantidad_x_envase = 1;
    }else {
      temporal_cantidad_x_envase = this.insumo.cantidad_x_envase;
    }
    var lotes = {
      'clave': this.insumo.clave,
      'nombre': this.insumo.nombre,
      'descripcion': this.insumo.descripcion,
      'es_causes': this.insumo.es_causes,
      'es_unidosis': this.insumo.es_unidosis,
      'lote': ['', [Validators.required]],
      'id': null,
      'codigo_barras': [''],
      'fecha_caducidad': ['', [Validators.required]],
      'cantidad': ['', [Validators.required]],
      'cantidad_x_envase': parseInt(temporal_cantidad_x_envase),
      'cantidad_surtida': 1,
      'movimiento_insumo_id': null,
      'stock_id': null,
    };

    // si no esta en la lista agregarlo
    if (!existe) {
      control.insert(0, this.fb.group(lotes));
    }
  }

  /**
   * Funcion para comprobar que se ingresen lotes diferentes
   */
  comprobarLote(insumo, i) {
    insumo = insumo.value;
    const control = <FormArray>this.dato.controls['insumos'];
    const ctrlLotes = <FormArray>control.controls[i];
    let lote_temporal = ''
    let existe = false;
    // for (let item of control.value) {
      for ( let c = 0; c < control.value.length; c++) {
      console.log(control.value[c]);
      if (control.value[c].clave === insumo.clave && control.value[c].lote === insumo.lote && c !== i) {
        this.notificacion.warn('Lote ' + ` <strong>` + insumo.lote + ` </strong>` + ' inválido',
                                'Error en clave ' + `<strong>` + insumo.clave + ` </strong>`
                                + '. El lote ' + ` <strong>` + insumo.lote + ` </strong>` + 'ya fue '
                                + `<strong> capturado anteriormente</strong>` , this.objeto);
        ctrlLotes.controls['lote'].patchValue('');
        existe = true;
        break;
      }
    }
  }

  /**
   * Este método agrega una nueva fila para los lotes nuevos
   * @return void
   */
  agregarNuevoLote() {
    this.lotes_insumo.push(
      {
        id: '' + Math.floor(Math.random() * (999)) + 1,
        codigo_barras: '',
        lote: '',
        fecha_caducidad: '',
        existencia: '',
        cantidad: '',
        nuevo: 1,
        existencia_unidosis: '',
        cantidad_unidosis: ''
      });
  }

  /**
     * Este método elimina los lotes nuevos que se agregaron a la lista de lotes
     * @return void
     */
  eliminarLote(index: number) {
    this.lotes_insumo.splice(index, 1);
  }

  /**
     * Este método quita un lote del la lista de insumos
     * @param i Posicion del insumo en la lista
     * @param val Object con los datos del lote
     * @param i2 Posicion del lote en la lista de lotes
     * @return void
     */
  quitar_lote_insumo(i, val, i2) {

    const control = <FormArray>this.dato.controls['insumos'];
    const ctrlLotes = <FormArray>control.controls[i];

    const ctrlLotesLote = <FormArray>ctrlLotes.controls['lotes'];

    ctrlLotesLote.removeAt(i2);

    var cantidad = ctrlLotes.controls['cantidad_surtida'].value - val.cantidad;
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
  }
  /**
   * Método que valida si la fecha de caducidad tiene un formato válido y si es mayor al periodo mínimo de caducidad (14 días).
   * @param fecha Variable que contiene la fecha de caducidad ingresada por el usuario para el insumo y lote correspondiente.
   * @param i Index de la posición del insumo al que corresponde la fecha de caducidad.
   */
  validar_fecha(fecha, i) {
    const control = <FormArray>this.dato.controls['insumos'];
    const ctrlLotes = <FormArray>control.controls[i];

    //let fecha_hoy = moment();
    let fecha_hoy = moment(this.dato.get('fecha_movimiento').value,'YYY-MM-DD');
    console.log(fecha_hoy);
    if (!moment(fecha, 'YYYY-MM-DD', true).isValid()) {
      this.notificacion.alert('Fecha inválida', 'Debe ingresar una fecha válida', this.objeto);
      ctrlLotes.controls['fecha_caducidad'].patchValue('');
    } else {
      if (moment(fecha, 'YYYY-MM-DD', true) <= fecha_hoy.add(14, 'days')) {
        ctrlLotes.controls['fecha_caducidad'].patchValue('');
        this.notificacion.alert('Fecha inválida', 'La fecha de caducidad debe ser mayor al ' +
         fecha_hoy.format('YYYY-MM-DD'), this.objeto);
      }
    }
  }


  /**
     * Este método valida que en el campo de la cantidad no pueda escribir puntos o signo negativo
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
   * Devuelve un valor Boolean que indica si existe o no un patrón en una cadena de búsqueda.
   * @param str Valor de la tecla presionada por el usuario.
   */
  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * Compureba que los insumos de la entrada sean mayores a 0.
   * Abre el modal 'guardarMovimiento' para confirmar que guarda la entrada como finalizada,
   * sin poder hacer cambios después.
   */
  guardar_movimiento() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];
    if (control.length === 0) {
      this.notificacion.warn('Insumos', 'Debe agregar por lo menos un insumo', this.objeto);
    }else {
      this.estoymodificando = true;
      this.dato.controls['estatus'].patchValue('FI');
      document.getElementById('guardarMovimiento').classList.add('is-active');
    }
  }
  /**
   * Método que es llamado cuando va a guardarse un avance.
   * Coloca 'BR' al estatus de la entrada y activa el botón
   * ```html
   * <span id="borrador" (click)="ctrl.enviar(false, '/almacen/entradas-estandar/editar');"></span>
   * ```
   * que envía al CRUD los datos correspondientes para guardar un borrador.
   */
  guardarBorrador() {
    this.dato.controls.estatus.patchValue('BR');
    document.getElementById('borrador').click();
  }

  /**
   * Este método envia los datos para actualizar un elemento con el id
   * que se envia por la url
   * @return void
   */
  actualizarDatos() {
      this.cargando = true;
      let dato;
      try {
          dato = this.dato.getRawValue();
      }catch (e) {
          dato = this.dato.value;
      }

      this.crudService.editar(this.dato.controls.id.value, dato, 'entrada-almacen').subscribe(
          resultado => {
              document.getElementById('actualizar').click();
              this.cargando = false;

              this.mensajeResponse.texto = 'Se han guardado los cambios.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);
          },
          error => {
              this.cargando = false;

              this.mensajeResponse.texto = 'No especificado.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'alert';
              this.mensaje(2);
              try {
                  let e = error.json();
                  if (error.estatus == 401) {
                      this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                      this.mensajeResponse.clase = 'error';
                      this.mensaje(2);
                  }
                  // Problema de validación
                  if (error.estatus == 409) {
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
                  if (error.estatus == 500) {
                      this.mensajeResponse.texto = '500 (Error interno del servidor)';
                  } else {
                      this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor ' +
                      'contacte con soporte técnico si esto vuelve a ocurrir.';
                  }
                  this.mensajeResponse.clase = 'error';
                  this.mensaje(2);
              }

          }
      );
  }


/***************************************** IMPRESION DE REPORTES ********************************************/


  /**
   * Método que permite imprimir la salida manual de medicamentos por PDF.
   */
  imprimir() {
    try {
      this.cargandoPdf = true;
      let entrada_imprimir = {
        datos: this.dato.value,
        lista: this.dato.value.insumos,
        usuario: this.usuario
      };
      this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
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
        timeOut: cuentaAtras * 1000,
        lastOnBottom: true
    };
    if (this.mensajeResponse.titulo === '') {
        this.mensajeResponse.titulo = 'Entradas de almacén';
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
