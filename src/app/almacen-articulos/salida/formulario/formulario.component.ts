import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'salida-formulario',
  templateUrl: './formulario.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class FormularioComponent {
  dato: FormGroup;
  cargando = false;
  movimiento_articulos;
  usuario = JSON.parse(localStorage.getItem('usuario'));
  configuracion_general = JSON.parse(localStorage.getItem('configuracion_general'));
  ticket;
  error_salida = false;
  salida_ok = false;
  json;
  /**
   * Contiene la URL a la que se hace la consulta a la API para la búsqueda de artículos.
   * @type {string}
   */
  public articulos_term = `${environment.API_URL}/inventario-articulo-auto?term=:keyword&almacen=${this.usuario.almacen_activo.id}`;

  tieneid: boolean = false;
  tamano = document.body.clientHeight;

  url_nuevo = '../../nuevo';
  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService) { }


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
      movimiento_articulos: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
      }
    });

    this.dato.controls.fecha_movimiento.valueChanges.subscribe(
      val => {
          if (val) {
            setTimeout(() => {
              this.calcular_importe_articulo();
              console.log(val, this.dato);
            }, 500);
          }
      }
    );

    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    // document.getElementById("catalogos").click();
    setTimeout(function () {
      (<HTMLInputElement>document.getElementById('buscarArticulo')).focus;
    }, 100);
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
            <p class="title is-4">${data.nombre} <small>${data.categoria ? data.categoria : 'Ninguna'}</small></p>
            <p class="subtitle is-6">
              <strong>descripcion: </strong> ${data.descripcion}
              `;
    html += `<label class="tag is-success" >Es activo fijo: ${data.es_activo_fijo ? 'Si' : 'No'} </label>`;
    html += `<label class="tag is-dark" >Número de inventario: ${data.numero_inventario } </label>`;
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
     * Este método agrega los lostes del modal a el modelo que se envia a la api
     * @return void
     */
  select_articulo_autocomplete(data) {
    this.salida_ok = false;
    this.cargando = true;

    //obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['movimiento_articulos'];

    
    //comprobar que el articulo no este en la lista cargada
    var existe = false; var i = 0;
    for (let item of control.value) {
      if (item.articulos.numero_inventario == data.numero_inventario) {
        existe = true;
        const imp = <FormArray>control.controls[i];
        if(imp.value.existencia > imp.value.cantidad)
          imp.controls['cantidad'].patchValue(item.cantidad + 1);
        break;
      }
    }

     //crear el json que se pasara al formulario reactivo tipo articulos
    var movimiento_articulos = {
      articulo_id: [data.articulo_id, [Validators.required]],
      cantidad: [1, [Validators.required]],
      precio_unitario: [data.precio_unitario, [Validators.required]],
      numero_inventario: [data.numero_inventario, [Validators.required]],
      iva: [0],
      importe: [0, [Validators.required]],
      observaciones: [''],
      inventarios: this.fb.array([]),
      articulos: data
    };

    if (!existe)
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
   * Método que sirve para calcular el importe de la salida, sumando los precios de los artículos.
   */
  calcular_importe_articulo() {
    // sumamos las cantidades
    var subtotal = 0;
    var iva = 0;
    var c = 0;
    var p_iva = this.configuracion_general.iva;
    this.dato.get('movimiento_articulos').value.forEach(element => {
      const ma = <FormArray>this.dato.controls.movimiento_articulos;
      const it = <FormGroup>ma.controls[c];
      var ix = element.precio_unitario * (p_iva / 100);

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

  cambio_cantidad(index, articulos) {
    if(articulos.cantidad.value > articulos.articulos.value.existencia)
      articulos.cantidad.patchValue(articulos.articulos.value.existencia);

      this.calcular_importe_articulo();
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

  enviar() {
    this.cargando = true;
    this.json = this.dato.getRawValue();
    if (this.dato.get('id').value > 0) {
      this.crudService.editar(this.dato.get('id').value, this.json, 'salida-articulo').subscribe(
        resultado => {
          this.enviar_ticket(this.json, resultado);
        },
        error => {
          this.error_salida = true;
        }
      );
    }
    else {
      this.crudService.crear(this.json, 'salida-articulo').subscribe(
        resultado => {
          this.enviar_ticket(this.json, resultado);
          this.reset_form();
          this.dato.controls.tipo_movimiento_id.patchValue(12);
          this.dato.controls.status.patchValue('FI');
        },
        error => {
          this.error_salida = true;
          setTimeout(() => {
            this.error_salida = false;
          }, 2500);
        }
      );
    }
  }

  enviar_ticket(json, resultado) {
    this.cargando = false;
    this.reimprimir = true;
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

  reimprimir = false;
  imprimir() {

  }

}