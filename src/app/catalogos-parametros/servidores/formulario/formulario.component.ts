import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'servidores-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  tipo: any[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: ['', [Validators.required]], 
      nombre: ['', [Validators.required]],     
      secret_key: ['', [Validators.required]] ,
      tiene_internet: ['0', [Validators.required]] ,
      catalogos_actualizados: ['0', [Validators.required]] ,
      version: ['', [Validators.required]] ,
      periodo_sincronizacion: ['', [Validators.required]] ,
      principal: ['0', [Validators.required]] 
    });  
    
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    //document.getElementById("catalogos").click();  
  }
  
}