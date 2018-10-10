import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';
import { Mensaje } from '../../../mensaje';
import { createAutoCorrectedDatePipe } from 'text-mask-addons';

import * as moment from 'moment';
import  * as FileSaver    from 'file-saver';
/**
 * Formulario para crear o ver una salida estandar.
 */
@Component({
  selector: 'app-salidas-estandar-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./../../../../../src/styles.css'],
  styles: ['ngui-auto-complete {z-index: 999999 !important}'],
  host: {
        '(document:keydown)': 'handleKeyboardEvents($event)'
    }
})

export class FormularioComponent {
  /**
   * Variable que contienen el total de la suma de los precios de los insumos más iva.
   * @type {Number}
   */
  total_precio: Number = 0;
  /**
   * Variable que contienen el total del iva de los insumos que son material de curación.
   * @type {Number}
   */
  total_iva: Number = 0;
  /**
   * Variable que contienen el total de la suma de los precios sin iva.
   * @type {Number}
   */
  subtotal_precios: Number = 0;
  /**
   * Variable que contiene la cantidad solicitada, su tipo es para que se pueda modificar en el DOM y en typescript.
   * @type ViewChildren
   */
  @ViewChildren('cantidad_solicitada') cantidad_solicitadaBoxViewChildren;
  /**
   * Variable que contiene la cantidad solicitada en forma de unidosis, su tipo es para que se pueda modificar en el DOM y en typescript.
   * @type ViewChildren
   */
  @ViewChildren('cantidad_solicitada_unidosis') cantidad_solicitada_unidosisBoxViewChildren;

  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API,
   * y son los mismos datos que podemos ver al consultar una salida de almacén.
   * @type {FormGroup} */
  dato: FormGroup;
  /**
   * Contiene el modo de salida del insumo 'N' hace referencia a una salida normal.
   * 'U' a una salida en unidosis.
   * @type {String} */
  modo = 'N';
  /**
   * Variable que contiene un valor _true_ si la cantidad solicitada es mayor a cero.
   * @type {boolean} */
  cant_solicitada_valida = false;
  /**
   * Se tuvo que crear la variable debido a que se debe hacer referencia únicamente cuando se esté actualizando
   * el catálogo de programas y no cada vez que se esté cargando otros elementos.
   */
  cargandoCatalogo = false;
  /**
   * Variable que contiene un valor _true_ si al sumar la cantidad de los lotes es mayor a cero.
   */
  sum_cant_lotes = false;
  /**
   * Contiene el valor de la tecla presionada por el usuario.
   * @type {any} */
  key;
  /**
   * Contiene la unidad de medida del insumo médico.
   */
  unidad_medida;
  /**
   * Contiene la lista de turnos disponibles en la CLUES.
   * @type {array}
   */
  array_turnos;
  /**
   * Contiene la lista de servicios disponibles en la CLUES.
   * @type {array}
   */
  array_servicios;
  /**
   * Contiene el index del insumo a borrar.
   */
  index_borrar;
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Array que contiene valores booleanos para ver o no, el detalle de cada insumo en la lista.
   */
  mostrar_lote = [];
  /**
   * Máscara para validar la entrada de la fecha de caducidad.
   */
  mask = [/[2]/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  autoCorrectedDatePipe: any = createAutoCorrectedDatePipe('yyyy-mm-dd');
  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioComponent#res_busq_insumos}
   * @type {string}
   */
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  objeto = {
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 2000
  };
  
  /**
   * Contiene la fecha MÍNIMA de CADUCIDAD que puede ingresar el usuario para la fecha que fue hecha la salida de almacen.
   * @type {Date} */
  MinDateCaducidad;
  /**
   * Contiene la fecha MÍNIMA que puede ingresar el usuario para la fecha que fue hecha la salida de almacen.
   * @type {Date} */
  MinDate = new Date();
  /**
   * Contiene la fecha MÁXIMA que puede ingresar el usuario para la fecha que fue hecha la salida de almacen.
   * @type {Date} */
  MaxDate = new Date();
  /**
   * Contiene la fecha del día de hoy y es la que automáticamente se asigna a la fecha del movimiento, aunque el usuario puede
   * cambiarla hay un límite de una fecha mínima [MinDate]{@link FormularioComponent#MinDate} y
   * fecha máxima [MaxDate]{@link FormularioComponent#MaxDate}
   * @type {Date} */
  fecha_actual;
  /**
   * Variable que sirve como bandera para saber si la fecha ingresada por el usuario es válida.
   */
  fecha_invalida = true;
  /**
   * Variable que si tiene un valor verdadero quiere decir que es un movimiento creado.
   */
  tieneid = false;
  /**
   * La variable toma un valor true cuando un proceso está activo.
   */
  cargando = false;
  mostrarCancelado;
  /**
   * Variable que guarda el resultado de la consulta a la API del insumo seleccionado.
   */
  lotes_insumo;
  /**
   * Guarda el resultado de la búsqueda de insumos médicos.
   * @type {array} */
  res_busq_insumos= [];

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
   * Crear la variable que mustra las notificaciones
   **/
  mensajeResponse: Mensaje = new Mensaje();
  /**
   * Texto que se muestra en las notificaciones.
   */
  titulo= 'Salidas estándar';

  /**
   * Objeto que contiene la configuracion default para mostrar los mensajes,
   * posicion abajo izquierda, tiempo 5 segundos.
   * @type {Object}
   */
  public options = {
    position: ['bottom', 'right'],
    timeOut: 2000,
    lastOnBottom: true
  };
  /**
   * Contiene la información del insumo elegido por el usuario, y que posteriormente será agregado a la lista de insumos médicos
   * de la entrada estándar, los valores se asignan a los campos correspondientes del formulario reactivo.
   */
  insumo;

  /**
   * Contiene la lista de programas
   * @type {any}
   */
  lista_programas= [];
  /**
   * Si el insumo seleccionado contiene el valor unidosis.
   * @type boolean
   */
  es_unidosis = false;
  /**
   * Contiene la clave del programa elegido por el usuario, nos sirve para hacer comparaciones en caso
   * de que el usuario intente cambiar el programa cuando hay insumos capturados.
   * @type {any}
   */
  programa_elegido= null;
  /**
   * Contiene el nombre del programa elegido por el usuario, nos sirve para mostrar el nombre en la vista para el usuario
   * @type {any}
   */
  nombre_programa_elegido= '';

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del módulo
   */
  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone) { }


  ngOnInit() {

    // obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem("usuario"));

    // Solo si se va a cargar catalogos poner un 
    // <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogos').click();
    document.getElementById('actualizar').click();

    if (this.usuario.clues_activa) {
      this.insumos_term += '&clues=' + this.usuario.clues_activa.clues;
    }
    if (this.usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + this.usuario.almacen_activo.id;
    }

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-estandar/salidas/salida-estandar.js');

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
      tipo_movimiento_id: ['18', [Validators.required]],
      estatus: ['FI'],
      fecha_movimiento: ['', [Validators.required]],
      observaciones: [''],
      cancelado: [''],
      programa_id: [null],
      subtotal: [''],
      total: [''],
      iva: [''],
      observaciones_cancelacion: [''],
      movimiento_metadato: this.fb.group({
        turno_id: ['', [Validators.required]],
        servicio_id: [''],
        persona_recibe: ['', [Validators.required]],
        unidad_medica_destino: ['', [Validators.required]],
      }),
      insumos: this.fb.array([]),
      insumos_negados: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;

        // this.subtotal_precios = temporal_subtotal_precios;
        // this.total_iva = temporal_total_iva;
        // this.total_precio = Number(this.subtotal_precios) + Number(this.total_iva);
      }
    });

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
    this.cargarCatalogo('programa', 'lista_programas', 'estatus');

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
  }

  /**
   * Método con el que comprobamos la lista de insumos antes de cambiar de programa.
   * En caso de que la lista tenga datos, debe confirmar el cambio para eliminar los insumos capturados,
   * y que se capturen los insumos del programa al que corresponde.
   */
  comprobar_lista () {
    const lista_insumos = <FormArray>this.dato.controls['insumos'];

    if (lista_insumos.value.length > 0) {
      this.abrirModal('cambiarPrograma');
    } else {
      this.programa_elegido = this.dato.controls.programa_id.value;
    }
  }

  /**
   * Método para asignar el valor del nuevo programa elegido o mantener el mismo programa.
   * @param respuesta Variable que contiene un valor _true_ si desea mantener el programa y  _false_ si el usuario desea cambiarlo.
   */
  mantenerPrograma (respuesta: boolean) {

    if (respuesta) {
      this.dato.get('programa_id').patchValue(this.programa_elegido);
    } else {
      this.programa_elegido = this.dato.controls.programa_id.value;
      this.dato.controls.insumos = this.fb.array([]);
    }
  }

  /**
     * Este método abre una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  abrirModal(id, index?) {
    if (index) {
      this.index_borrar = index;
    }
    document.getElementById(id).classList.add('is-active');
  }

  /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
    if (id  === 'verLotes') {
      this.cantidad_solicitadaBoxViewChildren.first.nativeElement.value = '';
      this.cantidad_solicitadaBoxViewChildren.first.nativeElement.focus();
    }
  }

  /**
   * Método de búsqueda de insumos en la API.
   * @param keyword Contiene la palabra que va a buscar.
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
    let programa = this.dato.controls.programa_id.value ? this.dato.controls.programa_id.value : '';
    this.crudService.busquedaInsumos(keyword, 'insumos-laboratorio-clinico-auto', {programa_id: programa}).subscribe(
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
     * @param data resultados de la busqueda 
     * @return void
     */
  autocompleListFormatter = (data: any) => {
    let html = `
    <div class="card">
      <div class="card-content">
        <div class="media">          
          <div class="media-content">
            <p class="title is-4"> <small>${data.descripcion}</small></p>
            <p class="subtitle is-6">
              <strong>Clave: </strong> ${data.clave}) 
              `;
    
              if(data.es_causes == 1)
              html += `<label class="tag is-success" ><strong>Cause </strong></label>`;
              if(data.es_causes == 0)
              html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);"><strong>No Cause </strong> </label>`; 
              if(data.es_unidosis == 1)                                                                 
              html += `<label class="tag is-warning" ><strong>Unidosis</strong></label>`;
              
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
    this.cargando = true;

    //cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + usuario.almacen_activo.id + '&programa_id=' + this.programa_elegido + '&clave=' + data.clave).subscribe(
      resultado => {
      
        let unidosis_temporal: Number; 
        let normal_temporal: Number; 
        for(let item of this.dato.get('insumos').value){
          if(resultado.length == 0)
            break;
          if(item.clave == resultado[0].clave_insumo_medico){
            var existencia_unidosis = 0;
            var existencia = 0;
            for (let val of item.lotes){
              for (let res of resultado){
                if (val.id === res.id) {
                 try {
                   if (val.cantidad > 0) {
                     if (item.modo_salida === 'U') {
                       res.existencia = res.existencia - (val.cantidad / item.cantidad_x_envase);
                     }
                     if (item.modo_salida === 'N') {
                       res.existencia = res.existencia - val.cantidad;
                     }
                       res.existencia_unidosis = (res.existencia * item.cantidad_x_envase);
                   }
                 }catch (e) {
                   console.log(e);
                 }
                }
              }
            }
          }
        }

        this.lotes_insumo = resultado;
        console.log(this.lotes_insumo);
        this.insumo = data;

        // limpiar el autocomplete
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
        this.res_busq_insumos = [];

        // poner el titulo a la modal
        document.getElementById('tituloModal').innerHTML = ` ${data.descripcion} <br>
          <p aling="justify" style="font-size:12px">${data.descripcion}</p> 
          <p aling="justify" style="font-size:16px"> CANTIDAD POR ENVASE: 
          ${data.cantidad_x_envase ? data.cantidad_x_envase : 'Sin especificar' }</p>`;
        this.es_unidosis = data.es_unidosis;
        this.unidad_medida = data.unidad_medida;

        this.cargando = false;
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
  agregarLoteIsumo(cantidad_solicitada: number) {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];

    console.log(this.insumo);

    // crear el json que se pasara al formulario reactivo tipo insumos
    var lotes = {
      'clave': this.insumo.clave,
      'nombre': this.insumo.nombre,
      'descripcion': this.insumo.descripcion,
      'es_causes': this.insumo.es_causes,
      'es_unidosis': this.insumo.es_unidosis,
      'cantidad': 1,
      'presentacion_nombre': this.insumo.presentacion_nombre,
      'unidad_medida': this.insumo.unidad_medida,
      'cantidad_x_envase': this.insumo.cantidad_x_envase ? parseInt(this.insumo.cantidad_x_envase) : 1,
      'cantidad_surtida': 1,
      'modo_salida': this.modo,
      'programa_nombre': '',
      'cantidad_solicitada': cantidad_solicitada, // this.modo == 'N' ? cantidad_solicitada : 0,
      'cantidad_solicitada_unidosis': cantidad_solicitada,// this.modo == 'U' ? cantidad_solicitada : 0,
      'tipo': this.insumo.tipo,
      'lotes': this.fb.array([])
    };

    // comprobar que el insumo no este en la lista cargada
    var existe = false;
    var existe_clave = false;
    var posicion_existe = 0;

    for (let item of control.value) {
      if (item.clave == this.insumo.clave) {
        existe_clave = true;
        if(item.modo_salida == this.modo){
          existe = true;
          break;
        }
      }
      posicion_existe++;
    }



    // si no esta en la lista agregarlo
    if (!existe) {
      control.push(this.fb.group(lotes));
    }

    // obtener la ultima posicion para que en esa se agreguen los lotes
    var posicion = posicion_existe;
    // control.length - 1;
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
    this.options = {
      position: ['top', 'right'],
      timeOut: 5000,
      lastOnBottom: true
    };
    //recorrer la tabla de lotes del modal para obtener la cantidad 
    for (let item of this.lotes_insumo) {
      console.log(item);
      //agregar unicamente aquellos que tiene cantidad normal o unidosis
      if (item.cantidad > 0) {
        var existe_lote = false;

        //si existe el insumo validar que el lote no exista
        if (existe) {
          for (let l of ctrlLotes.controls['lotes'].controls) {
            //si el lote existe agregar unicamente la cantidad nueva
            if (l.controls.id.value == item.id) {
              existe_lote = true;
              //agregar la cantida nueva al lote
              let cantidad_lote: number = l.controls.cantidad.value + item.cantidad;
              //agregar la cantida nueva al lote
              let cantidad_unidosis_lote: number = l.controls.cantidad.value + item.cantidad;

              //validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima 
              if(this.modo=='N'){
                if (cantidad_lote > l.controls.existencia.value) {
                  this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + l.controls.existencia.value, objeto);
                  cantidad_lote = l.controls.existencia.value * 1;
                }
              }
              if(this.modo=='U'){
                if (cantidad_lote > l.controls.existencia_unidosis.value) {
                  this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + l.controls.existencia_unidosis.value, objeto);
                  cantidad_lote = l.controls.existencia_unidosis.value * 1;
                }
              }
              l.controls.cantidad.patchValue(cantidad_lote);
              //l.controls.cantidad.patchValue(cantidad_unidosis_lote);
              break;
            }
          }
          this.sumaTotal();
        }
        // si el lote no existe agregarlo
        if (!existe_lote) {
          // validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima
          // Para Cantidad normal y unidosis
          if(item.nuevo){
            item.existencia = item.cantidad * 1;
          }
          if(this.modo == 'N'){
            if (item.cantidad > item.existencia) {
              this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + item.existencia, objeto);
              item.cantidad = item.existencia * 1;
            }
          }
          if(this.modo == 'U'){
            {
              if (item.cantidad > item.existencia_unidosis) {
                this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + item.existencia_unidosis, objeto);
                item.cantidad = item.existencia_unidosis * 1;
              }
            }
          }

          console.log(item);
          // agregar al formulario reactivo de lote
          ctrlLotes.controls['lotes'].push(this.fb.group(
            {
              id: item.id,
              nuevo: item.nuevo | 0,
              codigo_barras: item.codigo_barras,
              lote: item.lote,
              fecha_caducidad: item.fecha_caducidad,
              existencia: item.nuevo ? item.cantidad : item.existencia,
              exclusivo: this.dato.controls.programa_id == null ? 0 : 1,
              cantidad: item.cantidad,
              existencia_unidosis: item.nuevo ? item.cantidad : item.existencia_unidosis,
              modo_salida: this.modo,
              programa_id: this.programa_elegido == null ? Number(item.programa_id) : this.programa_elegido,
              programa_nombre: item.programa ? item.programa.nombre : '',
              precio_unitario: item.movimiento_insumo ? item.movimiento_insumo.precio_unitario : 0
            }
          ));
          this.sumaTotal();
        }
      }
    }

    // sumamos las cantidades de los lotes
    let cantidad: number = 0;
    let cantidad_unidosis: number = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
      cantidad_unidosis = cantidad_unidosis + l.cantidad;
    }

    // agregar la cantidad surtida y cantidad solicitada
    if (ctrlLotes.controls['modo_salida'].value == 'N') {
      ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
      if (existe) {
        let temp_cant_solicitada: number = ctrlLotes.controls['cantidad_solicitada'].value;
        cantidad_solicitada = Number(temp_cant_solicitada) + Number(cantidad_solicitada);
        ctrlLotes.controls['cantidad_solicitada'].patchValue(cantidad_solicitada);
      }
    }
    if (ctrlLotes.controls['modo_salida'].value == 'U') {
      ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
      if (existe) {
        let temp_cant_solicitada: number = ctrlLotes.controls['cantidad_solicitada'].value;
        cantidad_solicitada = Number(temp_cant_solicitada) + Number(cantidad_solicitada);
        ctrlLotes.controls['cantidad_solicitada'].patchValue(cantidad_solicitada);
      }
    }
    this.cancelarModal('verLotes');
    this.cancelarModal('negarExistencia');
    this.cantidad_solicitadaBoxViewChildren.first.nativeElement.value = '';
    this.cantidad_solicitadaBoxViewChildren.first.nativeElement.focus();
    this.cant_solicitada_valida = false;
    this.sum_cant_lotes = false;
    this.modo = 'N';
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
    this.lotes_insumo.push(
      {
        id: '' + Math.floor(Math.random() * (999)) + 1,
        codigo_barras: '', lote: '',
        fecha_caducidad: '',
        exclusivo: this.dato.controls.programa_id == null ? 0 : 1,
        existencia: '',
        cantidad: '',
        nuevo: 1,
        programa_nombre: this.dato.controls.programa_id == null ? '' : this.dato.controls.programa_id,
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
     * Este método valida que la cantidad escrita en el lote por listado de isnumos sea menor que la existencia
     * @param i Posicion del insumo en la lista
     * @param val Object con los datos del lote
     * @param i2 Posicion del lote en la lista de lotes
     * @return void
     */
  validar_cantidad_lote(i, val, i2, modo_salida) {
    if(modo_salida == 'N'){
      if (val.controls.cantidad.value > val.controls.existencia.value) {
        var objeto = {
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 2000
        };
        this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + val.controls.existencia.value, objeto);
        val.controls.cantidad.patchValue(val.controls.existencia.value * 1);
      }
    }
    if(modo_salida == 'U'){
      if (val.controls.cantidad.value > val.controls.existencia_unidosis.value) {
        var objeto = {
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 2000
        };
        this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + val.controls.existencia_unidosis.value, objeto);
        val.controls.cantidad.patchValue(val.controls.existencia_unidosis.value * 1);
      }
    }
    // sumamos las cantidades de los lotes
    const control = <FormArray>this.dato.controls['insumos'];
    const ctrlLotes = <FormArray>control.controls[i];
    let cantidad = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
    }
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
  }

  /**
   * Comprueba que la suma de la cantidad a entregar de los lotes sea mayor a cero.
   */
  comprobar_cant_lotes() {
    let cantidad = 0;
    for (let l of this.lotes_insumo) {
      if(l.cantidad)
        cantidad = Number(cantidad) + Number(l.cantidad);
    }
    if(cantidad>0){
      this.sum_cant_lotes = true;
    }else{
      this.sum_cant_lotes = false;
    }
  }

  /**
   * 
   * @param value Comprueba que la cantidad solicitada sea mayor a cero.
   */
  comprobar_cant_solicitada(value) {
    if (value>0) {
      this.cant_solicitada_valida = true;
    }else{
      this.cant_solicitada_valida = false;
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

  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  validar_fecha() {
    let fecha_ingresada;
    let fecha_hoy = moment();
    let cont = 0;
    for (let valor of this.lotes_insumo) {
      fecha_ingresada = moment(valor.fecha_caducidad, 'YYYY-MM-DD');
      if (valor.nuevo) {
        if (!fecha_ingresada.isValid()) {
          cont++;
          this.mensajeResponse.texto = 'Debe ingresar una fecha válida';
          this.mensajeResponse.clase = 'warning';
          this.mensaje(8);
        } else {
          if (fecha_ingresada <= fecha_hoy) {
            cont++;
            this.mensajeResponse.texto = 'La fecha de caducidad debe ser mayor al día de hoy';
            this.mensajeResponse.clase = 'warning';
            this.mensaje(8);
          }
        }
      }
    }

    if (cont > 0) {
      this.fecha_invalida = false;
    } else {
      this.fecha_invalida = true;
    }
  }
  /**
   * Método que comprueba si al menos hay un insumo en la lista de salida para poder guardar la salida de almacén
   */
  guardar_movimiento() {
    let lotes = true;
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];
    if (control.length === 0) {
      this.notificacion.warn('Insumos', 'Debe agregar por lo menos un insumo', this.objeto);
    }else {
      for (let item of control.value) {
        if (item.lotes.length === 0) {
          lotes = false;
        }
      }
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
   * Método en el que se hace la suma de los precios de los insumos, debemos sacar el IVA en caso de que sea Material de Curación
   * y sumar todo para obtener el total de la factura.
   */
  sumaTotal() {
    const control = <FormArray>this.dato.controls['insumos'];
    let temporal_total_iva = 0, temporal_total_precio = 0, temporal_subtotal_precios = 0, importe = 0;

    for (let c = 0; c < control.value.length; c++) {
      console.log(control.value[c]);
      for (let item of control.value[c].lotes) {
        importe = Number(item.cantidad) * Number(item.precio_unitario);
        temporal_subtotal_precios = temporal_subtotal_precios + Number(importe);
        if (control.value[c].tipo === 'MC') {
          temporal_total_iva = temporal_total_iva + ( importe * .16);
        }
      }
    }


    // if (this.dato.value.estatus === 'FI' && this.tieneid) {
    //   for (let c = 0; c < control.value.length; c++) {
    //     for (let item of control.value[c].lotes) {
    //       temporal_subtotal_precios = temporal_subtotal_precios + Number(item.importe);
    //       if (control.value[c].tipo === 'MC') {
    //         temporal_total_iva = temporal_total_iva + ( item.importe * .16);
    //       }
    //     }
    //   }
    // } else {
    //   for (let i = 0; i < control.value.length; i++) {
    //     temporal_subtotal_precios = temporal_subtotal_precios + control.value[i].importe;
    //     if (control.value[i].tipo === 'MC') {
    //       temporal_total_iva = temporal_total_iva + ( control.value[i].importe * .16);
    //     }
    //   }
    // }

    this.subtotal_precios = temporal_subtotal_precios;
    this.total_iva = temporal_total_iva;
    this.total_precio = Number(this.subtotal_precios) + Number(this.total_iva);
  }

  /**************************************************** NOTIFICATIONS ********************************************************************** */

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
            this.mensajeResponse.titulo = this.titulo;
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

  /******************************* IMPRESION DE REPORTES *********************************** */

  imprimir() {
    this.cargando= true;
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    let turno;
    this.crudService.verIniciar('documentos-firmantes/2').subscribe(
      resultado => {
              for (let item of this.array_turnos.clues_turnos){
                if (this.dato.value.movimiento_metadato.turno_id === item.id) {
                  turno = item;
                  break;
                }
              };
              try {
                this.cargandoPdf = true;
                let entrada_imprimir = {
                  datos: this.dato.value,
                  lista: this.dato.value.insumos,
                  turno: turno ? turno : 'No disponible',
                  firmas: resultado,
                  usuario: usuario
                };
                this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
              } catch (e) {
                this.cargandoPdf = false;
              }
              this.cargando = false;
            },
            error => {
              this.cargandoPdf = false;
              this.mensajeResponse.mostrar = true;
              try {
                  let e = error.json();
                  if (error.estatus === 401) {
                      this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                      this.mensajeResponse.clase = 'danger';
                      this.mensaje(2);
                  }
              } catch (e) {
                  if (error.estatus === 500) {
                      this.mensajeResponse.texto = '500 (Error interno del servidor)';
                  } else {
                      this.mensajeResponse.texto =
                        'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                  }
                  this.mensajeResponse.clase = 'danger';
                  this.mensaje(2);
              }
            }
    );
  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }

}
