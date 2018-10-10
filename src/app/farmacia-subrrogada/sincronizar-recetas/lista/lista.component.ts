import { Component, OnInit, Input, NgZone, ElementRef, ViewChild, ViewChildren  } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';
import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'sincronizar-recetas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})

export class ListaComponent {
  @ViewChildren('json') jsonBoxViewChildren;
  dato2: FormGroup;
  cargando = false;
  tamano = 0;
  error_json = false;
  json_valido;
  pedido_id;
  recetas_resultado = false;
  lista_impresion;
  usuario;
  // Crear la variable que mustra las notificaciones
  mensajeResponse: Mensaje = new Mensaje();
  // mostrar notificaciones configuracion default, posicion abajo izquierda, tiempo 2 segundos
  public options = {
    position: ['bottom', 'left'],
    timeOut: 2000,
    lastOnBottom: true
  };
  titulo= 'Sincronizar recetas';
  public clues_term = `${environment.API_URL}/clues-auto?term=:keyword`;
  tieneid = false;
  foto = '';
  resultado_clues;
  clues;
  // Datos enviados en URL para filtros
  clave_clues = '';
  fecha_desde = '';
  fecha_hasta = '';
  numero_sinc;
  folio = '';

  // # SECCION: Reportes
  pdfworker: Worker;
  cargandoPdf = false;
  // # FIN SECCION

  constructor(private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone,
    private notificacion: NotificationsService) { }

  ngOnInit() {

    // obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    // this.tamano = this.elementView.nativeElement.offsetHeight/2;
    // inicializar el formulario reactivo
    this.dato2 = this.fb.group({
      json: [''],
      archivos: [''],
      pedido: ['00011']
    });

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker('web-workers/farmacia-subrrogada/lista-sincronizar-recetas.js');

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
  }
  /**
     * Este método abre una modal
     * @param id identificador del elemento de la modal
     * @param item_id identificador del pedido
     * @return void
     */
  abrirModal(id, item_id) {
    document.getElementById(id).classList.add('is-active');
    this.pedido_id = item_id;
  }

  /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
    this.dato2.patchValue({json:'',archivos:'' , pedido:''});
    this.jsonBoxViewChildren.first.nativeElement.value = "";
    this.pedido_id = "";
    this.recetas_resultado = false;
    this.json_valido = '';
  }

  /**
     * Este método selecciona un archivo txt con un json para subirlo <input type="file" (change)="seleccionarJson($event, 'modelo')">
     * @param evt Evento change del campo file
     * @param modelo Modelo donde guardaremos la cadena en base64 de la imagen
     * @return void
     */
  convertirJson(evt, modelo, mostrar) {
      modelo.patchValue('');
      this.error_json = false;
      var files = evt.target.files;
      var file = files[0];
      var esto = this;
      if (files && file) {
          var json = "";
          var reader = new FileReader();
          reader.readAsBinaryString(file);
          reader.onload = (function (theFile) {
              return function (e) {
                  try {
                      json = JSON.parse(e.target.result);
                      modelo.patchValue(json);
                  } catch (ex) {
                      esto.error_json = true;
                  }
              }
          })(file);
      }
  }


    /**
    * Este método envia los datos para agregar un elemento
    * @return void
    */
    enviarDatos(url?) {
        this.cargando = true;
        this.dato2.patchValue({pedido: this.pedido_id});
        let json = this.dato2.getRawValue();
        this.crudService.crear(json, url).subscribe(
            resultado => {
              this.cargando = false;
              if (resultado.data) {
                this.json_valido = resultado.data;
              }
              this.recetas_resultado = true;
              this.mensajeResponse.texto = 'Validación realizada.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);
            },
            error => {
                this.cargando = false;

                try {
                    let e = error.json();
                    if (error.status === 401) {
                        this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';

                    }
                    // Problema de validación
                    if (error.status === 409) {
                        this.mensajeResponse.texto = 'Por favor verfique los campos marcados en rojo.';
                        this.mensajeResponse.clase = 'warning';
                        this.mensaje(8);

                        for (var input in e.error) {
                            // Iteramos todos los errores
                            for (var i in e.error[input]) {
                                for (var j in e.error[input][i]){
                                this.mensajeResponse.titulo = '¡Error!';
                                this.mensajeResponse.texto = e.error[input][i][j];
                                this.mensajeResponse.clase = 'error';
                                this.mensaje(3);
                                }
                            }
                        }
                    }
                } catch (e) {

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
    * Este método envia los datos para agregar un elemento
    * @return void
    */
    sincronizarReceta(modal?) {
        this.cargando = true;
        this.dato2.patchValue({pedido: this.pedido_id});
        var json = this.dato2.getRawValue();
        this.crudService.crear(json, 'procesar-json-proveedor').subscribe(
            resultado => {
              this.cargando = false;

              this.cancelarModal(modal);
              this.mensajeResponse.texto = 'Se han sincronizado las recetas.';
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);
            },
            error => {
                this.cargando = false;

                try {
                    let e = error.json();
                    if (error.status == 401) {
                        this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';

                    }
                    // Problema de validación
                    if (error.status == 409) {
                        this.mensajeResponse.texto = 'Por favor verfique los campos marcados en rojo.';
                        this.mensajeResponse.clase = 'warning';
                        this.mensaje(8);
                        for (var input in e.error) {
                            // Iteramos todos los errores
                            for (var i in e.error[input]) {
                                this.mensajeResponse.titulo = '¡Error!';
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
                        <p class="title is-4" style="color: black;">
                            <i class="fa fa-hospital-o" aria-hidden="true"></i> &nbsp; ${data.clues}
                        </p>
                        <p class="subtitle is-6" style="color: black;">
                            <strong style="color: black;">Nombre: </strong> ${data.nombre}
                            <strong style="color: black;">&nbsp; Jurisdicción: </strong>
                            <span style="color: black;"> ${data.jurisdiccion ? data.jurisdiccion.numero : 'No disponible'} -
                             ${data.jurisdiccion ? data.jurisdiccion.nombre : 'No disponible'}</span>
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
  select_clues_autocomplete(data) {

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.clave_clues = data.clues;
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
    /******************************************IMPRESION DE REPORTES************************************ */

  imprimir() {

    try {
      this.cargandoPdf = true;
      let temporal;
      if (this.numero_sinc === undefined) {
          this.numero_sinc = '';
      }

      this.crudService.lista_general('listar-pedidos-proveedor?fecha_desde=' + this.fecha_desde
      + '&fecha_hasta=' + this.fecha_hasta + '&clues=' + this.clave_clues + '&numero_sinc='
      + this.numero_sinc + '&folio=' + this.folio).subscribe(
        resultado => {
                this.cargando = false;
                this.lista_impresion = resultado.data;
                let entrada_imprimir = {
                  lista: this.lista_impresion,
                  usuario: this.usuario,
                  fecha_desde: this.fecha_desde,
                  fecha_hasta: this.fecha_hasta,
                  clues: this.clave_clues,
                  folio: this.folio,
                  numero_sinc: this.numero_sinc
                };
                this.pdfworker.postMessage(JSON.stringify(entrada_imprimir));
              },
              error => {
              }
      );
    } catch (e) {
      this.cargandoPdf = false;
    }
  }

  base64ToBlob( base64, type ) {
      let bytes = atob( base64 ), len = bytes.length;
      let buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( let i = 0 ; i < len ; i++ ) {
        view[i] = bytes.charCodeAt(i) & 0xff;
      }
      return new Blob( [ buffer ], { type: type } );
  }

    /*********************************************NOTIFICACIONES*************************************************** */

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
}