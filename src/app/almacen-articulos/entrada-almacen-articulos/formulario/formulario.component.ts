import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import { forEach } from '@angular/router/src/utils/collection';

import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'entrada-formulario',
  templateUrl: './formulario.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class FormularioComponent {
  /**
   * Variable que muestra las notificaciones.
   * @type {Mensaje}
   */
  mensajeResponse: Mensaje = new Mensaje();
  dato: FormGroup;
  cargando = false;
  movimiento_articulos;
  configuracion_general = JSON.parse(localStorage.getItem('configuracion_general'));
  /**
   * Contiene la ruta de la API a la cual hacer la búsqueda de artículos.
   * @type {string}
   */
  public articulos_term: string = `${environment.API_URL}/articulos-auto?term=:keyword`;
  /**
   * Contiene un valor _true_ si va a consultar una entrada, y _false_
   * si es una entrada nueva.
   * @type {boolean}
   */
  tieneid: boolean = false;
    /**
   * Se tuvo que crear la variable debido a que se debe hacer referencia únicamente cuando se esté actualizando
   * el catálogo de programas y no cada vez que se esté cargando otros elementos.
   */
  cargandoCatalogo = false;
  /**
   * Almacena cantidad limite para determinar si es petrimonio o no
   */
  limite_patrimonio = 0;
  /**
   * Contiene el valor de la altura del navegador web.
   */
  tamano = document.body.clientHeight;
  /**
   * Variable que contiene la ruta para crear una entrada nueva
   * @type {string}
   */
  url_nuevo = '../../nuevo';
  
  /**
   * Variable que contiene un valor positivo 
   * si puede verse el boton remprimir ticket, o false en caso contrario
   */
  reimprimir = false;
  /**
   * Objeto para los reportes con web Webworkers.
   * @type {Worker} */
  pdfworker: Worker;
  
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {any} */
  usuario;
  
  /**
   * Variable que vale true cuando se está cargando el PDF, false en caso contrario.
   * @type {boolean} */
  cargandoPdf = false;

  public options = {
    position: ['top', 'right'],
    timeOut: 5000,
    lastOnBottom: true
  };
  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private _ngZone: NgZone) { }

  ngOnInit() {
    // obtener los datos del usuario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    //inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: [11],
      programa: [],
      programa_id: [''],
      status: ['FI'],
      fecha_movimiento: ['', [Validators.required]],
      observaciones: [''],
      iva: [],
      total: [],
      subtotal: [],
      movimiento_articulos: this.fb.array([]),
      movimiento_entrada_metadatos_a_g: this.fb.group({
        proveedor_id: [''],
        fecha_referencia: ['', [Validators.required]],
        proveedor: [],
        numero_pedido: [{value: '', disabled: false}, [Validators.required]],
        folio_factura: [{value: '', disabled: false}, [Validators.required]],
        donante: [{value: '', disabled: true}, [Validators.required]],
        donacion: [false],
        persona_entrega: [''],
      })
    });

    this.limite_patrimonio = Number(this.configuracion_general.valor_salario) * Number(this.configuracion_general.salarios_patrimonio);

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
        this.reimprimir = true;
      }
    });

    this.dato.controls.fecha_movimiento.valueChanges.subscribe(
      val => {
          if (val) {
            setTimeout(() => {
              this.calcular_importe_articulo();
            }, 500);
          }
      }
    );

    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    // document.getElementById('actualizar').click();
    // document.getElementById('actualizar').click();

    this.cargarCatalogo('programa', 'lista_programas', 'estatus');
    this.cargarCatalogo('proveedores', 'lista_proveedores', 'activo');

    setTimeout(function () {
      (<HTMLInputElement>document.getElementById('buscarArticulo')).focus;
    }, 100);
    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/almacen-articulos/entradas-activo-fijo/entrada-estandar-articulos.js');

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
            <p class="title is-4"> <span style="font-weight:bold;"> ${data.nombre}</span> <small><i>${data.categoria ? data.categoria.nombre : 'Ninguna'}</i></small></p>
            <p class="subtitle is-6">
              <strong>descripcion: </strong> ${data.descripcion}
              `;
    html += `<label class="tag is-info" >Activo fijo: ${data.es_activo_fijo ? 'SÍ' : 'NO'} </label>`;
    html += `
            </p>
          </div>
        </div>
      </div>
    </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);

  }

  /**
     * Este método agrega los lostes del modal a el modelo que se envia a la api
     * @return void
     */
  select_articulo_autocomplete(data) {
    this.entrada_ok = false;
    this.cargando = true;
    //obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['movimiento_articulos'];

     //crear el json que se pasara al formulario reactivo tipo articulos
    var movimiento_articulos = {
      articulo_id: [data.id, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required]],
      iva: [0],
      iva_porcentaje: [this.configuracion_general.iva],
      importe: [0, [Validators.required]],
      observaciones: [''],
      es_patrimonio: [false],
      inventarios: this.fb.array([
        this.initLote(data, data.articulos_metadatos)
      ]),
      articulos: data
    };

    //si no esta en la lista agregarlo
    control.push(this.fb.group(movimiento_articulos));
    this.calcular_importe_articulo();

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
  }

  /**
   * Método que sirve para calcular el importe de la entrada, sumando los precios de los artículos.
   */
  calcular_importe_articulo() {
    //sumamos las cantidades
    var subtotal = 0;
    var iva = 0;
    var c = 0;
    var p_iva = this.configuracion_general.iva;
    var s_patrimonio = Number(this.configuracion_general.salarios_patrimonio);
    var s_valor = Number(this.configuracion_general.valor_salario);
    this.dato.get('movimiento_articulos').value.forEach(element => {
      const ma = <FormArray>this.dato.controls.movimiento_articulos;
      const it = <FormGroup>ma.controls[c];
      var ix = element.precio_unitario * (p_iva / 100);

      if(element.articulos.es_activo_fijo==1)  { // Si es activo fijo, pregunttar si es petrimonio
        if(element.precio_unitario>=(s_valor*s_patrimonio)){
          it.controls['es_patrimonio'].patchValue(true);
        }
      } else {
        it.controls['es_patrimonio'].patchValue(false); //  No es patrimonio
      }

      it.controls.iva.patchValue(ix * element.cantidad);
      it.controls.importe.patchValue((element.cantidad * element.precio_unitario) + (element.cantidad * ix));
      subtotal += (element.cantidad * element.precio_unitario);
      iva += (element.cantidad * ix);
      c++;
    });

    this.dato.controls['subtotal'].patchValue(subtotal);
    this.dato.controls['iva'].patchValue(iva);
    this.dato.controls['total'].patchValue(subtotal + iva);
  }

  cambioCheck(modelo, indice){
    modelo.controls.numero_inventario.setValue('');
    modelo.controls.numero_inventario.clearValidators();
    if(!modelo.controls.primera_vez_inventario.value){
      modelo.controls.numero_inventario.setValidators(Validators.required);
    }
    modelo.controls.numero_inventario.updateValueAndValidity();
  }

  initLote(articulo, meta) {
    var formulario: FormArray = this.fb.array([]);
    meta.forEach(ele => {
      var campos = {};
      campos['metadatos_id'] = [ele.id];
      campos['campo'] = [ele.campo, [Validators.required]];
      campos['valor'] = [ele.valor];
      campos['longitud'] = [ele.longitud];
      campos['tipo'] = [ele.tipo];
      campos['requerido'] = [ele.requerido];
      campos['requerido_inventario'] = [ele.requerido_inventario];

      formulario.controls.push(this.fb.group(campos));
    });

    var ia = {
      observaciones: [''],
      lote: [''],
      inventario_metadato: formulario
    };

    // SI EL ARTÍCULO TIENE CADUCIDAD SE SOLICITA DICHA FECHA
    if(articulo.tiene_caducidad==1){
      ia['fecha_caducidad'] = ['', [Validators.required]];
    } else {
      ia['fecha_caducidad'] = [''];
    }
    // SI ES ACTIVO FIJO
    if(articulo.es_activo_fijo==1){
      ia['primera_vez_inventario'] = [true];
      ia['numero_inventario'] = [''];
      ia['es_patrimonio'] = [true];
      ia['valido'] = ['', [Validators.required]];
    } else {
      ia['primera_vez_inventario'] = [false];
      ia['numero_inventario'] = [''];
      ia['es_patrimonio'] = [false];
      ia['valido'] = ['1', [Validators.required]];
    }
    return this.fb.group(ia)
  }

  asignar_fecha(i, x, z) {
    setTimeout(() => {
      var v = <HTMLInputElement>document.getElementById('valor' + z);

      const articulos = <FormArray>this.dato.controls.movimiento_articulos;
      const articulo = <FormGroup>articulos.controls[i];

      const inventarios = <FormArray>articulo.controls.inventarios;
      const inventario = <FormGroup>inventarios.controls[x];

      const metadatos = <FormArray>inventario.controls.inventario_metadato;
      const metadato = <FormGroup>metadatos.controls[z];

      metadato.controls.valor.patchValue(v.value);
    }, 300);
  }

  agregar_lote(i?: number) {
    const ar = <FormArray>this.dato.controls.movimiento_articulos;
    const po = <FormGroup>ar.controls[i];
    const st = <FormArray>po.controls.inventarios;
    st.controls.push(this.initLote(po.controls['articulos'].value, po.controls['articulos'].value.articulos_metadatos));
  }

  quitar_lote(i, i2) {
    const a: FormArray = <FormArray>this.dato.controls.movimiento_articulos;
    const control: FormArray = <FormArray>a.at(i).get('inventarios');
    control.removeAt(i2);
  }

  cambio_cantidad(index, articulos) {
    if(articulos.articulos.value.es_activo_fijo==1) {
      let inv = articulos.inventarios.controls.length;
      let tot = articulos.cantidad.value - inv;

      if (tot > 0) {
        for (let i = 0; i < tot; i++) {
          this.agregar_lote(index);
          this.validar_campos(articulos.inventarios.controls[index].controls.inventario_metadato.controls, articulos.inventarios.controls[index].controls);
        }
      }
      if (tot < 0) {
        var quitar = tot * -1;
        for (let x = 0; x < quitar; x++) {
          this.quitar_lote(index, articulos.inventarios.controls.length - 1);
        }
      }
      this.calcular_importe_articulo();
    }
  }

  cambio_precio_unitario(articulos) {
    this.calcular_importe_articulo();
  }

  //  validar_campos(val.controls.inventarios.controls[x].controls.inventario_metadato.controls, val.controls.inventarios.controls[x].controls)
  validar_campos(campo, inv) {
    var valido = '1';
    campo.forEach(element => {
      if (element.value.requerido_inventario == '1' || element.value.requerido_inventario == 1) {
        if (element.value.valor == '' || element.value.valor == null)
          valido = '';
      }
    });
    inv.valido.patchValue(valido);
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
          este.select_articulo_autocomplete(resultado.data);
          este.cargando = false;
        },
        error => { }
      );
    }
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
  ticket;
  error_entrada = false;
  entrada_ok = false;
  json;

  enviar() {
    this.cargando = true;
    this.json = this.dato.getRawValue();
    if (this.json.movimiento_articulos.length>0) {
      if (this.dato.get('id').value > 0) {
        // this.crudService.editar(this.dato.get('id').value, this.json, 'entrada-articulo').subscribe(
        //   resultado => {
        //     // this.enviar_ticket(this.json, resultado);
        //     if (resultado.status == 401) {
        //       this.mensajeResponse.texto = resultado.me;
        //       this.mensajeResponse.clase = 'danger';
        //       this.mensaje(2);
        //     }
        //   },
        //   error => {
        //     this.error_entrada = true;
        //   }
        // );
      } else {
        this.crudService.crear(this.json, 'entrada-articulo').subscribe(
          resultado => {
            this.enviar_ticket(this.json, resultado);
            this.reset_form();
            this.dato.controls.tipo_movimiento_id.patchValue(11);
            this.dato.controls.status.patchValue('FI');
          },
          error => {
            this.error_entrada = true;
            setTimeout(() => {
              this.error_entrada = false;
            }, 2500);
          }
        );
      }
    } else {
      this.mensajeResponse.texto = 'Debe agregar por  lo menos un artículo a la lista';
      this.mensajeResponse.clase = 'danger';
      this.mensaje(4);
      this.cargando = false;
    }
  }

  enviar_ticket(json, resultado) {
    this.cargando = false;
    // this.reimprimir = true;
    var esto = this;
    this.entrada_ok = true;
    setTimeout(() => {
      this.entrada_ok = false;
    }, 3000);
    this.json = resultado.data;
    this.calcular_importe_articulo();
    this.error_entrada = false;
    setTimeout(() => {
      esto.imprimir();
    }, 200);

    setTimeout(() => {
      this.entrada_ok = false;
    }, 1500);
  }

  /**
   * Metodo que manda a imprimir en formato PDF la entrada.
   */
  imprimir() {
     // try {
    //   this.cargandoPdf = true;
    //   let entrada_imprimir = {
    //     datos: this.dato.value,
    //     lista: this.dato.value.movimiento_articulos,
    //     usuario: this.usuario
    //   };
    //   this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
    // } catch (e) {
    //   this.cargandoPdf = false;
    // }
    try {
      this.cargandoPdf = true;
        this.cargando = true;
        // this.crudService.ver(this.dato.controls.id.value, 'entrada-almacen-standard').subscribe(
          this.crudService.verIniciar('documentos-firmantes/2').subscribe(
            resultado => {
              this.cargando = false;
              let entrada_imprimir = {
                datos: this.dato.value,
                lista: this.dato.value.movimiento_articulos,
                usuario: this.usuario,
                firmas: resultado
              };
              console.log(entrada_imprimir);
              this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));

              this.mensajeResponse.titulo = 'Modificar';
              this.mensajeResponse.texto = 'Los datos se cargaron';
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);
            },
            error => {
                this.cargando = false;

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
    // window.open(`${environment.API_URL}/inventario-insumos-excel?${query}${cadena_url}&buscar_en=${this.buscar_en}&seleccionar=${this.seleccionar}&tipo=${this.tipo}&clave_insumo=${this.clave_insumo}`);
  }

  imprimirPdf() {
    // this.cargandoPdf = true;
    // let usuario_actual = JSON.parse(localStorage.getItem('usuario'));
    // // this.abrirModal('imprimirModal');
    // this.crudService.lista_general( 'inventario-insumos?buscar_en=' + this.buscar_en
    // + '&seleccionar=' + this.seleccionar + '&tipo=' + this.tipo).subscribe(
    //   resultado => {
    //             this.cargando = false;
    //             this.lista_impresion = resultado;
    //             let tipo_insumo = this.t.first.nativeElement.options;
    //             let existencia = this.s.first.nativeElement.options;
    //             tipo_insumo = tipo_insumo[tipo_insumo.selectedIndex].text;
    //             existencia = existencia[existencia.selectedIndex].text;
    //             try {

    //               let existencia_imprimir = {
    //                 lista: this.lista_impresion,
    //                 usuario: usuario_actual,
    //                 buscar_en: this.buscar_en,
    //                 seleccionar: existencia,
    //                 tipo: tipo_insumo
    //               };
    //               this.pdfworker.postMessage(JSON.stringify(existencia_imprimir));
    //             } catch (e) {
    //               this.cargandoPdf = false;
    //             }
    //         },
    //         error => {
    //           try {
    //                 let e = error.json();
    //                 if (error.status == 401) {
    //                     this.mensajeResponse.texto = "No tiene permiso para hacer esta operación.";
    //                     this.mensajeResponse.clase = 'danger';
    //                     this.mensaje(2);
    //                 }
    //             } catch (e) {
    //                 if (error.status == 500) {
    //                     this.mensajeResponse.texto = '500 (Error interno del servidor)';
    //                 } else {
    //                     this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
    //                 }
    //                 this.mensajeResponse.clase = 'danger';
    //                 this.mensaje(2);
    //             }

    //         }
    // );

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
    if (this.mensajeResponse.titulo === '') {
        this.mensajeResponse.titulo = 'Entradas de artículos';
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

/**
   * Método para volver NO requerido campos del formulario. Se llama al método
   * cuando se da click al checkbox tiene_seguro_popular.
   * @param campo Contiene el campo que se limpiará, activará o desactivará.
   * @param formgroup_nombre Si el campo a desactivar forma parte de un formgroup, se envía el nombre del formgroup al que pertenece.
   */
  no_requerirCampo (campo, formgroup_nombre?) {
    let temporal;
    if (formgroup_nombre) {
      temporal = <FormGroup>this.dato.controls[formgroup_nombre];
    } else {
      temporal = <FormGroup>this.dato;
    }
    const formEntrada = temporal;
    if (this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === true ||
        this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === 1 ||
        this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === '1') {
        formEntrada.get(campo).disable();
        // Se limpian los campos cuando se activa la donación
        formEntrada.get(campo).patchValue('');
        this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donante'].enable();
    }
    if ( this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === false ||
      this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === 0 ||
      this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donacion'].value === '0') {
      formEntrada.get(campo).enable();
      this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donante'].disable();
      // Se limpia el campo DONANTE cuando se desactiva la donación
      this.dato.controls.movimiento_entrada_metadatos_a_g['controls']['donante'].patchValue('');
    }
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

}
