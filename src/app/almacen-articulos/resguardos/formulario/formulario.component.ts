import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';

import { Subject } from 'rxjs/Subject';
import { Mensaje } from '../../../mensaje';

import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: "resguardos-formulario",
  templateUrl: "./formulario.component.html",
  styles: ["ngui-auto-complete {z-index: 999999 !important}"]
})
export class FormularioComponent {
  dato: FormGroup;
  cargando = false;
  resguardos_articulos;

  public clues_term = `${environment.API_URL}/clues-auto?term=:keyword`
  resultado_clues;
  clues;

  /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
  fecha_desde: String = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
  fecha_hasta: String = '';
  /**
   * /**
   * Fecha inicial de periodo de tiempo para filtro.
   * @type {string} */
  clues_destino: String = '';
  /**
   * Fecha final de periodo de tiempo de filtro.
   * @type {string} */
  persona_recibe: String = '';

  // # SECCION: Esta sección es para mostrar mensajes

  ultimaPeticion: any;
  // # FIN SECCION

  // # SECCION: Lista de dato

  //dato es el modelo general que contiene los datos del formulario
  datoSalida: any[] = [];
  respuesta: any[] = [];
  mensajeResponse: Mensaje = new Mensaje(true);

  paginaActual = 1;
  resultadosPorPagina = 20;
  total = 0;
  paginasTotales = 0;
  indicePaginas: number[] = [];
  // # FIN SECCION

  // # SECCION: Resultados de búsqueda
  ultimoTerminoBuscado = "";
  terminosBusqueda = new Subject<string>();
  resultadosBusqueda: any[] = [];
  busquedaActivada: boolean = false;
  paginaActualBusqueda = 1;
  resultadosPorPaginaBusqueda = 20;
  totalBusqueda = 0;
  paginasTotalesBusqueda = 0;
  indicePaginasBusqueda: number[] = [];
  // # FIN SECCION

  usuario = JSON.parse(localStorage.getItem("usuario"));
  configuracion_general = JSON.parse(
    localStorage.getItem("configuracion_general")
  );
  ticket;
  error_resguardos = false;
  resguardos_ok = false;
  json;

  data_articulo;
  /**
   * Contiene la URL a la que se hace la consulta a la API para la búsqueda de artículos.
   * @type {string}
   */
  public articulos_term = `${
    environment.API_URL
  }/salida-auto?term=:keyword&almacen=${this.usuario.almacen_activo.id}`;

  tieneid = false;
  tamano = document.body.clientHeight;

  url_nuevo = "../../nuevo";

  public options = {
    position: ["top", "right"],
    timeOut: 5000,
    lastOnBottom: true
  };
  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService
  ) {}

  ngOnInit() {
    // inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [""],
      status: ["ACTIVO"],
      clues_destino: ["", Validators.required],
      area_resguardante: ["", Validators.required],
      nombre_resguardante: ["", Validators.required],
      apellidos_resguardante: ["", Validators.required],
      temp_resguardos_articulos: this.fb.array([]),
      resguardos_articulos: this.fb.array([]),
      subtotal: [0],
      iva: [0],
      total: [0]
    });

    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.tieneid = true;
      }
    });

    //  Solo si se va a cargar catalogos poner un <a id='catalogos' (click)='ctl.cargarCatalogo('modelo','ruta')'>refresh</a>
     document.getElementById('catalogos').click();
    // setTimeout(function() {
    //   (<HTMLInputElement>document.getElementById("buscarArticulo")).focus;
    // }, 100);
  }

  /**
   * Este método formatea los resultados de la busqueda en el autocomplte
   * @param data resultados de la busqueda
   * @return void
   */
  // autocompleListFormatter = (data: any) => {
  //   let html = `
  //   <div class='card'>
  //     <div class='card-content'>
  //       <div class='media'>
  //         <div class='media-content'>
  //           <p class='title is-4' ><span style='font-weight:bold;'>${
  //             data.observaciones
  //           }</span>
  //             <small><i>${
  //               data.fecha_movimiento
  //             }</i></small></p>
  //           <p class='subtitle is-6'>              `;
  //   html += `<label class='tag is-success' >Articulos: ${data.movimiento_articulos.length} </label>`;
  //   html += `
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>`;
  //   return this._sanitizer.bypassSecurityTrustHtml(html);
  // };

  /**
   * Este método agrega los lostes del modal a el modelo que se envia a la api
   * @return void
   */
  articulos = [];
  select_articulo_autocomplete(data) {
    this.articulos = data.movimiento_articulos;
    this.abrirModal("articulos");
  }

  select_salida(indice){
    const temp_control = <FormArray>this.dato.controls['temp_resguardos_articulos'];
    const control = <FormArray>this.dato.controls['resguardos_articulos'];
      this.datoSalida[indice].movimiento_articulos.forEach(element => {
        element.inventarios.forEach(inventario => {
          var obj =  {
            inventario_id: [inventario.id],
            numero_inventario: [inventario.numero_inventario],
            status: ["ACTIVO"],
            cantidad: [1],
            condiciones_articulos_id: [""],
            precio_unitario: [Number(element.precio_unitario)],
            importe: [(Number(element.precio_unitario))],
            iva: [(Number(element.precio_unitario) * (Number(element.iva_porcentaje) / 100))],
            iva_porcentaje: [Number(element.iva_porcentaje)],
            articulos: [element.articulos],
            inventario_metadato_unico: this.fb.array(inventario.inventario_metadato_unico),
            agregar:[false]
          };

          let existe = false;
          control.controls.forEach(ra => {
            if (inventario.id==ra.value.inventario_id) {
              existe = true;
              return false;
            }
          });

          let tiene_resguardo = false;
          inventario.resguardos_articulos.forEach(rag => {
            if (rag.status=="ACTIVO") {
              tiene_resguardo = true;
              return false;
            }
          });

          if (!existe && !tiene_resguardo)
            temp_control.push(this.fb.group(obj))
        });
      });
    this.cancelarModal('salidas');

    this.abrirModal('articulos')
  }

  calcular_total(){
    const control = <FormArray>this.dato.controls['resguardos_articulos'];
    let subtotal = 0;
    let iva = 0;

    control.controls.forEach(element => {
      subtotal += Number(element.value.precio_unitario);
      iva += Number(element.value.iva);
    });

    this.dato.controls["subtotal"].patchValue(subtotal);
    this.dato.controls["iva"].patchValue(iva);
    this.dato.controls["total"].patchValue(subtotal + iva);
  }

  cargarInventario(){
    const temp_control = <FormArray>this.dato.controls['temp_resguardos_articulos'];
    const control = <FormArray>this.dato.controls['resguardos_articulos'];
    let subtotal = 0;
    let iva = 0;

    temp_control.controls.forEach(element => {
      if (element.value.agregar==true) {
        let existe = false;
        control.controls.forEach(ra => {
          if (element.value.inventario_id==ra.value.inventario_id) {
            existe = true;
            return false;
          }
        });

        if (!existe){
          element["controls"].condiciones_articulos_id.setValidators(Validators.required);
          element["controls"].condiciones_articulos_id.updateValueAndValidity();

          control.push(element)
          subtotal += Number(element.value.precio_unitario);
          iva += Number(element.value.iva);
        }
      }
    });

    this.dato.controls["subtotal"].patchValue(subtotal);
    this.dato.controls["iva"].patchValue(iva);
    this.dato.controls["total"].patchValue(subtotal + iva);

    this.cancelarModal('articulos');
  }

  select_articulo() {
    this.reset_form();
    this.resguardos_ok = false;
    this.cargando = true;

    // obtener el formulario reactivo para agregar los elementos
    let control = <FormArray>this.dato.controls["resguardos_articulos"];
    let subtotal = 0;
    let iva = 0;
    this.articulos.forEach(element => {

      if(element.agregar){
        let obj = this.fb.group({
          inventario_id: [element.inventario_id],
          status: ["ACTIVO"],
          condiciones_articulos_id: ["", Validators.required],
          cantidad: [element.cantidad],
          precio_unitario: [element.precio_unitario],
          importe: [element.importe],
          iva: [element.iva],
          iva_porcentaje: [element.iva_porcentaje],
          articulos: [element.articulos]
        });
        control.controls.push(obj);
        subtotal += element.importe;
        iva += element.iva;
      }
    });
    this.dato.controls["subtotal"].patchValue(subtotal);
    this.dato.controls["iva"].patchValue(iva);
    this.dato.controls["total"].patchValue(subtotal + iva);
  }

  abrirModal(id) {
    document.getElementById(id).classList.add("is-active");
  }

  /**
   * Este método cierra una modal
   * @param id identificador del elemento de la modal
   * @return void
   */
  cancelarModal(id) {
    if (id=="articulos")
      this.dato.controls.temp_resguardos_articulos = this.fb.array([]);
    document.getElementById(id).classList.remove("is-active");
  }


  reset_form() {
    this.dato.reset();
    for (let item in this.dato.controls) {
      const ctrl = <FormArray>this.dato.controls[item];
      if (ctrl.controls) {
        if (typeof ctrl.controls.length == "number") {
          while (ctrl.length) {
            ctrl.removeAt(ctrl.length - 1);
          }
          ctrl.reset();
        }
      }
    }
  }

  enviar() {
    this.cargando = true;
    this.json = this.dato.getRawValue();
    if (this.dato.get("id").value > 0) {
      this.crudService
        .editar(this.dato.get("id").value, this.json, "resguardos-articulo")
        .subscribe(
          resultado => {
            this.enviar_ticket(this.json, resultado);
          },
          error => {
            this.error_resguardos = true;
          }
        );
    } else {
      this.crudService.crear(this.json, "resguardos-articulo").subscribe(
        resultado => {
          this.enviar_ticket(this.json, resultado);
          this.reset_form();
          this.dato.controls.tipo_movimiento_id.patchValue(12);
          this.dato.controls.status.patchValue("FI");
        },
        error => {
          this.error_resguardos = true;
          setTimeout(() => {
            this.error_resguardos = false;
          }, 2500);
        }
      );
    }
  }

  enviar_ticket(json, resultado) {
    this.cargando = false;
    // this.reimprimir = true;
    var esto = this;
    this.resguardos_ok = true;
    setTimeout(() => {
      this.resguardos_ok = false;
    }, 3000);
    this.json = resultado.data;
    // this.calcular_importe_articulo();
    this.error_resguardos = false;
    setTimeout(() => {
      esto.imprimir();
    }, 200);

    setTimeout(() => {
      this.resguardos_ok = false;
    }, 1500);
  }

  reimprimir = false;
  imprimir() {}

  /**
   * Este método obtiene una lista de elementos de la api
   * @param pagina  inicio de la página para mostrar resultados
   * @return void
   */
  listar(pagina: number): void {
      this.paginaActual = pagina;

      this.cargando = true;
      this.crudService.lista(pagina, this.resultadosPorPagina, "salida-articulo?tipo_movimiento_id=12&activo_fijo=1&fecha_desde="+this.fecha_desde+"&fecha_hasta="+this.fecha_hasta+"&clues_destino="+this.clues_destino+"&persona_recibe="+this.persona_recibe).subscribe(
          resultado => {
              this.cargando = false;

              if(resultado.data)
                  this.datoSalida = resultado.data as any[];
              else
                  this.datoSalida = resultado as any[];

              this.total = resultado.total | 0;
              this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

              this.indicePaginas = [];
              for (let i = 0; i < this.paginasTotales; i++) {
                  this.indicePaginas.push(i + 1);
              }
              this.mensajeResponse.mostrar = true;
              this.mensajeResponse.texto = 'lista cargada';
              this.mensajeResponse.clase = 'success';
              this.mensaje(2);

              this.abrirModal('salidas');
          },
          error => {
              this.cargando = false;
              this.mensajeResponse.mostrar = true;
              this.ultimaPeticion = this.listar;
              try {
                  let e = error.json();
                  if (error.status == 401) {
                      this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                      this.mensajeResponse.clase = 'danger';
                      this.mensaje(2);
                  }
              } catch (e) {
                  if (error.status == 500) {
                      this.mensajeResponse.texto = '500 (Error interno del servidor)';
                  } else {
                      this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                  }
                  this.mensajeResponse.clase = 'danger';
                  this.mensaje(2);
              }

          }
      );
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
          this.mensajeResponse.titulo = 'Búsqueda de salidas';

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
    this.clues_destino = data.clues;
  }

}
