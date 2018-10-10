import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'categorias-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  form_tipos_personal_metadatos;
  tipos;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],      
      nombre: ['', [Validators.required]],
      tipos_personal_metadatos: this.fb.array([])   
    });  
    this.form_tipos_personal_metadatos = {
      campo:['', [Validators.required]], 
      descripcion: [''],  
      tipo:['', [Validators.required]], 
      longitud:[1, [Validators.required]], 
      requerido:[1]
    }
    this.tipos = [
      {id: "text", nombre: "Texto"},
      {id: "number", nombre: "Número"},
      {id: "boolean", nombre: "Falso/Verdadero"},
      {id: "timestamp", nombre: "Fecha:hora"},
      {id: "date", nombre: "Fecha"},
      {id: "time", nombre: "Hora"},
      {id: "file", nombre: "File"}
    ]
  }
  
}