import { Component, OnInit } from '@angular/core';
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
   * Formulario reactivo que contiene los datos que se enviarán a la API.
   * @type {FormGroup}
   */
  dato: FormGroup;
  /**
   * Parte del formulario reactivo que se envía a la API para agregar un nuevo tipo de movimiento del almacén
   */
  form_almacen_tipos_movimientos: any;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro id, lo que significa que ha de mostrarse una salida por receta
   * existente. Cuando su valor es __false__ quiere decir que mostraremos la vista para crear una nueva salida.
   * @type {Boolean}
   */
  tieneid: boolean = false;
  /**
   * Variable que contiene el nivel del almacen que está creando.
   */
  nivel_almacen;
  tipo_almacen;
  proveedor_id;
  tipos_almacen: any[] = [
    { id: 'ALMPAL', nombre: 'ALMPAL' },
    { id: 'JURIS', nombre: 'JURIS' },
    { id: 'UNMED', nombre: 'UNMED' },
    { id: 'LAB', nombre: 'LAB' },
    { id: 'FARMACIA', nombre: 'FARMACIA' },
    { id: 'CENDIS', nombre: 'CENDIS' }
  ];

  niveles_almacen: any[] = [
    { id: 1, nombre: 'HACE PEDIDOS AL PROVEEDOR' },
    { id: 2, nombre: 'HACE PEDIDOS A OTRO ALMACEN DENTRO DE LA CLUES' }
  ];
  tab: number = 1;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required]],
      nivel_almacen: ['', [Validators.required]],
      tipo_almacen: ['', [Validators.required]],
      subrogado: [''],
      proveedor_id: [null],
      unidosis: [''],
      almacen_tipos_movimientos: this.fb.array([])
    });

    this.form_almacen_tipos_movimientos = {
      tipo_movimiento_id: ['', [Validators.required]]
    };
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tieneid = true;
      }
    });
    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogos').click();
  }

  ngAfterViewInit() {
    // Solo si se tiene el control mover izquierda-derecha poner un
    // <a id="initMover" (click)="ctrl.initMover(ctrl.dato.controls.almacen_tipos_movimientos.controls, ctrl.tipos_movimientos)>refresh</a>
    // incrementar el tiempo segun sea el caso para que cargue el catalogo en este caso va a acrgar 2 catalogos por eso pongo 5000
    setTimeout(() => {
      document.getElementById('initMover').click();
    }, 5000);

  }
}
