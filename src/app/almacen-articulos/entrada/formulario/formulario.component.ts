import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'entrada-formulario',
  templateUrl: './formulario.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class FormularioComponent {
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
   * Contiene el valor de la altura del navegador web.
   */
  tamano = document.body.clientHeight;
  /**
   * Variable que contiene la ruta para crear una entrada nueva
   * @type {string}
   */
  url_nuevo = '../../nuevo';

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
    private notificacion: NotificationsService) { }

  ngOnInit() {

    //inicializar el formulario reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: [11],
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
            <p class="title is-4">${data.nombre} <small>${data.categorias ? data.categorias.nombre : 'Ninguna'}</small></p>
            <p class="subtitle is-6">
              <strong>descripcion: </strong> ${data.descripcion}
              `;
    html += `<label class="tag is-success" >Es activo fijo: ${data.es_activo_fijo ? 'Si' : 'No'} </label>`;
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
      cantidad: [1, [Validators.required]],
      precio_unitario: [0, [Validators.required]],
      iva: [0],
      importe: [0, [Validators.required]],
      observaciones: [''],
      inventarios: this.fb.array([
        this.initLote(data.categoria.categorias_metadatos)
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

  initLote(meta) {
    var formulario: FormArray = this.fb.array([]);
    meta.forEach(ele => {
      var campos = {};
      campos['metadatos_id'] = [ele.id];
      campos['campo'] = [ele.campo, [Validators.required]];
      campos['descripcion'] = [ele.descripcion];
      campos['longitud'] = [ele.longitud];
      campos['tipo'] = [ele.tipo];
      campos['requerido'] = [ele.requerido];
      campos['valor'] = [''];
      
      formulario.controls.push(this.fb.group(campos));
    });

    return this.fb.group({
      numero_inventario: [''],
      observaciones: [''],
      valido: ['', [Validators.required]],
      inventario_metadato: formulario
    })
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

    st.controls.push(this.initLote(po.controls['articulos'].value.categoria.categorias_metadatos));
  }

  quitar_lote(i, i2) {
    const a: FormArray = <FormArray>this.dato.controls.movimiento_articulos;
    const control: FormArray = <FormArray>a.at(i).get('inventarios');
    control.removeAt(i2);
  }

  cambio_cantidad(index, articulos) {
    let inv = articulos.inventarios.controls.length;
    let tot = articulos.cantidad.value - inv;

    if (tot > 0) {
      for (let i = 0; i < tot; i++) {
        this.agregar_lote(index);
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

  cambio_precio_unitario(articulos) {
    this.calcular_importe_articulo();
  }

  validar_campos(campo, inv) {
    var valido = '1';
    campo.forEach(element => {
      if (element.value.requerido == '1' || element.value.requerido == 1) {
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
    if (this.dato.get('id').value > 0) {
      this.crudService.editar(this.dato.get('id').value, this.json, 'entrada-articulo').subscribe(
        resultado => {
          this.enviar_ticket(this.json, resultado);
        },
        error => {
          this.error_entrada = true;
        }
      );
    }
    else {
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
  }

  enviar_ticket(json, resultado) {
    this.cargando = false;
    this.reimprimir = true;
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

  reimprimir = false;
  imprimir() {

  }

}