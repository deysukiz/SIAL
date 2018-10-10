import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'resguardos-devolucion',
  templateUrl: './devolucion.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class DevolucionComponent {
  dato: FormGroup;
  form_pagos: any;
  form_resguardos_articulos: any;
  cargando = false;
  resguardos_articulos;
  codigo_barras_activo = true;
  caja_abierta = false;
  public articulos_term: string = `${environment.API_URL}/articulos-auto?term=:keyword`;
  constructor(private fb: FormBuilder, private crudService: CrudService, private route: ActivatedRoute, private _sanitizer: DomSanitizer, private notificacion: NotificationsService) { }

  tieneid: boolean = false;
  tamano = document.body.clientHeight;

  public startValue: string;
  public selected: string;

  url_nuevo = "../../nuevo";

  subtotal = 0;
  descuento = 0;
  iva = 0;
  total = 0;
  total_recibido = 0;
  cambio = 0;

  usuario;
  caja;
  ngOnInit() {


    if (this.caja > 0)
      this.caja_abierta = true;
    //inicializar el devolucion reactivo
    this.dato = this.fb.group({
      id: [''],
      tipo_movimiento_id: [11],
      personas_id: [''],
      subtotal: [0],
      descuento: [0],
      iva: [0],
      cajas_id: [''],
      total: [0, [Validators.required]],
      temp_total: [''],
      total_recibido: [0, [Validators.required]],
      cambio: [''],
      codigo: [''],
      folio: [''],
      barcode:[''],
      status_movimientos_id: [1],
      comentarios: [''],
      valido: ['', [Validators.required]],
      pagos: this.fb.array([]),
      resguardos_articulos: this.fb.array([]),
      usuarios: this.fb.group({})
    });

    this.selected = '';
    this.startValue = '';
    //variable para crear el array del devolucion reactivo
    this.form_pagos = {
      pagos_targetas: this.fb.group({
        banco: [''],
        folio: ['']
      }),
      tipos_metodos_pagos_id: [1, [Validators.required]],
      importe: [this.dato.controls['total'].value, [Validators.required]],
      paga_con: ['', [Validators.required]],
      cambio: ['', [Validators.required]],
      comentarios: ['']
    };

    this.form_resguardos_articulos = {
      articulos_id: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      precio_unitarios_unitario: ['', [Validators.required]],
      articulos_precio_unitarios_id: [],
      importe: ['', [Validators.required]],
      descuento: ['', [Validators.required]],
      importe_con_descuento: ['', [Validators.required]],
      iva_porcentaje: ['', [Validators.required]],
      iva_cantidad: ['', [Validators.required]],
      subtotal: ['', [Validators.required]]
    };
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();

    this.dato.controls.personas_id.valueChanges.
    subscribe(val => {
      setTimeout(()=> {
        this.dato.controls.tipo_movimiento_id.patchValue(11);
      }, 500);
    });

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
    html += `<label class="tag is-success" >Es activo fijo: ${data.es_activo_fijo ? 'Si' : 'No'} </label>`;;

    html += `
            </p>
          </div>
        </div>
      </div>
    </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);

  }

  public options = {
    position: ["top", "right"],
    timeOut: 5000,
    lastOnBottom: true
  };
  cambiar_precio_unitario(p, i, modelo) {
    p = p.srcElement.value;
    modelo[i].controls['precio_unitario_unitario'].patchValue(modelo[i].get('articulos').value.articulos_precio_unitarios[p].precio_unitario);
    this.calcular_importe_articulo();
  }
  /**
     * Este método agrega los lostes del modal a el modelo que se envia a la api
     * @return void
     */
  select_articulo_autocomplete(data) {
    this.resguardos_ok = false;
    this.cargando = true;

    //obtener el devolucion reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['resguardos_articulos'];

    //comprobar que el articulo no este en la lista cargada
    var existe = false; var i = 0;
    for (let item of control.value) {
      if (item.articulos_id == data.id) {
        existe = true;
        const imp = <FormArray>control.controls[i];
        imp.controls['cantidad'].patchValue(item.cantidad + 1);
        imp.controls['cantidad_restante'].patchValue(imp.controls["cantidad"].value);
        break;
      }
    }

    //crear el json que se pasara al devolucion reactivo tipo articulos
    var resguardos_articulos = {
      articulos_id: [data.id, [Validators.required]],
      cantidad: [1, [Validators.required]],
      cantidad_restante:[1],
      precio_unitario_unitario: [data.articulos_precio_unitarios[0].precio_unitario, [Validators.required]],
      articulos_precio_unitarios_id: [data.articulos_precio_unitarios[0].id, [Validators.required]],
      importe: [data.articulos_precio_unitarios[0].precio_unitario, [Validators.required]],
      descuento: [0, [Validators.required]],
      importe_con_descuento: [data.articulos_precio_unitarios[0].precio_unitario, [Validators.required]],
      iva_porcentaje: [0, [Validators.required]],
      iva_cantidad: [0, [Validators.required]],
      subtotal: [data.articulos_precio_unitarios[0].precio_unitario, [Validators.required]],
      stocks:this.fb.array([]),
      articulos: data
    };

    //si no esta en la lista agregarlo
    if (!existe)
      control.push(this.fb.group(resguardos_articulos));

    this.calcular_importe_articulo();

    var objeto = {
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
      maxLength: 2000
    };

    this.options = {
      position: ["top", "right"],
      timeOut: 5000,
      lastOnBottom: true
    };

    if (data.stocks.length > 0) {
      var existencia = 0;
      data.stocks.forEach(element => {
        existencia += element;
      });
      if (data.cantidad > existencia)
        this.notificacion.alert("Cantidad Excedida", "La cantidad maxima es: " + existencia, objeto);
    }
    else {
      this.notificacion.alert("¡No ha inicializado inresguardosrio!", "Es necesario inicializar en el módulo de inicialización ", objeto);
    }
    this.cargando = false;
  }

  cambio_cantidad_articulo(articulo){
    if(articulo.cantidad_devolucion.value > articulo.cantidad.value)
      articulo.cantidad_devolucion.patchValue(parseFloat(articulo.cantidad.value));
    this.calcular_importe_articulo();
  }

  time_cambio_cantidad_articulo_key;
  cambio_cantidad_articulo_key(event, articulo) {
    if (event.key != 'Backspace' && event.key != 'Delete' && event.key != 'ArrowLeft' && event.key != 'ArrowRight' &&event.key !=  'ArrowUp' && event.key != 'ArrowDown' && event.key != '.' ) {
      clearTimeout(this.time_cambio_cantidad_articulo_key);
      this.time_cambio_cantidad_articulo_key = setTimeout(() => {
        this.cambio_cantidad_articulo(articulo);
      }, 500);
    }
  }

  calcular_importe_articulo() {
    //sumamos las cantidades

    var total = 0;
    var c = 0;
    this.dato.get('resguardos_articulos').value.forEach(element => {
      var cantidad = element.cantidad - element.cantidad_devolucion;
      element.importe = cantidad * element.precio_unitario_unitario;
      total = total + element.importe;
      const ma = <FormArray>this.dato.controls.resguardos_articulos;
      const it = <FormGroup>ma.controls[c];
      it.controls.importe.patchValue(element.importe);
      c++;
    });

    var importe = 0;
    var cambio = 0;
    var i = 0;
    const pagos = <FormArray>this.dato.controls['pagos'];
    this.dato.get('pagos').value.forEach(element => {
      importe = importe + element.paga_con;
    });

    this.dato.controls['subtotal'].patchValue(total);
    this.dato.controls['total'].patchValue(total);
    this.dato.controls['total_recibido'].patchValue(importe);
    this.dato.controls['cambio'].patchValue(importe - total);

    if(this.json){
      this.json.subtotal = (total);
      this.json.total = (total);
      this.json.total_recibido = (importe);
      this.json.cambio = (importe - total);
    }

    if (importe >= total)
      this.dato.controls["valido"].patchValue("si");
    else
      this.dato.controls["valido"].patchValue('');

    const imp = <FormGroup>pagos.controls[0];
    imp.controls.importe.patchValue(total);

    this.dato.get('pagos').value.forEach(element => {
      const imp = <FormGroup>pagos.controls[i];
      imp.controls['cambio'].patchValue(element.paga_con - element.importe);
      i++;
    });

  }

  buscar_articulo(e) {
    if (e.keyCode == 13) {
      var valor = (<HTMLInputElement>document.getElementById("buscarArticulo")).value;
      (<HTMLInputElement>document.getElementById("buscarArticulo")).value = "";
      (<HTMLInputElement>document.getElementById("buscarArticulo")).focus;
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

  cambiar_busqueda() {
    this.codigo_barras_activo = !this.codigo_barras_activo;
    (<HTMLInputElement>document.getElementById("buscarArticulo")).value = "";
    (<HTMLInputElement>document.getElementById("buscarArticulo")).focus;
  }


  time_pago;
  validar_cantidad_pago(event, modelo, cantidad, tipo, i) {
    if (event.key != 'Backspace' && event.key != 'Delete' && event.key != 'ArrowLeft' && event.key != 'ArrowRight' &&event.key !=  'ArrowUp' && event.key != 'ArrowDown' && event.key != '.' ) {
      clearTimeout(this.time_pago);
      this.time_pago = setTimeout(() => {
        this.validar_pago(event, modelo, cantidad, tipo, i);
      }, 500);
    }
  }
  validar_pago(event, modelo, cantidad, tipo, i) {

    var success = true;
    if (tipo == 'min') {
      if (modelo.value < cantidad)
        success = false;
    }
    if (tipo == 'max') {
      if (modelo.value > cantidad)
        success = false;
    }
    if (!success)
      modelo.patchValue(cantidad);

    this.calcular_importe_articulo();
  }
  reset_form() {
    this.selected = '';
    this.startValue = '';
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
  error_resguardos = false;
  resguardos_ok = false;
  json;

  enviar() {
    this.cargando = true;
    this.json = this.dato.getRawValue();

    this.crudService.crear(this.json, "resguardos-devolucion").subscribe(
      resultado => {
        this.enviar_ticket(this.json, resultado);
        this.reset_form();
        this.dato.controls.tipo_movimiento_id.patchValue(11);
        this.dato.controls.status_movimientos_id.patchValue(1);
      },
      error => {
        this.error_resguardos = true;
        setTimeout( ()=> {
          this.error_resguardos = false;
        }, 2500);
      }
    );
  }

  enviar_ticket(json, resultado){
    this.cargando = false;
    this.reimprimir = true;
    var esto = this;
    this.resguardos_ok = true;
    setTimeout(()=> {
      this.resguardos_ok = false;
    }, 3000);
    this.json = resultado.data;
    this.calcular_importe_articulo();
    this.error_resguardos = false;

      setTimeout( ()=> {
        esto.imprimir();
        document.getElementById("cargar_datos_actualizar").click();
      }, 200);

    setTimeout( ()=> {
      this.resguardos_ok = false;
    }, 1500);
  }


  reimprimir = false;
  imprimir() {
    /*let pdf = new jsPDF('p', 'pt', 'letter');
    pdf.setProperties({
      title: 'Ticket',
      subject: 'YOURSOFT',
      author: 'Eliecer Ramirez Esquinca',
      keywords: 'yoursoft, web, mobile, desarrollo, agil',
      creator: 'www.yoursoft.com.mx'
    });
    var elementHandler = {
      '.equis': function (element, renderer) {
        return true;
      }
    };
    pdf.fromHTML($('body')[0], 5, 5, {
      'width': 170,
      'elementHandlers': elementHandler
    });

    pdf.output('dataurlnewwindow')*/
    var html = document.getElementById("imprimir").innerHTML;
    html = '<html lang="es">' + ' <head>' + ' <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' + ' <meta name="charset" content="UTF-8">' + ' <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' + ' <meta name="apple-mobile-web-app-capable" content="yes">' + ' <title>PDF</title> <meta name="viewport" content="initial-scale=1" />' + ' <style>html { font-size: .9em;} body{font-size: .9em;} select::-ms-expand {display: none;}</style>' + ' </head>' + ' <body>' + html + ' </body>' + ' </html>';
    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", "printf");
    iframe.setAttribute("style", "display:none");
    document.body.appendChild(iframe);

    var mywindow = <HTMLSelectElement>document.getElementById('printf');
    mywindow.contentWindow.document.write(html);
    setTimeout(function () {
      // lanzar la sentencia imprimir
      mywindow.contentWindow.print();
    }, 500);
    setTimeout(function () {
      // remover el contenedor de impresión
      document.body.removeChild(iframe);
    }, 2000);
  }

}
