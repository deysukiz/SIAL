import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, MinLengthValidator, MaxLengthValidator } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';

import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import { Inventario } from '../../../inventario/inicializacion-inventario/inventario';
import { ResourceLoader } from '@angular/compiler';
import { ValidacionPedidosAlternosModule } from '../../../administrador-central/validacion-pedidos-alternos/validacion-pedidos-alternos.module';
import { mergeMap } from 'rxjs/operators';

import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'salida-formulario',
  templateUrl: './formulario.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class FormularioComponent {
  dato: FormGroup;
  cargando = false;
  movimiento_articulos;
  
  /**
   * Objeto para los reportes con web Webworkers.
   * @type {Worker} */
  pdfworker: Worker;
  
  /**
   * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
   * @type {boolean} */
  cargandoPdf = false;
  
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario = JSON.parse(localStorage.getItem('usuario'));
  configuracion_general = JSON.parse(localStorage.getItem('configuracion_general'));
  ticket;
  error_salida = false;
  salida_ok = false;
  json;
  
  /**
   * Variable que contiene un valor positivo 
   * si puede verse el boton remprimir ticket, o false en caso contrario
   */
  reimprimir = false;

  // Crear la variable que mustra las notificaciones
  mensajeResponse: Mensaje = new Mensaje()
  @Input() titulo: string;
  /**
   * Contiene la URL a la que se hace la consulta a la API para la búsqueda de artículos.
   * @type {string}
   */
  public articulos_term = `${environment.API_URL}/inventario-articulo-auto?term=:keyword&almacen=${this.usuario.almacen_activo.id}`;
/**
   * Contiene la URL donde se hace la búsqueda de insumos médicos, cuyos resultados posteriormente
   * se guarda en [res_busq_insumos]{@link FormularioComponent#res_busq_insumos}
   * @type {string} */
  public clues_term = `${environment.API_URL}/clues-auto?term=:keyword`;
  tieneid: boolean = false;
  tamano = document.body.clientHeight;

  url_nuevo = '../../nuevo';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private location: Location,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone) { }


  ngOnInit() {

    //inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: [12],
      status: ['FI'],
      fecha_movimiento: ['', Validators.required],
      observaciones: [''],
      iva: [],
      total: [],
      subtotal: [],
      movimiento_articulos: this.fb.array([]),
      temp_movimiento_articulos: this.fb.array([]),
      movimiento_salida_metadatos_a_g: this.fb.group({
        persona_recibe: ['', [Validators.required]],
        clues_destino: ['', [Validators.required]],
        unidad_medica: this.fb.group({
          clues: [''],
          nombre: [''],
        })
      })
    });


    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
        this.reimprimir = true;
      }
    });

    this.dato.controls.fecha_movimiento.valueChanges.subscribe(
      val => {
          if (val) {
            if (!this.tieneid) {
              setTimeout(() => {
                this.calcular_importe_articulo();
              }, 500);
            }
          }
      }
    );

    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    // document.getElementById("catalogos").click();
    setTimeout(function () {
      (<HTMLInputElement>document.getElementById('buscarArticulo')).focus;
    }, 100);

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-articulos/salidas-activo-fijo/salida-estandar-articulos.js');

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
            <p class="title is-4" ><span style="font-weight:bold;">${data.nombre}</span> <small><i>${data.categoria ? data.categoria.nombre : 'Ninguna'}</i></small></p>
            <p class="subtitle is-6">
              <strong>descripcion: </strong> ${data.descripcion}
              `;
    html += `<label class="tag is-success" >Es activo fijo: ${data.es_activo_fijo ? 'Si' : 'No'} </label>`;
    html += `<!--<label class="tag is-dark" >Número de inventario: ${data.numero_inventario } </label>-->`;
    html += `
            </p>
          </div>
        </div>
      </div>
    </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);

  }

  public options = {
    position: ['top', 'right'],
    timeOut: 5000,
    lastOnBottom: true
  };

  /**
   * Este método abre una modal
   * @return void
   */
  abrirModal() {
    document.getElementById('inventarios').classList.add('is-active');
  }

  /**
   * Este método cierra una modal
   * @return void
   */
  cancelarModal(data) {
    this.dato.controls.temp_movimiento_articulos = this.fb.array([]);
    document.getElementById('inventarios').classList.remove('is-active');
  }

  /**
   * Este método carga los datos del modal a detalles del movimiento
   * @return void
   */
  cargarInventario() {
    const control = <FormArray>this.dato.controls['movimiento_articulos'];
    const temp_control = <FormArray>this.dato.controls['temp_movimiento_articulos'];

    var existe_articulo = false;
    var index_afectar = null;
    control.value.forEach((element, index )=> {
      if (element.articulo_id == this.dato.controls.temp_movimiento_articulos.value[0].articulo_id) {
        index_afectar = index;
        existe_articulo = true;
        return false;
      }
    });

    if (!existe_articulo) { // NO EXISTE ARTICULO
      var resultado = temp_control.controls[0]['controls'];
      var movimiento_articulos = {
        articulo_id: [resultado.articulo_id.value, [Validators.required]],
        cantidad: [0],
        // precio_referencia: [resultado.precio_referencia.value, [Validators.required]],
        iva: [0],
        importe: [0],
        observaciones: [''],
        inventarios: this.fb.array([]),
        articulos: resultado.articulos
      };

      temp_control.controls[0]['controls'].inventarios.controls.forEach((element, index) => {
        if(element.controls.cantidad.value>0){
          if(resultado.articulos.value.es_activo_fijo==1)
            element.controls.cantidad.patchValue(1);
          element.controls.cantidad.Validators = [Validators.required, Validators.min(1),Validators.max(element.controls.existencia.value)];
          movimiento_articulos.inventarios.push(element);
        }
      });
      control.push(this.fb.group(movimiento_articulos));
    } else {  //  Comparar con inventarios existentes
      temp_control.controls[0]['controls'].inventarios.controls.forEach(element => {
        if(element.value.existencia>0)  {
          var agregadoInventario = false;
          control.controls[index_afectar]['controls'].inventarios.controls.forEach(inveGuardado => {
            if(inveGuardado.value.id==element.id){
              agregadoInventario = true;
              return false;
            }
          });

          if(!agregadoInventario){
            if(element.controls.cantidad.value>0)
              control.controls[index_afectar]['controls'].inventarios.controls.push(element)
          }

        }
      });
    }
    this.dato.controls.temp_movimiento_articulos = this.fb.array([]);

    this.calcular_importe_articulo();

    document.getElementById('inventarios').classList.remove('is-active');
  }

  /**
   * Este método agrega los lostes del modal a el modelo que se envia a la api
   * @return void
   */
  select_articulo_autocomplete(data) {
    this.salida_ok = false;
    this.cargando = true;

    this.crudService.ver(data.articulo_id, 'articulos-inventarios').subscribe(
      resultado => {
        //obtener el formulario reactivo para agregar los elementos
        const control = <FormArray>this.dato.controls['movimiento_articulos'];
        const temp_control = <FormArray>this.dato.controls['temp_movimiento_articulos'];
        this.cargando = false;

        var existe_articulo = false;
        var index_afectar = null;
        control.value.forEach((element, index )=> {
          if (element.articulo_id == resultado.id) {
            index_afectar = index;
            existe_articulo = true;
            return false;
          }
        });


        //crear el json que se pasara al formulario reactivo tipo articulos
        var articulo = resultado;
        if(resultado.articulo)
          articulo = resultado.articulo;

        var movimiento_articulos = {
          articulo_id: [articulo.id, [Validators.required]],
          cantidad: [0],
          // precio_referencia: [resultado.precio_referencia, [Validators.required]],
          iva: [0],
          importe: [0],
          observaciones: [''],
          inventarios: this.fb.array([]),
          articulos: articulo
        };

        if (!existe_articulo) { // NO EXISTE ARTICULO
          resultado.inventarios.forEach(element => {
            if(element.existencia>0)  { // Tiene existencia
              if(element.programa==null)
                element.programa = {nombre: 'Sin programa'};
              var inventario =  {
                cantidad: [0, [Validators.required, Validators.max(element.existencia)]],  // formulario
                iva: [0],       // calcular
                iva_porcentaje: element.movimiento_articulo.iva_porcentaje,
                precio_unitario: element.movimiento_articulo.precio_unitario,
                inventario_metadato_unico: this.fb.array(element.inventario_metadato_unico),
                articulo_id : element.articulo_id,
                es_patrimonio : element.es_patrimonio,
                existencia : element.existencia,
                fecha_caducidad : element.fecha_caducidad,
                id : element.id,
                lote : element.lote,
                movimiento_articulo : this.fb.group(element.movimiento_articulo),
                movimiento_articulo_id : element.movimiento_articulo_id,
                numero_inventario : element.numero_inventario,
                primera_vez_inventario : element.primera_vez_inventario,
                programa : this.fb.group(element.programa)
              };

              movimiento_articulos.inventarios.push(this.fb.group(inventario));
            }
          });

          temp_control.push(this.fb.group(movimiento_articulos))
        } else {  //  ARTICULO EXISTENTE
          resultado.inventarios.forEach(element => {
            if(element.programa==null)
                element.programa = {nombre: 'Sin programa'};
            var inventario =  {
              cantidad: [0, [Validators.required]],   // formulario
              iva: [0],                               // calcular
              iva_porcentaje: element.movimiento_articulo.iva_porcentaje,
              precio_unitario: element.movimiento_articulo.precio_unitario,
              inventario_metadato_unico: this.fb.array(element.inventario_metadato_unico),
              articulo_id : element.articulo_id,
              es_patrimonio : element.es_patrimonio,
              existencia : element.existencia,
              fecha_caducidad : element.fecha_caducidad,
              id : element.id,
              lote : element.lote,
              movimiento_articulo : this.fb.group(element.movimiento_articulo),
              movimiento_articulo_id : element.movimiento_articulo_id,
              numero_inventario : element.numero_inventario,
              primera_vez_inventario : element.primera_vez_inventario,
              programa : this.fb.group(element.programa)
            };


            if(element.existencia>0)  {
              var agregadoInventario = false;
              control.controls[index_afectar]['controls'].inventarios.controls.forEach(inveGuardado => {
                if(inveGuardado.value.id==element.id){
                  agregadoInventario = true;
                  return false;
                }
              });

              if(!agregadoInventario){
                movimiento_articulos.inventarios.push(this.fb.group(inventario));
              }
            }
          });
          temp_control.push(this.fb.group(movimiento_articulos));
        }

        this.abrirModal();

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

        (<HTMLInputElement>document.getElementById('buscarArticulo')).value = '';
        this.cargando = false;
      },
      error => { }
    );
  }

  agregar_lote(control, inventario) {
    control.controls.push(inventario);
  }

  /**
   * Método que sirve para calcular el importe de la salida, sumando los precios de los artículos.
   */
  calcular_importe_articulo() {
    // sumamos las cantidades
    var subtotal = 0;
    var iva = 0;
    var c = 0;
    var p_iva = this.configuracion_general.iva;
    this.dato.get('movimiento_articulos')['controls'].forEach(element => {
      const ma = <FormArray>this.dato.controls.movimiento_articulos;
      const it = <FormGroup>ma.controls[c];

      var iva_mov = 0;
      var importe_mov = 0;
      it.controls.inventarios.value.forEach(inv => {
        iva_mov+= inv.cantidad * (inv.movimiento_articulo.precio_unitario * (inv.movimiento_articulo.iva_porcentaje / 100));
        importe_mov+= inv.cantidad * inv.movimiento_articulo.precio_unitario;
      });

      it.controls.iva.patchValue(iva_mov);
      it.controls.importe.patchValue(importe_mov);

      subtotal += importe_mov;
      iva += iva_mov;
      c++;
    });

    this.dato.controls['subtotal'].patchValue(subtotal);
    this.dato.controls['iva'].patchValue(iva);
    this.dato.controls['total'].patchValue(subtotal + iva);
  }

  isFloat(n){
      return Number(n) === n && n % 1 !== 0;
  }

  cambio_cantidad(index, articulos) {
    if(articulos.cantidad.value > Number(articulos.existencia.value) || this.isFloat(articulos.cantidad.value))
      articulos.cantidad.patchValue(articulos.existencia.value);
    this.calcular_importe_articulo();
    var iva_save = articulos.cantidad.value * articulos.movimiento_articulo.value.precio_unitario * (articulos.movimiento_articulo.value.iva_porcentaje / 100);
    articulos.iva.patchValue(iva_save);
    articulos.iva_porcentaje.patchValue(articulos.movimiento_articulo.value.iva_porcentaje);
  }

  cambio_precio_unitario(articulos) {
    this.calcular_importe_articulo();
  }

  time_cambio_cantidad;
  cambio_cantidad_key(event, index, articulos) {
    clearTimeout(this.time_cambio_cantidad);
    this.time_cambio_cantidad = setTimeout(() => {
      this.cambio_cantidad(index, articulos);
    }, 500);
  }

  time_cambio_precio_unitario;
  cambio_precio_unitario_key(event, articulos) {
    if (event.key != 'Backspace' && event.key != 'Delete' && event.key != 'ArrowLeft' && event.key != 'ArrowRight' && event.key != 'ArrowUp' && event.key != 'ArrowDown' && event.key != '.') {
      clearTimeout(this.time_cambio_precio_unitario);
      this.time_cambio_precio_unitario = setTimeout(() => {
        this.calcular_importe_articulo();
      }, 500);
    }
  }

  //fin lote
  buscar_articulo(e) {
    if (e.keyCode == 13) {
      var valor = (<HTMLInputElement>document.getElementById('buscarArticulo')).value;
      (<HTMLInputElement>document.getElementById('buscarArticulo')).value = '';
      (<HTMLInputElement>document.getElementById('buscarArticulo')).focus;
      var este = this;
      this.cargando = true;
      this.crudService.ver(valor, 'articulos').subscribe(
        resultado => {
          este.select_articulo_autocomplete(resultado.data.id);
          este.cargando = false;
        },
        error => { }
      );
    }
  }

  detalle_articulo(articulo) {
      this.cargando = true;
      this.crudService.ver(articulo, 'articulos').subscribe(
        resultado => {
          this.cargando = false;
        },
        error => { }
      );
  }

  reset_form() {
    this.dato.reset();
    for (let item in this.dato.controls) {
      const ctrl = <FormArray>this.dato.controls[item];
      if (ctrl.controls) {
        if (typeof ctrl.controls.length == 'number') {
          while (ctrl.length) {
            ctrl.removeAt(ctrl.length - 1);
          }
          ctrl.reset();
        }
      }
    }
  }

  enviar(regresar, editar, redirigirAVer: string = '') {
    this.cargando = true;
    this.json = this.dato.getRawValue();
    if (this.dato.get('id').value > 0) {
      // this.crudService.editar(this.dato.get('id').value, this.json, 'salida-articulo').subscribe(
      //   resultado => {
      //     this.enviar_ticket(this.json, resultado);
      //   },
      //   error => {
      //     this.error_salida = true;
      //   }
      // );
    } else {

      this.crudService.crear(this.json, 'salida-articulo').subscribe(
        resultado => {
          if (resultado.status==200 || resultado.status==201) {
            this.cargando = false;
            if (regresar) {
                this.location.back();
            }
            if(redirigirAVer != ''){
                this.router.navigate([redirigirAVer + "/"+ resultado.id]);
            }
            if (editar && this.json.estatus === 'FI') {
                this.router.navigate([editar]);
            }

            this.mensajeResponse.texto = 'Se han guardado los cambios.';
            this.mensajeResponse.mostrar = true;
            this.mensajeResponse.clase = 'success';
            this.mensaje(2);
          } else {

          }
        },
        error => {
            this.cargando = false;
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
                            // Iteramos todos los errores
                            /* for (var i in e.error[input]) {
                                this.mensajeResponse.titulo = input;
                                this.mensajeResponse.texto = e.error[input][i];
                                this.mensajeResponse.clase = 'error';
                                this.mensaje(3);
                            }*/
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

                if (error.status == 500) {
                    this.mensajeResponse.texto = '500 (Error interno del servidor)';
                } else {
                    this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                }
            }
        }
    );

      // this.crudService.crear(this.json, 'salida-articulo').subscribe(
      //   resultado => {
      //     // this.cargando = false;
      //     // if (regresar) {
      //     //     this.location.back();
      //     // }
      //     // if(redirigirAVer != ''){
      //     //     this.router.navigate([redirigirAVer + "/"+ resultado.id]);
      //     // }
      //     // if (editar && json.estatus === 'BR') {
      //     //     this.router.navigate([editar, resultado.id]);
      //     // }
      //     // if (editar && json.estatus === 'FI') {
      //     //     this.router.navigate([editar]);
      //     // }
      //     // this.router.navigate([redirigirAVer+"/"+ resultado.id]);
      //     this.enviar_ticket(this.json, resultado);
      //     this.reset_form();
      //     this.dato.controls.tipo_movimiento_id.patchValue(12);
      //     this.dato.controls.status.patchValue('FI');
      //   },
      //   error => {
      //     this.error_salida = true;
      //     if (error.status === 409) {
      //     }
      //     setTimeout(() => {
      //       this.error_salida = false;
      //     }, 2500);
      //   }
      // );
    }
  }

  enviar_ticket(json, resultado) {
    this.cargando = false;
    //this.reimprimir = true;
    var esto = this;
    this.salida_ok = true;
    setTimeout(() => {
      this.salida_ok = false;
    }, 3000);
    this.json = resultado.data;
    this.calcular_importe_articulo();
    this.error_salida = false;
    setTimeout(() => {
      esto.imprimir();
    }, 200);

    setTimeout(() => {
      this.salida_ok = false;
    }, 1500);
  }

  /**
   * Metodo que manda a imprimir la salida en formato PDF.
   */
  imprimir() {
    try {
      this.cargandoPdf = true;
      let entrada_imprimir = {
        datos: this.dato.value,
        lista: this.dato.value.movimiento_articulos,
        usuario: this.usuario
      };
      this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
    } catch (e) {
      this.cargandoPdf = false;
    }
  }

/**
 * Método que nos ayuda a convertir un archivo para poder guardarlo
 * @param base64 pendiente
 * @param type pendiente
 */
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
          this.mensajeResponse.titulo = this.titulo;

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

    /*************************INICIA AUTOCOMPLETE*************************** */

    /**
     * Este método formatea los resultados de la busqueda en el autocomplte
     * @param data resultados de la busqueda
     * @return void
     */
    autocompleListFormatCLUES = (data: any) => {
      let html = `
      <div class="card">
          <div class="card-content">
              <div class="media">
                  <div class="media-content">
                      <p class="title is-4" style="color: black;">
                        <i class="fa fa-hospital-o" aria-hidden="true"></i>
                        &nbsp; ${data.clues}
                      </p>
                      <p class="subtitle is-6" style="color: black;">
                          <strong style="color: black;">&nbsp; Nombre: </strong>
                          <span style="color: black;"> ${data.nombre ? data.nombre : 'No disponible'} </span>
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
    select_clues_autocomplete(data) {
      this.dato.controls.movimiento_salida_metadatos_a_g['controls']['clues_destino'].patchValue(data.clues);
      this.dato.controls.movimiento_salida_metadatos_a_g['controls']['unidad_medica'].controls.clues.patchValue(data.clues);
      this.dato.controls.movimiento_salida_metadatos_a_g['controls']['unidad_medica'].controls.nombre.patchValue(data.nombre);
      if (data.clues === undefined) {
        this.dato.controls.movimiento_salida_metadatos_a_g['controls']['clues_destino'].patchValue('');
        this.mensajeResponse.texto = 'Error al capturar la CLUES ' + `<strong>${data.clues}</strong>`;
        this.mensajeResponse.mostrar = true;
        this.mensajeResponse.clase = 'warning';
        this.mensaje(0);
      }
    }
    /*************************************FINALIZA AUTOCOMPLETE*********************************** */

}
