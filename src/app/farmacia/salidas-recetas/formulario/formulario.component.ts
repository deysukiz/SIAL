import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

import  * as FileSaver    from 'file-saver';
/**
 * Componente que se encarga de crear el formulario para
 * crear o ver una salida por receta.
 */
@Component({
  selector: 'salidas-recetas-formulario',
  templateUrl: './formulario.component.html',
  styles: [`
    ngui-auto-complete {
      z-index: 999999 !important
    }
    .b-checkbox {
      line-height: 1;
    }
    .select{
      width: 100%;
    }
    .b-checkbox label {
      position: relative;
      padding-left: 5px;
      cursor: pointer;
    }

    .b-checkbox label::before {
      content: "";
      position: absolute;
      width: 17px;
      height: 17px;
      left: 0;
      margin-left: -17px;
      border: 1px solid #dbdbdb;
      border-radius: 3px;
      background-color: #fff;
      transition: background .1s ease-in-out;
    }

    .b-checkbox label::after {
      position: absolute;
      width: 16px;
      height: 16px;
      left: 0;
      top: 5px;
      margin-left: -15px;
      font-size: 12px;
      line-height: 1;
      color: #363636;
    }

    .b-checkbox input[type="checkbox"],
    .b-checkbox input[type="radio"] {
      opacity: 0;
      z-index: 1;
      cursor: pointer;
    }

    .b-checkbox input[type="checkbox"]:focus + label::before,
    .b-checkbox input[type="radio"]:focus + label::before {
      outline: thin dotted;
      outline: 5px auto -webkit-focus-ring-color;
      outline-offset: -2px;
    }

    .b-checkbox input[type="checkbox"]:checked + label::after,
    .b-checkbox input[type="radio"]:checked + label::after {
      font-family: "FontAwesome";
      content: "";
    }

    .b-checkbox input[type="checkbox"]:indeterminate + label::after,
    .b-checkbox input[type="radio"]:indeterminate + label::after {
      display: block;
      content: "";
      width: 10px;
      height: 3px;
      background-color: #555555;
      border-radius: 2px;
      margin-left: -16.5px;
      margin-top: 7px;
    }

    .b-checkbox input[type="checkbox"]:disabled,
    .b-checkbox input[type="radio"]:disabled {
      cursor: not-allowed;
    }

    .b-checkbox input[type="checkbox"]:disabled + label,
    .b-checkbox input[type="radio"]:disabled + label {
      opacity: 0.65;
    }

    .b-checkbox input[type="checkbox"]:disabled + label::before,
    .b-checkbox input[type="radio"]:disabled + label::before {
      background-color: whitesmoke;
      cursor: not-allowed;
    }

    .b-checkbox.is-circular label::before {
      border-radius: 50%;
    }

    .b-checkbox.is-inline {
      margin-top: 0;
    }
  `],
  host: {
        '(document:keydown)': 'handleKeyboardEvents($event)'
    }
})

export class FormularioComponent {
  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API
   * y son los mismos datos que podemos ver al consultar una receta.
   * @type {FormGroup} */
  dato: FormGroup;
  /**
   * Varible que nos  muestra si está ocurriendo un proceso y ayuda a mostrar un gráfico en la vista como retroalimentación
   * al usuario.
   * @type {boolean} */
  cargando = false;
  /**
   * Varible que guarda el valor de la unidad de medida del insumo médico.
   * @type {any} */
  unidad_medida;
  /**
   * Varible que guarda el valor de la cantidad por envase del insumo médico.
   * @type {any} */
  cantidad_x_envase;
  /**
   * Varible que guarda el valor de la presentación del insumo médico.
   * @type {any} */
  presentacion_nombre;
  /**
   * Guarda el resultado de la búsqueda de insumos médicos.
   * @type {array} */
  res_busq_insumos= [];
  /**
   * Variable que se le asigna el valor __false__ cuando la suma de las cantidades de los lotes del insumo médico
   * NO es mayor a 0 ó algunos campos necesarios (dentro del modal) están vacíos, y se le asigna __true__ en caso contrario.
   * @type {boolean} */
  sum_cant_lotes = false;
  /**
   * Contiene la cantidad de medicamento recomendada a surtir calculada a partir de
   *  la dosis, frecuencia (hrs.) y duración(días).
   * @type {number} */
  cantidad_recomendada;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Contiene el valor de la tecla presionada por el usuario.
   * @type {any} */
  key;
  /**
   * Contiene los permisos del usuario, que posteriormente sirven para verificar si puede realizar o no
   * algunas acciones en este módulo.
   * @type {any} */
  permisos: any = [];
  /**
   * Contiene la fecha MÍNIMA que puede ingresar el usuario para la fecha que fue hecha el movimiento.
   * @type {Date} */
  MinDate = new Date();
  /**
   * Contiene la fecha MÁXIMA que puede ingresar el usuario para la fecha que fue hecha el movimiento.
   * @type {Date} */ 
  MaxDate = new Date();
  /**
   * Contiene la fecha del día de hoy y es la que automáticamente se asigna a la fecha del movimiento, aunque el usuario puede
   * cambiarla hay un límite de una fecha mínima [MinDate]{@link FormularioRecetaComponent#MinDate} y
   * fecha máxima [MaxDate]{@link FormularioRecetaComponent#MaxDate}
   * @type {Date} */
  fecha_actual;
  mostrarCancelado = false;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean} */
  tieneid = false;

  // # SECCION: Reportes
      /**
       * Objeto para los reportes con web Webworkers.
       * @type {Worker} */
      pdfworker: Worker;
      /**
       * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
       * @type {boolean} */
      cargandoPdf = false;
  // # FIN SECCION
  /**
   * Contiene un array con los tipos de receta disponibles.
   *  * | id | nombre |
   * | --- | --- |
   * | 1 | Normal |
   * | 2 | controlado |
   * @type {any[]} */
  tipos_recetas: any[] = [
                            { id: 1, nombre: 'Normal'},
                            { id: 2, nombre: 'Controlado'}
                          ];
  /**
   * Objeto que contiene la configuracion default para mostrar los mensajes,
   * posicion abajo izquierda, tiempo 5 segundos.
   * @type {Object}
   */
  public options = {
    position: ['top', 'left'],
    timeOut: 5000,
    lastOnBottom: true
  };
  lotes_insumo;

  objeto = {
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 2000
  };
  mostrar_lote = [];
  @ViewChildren('seguroPopular') seguroPopular;
  @ViewChildren('poliza') poliza;
  @ViewChildren('campoDr') campoDr;
  @ViewChildren('dosis') dosis;
  @ViewChildren('frecuencia') frecuencia;
  @ViewChildren('duracion') duracion;
  @ViewChildren('cant_recetada') cant_recetada;
  @ViewChildren('cant_surtida') cant_surtida;
  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioRecetaComponent#res_busq_insumos}
   * @type {string} */
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;
  /**
   * Contiene la URL donde se hace la búsqueda del personal médico.
   * @type {string} */
  public medicos_term = `${environment.API_URL}/personal-medico?tipo_personal=1&term=:keyword`;

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone,
    public http: Http) { }

  ngOnInit() {

    // obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    this.permisos = this.usuario.permisos;

    if (this.usuario.clues_activa) {
      this.insumos_term += '&clues=' + this.usuario.clues_activa.clues;
      this.medicos_term += '&clues=' + this.usuario.clues_activa.clues;
    }
    if (this.usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + this.usuario.almacen_activo.id;
      this.medicos_term += '&almacen=' + this.usuario.almacen_activo.id;
    }

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/farmacia/movimientos/receta.js');

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
      // open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };

    // inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: ['5', [Validators.required]],
      status: ['FI'],
      fecha_movimiento: ['', [Validators.required]],
      observaciones: [''],
      cancelado: [''],
      observaciones_cancelacion: [''],
      movimiento_metadato: this.fb.group({
        turno_id: ['', [Validators.required]]
      }),
      receta: this.fb.group({
        id: [''],
        folio: ['', [Validators.required]],
        tipo_receta: [''],
        fecha_receta: ['', [Validators.required]],
        doctor: ['', [Validators.required]],
        personal_clues_id: [''],
        paciente: ['', [Validators.required]],
        tiene_seguro_popular: [false, []],
        poliza_seguro_popular: [{value: '', disabled: true}, [Validators.required]],
        diagnostico: ['', [Validators.required]],
        imagen_receta: [''],
        servidor_id: [''],
        movimiento_id: [''],
        incremento: [''],
        tipo_receta_id: ['1', [Validators.required]],
        fecha_surtido: [''],
        folio_receta: [''],
        usuario_id: [''],
        receta_detalles: this.fb.array([])
      }),
      insumos: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
      }
    });


    // inicializar el data picker minimo y maximo
    var date = new Date();

    this.MinDate = new Date(date.getFullYear() - 1, 0, 1);
    this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // si es nuevo poner la fecha actual si no poner la fecha con que se guardo
    if (!this.dato.get('fecha_movimiento').value) {
      this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
      this.dato.get('fecha_movimiento').patchValue(this.fecha_actual);
    } else {
      this.fecha_actual = this.dato.get('fecha_movimiento').value;
    }

    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogos').click();
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
   * Método para volver requerido el campo de póliza de seguro. Se llama al método
   * cuando se da click al checkbox tiene_seguro_popular.
   */
  requerirCampo () {

    const formReceta = <FormArray>this.dato.controls['receta'];

    if (!formReceta.controls['tiene_seguro_popular'].value) {
      formReceta.get('poliza_seguro_popular').enable();
    } else {
      formReceta.get('poliza_seguro_popular').disable();
    }
  }

  /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
    this.dosis.first.nativeElement.value = '';
    this.duracion.first.nativeElement.value = '';
    this.frecuencia.first.nativeElement.value = '';
    this.cant_recetada.first.nativeElement.value = '';
    this.cant_surtida.first.nativeElement.value = '';
    this.sum_cant_lotes = false;
  }

  /****************************************************************************************************** */

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

  /********************************************************************************************* */
  /**
     * Este método formatea los resultados de la busqueda en el autocomplte
     * @param data resultados de la busqueda
     * @return void
     */
    autocompleListFormatMedico = (data: any) => {
        let html = `
        <div class="card">
            <div class="card-content">
                <div class="media">          
                    <div class="media-content">
                        <p class="title is-4" style="color: black;">
                            <i class="fa fa-user-md" aria-hidden="true"></i> &nbsp; ${data.nombre}
                        </p>
                        <p class="subtitle is-6" style="color: black;">
                            <strong style="color: black;">Título: </strong> Médico cirujano
                            <strong style="color: black;">&nbsp; Cédula: </strong>
                            <span style="color: black;"> ${data.cedula ? data.cedula : 'No disponible'} </span>
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
  select_medico_autocomplete(data) {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    const control_receta = <FormArray>this.dato.controls['receta'];
    //const ctrlDr = <FormArray>control_receta.controls['doctor'];
    const ctrlPersonalClues = <FormArray>control_receta.controls['personal_clues_id'];
    //ctrlDr.patchValue(data.nombre);
    ctrlPersonalClues.patchValue(data.id);
  }

  
  DoctorBuscador() {
    const control_receta = <FormArray>this.dato.controls['receta'];
    const ctrlDr = <FormArray>control_receta.controls['doctor'];
    //const ctrlPersonalClues = <FormArray>control_receta.controls['personal_clues_id'];
    //ctrlDr.patchValue(this.campoDr.first.nativeElement.value);
    //ctrlPersonalClues.patchValue(null);
    //console.log(ctrlPersonalClues);
  }

  /**
   * Este método formatea los resultados de la busqueda en el autocomplte de los insumos médicos
   * @param data resultados de la busqueda
   * @return void
   */
  autocompleListFormatter = (data: any) => {
    let html = `
    <div class="card">
      <div class="card-content">
        <div class="media">          
          <div class="media-content">
            <p class="title is-4">${data.descripcion}</p>
            <p class="subtitle is-6">
              <strong>Clave: </strong> ${data.clave}
              `;
    
              if(data.es_causes == 1)
              html += `<label class="tag is-success" ><strong>Cause </strong></label>`;
              if(data.es_causes == 0)
              html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);" ><strong>No Cause </strong> </label>`; 
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
  insumo;
  es_unidosis = false;
  /**
     * Este método carga los datos de un elemento de la api con el id que se pase por la url
     * @param data json con los datos del objetop seleccionado del autocomplete
     * @return void
     */
  select_insumo_autocomplete(data) {

    var usuario = JSON.parse(localStorage.getItem('usuario'));
    this.cargando = true;
    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + usuario.almacen_activo.id + '&clave=' + data.clave).subscribe(
      resultado => {

        this.lotes_insumo = resultado;
        this.insumo = data;

        //limpiar el autocomplete
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
        this.res_busq_insumos = [];

        //poner el titulo a la modal
        document.getElementById('tituloModal').innerHTML = ` ${data.descripcion} <br>
          <p aling="justify" style="font-size:12px">CANTIDAD POR ENVASE: 
          ${data.cantidad_x_envase ? data.cantidad_x_envase : 'Sin especificar' }</p> `;

        this.es_unidosis = data.es_unidosis;
        this.unidad_medida = data.unidad_medida;
        this.presentacion_nombre = data.presentacion_nombre;
        this.cargando = false;
        this.cantidad_x_envase = data.cantidad_x_envase ? data.cantidad_x_envase : 1;
        this.abrirModal('verLotes');
      },
      error => {
        this.cargando = false;
      }
    );
  }

  /**
     * Este método agrega los lotes del modal a el modelo que se envia a la api
     * @return void
     */
  agregarLoteIsumo(dosis, frecuencia, duracion, cantidad_recetada) {
    //obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];

    //crear el json que se pasara al formulario reactivo tipo insumos
    var lotes = {
      'clave': this.insumo.clave,
      'nombre': this.insumo.nombre,
      'descripcion': this.insumo.descripcion,
      'es_causes': this.insumo.es_causes,
      'es_unidosis': this.insumo.es_unidosis,
      'cantidad': 1,
      'cantidad_x_envase': this.insumo.cantidad_x_envase ? parseInt(this.insumo.cantidad_x_envase) : 1,
      'dosis': [dosis, [Validators.required]],
      'frecuencia': [frecuencia, [Validators.required]],
      'duracion': [duracion, [Validators.required]],
      'cantidad_recetada': [cantidad_recetada, [Validators.required]],
      'cantidad_surtida': 1,
      'unidad_medida': this.unidad_medida,
      'presentacion_nombre': this.presentacion_nombre,
      'lotes': this.fb.array([])
    };

    // comprobar que el isumo no este en la lista cargada
    var existe = false;
    for (let item of control.value) {
      if (item.clave === this.insumo.clave) {
        existe = true;
        break;
      }
    }
    // si no esta en la lista agregarlo
    if (!existe) {
      control.push(this.fb.group(lotes));
    }

    // obtener la ultima posicion para que en esa se agreguen los lostes
    var posicion = control.length - 1;
    // obtener el control del formulario en la posicion para agregar el nuevo form array que corresponde a los lotes
    const ctrlLotes = <FormArray>control.controls[posicion];
    // Mostrar ocultar los lotes en la vista al hacer clic en el icono de plus
    this.mostrar_lote[posicion] = false;

    var objeto = {
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
      maxLength: 2000
    };
    //recorrer la tabla de lotes del modal para obtener la cantidad 
    for (let item of this.lotes_insumo) {
      //agregar unicamente aquellos que tiene cantidad
      if (item.cantidad > 0) {
        var existe_lote = false;

        //si existe el isnumo validar que el lote no exista
        if (existe) {
          for (let l of ctrlLotes.controls['lotes'].controls) {
            //si el lote existe agregar unicamente la cantidad nueva
            if (l.controls.id.value == item.id) {
              existe_lote = true;
              //agregar la cantida nueva al lote
              let cantidad_lote: number = l.controls.cantidad.value + item.cantidad;
              
              //Si es nuevo entonces igualar la cantidad a la existencia
              if(item.nuevo){
                item.existencia = item.cantidad * 1;
              }

              //validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima      
              if (cantidad_lote > l.controls.existencia.value && item.nuevo == 0) {
                this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + l.controls.existencia.value, objeto);
                cantidad_lote = l.controls.existencia.value * 1;
              }
              l.controls.cantidad.patchValue(cantidad_lote);
              break;
            }
          }
        }
        // si el lote no existe agregarlo
        if (!existe_lote) {
          // Si es nuevo entonces igualar la cantidad a la existencia
          if (item.nuevo) {
            item.existencia = item.cantidad * 1;
          }

          // validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima        
          if (item.cantidad > item.existencia) {
            this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + item.existencia, objeto);
            item.cantidad = item.existencia * 1;
          }

          // agregar al formulario reactivo de lote
          ctrlLotes.controls['lotes'].push(this.fb.group(
            {
              id: item.id,
              nuevo: item.nuevo | 0,
              codigo_barras: item.codigo_barras ? item.codigo_barras : '' ,
              lote: item.lote,
              fecha_caducidad: item.fecha_caducidad,
              existencia: item.nuevo ? item.cantidad : item.existencia,
              cantidad: item.cantidad
            }
          ));
        }
      }
    }
    //sumamos las cantidades de los lotes
    let cantidad: number = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
    }
    //agregar la cantidad surtida
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
    this.cancelarModal('verLotes');
    this.sum_cant_lotes = false;
  }
  /**
     * Este método agrega una nueva fila para los lotes nuevos
     * @param posicion Posicion a mostrar el detalle de lotes
     * @return void
     */
  ver_lotes_asignados(posicion) {
    this.mostrar_lote[posicion] = !this.mostrar_lote[posicion];
  }
  /**
     * Este método agrega una nueva fila para los lotes nuevos
     * @return void
     */
  agregarNuevoLote() {
    this.lotes_insumo.push({ 
      id: '' + Math.floor(Math.random() * (999)) + 1, 
      codigo_barras: '', lote: '', fecha_caducidad: '', existencia: '', 
      cantidad: '', nuevo: 1, existencia_unidosis: '', cantidad_unidosis: '' });
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
     * Este método valida que la cantidad escrita en el lote por listado de insumos sea menor que la existencia
     * @param i Posicion del insumo en la lista
     * @param val Object con los datos del lote
     * @param i2 Posicion del lote en la lista de lotes
     * @return void
     */
  validar_cantidad_lote(i, val, i2) {
    if (val.controls.cantidad.value > val.controls.existencia.value && val.nuevo == 0) {
      var objeto = {
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 2000
      };
      this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + val.controls.existencia.value, objeto);
      val.controls.cantidad.patchValue(val.controls.existencia.value * 1);
    }
    //sumamos las cantidades de los lotes
    const control = <FormArray>this.dato.controls['insumos'];
    const ctrlLotes = <FormArray>control.controls[i];
    let cantidad: number = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
    }
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
  }
  /**
   * Verifica que la cantidad ingresada de los lotes a salir sea válida, si la suma de las 
   * cantidades de los lotes es cero, entonces no se activa el botón acpetar en el modal.
   */
  comprobar_cant_lotes() {
    let cantidad = 0;
    for (let l of this.lotes_insumo) {
      if (l.cantidad) {
        cantidad = Number(cantidad) + Number(l.cantidad);
      }
    }
    if (cantidad > 0 && this.dosis.first.nativeElement.value !== '' && this.frecuencia.first.nativeElement.value !== ''
      && this.duracion.first.nativeElement.value !== '' && this.cant_recetada.first.nativeElement.value !== '') {
      this.sum_cant_lotes = true;
    }else {
      this.sum_cant_lotes = false;
    }
  }
  /**
   * Función no permite escribir signos puntos o letras en el campo donde se manda a llamar esta función.
   * @param event Objeto que contiene las propiedades de la tecla presionada
   */
  quitar_punto(event) {
    if (this.is_numeric(event.key )) {
      return true;
    }else {
      return false;
    }
  }
  /**
   * Devuelve un valor Boolean que indica si existe o no un patrón en una cadena de búsqueda.
   * @param str Contiene el valor de tecla presionada por el usuario.
   */
  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  /**
     * Este método permite que colocar el cursor en el campo deseado
     * o al buscador de insumos una vez presionada la tecla enter.
     * @param event Parametro que contiene el valor de la tecla presionada
     * @return void
     */
  handleKeyboardEvents(event: KeyboardEvent) {
    if (document.activeElement.id === 'buscarMedico') {
      document.getElementById('buscarMedico').focus();
    } else {
      this.key = event.which || event.keyCode;
        if (event.keyCode === 13) {
          document.getElementById('buscarInsumo').focus();
          event.preventDefault();
          return false;
        }
    }
  }
  /**
   * Este método calcula la cantidad sugerida a surtir a partir de
   * la dosis, frecuencia (hrs.) y duración(días).
   * @param dosis Contiene la dosis del médicamento indicado por el médico,
   * el valor debe ser numérico sin decimales.
   * @param frecuencia Es la frecuencia en horas en que debe tomar el paciente el medicamento,
   * el valor debe ser numérico sin decimales.
   * @param duracion Es la cantidad de días que debe tomar el medicamento, el valor debe ser numérico sin decimales.
   */
  calcularCantidadSugerida(dosis, frecuencia, duracion) {
    let veces_al_dia = 24 / frecuencia;
    this.cantidad_recomendada  = veces_al_dia * dosis * Number(duracion);
    this.cantidad_recomendada = this.cantidad_recomendada / this.cantidad_x_envase;
    let temporal = '' + this.cantidad_recomendada;

    if ( this.cantidad_recomendada > parseInt(temporal, 10)) {
      this.cantidad_recomendada =  parseInt(temporal, 10) + 1;
    }
  }
  /**
   * Calcula la cantidad surtida sumando las cantidades de los lotes del insumo médico.
   * La suma se la asigna a la propiedad [cant_surtida]{@link FormularioRecetaComponent#cant_surtida}.
   */
  calcularCantidadSurtida() {
    let total_cantidad_surtida = 0;
    for (let item of this.lotes_insumo) {
      total_cantidad_surtida = item.cantidad ? total_cantidad_surtida + item.cantidad : total_cantidad_surtida + 0;
    }
    this.cant_surtida.first.nativeElement.value = total_cantidad_surtida;
    if (this.dosis.first.nativeElement.value === '' || this.frecuencia.first.nativeElement.value === ''
      || this.duracion.first.nativeElement.value === '' || this.cant_recetada.first.nativeElement.value === '') {
      this.sum_cant_lotes = false;
    }
  }
  /**
   * Este método permite validar la salida al dar click en guardar, verifica que hayan ingresado por lo menos un insumo
   * para poder llamar al modal de confirmación de la salida.
   */
  guardar_movimiento() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];
    let lotes = true;
    if (control.length === 0) {
      this.notificacion.warn('Insumos', 'Debe agregar por lo menos un insumo', this.objeto);
    }else {
      for (let item of control.value) {
        if (item.lotes.length === 0) {
          lotes = false;
        }
      }
      console.log(lotes);
      if (lotes) {
        document.getElementById('guardarMovimiento').classList.add('is-active');
      } else {
        document.getElementById('tituloGuardar').innerHTML = ` <br>
          <p aling="justify" style="font-size:12px; color: red"> Contiene insumos con existencia negada.</p>`;
        document.getElementById('guardarMovimiento').classList.add('is-active');
        this.notificacion.warn('Insumos', 'negarExistencia', this.objeto);
      }
    }
  }



  /***************************************IMPRESION DE REPORTES*************************************************/
  /**
   * Metodo que permite imprimir la receta en pdf.
   */
  imprimir() {
    var usuario = JSON.parse(localStorage.getItem('usuario'));
    const formReceta = <FormArray>this.dato.controls['receta'];

    
    try {
      this.cargandoPdf = true;
      var entrada_imprimir = {
        datos: this.dato.value,
        lista: this.dato.value.insumos,
        usuario: usuario,
        poliza: formReceta.controls['poliza_seguro_popular'].value ?
                formReceta.controls['poliza_seguro_popular'].value : 'No cuenta con póliza de Seguro Popular'
      };
      this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
    } catch (e){
      this.cargandoPdf = false;
      console.log(e);
    }   
  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }
}
