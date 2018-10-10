import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';

import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'app-ajuste-mas-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./../../../../../src/styles.css'],
  styles: ['ngui-auto-complete {z-index: 999999 !important}'],
  host: {
        '(document:keydown)': 'handleKeyboardEvents($event)'
    }
})

export class FormularioComponent {
  key;
  lotes_insumo;
  dato: FormGroup;
  form_insumos: any;
  modo = 'N';
  tab = 1;
  cant_solicitada_valida = false;
  unidad_medida;
  array_turnos;
  array_servicios;
  sum_cant_lotes = false;
  mostrar_lote = [];
  cantidad_error = 0;
  tipos_ajustes: any[] = [
                          { id: 1, nombre: 'Merma'},
                          { id: 2, nombre: 'Caducidad'},
                          { id: 3, nombre: 'Robo'}
                        ];
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  MinDate = new Date();
  MaxDate = new Date();
  fecha_actual;
  tieneid = false;
  cargando = false;
  fecha_movimiento;
  mostrarCancelado;
  insumo;
  es_unidosis = false;
  // # SECCION: Reportes
    pdfworker: Worker;
    cargandoPdf = false;
  // # FIN SECCION

  // Crear la variable que mustra las notificaciones
  mensajeResponse: Mensaje = new Mensaje();
  titulo= 'Ajuste menos de inventario';

  // mostrar notificaciones configuracion default, posicion abajo izquierda, tiempo 2 segundos
  public options = {
    position: ['bottom', 'right'],
    timeOut: 2000,
    lastOnBottom: true
  };

  objeto = {
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 2000
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
    let usuario = JSON.parse(localStorage.getItem('usuario'));


    if (usuario.clues_activa) {
      this.insumos_term += '&clues=' + usuario.clues_activa.clues;
    }
    if (usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + usuario.almacen_activo.id;
    }

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/inventario/ajuste-menos.js');

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
      tipo_ajuste: ['1', [Validators.required]],
      observaciones: ['', [Validators.required]],
      tipo_movimiento_id: ['7', [Validators.required]],
      insumos: this.fb.array([])
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
    this.cant_solicitada_valida = false;
    this.sum_cant_lotes = false;
    this.modo = 'N';
    this.cantidad_error = 0;
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
              <strong>Clave: </strong> ${data.clave}
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

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.cargando = true;

    // cargar los datos de los lotes del insumo seleccionado en el autocomplete
    this.crudService.lista(0, 1000, 'comprobar-stock?almacen=' + usuario.almacen_activo.id + '&clave=' + data.clave).subscribe(
      resultado => {
        let unidosis_temporal: Number;
        let normal_temporal: Number;
        let array_temporal = [];
        for (let item of this.dato.get('insumos').value){
          if (resultado.length === 0) {
            break;
          }
          if (item.clave === resultado[0].clave_insumo_medico) {
            let existencia_unidosis = 0;
            let existencia = 0;
            for (let val of item.lotes){
              for (let res of resultado){
                if (val.id === res.id) {
                 try {
                   res.cantidad = val.cantidad;
                   res.nueva_existencia = val.nueva_existencia;
                 }catch (e) {
                   console.log(e);
                 }
                }
              }
              if (val.nuevo === 1) {
                array_temporal.push(val);
              }
            }
          }
        }
        try {
          if (array_temporal.length > 0) {
            for (let item of array_temporal) {
              resultado.push(item);
            }
          }
        }catch (e) {
          console.log(e);
        }
        this.lotes_insumo = resultado;
        this.insumo = data;

        // limpiar el autocomplete
        (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';

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
      });
  }

  /**
     * Este método agrega los lostes del modal a el modelo que se envia a la api
     * @return void
     */
  agregarLoteIsumo() {
    this.cantidad_error = 0;
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];

    // crear el json que se pasara al formulario reactivo tipo insumos
    let lotes = {
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
      'lotes': this.fb.array([])
    };

    // comprobar que el insumo no este en la lista cargada
    let existe = false;
    let existe_clave = false;
    let posicion_existe = 0;

    for (let item of control.value) {
      if (item.clave === this.insumo.clave) {
        existe_clave = true;
        existe = true;
        break;
      }
      posicion_existe++;
    }

    // si no existe el insumo en la lista agregarlo
    if (!existe) {
      control.push(this.fb.group(lotes));
    }

    // obtener la ultima posicion para que en esa se agreguen los lotes
    let posicion = posicion_existe; // control.length - 1;
    // obtener el control del formulario en la posicion para agregar el nuevo form array que corresponde a los lotes
    const ctrlLotes = <FormArray>control.controls[posicion];

    let objeto = {
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
      maxLength: 2000
    };
    this.options = {
      position: ['bottom', 'left'],
      timeOut: 5000,
      lastOnBottom: true
    };
    let existencia_menor_lote = false;
    // recorrer la tabla de lotes del modal para obtener la cantidad
    for (let item of this.lotes_insumo) {
      if (item.cantidad < item.existencia && item.cantidad !== null) {
        existencia_menor_lote = true;
      }
    }
    for (let item of this.lotes_insumo) {
      // agregar unicamente aquellos que tiene cantidad normal
      if (item.cantidad >= 0 && item.cantidad !== null) {
        let existe_lote = false;
        // si existe el insumo validar que el lote no exista
        if (existe) {
          for (let l of ctrlLotes.controls['lotes'].controls) {
            // si el lote existe agregar unicamente la cantidad nueva
            if (l.controls.id.value === item.id) {
              existe_lote = true;
              // agregar la cantida nueva al lote
              let cantidad_lote: number = item.cantidad;

              // validar que la cantidad escrita no sea mayor que la existencia si no poner la existencia como la cantidad maxima
              if (l.controls.existencia.value <= cantidad_lote) {
                let existencia_maxima = Number(l.controls.existencia.value) - 1;
                this.notificacion.alert('Cantidad Inválida', 'La cantidad máxima es: ' + existencia_maxima, objeto);
                cantidad_lote = Number(l.controls.existencia.value) - 1;
                this.cantidad_error++;
              }
              l.controls.cantidad.patchValue(cantidad_lote);
              l.controls.nueva_existencia.patchValue(cantidad_lote);
              break;
            }
          }
        }
        // si el lote no existe agregarlo
        if (!existe_lote) {
          // validar que la cantidad escrita no sea mayor que la existencia
          if (item.cantidad < item.existencia) {

            // agregar al formulario reactivo de lote
            ctrlLotes.controls['lotes'].push(this.fb.group(
              {
                id: item.id,
                ajuste: 1,
                nueva_existencia: item.cantidad,
                nuevo: item.nuevo | 0,
                codigo_barras: item.codigo_barras,
                lote: item.lote,
                fecha_caducidad: item.fecha_caducidad,
                cantidad: item.cantidad,
                existencia: item.nuevo ? 0 : item.existencia
              }
            ));
          }else {
            let existencia_maxima = Number(item.existencia) - 1;
            this.notificacion.alert('Cantidad Inválida', 'La cantidad máxima de ' + item.lote +
            ' es: ' + existencia_maxima, objeto);
            this.cantidad_error++;
            if (!existe && !existencia_menor_lote) {
              control.removeAt(posicion);
            }
          }
        }
      }
    }

    // sumamos las cantidades de los lotes
    let cantidad = 0;
    let cantidad_unidosis = 0;
    for (let l of ctrlLotes.controls['lotes'].value) {
      cantidad = cantidad + l.cantidad;
      cantidad_unidosis = cantidad_unidosis + l.cantidad;
    }

    // agregar la cantidad surtida
    ctrlLotes.controls['cantidad_surtida'].patchValue(cantidad);
    if (this.cantidad_error === 0) {
      this.cancelarModal('verLotes');
    }
    this.cancelarModal('negarExistencia');
  }
  /********************************************************************************************************************* */
  /**
     * Este método valida los lotes del modal antes de agregarlos
     * @return void
     */
  validarLotesInsumo() {
    this.options = {
      position: ['bottom', 'left'],
      timeOut: 5000,
      lastOnBottom: true
    };
    this.cantidad_error = 0;
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['insumos'];

    // crear el json que se pasara al formulario reactivo tipo insumos
    let datos_insumo = {
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
      'lotes': this.fb.array([])
    };

    // comprobar que el insumo no este en la lista cargada
    let existe = false;
    let existe_clave = false;
    let posicion_existe = 0;
    let existencia_minima_lote = true;

    for (let item of control.value) {
      if (item.clave === this.insumo.clave) {
        existe_clave = true;
        existe = true;
        break;
      }
      posicion_existe++;
    }

    // si no existe el insumo en la lista agregarlo
    if (!existe) {
      control.push(this.fb.group(datos_insumo));
    }

    // recorrer la tabla de lotes del modal para obtener la cantidad
    for (let item of this.lotes_insumo) {
      if (item.cantidad >= item.existencia) {
        existencia_minima_lote = false;
        if (!existe) {
          control.removeAt(control.length - 1);
        }
        if (!existe && item.cantidad == null) {
          item.cantidad = undefined;
        }
      }
    }
    if (existencia_minima_lote) {
      this.agregarLoteIsumo();
    }else {
      this.mensajeResponse.titulo = 'Ajuste MENOS';
      this.mensajeResponse.texto = 'Verificar que las cantidades ingresadas sean menor a la existencia de su respectivo lote.';
      this.mensajeResponse.clase = 'warning';
      this.mensaje(8);
    }
  }
  /***************************************************************************************************************** */
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
        existencia: '', cantidad: '', nueva_existencia: '', nuevo: 1, existencia_unidosis: '', cantidad_unidosis: '' });
    // this.lotes_insumo.push({ id: "" + Math.floor(Math.random() * (999)) + 1, codigo_barras: "",
    // lote: "", fecha_caducidad: "", existencia: '', cantidad: '', nuevo: 1});
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
    if (val.controls.cantidad.value == null) {
        this.notificacion.alert('Cantidad Inválida', 'Verifique la cantidad ingresada en el lote: '
          + val.controls.lote.value, this.objeto);
    } else {
      if (val.controls.cantidad.value >= val.controls.existencia.value) {
        let existencia_maxima = Number(val.controls.existencia.value) - 1;
        this.notificacion.alert('Cantidad Inválida', 'La cantidad máxima es: ' + existencia_maxima, this.objeto);
        let cantidad_lote = Number(val.controls.existencia.value) - 1;
        val.controls.cantidad.patchValue(cantidad_lote);
        val.controls.nueva_existencia.patchValue(cantidad_lote);
      } else {
        val.controls.cantidad.patchValue(val.controls.cantidad.value);
        val.controls.nueva_existencia.patchValue(val.controls.cantidad.value);
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
    for (let l of this.lotes_insumo) {
      if (l.cantidad) {
        cantidad = Number(cantidad) + Number(l.cantidad);
      }
    }
    if (cantidad >= 0) {
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

  /**
     * Este método valida que en el campo de la cantidad no pueda escribir puntos o signo negativo
     * @param event Parametro que contiene el valor de la tecla presionada
     * @return void
     */
  quitar_punto(event) {
    if (this.is_numeric(event.key)) {
      return true;
    }else {
      return false;
    }
  }

  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  guardar_movimiento() {
    const control = <FormArray>this.dato.controls['insumos'];
    let valido = true;
    for (let item of control.value){
      for (let lote of item.lotes){
        if (lote.cantidad == null) {
          valido = false;
        }
      }
    }
    if (valido) {
      document.getElementById('guardarMovimiento').classList.add('is-active');
    }else {
      this.notificacion.alert('Cantidad Inválida', 'Hay campos vacíos. Verifique las cantidades ingresadas.', this.objeto);
    }
  }


/**********************************************IMPRESION DE REPORTES********************************************* */
  imprimir() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    try {
      this.cargandoPdf = true;
      let entrada_imprimir = {
        datos: this.dato.value,
        lista: this.dato.value.insumos,
        usuario: usuario
      };
      this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
    } catch (e) {
      this.cargandoPdf = false;
    }
  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }

  handleKeyboardEvents(event: KeyboardEvent) {
    this.key = event.which || event.keyCode;
    if (event.keyCode === 13) {
      document.getElementById('buscarInsumo').focus();
      event.preventDefault();
      return false;
    }
  }
/**********************************************FIN IMPRESION DE REPORTES********************************************* */


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

}
