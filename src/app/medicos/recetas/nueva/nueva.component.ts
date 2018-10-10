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

@Component({
  selector: 'app-nueva',
  templateUrl: './nueva.component.html',
  styleUrls: ['./nueva.component.css'],
  styles: [`
    html, body {
      overflow:auto!important;
    }
    .akira-autocomplete {
      display: inline-block;
      position: absolute;
      z-index:999;
      width:100%;
      height:auto;
      max-height:120px;
      background:white;
      overflow-y:auto;
      overflow-x:hidden;
      font-size:0.8em;
      cursor:pointer;
      border: 1px solid #DDD;
    }
    .akira-autocomplete li.is-selected {
      background: #EEE;
      
    }
    .akira-autocomplete a{
      color: black;
      display:block;
      
    }
    .akira-autocomplete li:hover{
      background: #EFEFEF;
      
    }
    .akira-autocomplete p {
      padding:3px;
    }
    .akira-autocomplete li {
      border-bottom:1px solid #DDD;
    },


  `],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class NuevaComponent implements OnInit {

  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API
   * y son los mismos datos que podemos ver al consultar una receta.
   * @type {FormGroup} */
  dato: FormGroup;

  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API
   * y son los mismos datos que podemos ver al consultar una receta.
   * @type {FormGroup} */
  datoPaciente: FormGroup;


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

  @ViewChildren('autocompletePaciente') autocompletePaciente;


  @ViewChildren('seguroPopular') seguroPopular;
  @ViewChildren('poliza') poliza;
  //@ViewChildren('campoPac') campoPac;
  @ViewChildren('dosis') dosis;
  @ViewChildren('frecuencia') frecuencia;
  @ViewChildren('duracion') duracion;
  @ViewChildren('cant_recetada') cant_recetada;
  //@ViewChildren('cant_surtida') cant_surtida;
  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioRecetaComponent#res_busq_insumos}
   * @type {string} */
  public insumos_term = `${environment.API_URL}/insumos-auto?stock=true&term=:keyword`;
  /**
   * Contiene la URL donde se hace la búsqueda del personal médico.
   * @type {string} */
  public pacientes_term = `${environment.API_URL}/medicos/pacientes?term=:keyword`;

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
      this.pacientes_term += '&clues=' + this.usuario.clues_activa.clues;
    }
    /*if (this.usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + this.usuario.almacen_activo.id;
      this.pacienes_term += '&almacen=' + this.usuario.almacen_activo.id;
    }*/

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
    
      tipo_receta: [''],
      
      tipo_receta_id: ['1', [Validators.required]],
      fecha_receta: ['', [Validators.required]],  
      paciente_nombre: [''],    
      paciente_id: ['', [Validators.required]],
      diagnostico: ['', [Validators.required]],
      medico_id: [this.usuario.medico_id, [Validators.required]],

      insumos: this.fb.array([])
    });

    
    

    // inicializar el formulario reactivo paciente
  

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
    if (!this.dato.get('fecha_receta').value) {
      this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
    //  this.dato.get('fecha_receta').patchValue(this.fecha_actual);
    } else {
      this.fecha_actual = this.dato.get('fecha_receta').value;
    }

    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    // Akira comente esto porque no se que verga es
    //document.getElementById('catalogos').click();
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
/*
    const formReceta = <FormArray>this.dato.controls['receta'];

    if (!formReceta.controls['tiene_seguro_popular'].value) {
      formReceta.get('poliza_seguro_popular').enable();
    } else {
      formReceta.get('poliza_seguro_popular').disable();
    }*/
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
//    this.cant_surtida.first.nativeElement.value = '';
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
    // Akira: Esto no se ni paque lo dejaron si no lo ocupan pero bueno
    let url: string = '' + environment.API_URL + '/insumos-auto?stock=true&term=' + keyword + cabecera;
    //----------
    

    this.crudService.busquedaInsumos(keyword, 'insumos-auto',{stock:true, clues: this.usuario.clues_activa.clues}).subscribe(
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
  

    autocompleListFormatPaciente = (data: any) => {      
      let html = `<p>
        ${data.nombre}<br>
        <small><i class="fa fa-${data.sexo==1?"mars":"venus"}" style="font-size:1em;line-height:2em;"></i> ${data.sexo==1?"Hombre":"Mujer"}
        ${this.calcularEdad(new Date(data.fecha_nacimiento))} años</small>
      </p>`;
      return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  
  calcularEdad(fecha_nacimiento) { // birthday is a date
    var birthday = new Date(fecha_nacimiento);
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
    //this.cargando = true;
    
    this.insumo = data;
    this.res_busq_insumos = [];
    document.getElementById('tituloModal').innerHTML = ` ${data.descripcion} <br>
    <p aling="justify" style="font-size:12px">CANTIDAD POR ENVASE: 
    ${data.cantidad_x_envase ? data.cantidad_x_envase : 'Sin especificar' }</p> `;

    
    this.es_unidosis = data.es_unidosis;
    this.unidad_medida = data.unidad_medida;
    this.presentacion_nombre = data.presentacion_nombre;    
    this.cantidad_x_envase = data.cantidad_x_envase ? data.cantidad_x_envase : 1;

    this.abrirModal('verLotes');
    
    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
   /* this.crudService.lista(0, 1000, 'comprobar-stock?&clave=' + data.clave).subscribe(
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
    );*/
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
      
      'unidad_medida': this.unidad_medida,
      'presentacion_nombre': this.presentacion_nombre
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

    /*
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
    console.log("aqui no hay error")
    */
    /*//recorrer la tabla de lotes del modal para obtener la cantidad 
    
    for (let item of this.lotes_insumo) {
      console.log("que tal aca");
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
    }*/
    /*
    console.log("incluso yo debería ejecutarme")
    //sumamos las cantidades de los lotes
    let cantidad: number = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
    }
    //agregar la cantidad surtida
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);*/
    this.cancelarModal('verLotes');
    //this.sum_cant_lotes = false;
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
    //this.cant_surtida.first.nativeElement.value = total_cantidad_surtida;
    if (this.dosis.first.nativeElement.value === '' || this.frecuencia.first.nativeElement.value === ''
      || this.duracion.first.nativeElement.value === '' || this.cant_recetada.first.nativeElement.value === '') {
      this.sum_cant_lotes = false;
    }
  }
  /**
   * Este método permite validar la salida al dar click en guardar, verifica que hayan ingresado por lo menos un insumo
   * para poder llamar al modal de confirmación de la salida.
   */
  guardar_receta() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];
    let lotes = true;
    if (control.length === 0) {
      this.notificacion.warn('Insumos', 'Debe agregar por lo menos un insumo', this.objeto);
    }else {
      document.getElementById('modalGuardarReceta').classList.add('is-active');
    }
  }

  





  /*******************************************PACIENTES*********************************************/
  // Akira: tuve que hacer el autocomplete perdi mucho tiempo no mamen
  resultadosPaciente: any[] = [];
  mostrarAutocompletePaciente:boolean = false;
  seleccionarPaciente(item){
    console.log(item);
    for(var i in this.resultadosPaciente){
      this.resultadosPaciente[i].seleccionado = false;
    }
    item.seleccionado = true;
    this.mostrarAutocompletePaciente = false;

    this.autocompletePaciente.first.nativeElement.value = item.nombre;
    this.dato.get('paciente_id').patchValue(item.id);
  }
  buscandoAutocompletePaciente:boolean = false;
  buscarPaciente(term:string = ''){
    this.mostrarAutocompletePaciente = true;
    this.buscandoAutocompletePaciente = true;
    // Despues le metemos lo del subscribe pa que no mande un millon de peticiones por cada letra que vaya ingresando
    this.crudService.lista_personalizada({term: term, clues: this.usuario.clues_activa.clues },'medicos/pacientes').subscribe(
      resultado => {
        this.resultadosPaciente = resultado;
        for(var i in this.resultadosPaciente){
          this.resultadosPaciente[i].seleccionado = false;
          this.resultadosPaciente[i].edad = this.calcularEdad(this.resultadosPaciente[i].fecha_nacimiento);
        }
        this.buscandoAutocompletePaciente = false;

      }, error => {
        console.log(error);
        this.buscandoAutocompletePaciente = false;
      }
    )

    if(term == ""){
      this.dato.get('paciente_id').patchValue("");
    }


  }
  nuevoPaciente: any = {
    nombre:'',
    sexo: 1,
    fecha_nacimiento:'',
    no_expediente:'',
    no_afiliacion:''
  }
  erroresPaciente: any = {
    nombre:null,
    sexo: null,
    fecha_nacimiento:null,
  }
  mensajeErrorPaciente = '';
  enviandoDatosPaciente: boolean = false;
  agregarPaciente(){    
    this.abrirModal('modalNuevoPaciente');    
  }
  enviarDatosPaciente(){
    this.enviandoDatosPaciente = true;
    this.erroresPaciente = {
      nombre:null,
      sexo: null,
      fecha_nacimiento:null,
    }
    this.mensajeErrorPaciente = '';
    this.crudService.crear(this.nuevoPaciente,'medicos/pacientes').subscribe(
      respuesta => {
        this.enviandoDatosPaciente = false;
        console.log(respuesta);

       /* this.campoPac.first.nativeElement.value = respuesta.nombre;
        this.dato.patchValue({
          paciente: myValue1, 
        });*/
        this.autocompletePaciente.first.nativeElement.value = respuesta.nombre;
        this.dato.get('paciente_id').patchValue(respuesta.id);


        this.nuevoPaciente = {
          nombre:'',
          sexo: 1,
          fecha_nacimiento:'',
          no_expediente:'',
          no_afiliacion:''
        }
        this.cancelarModal('modalNuevoPaciente');
      }, error => {
        this.enviandoDatosPaciente = false;
        try {
          let e = error.json();
         
          switch(error.status){
            case 401: 
              this.mensajeErrorPaciente =  "No tiee permiso para realizar esta acción.";
              break;
            case 409:
              this.mensajeErrorPaciente = "Verifique la información marcada de color rojo";
              for (var input in e.error){
                // Iteramos todos los errores
                for (var i in e.error[input]){
                  this.erroresPaciente[input] = e.error[input][i];
                }                      
              }
              break;
            case 500:
              this.mensajeErrorPaciente = "500 (Error interno del servidor)";
              break;
            default: 
              this.mensajeErrorPaciente = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
        } catch (e){
          this.mensajeErrorPaciente = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
        }
      }
    )
  }
  /****************************************************************************************/


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
