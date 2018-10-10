import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'app-correcciones-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./../../../../../src/styles.css'],
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class FormularioComponent {
  @ViewChildren('cantidad_solicitada_unidosis') cantidad_solicitada_unidosisBoxViewChildren;

  dato: FormGroup;
  form_insumos: any;
  modo = 'N';
  tab = 1;
  cant_solicitada_valida = false;
  unidad_medida;
  array_turnos;
  array_servicios;
  sum_cant_lotes = false;
  clave_insumo_incorrecto;
  cantidad_total;
  insumo;
  insumo_a_cambiar;
  es_unidosis = false;
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  MinDate = new Date();
  MaxDate = new Date();
  fecha_actual;
  tieneid = false;
  cargando = false;
  fecha_movimiento;
  mostrarCancelado;
  lotes_a_cambiar;
  lotes_insumo = [];

  public options = {
    position: ['top', 'right'],
    timeOut: 5000,
    lastOnBottom: true
  };

  mostrar_lote = [];

  // # SECCION: Reportes
  pdfworker: Worker;
  cargandoPdf = false;
  // # FIN SECCION
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  /**
   * Guarda el resultado de la búsqueda de insumos médicos.
   * @type {array} */
  res_busq_insumos= [];
  /**
   * Objeto que contiene propiedades de los mensajes 
   * (showProgressBar, pauseOnHover, clickToClose, maxLength)
   * @type {Object}
   */
  objeto = {
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 3000
        };

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone) { }

  ngOnInit() {

    // obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

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
    this.pdfworker = new Worker('web-workers/farmacia/movimientos/salida.js')

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

    // inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: ['2', [Validators.required]],
      status: ['FI'],
      fecha_movimiento: ['', [Validators.required]],
      observaciones: [''],
      cancelado: [''],
      observaciones_cancelacion: [''],
      movimiento_metadato: this.fb.group({
        turno_id: ['', [Validators.required]],
        servicio_id: ['', [Validators.required]],
        persona_recibe: ['', [Validators.required]],
      }),
      insumos: this.fb.array([]),
      insumos_negados: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
      }
    });

    // variable para crear el array del formulario reactivo
    this.form_insumos = {
      tipo_movimiento_id: ['', [Validators.required]]
    };

    // inicializar el data picker minimo y maximo
    let date = new Date();

    this.MinDate = new Date(date.getFullYear() - 1, 0, 1);
    this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // si es nuevo poner la fecha actual si no poner la fecha con que se guardo
    if (!this.dato.get('fecha_movimiento').value) {
      this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
      this.dato.get('fecha_movimiento').patchValue(this.fecha_actual);
    } else {
      this.fecha_actual = this.dato.get('fecha_movimiento').value;
    }

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
    this.lotes_insumo = [];
    this.sum_cant_lotes = false;
    this.cant_solicitada_valida = false;
    document.getElementById('tituloInsumoCorrecto').innerHTML = ``;
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

    // Inicializamos variables, por si cambia de insumo en el autocomplete
    this.lotes_insumo = [];
    this.cargando = true;
    this.sum_cant_lotes = false;
    this.cant_solicitada_valida = false;

    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + this.usuario.almacen_activo.id + '&clave=' + data.clave).subscribe(
      resultado => {
        let unidosis_temporal: Number;
        let normal_temporal: Number;
        if (resultado.length > 0) {
          if ( this.clave_insumo_incorrecto === resultado[0].clave_insumo_medico) {
            console.log('La clave es igual', this.clave_insumo_incorrecto);
            document.getElementById('tituloInsumoCorrecto').innerHTML = `<p aling="justify" style="font-size:20px; color: red"> 
            <strong> Acción incorrecta </strong> </p>
            <p aling="justify" style="font-size:16px">La clave que ingresó es la misma que va a corregir.</p> 
            <p aling="justify" style="font-size:16px"> <strong>Ingrese la clave del insumo correcto<strong> </p>`;
          }else {
            // poner el titulo al insumo reemplazante
            document.getElementById('tituloInsumoCorrecto').innerHTML = `<p aling="justify" style="font-size:20px"> 
              <strong> ${data.descripcion} </strong> </p>
              <p aling="justify" style="font-size:14px">${data.descripcion}</p> 
              <p aling="justify" style="font-size:18px"> CANTIDAD POR ENVASE:
              ${data.cantidad_x_envase ? data.cantidad_x_envase : 'Sin especificar' }</p>`;

            this.lotes_insumo = resultado;
            this.insumo = data;
          }
        }else {
          document.getElementById('tituloInsumoCorrecto').innerHTML = `<p aling="justify" style="font-size:20px; color: red"> 
          <strong> Acción incorrecta </strong> </p>
          <p aling="justify" style="font-size:16px">Este insumo no tiene lotes disponibles para este almacén.</p> 
          <p aling="justify" style="font-size:16px"> <strong>Ingrese la clave del insumo correcto.<strong> </p>`;
        }


        // limpiar el autocomplete
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
        this.res_busq_insumos = [];

        this.es_unidosis = data.es_unidosis;
        this.unidad_medida = data.unidad_medida;

        this.cargando = false;
      },
      error => {
        this.cargando = false;
      }
    );
  }

  /**
     * Este método agrega los lostes del modal a el modelo que se envia a la api
     * @return void
     */
  agregarLoteInsumo() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];
    console.log(this.insumo_a_cambiar);

    // crear el json que se pasara al formulario reactivo tipo insumos
    let lotes = {
      // Insumo a reemplazar
      'clave': this.insumo.clave,
      'nombre': this.insumo.nombre,
      'descripcion': this.insumo.descripcion,
      'es_causes': this.insumo.es_causes,
      'es_unidosis': this.insumo.es_unidosis,
      'cantidad': 1,
      'presentacion_nombre': this.insumo.presentacion_nombre,
      'unidad_medida': this.insumo.unidad_medida,
      'cantidad_x_envase': this.insumo.cantidad_x_envase ? Number(this.insumo.cantidad_x_envase) : 1,
      'cantidad_surtida': 1,
      'modo_salida': this.modo,
      'lotes': this.fb.array([]),
      // Insumo correcto
      'clave_correcta': this.insumo_a_cambiar.clave,
      'nombre_correcta': this.insumo_a_cambiar.nombre,
      'descripcion_correcta': this.insumo_a_cambiar.descripcion,
      'es_causes_correcta': this.insumo_a_cambiar.es_causes,
      'es_unidosis_correcta': this.insumo_a_cambiar.es_unidosis,
      'cantidad_correcta': 1,
      'presentacion_nombre_correcta': this.insumo_a_cambiar.presentacion_nombre,
      'unidad_medida_correcta': this.insumo_a_cambiar.unidad_medida,
      'cantidad_x_envase_correcta': this.insumo_a_cambiar.cantidad_x_envase ? Number(this.insumo_a_cambiar.cantidad_x_envase) : 1,
      'cantidad_surtida_correcta': 1,
      'modo_salida_correcta': this.modo,
      'lotes_correctos': this.fb.array([])
    };

    // comprobar que el insumo no este en la lista cargada
    let existe = false;
    let posicion_existe = 0;

    for (let item of control.value) {
      if (item.clave === this.insumo.clave) {
        if (item.modo_salida === this.modo) {
          existe = true;
          break;
        }
      }
      posicion_existe++;
    }

    // si no esta en la lista agregarlo
    if (!existe) {
       console.log(lotes);
       control.push(this.fb.group(lotes));
    }

    // obtener la ultima posicion para que en esa se agreguen los lotes
    let posicion = posicion_existe; // control.length - 1;
    // obtener el control del formulario en la posicion para agregar el nuevo form array que corresponde a los lotes
    const ctrlLotes = <FormArray>control.controls[posicion];
    // Mostrar ocultar los lotes en la vista al hacer clic en el icono de plus
    this.mostrar_lote[posicion] = false;

    // recorrer la tabla de lotes del modal para obtener la cantidad
    for (let item of this.lotes_insumo) {
      // agregar unicamente aquellos que tiene cantidad normal o unidosis
      if (item.cantidad > 0) {
        let existe_lote = false;

        // si existe el insumo validar que el lote no exista
        if (existe) {
          for (let l of ctrlLotes.controls['lotes_correctos'].controls) {
            // si el lote existe agregar unicamente la cantidad nueva
            if (l.controls.id.value === item.id) {
              existe_lote = true;
              // agregar la cantida nueva al lote
              let cantidad_lote: number = l.controls.cantidad.value + item.cantidad;
              // agregar la cantida nueva al lote
              let cantidad_unidosis_lote: number = l.controls.cantidad.value + item.cantidad;

              // validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima 
              if (this.modo === 'N') {
                if (cantidad_lote > l.controls.existencia.value) {
                  this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + l.controls.existencia.value, this.objeto);
                  cantidad_lote = l.controls.existencia.value * 1;
                }
              }
              if (this.modo === 'U') {
                if (cantidad_lote > l.controls.existencia_unidosis.value) {
                  this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: '
                  + l.controls.existencia_unidosis.value, this.objeto);
                  cantidad_lote = l.controls.existencia_unidosis.value * 1;
                }
              }
              l.controls.cantidad.patchValue(cantidad_lote);
              // l.controls.cantidad.patchValue(cantidad_unidosis_lote);
              break;
            }
          }
        }
        // si el lote no existe agregarlo
        if (!existe_lote) {
          // validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima
          // Para Cantidad normal y unidosis
          if (item.nuevo) {
            item.existencia = item.cantidad * 1;
          }
          if (this.modo === 'N') {
            if (item.cantidad > item.existencia) {
              this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + item.existencia, this.objeto);
              item.cantidad = item.existencia * 1;
            }
          }
          if (this.modo === 'U') {
            {
              if (item.cantidad > item.existencia_unidosis) {
                this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + item.existencia_unidosis, this.objeto);
                item.cantidad = item.existencia_unidosis * 1;
              }
            }
          }

          // agregar al formulario reactivo de lote
          console.log(ctrlLotes);
          ctrlLotes.controls['lotes_correctos'].push(this.fb.group(
            {
              id: item.id,
              nuevo: item.nuevo | 0,
              codigo_barras: item.codigo_barras,
              lote: item.lote,
              fecha_caducidad: item.fecha_caducidad,
              existencia: item.nuevo ? item.cantidad : item.existencia,
              cantidad: item.cantidad,
              existencia_unidosis: item.nuevo ? item.cantidad : item.existencia_unidosis,
              modo_salida: this.modo,
            }
          ));
        }
      }
    }

    // sumamos las cantidades de los lotes
    let cantidad = 0;
    let cantidad_unidosis = 0;
    for (let l of ctrlLotes.controls['lotes_correctos'].value) {
      cantidad = cantidad + l.cantidad;
      cantidad_unidosis = cantidad_unidosis + l.cantidad;
    }

    // agregar la cantidad surtida y cantidad solicitada
    if (ctrlLotes.controls['modo_salida'].value === 'N') {
      ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
      if (existe) {
        console.log('Cantidad surtida con normal');
      }
    }
    if (ctrlLotes.controls['modo_salida'].value === 'U') {
      ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
      if (existe) {
        console.log('Cantidad surtida con unidosis');
      }
    }
    this.cancelarModal('actualizarInsumo');
    this.cancelarModal('negarExistencia');
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
      { id: '' + Math.floor(Math.random() * (999)) + 1, codigo_barras: '', lote: '', fecha_caducidad: '',
      existencia: '', cantidad: '', nuevo: 1, existencia_unidosis: '', cantidad_unidosis: '' });
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

    let cantidad = ctrlLotes.controls['cantidad_surtida'].value - val.cantidad;
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
    if (modo_salida === 'N') {
      if (val.controls.cantidad.value > val.controls.existencia.value) {
        this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + val.controls.existencia.value, this.objeto);
        val.controls.cantidad.patchValue(val.controls.existencia.value * 1);
      }
    }
    if (modo_salida === 'U') {
      if (val.controls.cantidad.value > val.controls.existencia_unidosis.value) {
        this.notificacion.alert('Cantidad Excedida', 'La cantidad maxima es: ' + val.controls.existencia_unidosis.value, this.objeto);
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

  comprobar_cant_lotes() {
    let cantidad = 0;
    let i = 0;
    // Hacer el recorrido del array del insumo correcto para sumar las cantidades de los lotes ingresados
    for (let l of this.lotes_insumo) {
      if (l.cantidad) {
        if (this.lotes_insumo[i].cantidad > this.lotes_insumo[i].existencia) {
          this.sum_cant_lotes = false;
          return false;
        }else {
          cantidad = Number(cantidad) + Number(l.cantidad);
        }
      }
      i++;
    }

    // Comprobar que la suma de los lotes ingresados sea igual a la cantidad total del insumo a reemplazar
    if (cantidad === this.cantidad_total) {
      this.sum_cant_lotes = true;
    }else {
      this.sum_cant_lotes = false;
    }
  }

  comprobar_cant_solicitada(value) {
    if (value > 0) {
      this.cant_solicitada_valida = true;
    }else {
      this.cant_solicitada_valida = false;
    }
  }

  quitar_punto(event) {
    if (this.is_numeric(event.key )) {
      return true;
    }else {
      return false;
    }
  }

  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  guardar_movimiento() {
    document.getElementById('guardarMovimiento').classList.add('is-active');
  }
  /**
     * Este método iguala variables y abre el modal para hacer el cambio de insumo.
     * @param item Object con los datos del insumo
     * @return void
     */
  cambiarInsumos(item) {
    this.insumo_a_cambiar = item;
    this.lotes_a_cambiar = item.lotes;
    this.clave_insumo_incorrecto = item.clave;
    this.cantidad_total = Number(item.cantidad);

    document.getElementById('tituloInsumo').innerHTML = `<p aling="justify" style="font-size:18px"> 
      <strong> ${item.descripcion} </strong> </p>
      <p aling="justify" style="font-size:12px">${item.descripcion}</p> 
      <p aling="justify" style="font-size:16px"> CANTIDAD POR ENVASE:
      ${item.detalles == null ? 'Sin especificar' : item.detalles.informacion_ampliada = null ?  'Sin especificar' :
        item.detalles.informacion_ampliada.cantidad_x_envase == null
        ? item.detalles.informacion_ampliada.cantidad_x_envase : 'Sin especificar' }</p>`;

    this.abrirModal('actualizarInsumo');
  }

  /************************************************IMPRESION DE REPORTES********************************************* */

  imprimir() {
    let turno;
    for (let item of this.array_turnos.clues_turnos){
      if (this.dato.value.movimiento_metadato.turno_id === item.id) {
        turno = item;
        break;
      }
    };
    let servicio;
    for (let item of this.array_servicios.clues_servicios){
      if (this.dato.value.movimiento_metadato.servicio_id === item.id) {
        servicio = item;
        break;
      }
    };
    try {
      this.cargandoPdf = true;
      let entrada_imprimir = {
        datos: this.dato.value,
        lista: this.dato.value.insumos,
        turno: turno,
        servicio: servicio,
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
      for ( let i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }

}
