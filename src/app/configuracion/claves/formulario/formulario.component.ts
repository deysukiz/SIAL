import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'almacenes-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  /**
   * Contiene el tipo de insumo médico para mostrar la etiqueta correcta en la vista.
   * @type {string}
   */
  tipo= 'ME';
  /**
   * Contiene el valor 1 cuando el insumo médico es CAUSES y 0 cuando es NO CAUSES.
   * @type {number}
   */
  es_causes= 1;
  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API,
   * y son los mismos datos que podemos ver al consultar las claves de la unidad médica.
   * @type {FormGroup} */
  dato: FormGroup;
  /**
   * Variable que contien el valor _true_ cuando se está ejecutando un procesos para cargar datos.
   * @type {boolean}
   */
  cargando_claves_disponibles = false;
  /**
   * Variable que contien el valor _true_ cuando se está ejecutando un procesos para cargar datos.
   * @type {boolean}
   */
  cargando = true;
  /**
   * Contiene la información del insumo médico que se está agregando.
   * @type {array}
   */
  insumo;
  /**
   * Contiene el valor 1 cuando el insumo médico es UNIDOSIS y 0 cuando NO ES UNIDOSIS.
   * @type {number}
   */
  es_unidosis;
  /**
   * Variable que sirve como bandera para identificar si los datos de las
   * fechas de última actualización han sido cargadas satisfactoriamente.
   * @type {boolean}
   */
  actualizado;
  /**
   * Variable que sirve como bandera para identificar si ha ocurrido un error
   * al cargar los datos de la última actualización.
   * @type {boolean}
   */
  error_actualizacion;
  /**
   * Variable que contiene la última fecha de actualización de las claves.
   * @type {date}
   */
  actualizacion;
  /**
   * Contiene el nombre del usuario que realizó la última actualización.
   * @type {string}
   */
  actualizacion_usuario;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean}
   */
  tieneid;
  /**
   * Contiene la URL donde se hace la búsqueda de insumos médicos
   * @type {string} */
  public insumos_term = `${environment.API_URL}/insumos-auto?term=:keyword`;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del módulo
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef  ) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.cargando_claves_disponibles = true;

    let usuario = JSON.parse(localStorage.getItem('usuario'));

    this.dato = this.fb.group({
      clues: ['', [Validators.required]],
      jurisdiccion_id: [''],
      nombre: [''],
      activa: [''],
      director_id: [''],
      clues_claves: this.fb.array([])
    });

    try {
      this.route.params.subscribe(params => {
        if (params['clues']) {
          this.tieneid = true;
          console.log(this.dato);
        }
      });
    } catch (e) {
      console.log('Error');
    }

    if (usuario.clues_activa) {
      this.insumos_term += '&clues=' + usuario.clues_activa.clues;
    }
    if (usuario.almacen_activo) {
      this.insumos_term += '&almacen=' + usuario.almacen_activo.id;
    }
    document.getElementById('catalogos').click();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    document.getElementById('actualizar').click();
  }


  /**
   * Este método formatea los resultados de la busqueda en el autocomplete
   * @param data resultados de la busqueda 
   * @return void
   */
  autocompleListFormatter = (data: any) => {
    let html = `
    <div class="card">
      <div class="card-content">
        <div class="media">          
          <div class="media-content">
            <p class="title is-4"> <!-- ${data.nombre} --> <small>${data.descripcion}</small></p>
            <p class="subtitle is-6">
              <strong>Clave: </strong> ${data.clave}) 
              `;
    
              if(data.es_causes == 1)
              html += `<label class="tag is-success" ><strong>Cause </strong></label>`;
              if(data.es_causes == 0)
              html += `<label class="tag" style="background: #B8FB7E; border-color: #B8FB7E; color: rgba(0,0,0,0.7);">
                <strong>No Cause </strong> </label>`; 
              if(data.es_unidosis == 1)                                                                 
              html += `<label class="tag is-warning" ><strong>Unidosis</strong> </label>`;
              
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
    this.insumo = data;
    // Si es un objeto, quiere decir que trae los datos del insumo, entonces debe agregarse la clave
    // si no es objeto no debe agregarse porque los valores del insumo irían en null hacia la api.
    if (typeof this.insumo === 'object') {
      this.agregarClave();
    }
    (<HTMLInputElement>document.getElementById('buscarInsumo')).value = '';
    this.es_unidosis = data.es_unidosis;
    this.cargando = false;
  }

  /**
     * Este método agrega las claves de los insumos al formulario reactivo
     * @return void
     */
  agregarClave() {
    // obtener el formulario reactivo para agregar los elementos
    const control = <FormArray>this.dato.controls['clues_claves'];

    // comprobar que el isumo no este en la lista cargada, si está en la lista no se agrega
    let existe = false;
    let c;

    for ( c = 0; c < control.length; c++) {
      if (this.insumo.clave === control.value[c].clave_insumo_medico) {
        existe = true;
      }
    }
    // crear el json que se pasara al formulario reactivo tipo insumos
    let temporal_cantidad_x_envase;
    if (this.insumo.cantidad_x_envase == null) {
      temporal_cantidad_x_envase = 1;
    }else {
      temporal_cantidad_x_envase = this.insumo.cantidad_x_envase;
    }
    let insumo = {
      'clave_insumo_medico': this.insumo.clave,
      'nombre': this.insumo.nombre,
      'descripcion': this.insumo.descripcion,
      'es_causes': this.insumo.es_causes,
      'es_unidosis': this.insumo.es_unidosis,
      'tipo': this.insumo.tipo,
      'codigo_barras': [''],
      'unidad_medida': [''],
      'cantidad_x_envase': parseInt(temporal_cantidad_x_envase),
    };

    // si no esta en la lista agregarlo
    if (!existe) {
      control.push(this.fb.group(insumo));
    }
  }
}
