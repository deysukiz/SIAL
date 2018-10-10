import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'proveedores-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],      
      nombre: ['', [Validators.required]],
      rfc: [''],
      direccion: [''],
      ciudad: [''],
      contacto: [''],
      cargo_contacto: [''],
      telefono: [''],
      celular: [''],
      email: ['']    ,
      activo: ['']
    });  
    
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    //document.getElementById("catalogos").click();  
  }
  
}