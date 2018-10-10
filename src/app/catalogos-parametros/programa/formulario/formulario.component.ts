import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Params, ActivatedRoute } from '@angular/router';

import { CrudService } from '../../../crud/crud.service';
/**
 * Componente que muestra el formulario para crear o editar un programa.
 */
@Component({
  selector: 'app-programa-formulario',
  templateUrl: './formulario.component.html',
  styles: [`
    .b-checkbox {
      line-height: 1;
    }
    .select{
      width: 100%;
    }
    .b-checkbox label {
      position: relative;
      padding-left: 5px;
      cursor: pointer;
    }

    .b-checkbox label::before {
      content: "";
      position: absolute;
      width: 17px;
      height: 17px;
      left: 0;
      margin-left: -17px;
      border: 1px solid #dbdbdb;
      border-radius: 3px;
      background-color: #fff;
      transition: background .1s ease-in-out;
    }

    .b-checkbox label::after {
      position: absolute;
      width: 16px;
      height: 16px;
      left: 0;
      top: 5px;
      margin-left: -15px;
      font-size: 12px;
      line-height: 1;
      color: #363636;
    }

    .b-checkbox input[type="checkbox"],
    .b-checkbox input[type="radio"] {
      opacity: 0;
      z-index: 1;
      cursor: pointer;
    }

    .b-checkbox input[type="checkbox"]:focus + label::before,
    .b-checkbox input[type="radio"]:focus + label::before {
      outline: thin dotted;
      outline: 5px auto -webkit-focus-ring-color;
      outline-offset: -2px;
    }

    .b-checkbox input[type="checkbox"]:checked + label::after,
    .b-checkbox input[type="radio"]:checked + label::after {
      font-family: "FontAwesome";
      content: "";
    }

    .b-checkbox input[type="checkbox"]:indeterminate + label::after,
    .b-checkbox input[type="radio"]:indeterminate + label::after {
      display: block;
      content: "";
      width: 10px;
      height: 3px;
      background-color: #555555;
      border-radius: 2px;
      margin-left: -16.5px;
      margin-top: 7px;
    }

    .b-checkbox input[type="checkbox"]:disabled,
    .b-checkbox input[type="radio"]:disabled {
      cursor: not-allowed;
    }

    .b-checkbox input[type="checkbox"]:disabled + label,
    .b-checkbox input[type="radio"]:disabled + label {
      opacity: 0.65;
    }

    .b-checkbox input[type="checkbox"]:disabled + label::before,
    .b-checkbox input[type="radio"]:disabled + label::before {
      background-color: whitesmoke;
      cursor: not-allowed;
    }

    .b-checkbox.is-circular label::before {
      border-radius: 50%;
    }

    .b-checkbox.is-inline {
      margin-top: 0;
    }
  `]
})

export class FormularioComponent {
  dato: FormGroup;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean} */
  tieneid = false;

  /**
   * Contiene la lista de programas que crean el multiprograma.
   * @type {any}
   */
  multiprograma= [];
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
   * Variable que contiene el id del programa a editar
   */
  id_programa;

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],
      clave: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      programas: [''],
      estatus: ['', [Validators.required]],
      es_multiprograma: ['0']
      // programas: this.fb.array([])
    });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
        this.id_programa = params['id'];
      }
    });
    document.getElementById('catalogoPrograma').click();
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
    this.multiprograma = [];
    this[modelo] = [];
    this.cargandoCatalogo = true;
    this.crudService.lista_general(url).subscribe(
      resultado => {
        this.cargandoCatalogo = false;
        let contador = 0;
        let id_temporal = this.dato.controls.id.value;
        for (let item of resultado) {
          if ((item[estado] === 1 || item[estado] === '1') && item['es_multiprograma'] !== 1 && item.id !== Number(this.id_programa)) {
            this[modelo].push(item);
          }
        }
      }
    );
  }

  /**
   * Este método se utiliza para limpiar un array que contiene datos.
   * @param array Nombre del array que ha de limpiarse.
   */
  limpiar_array(nombre_array, multiprograma) {
    // this[nombre_array] = [];
    this[multiprograma] = [];
    this.dato.get(nombre_array).patchValue('');
    console.log(nombre_array, this.dato.value);
  }

  /**
     * Este método agrega un objeto a un array de elementos.
     * ejemplo <code>(click)="agregarLista('multiprograma', lista_programas, item)"</code>
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
      // Esta operación nos permite guardar únicamente el id de cada programa seleccionado en un arreglo.
      let arreglo = [];
      for (let c = 0; c < this[json].length; c++) {
        arreglo.push(this[json][c].id);
      }
      this.dato.get('programas').patchValue(arreglo);
    }

}
