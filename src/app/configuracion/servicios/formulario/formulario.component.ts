import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-servicios-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  actualizado;
  error_actualizacion = false;
  actualizacion;
  actualizacion_usuario;
  tieneid;

  tab = 2;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef  ) { }

  ngOnInit() {

    let usuario = JSON.parse(localStorage.getItem('usuario'));

    this.dato = this.fb.group({
      clues: ['', [Validators.required]],
      jurisdiccion_id: [''],
      nombre: [''],
      activa: [''],
      director_id: [''],
      clues_servicios: this.fb.array([])
    });
    try {
      this.route.params.subscribe(params => {
        if (params['clues']) {
          this.tieneid = true;
        }
      });
    } catch (e) {
      console.log('Error');
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    document.getElementById('actualizar').click();
  }
  cargarValidar() {
      try {
      // obtener el formulario reactivo para agregar los elementos
      const control = <FormArray>this.dato.controls['clues_servicios'];
      let c = 0;
      let tempUpdateAt = '';
      let temp_usuario_id = '';

        // Comprobar si el arreglo no está vacío
        if (control.value.length != 0){
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
      } catch (e) {
        console.log('Error cachado');
      }
  }
}
