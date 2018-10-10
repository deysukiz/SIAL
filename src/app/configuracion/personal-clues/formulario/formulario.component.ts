import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'personal-clues-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  /**
   * Contiene la altura del navegador en pixeles, que se calcula con _document.body.clientHeight_
   */
  tamano = document.body.clientHeight;
  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API,
   * y son los mismos datos que podemos ver al consultar personal clues.
   * @type {FormGroup} */
  dato: FormGroup;
  /**
   * Variable que contiene el número de la pestaña activa del formulario,
   * su valor puede ser 1 para mostrar los Datos Generales o 2 para Datos Detallados.
   */
  tab = 1;
  /**
   * Contiene los datos detallados del personal de la clues. Que son los campos
   * que dependiendo del tipo de personal deben cargarse.
   * @type {array}
   */
  valor = [];
  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    let usuario =  JSON.parse(localStorage.getItem('usuario'));
    this.dato = this.fb.group({
      id: [''],
      tipo_personal_id: ['', [Validators.required]],
      clues: [usuario.clues_activa.clues, [Validators.required]],
      nombre: ['', [Validators.required]],
      usuario_asignado: [''],
      celular: [''],
      email: [''],
      surte_controlados: [''],
      licencia_controlados: [''],
      // curp: ['', [Validators.required]],
      // rfc: ['', [Validators.required]],
      personal_clues_metadatos: this.fb.array([])
    });
    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogos').click();
  }
  /**
   * Método que activa los campos a mostrar de acuerdo al tipo de personal elegido. Recibe el arreglo completo de tipos de
   * personal, y con el id obtenido del campo tipo_personal_id se compara para ver que campos y valores corresponde mostrar.
   * @param tipos Array que contiene los tipos de personal que existen.
   */
  seleccionar_tipo_personal(tipos) {
    var id = this.dato.get('tipo_personal_id').value;
    var campos = {};
    this.dato.controls.personal_clues_metadatos.reset();
    tipos.forEach(element => {
      if (element.id == id) {
        element.tipos_personal_metadatos.forEach(ele => {
          this.valor.push('');
          campos['metadatos_id'] = [ele.id];
          campos['campo'] = [ele.campo, [Validators.required]];
          campos['descripcion'] = [ele.descripcion];
          campos['longitud'] = [ele.longitud];
          campos['tipo'] = [ele.tipo];
          campos['requerido'] = [ele.requerido];

          if (ele.requerido == 1) {
            campos['valor'] = ['', [Validators.required]];
          } else {
            campos['valor'] = [''];
          }
          const im = <FormArray>this.dato.controls.personal_clues_metadatos;
          im.push(this.fb.group(campos));
        });
        return;
      }
    });
  }
  /**
   * Se llama a este método cuando el tipo de valor a ingresar es una fecha en los metadatos del personal.
   * @param i Contiene el valor del índex del elemento que se va a afectar.
   */
  asignar_fecha(i) {
    setTimeout(() => {
      var v = <HTMLInputElement>document.getElementById('valor' + i);

      const im = <FormArray>this.dato.controls.personal_clues_metadatos;
      const ii = <FormGroup>im.controls[i];
      ii.controls.valor.patchValue(v.value);
    }, 300);
  }
}
