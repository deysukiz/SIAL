import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
// import { EventEmitter } from 'selenium-webdriver';
@Component({
  selector: 'app-modal-programas',
  templateUrl: './modal-programas.component.html'
})

export class ModalProgramasComponent {
  /**
   *  Salida de datos 
   */
  @Output() MultiprogramaJson = new EventEmitter();
  /**
   * Formulario reactivo que contiene los datos referente a los programas que se enviarán a la API
   * y son los mismos datos que podemos ver al consultar los programas.
   * @type {FormGroup} */
  dato2: FormGroup;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro clues, lo que significa que ha de mostrar 'Mis programas'
   * de la CLUES correspondiente y los programas disponibles.
   * @type {Boolean} */
  tieneid = false;
  /**
   * Contiene __false__ como valor inicial para poder mostrar el botón de cargar programas.
   * Cuando su valor es __false__ quiere decir que los programas ya se cargaron.
   * @type {Boolean} */
  mostrar_pantalla= false;
  /**
   * Se tuvo que crear la variable debido a que se debe hacer referencia únicamente cuando se esté actualizando
   * el catálogo de programas y no cada vez que se esté cargando otros elementos.
   */
  cargandoCatalogo = false;

  /**
   * Contiene la lista de programas
   * @type {any}
   */
  lista_programas= [];

  /**
   * Contiene la lista de programas que crean el multiprograma.
   * @type {any}
   */
  multiprograma= [];

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: CrudService,
    private _sanitizer: DomSanitizer) { }


  ngOnInit() {

    let usuario = JSON.parse(localStorage.getItem('usuario'));

    this.dato2 = this.fb.group({
      programas: ['', [Validators.required]],
      jurisdiccion_id: ['']
    });

    this.route.params.subscribe(params => {
      if (params['clues']) {
        this.tieneid = true;
      }
    });
    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogoPrograma').click();
  }

  ngAfterViewInit() {
    document.getElementById('actualizar').click();
  }

  /**
   * Función local para cargar el catalogo de programas, no se utilizó el cargarCatalogo del CRUD,
   * debido a que este catálogo no existen 'mis-programas', sino que es un catálogo general y se agregan
   * al arreglo únicamente aquellos programas que se encuentran activos (status = 1).
   * @param url Contiene la cadena con la URL de la API a consultar para cargar el catalogo del select.
   * @param modelo Contiene el nombre de la variable en la que se guardan los resultados de la consulta a la API.
   * @param estado Contiene el valor de la variable que representa el estado de cada item.
   */
  cargarCatalogo(url, modelo, estado) {
    this.multiprograma = [];
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

  /**
     * Este método agrega un objeto a un array de elementos para mover
     * ejemplo <code>(click)="agregarLista('multiprograma', ctrl.dato.controls.almacen_tipos_movimientos.controls, item)"</code>
     * @param json Lista a la que agrega los datos.
     * @param modelo  modelo que corresponde al array a agregar los elementos
     * @param valor valor a agregar al array
     * @return void
     */
    agregarLista(json, modelo, valor) {
      let i = this[json].indexOf(valor);
      if (i > -1) {
          this[json].splice(i, 1);
      } else {
          this[json].push(valor);
      }
  }

  enviar(json) {
    this.MultiprogramaJson.next([this.multiprograma]);
  }
}
