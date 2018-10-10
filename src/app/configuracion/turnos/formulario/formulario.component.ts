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
  dato: FormGroup;
  actualizado: boolean = false;
  actualizacion;
  error_actualizacion;
  actualizacion_usuario;
  cargando_claves_disponibles = false;
  tieneid: boolean = false;

  tab: number = 2;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private _sanitizer: DomSanitizer) { }

  ngOnInit() {

    var usuario = JSON.parse(localStorage.getItem('usuario'));

    this.dato = this.fb.group({
      clues: ['', [Validators.required]],
      jurisdiccion_id:[''],
      nombre:[''],
      activa:[''],
      director_id:[''],
      clues_turnos: this.fb.array([])
    });
    this.route.params.subscribe(params => {
      if (params['clues']) {
        this.tieneid = true;
      }
    });
    document.getElementById('catalogos').click();
  }
  
  ngAfterViewInit() {
     document.getElementById('actualizar').click();
    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
  }

  cargarValidar() {
    this.cargando_claves_disponibles = true;
    
      // obtener el formulario reactivo para agregar los elementos
      const control = <FormArray>this.dato.controls['clues_claves'];
      let c = 0;
      let tempUpdateAt = '';
      let temp_usuario_id = '';

      // Solo si se tiene el control mover izquierda-derecha poner un 
      // <a id="initMover"
      // (click)="ctrl.initMover(ctrl.dato.controls.almacen_tipos_movimientos.controls, ctrl.tipos_movimientos)>refresh</a>
      // incrementar el tiempo segun sea el caso para que cargue el catalogo en este caso va a acrgar 2 catalogos por eso pongo 5000
      if (control) {
        // document.getElementById('catalogos').click();
        this.cargando_claves_disponibles = false;
      }
      // Comprobar si el arreglo no está vacío
      if (control.value.length !== 0) {
        // Comprobacion de la última fecha en la que se modificó y el usuario que lo hizo
        if (control.value[c].updated_at) {
          tempUpdateAt = control.value[c].updated_at;
          this.error_actualizacion = false;
        } else if (control.value[c].created_at) {
          tempUpdateAt = control.value[c].created_at;
          this.error_actualizacion = false;
        } else {
          this.error_actualizacion = true;
        }
        temp_usuario_id = control.value[c].usuario_id;
        for (c = 0; c < control.length; ) {
          if (control.value[c].updated_at > tempUpdateAt) {
            tempUpdateAt = control.value[c].updated_at;
            temp_usuario_id = control.value[c].usuario_id;
          }
          c = c + 1;
        }
        this.actualizacion = tempUpdateAt;
        this.actualizacion_usuario = temp_usuario_id;
        this.actualizado = true;
      }else {
        this.error_actualizacion = true;
        this.actualizacion_usuario = 'Sin actualización';
      }
  }
}
