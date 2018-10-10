import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'medicamentos-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],      
      insumo_medico_clave: ['', [Validators.required]],      
      cantidad_x_envase: ['', [Validators.required]] ,
      concentracion: ['', [Validators.required]] ,
      contenido: ['', [Validators.required]] ,
      dosis: [''] ,
      es_controlado: [''] ,
      es_surfactante: [''] ,
      indicaciones: ['', [Validators.required]] ,
      unidad_medida_id: ['', [Validators.required]]  ,
      forma_farmaceutica_id: [''] ,
      presentacion_id:[''] ,
      via_administracion_id: ['', [Validators.required]] ,
    });  
    
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();  
  }
  
}