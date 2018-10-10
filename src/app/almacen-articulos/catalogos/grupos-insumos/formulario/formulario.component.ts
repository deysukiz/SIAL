import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'tipos-movimeintos-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  tipo: any[] = [];
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],      
      tipo: ['E', [Validators.required]] ,
      nombre: ['', [Validators.required]],
      numero: ['', [Validators.required]]    
    });  
    this.tipo=[{id:"ME", nombre:"Medicamentos"}, {id:"MC", nombre:"Material de curación"}, {id:"AD", nombre:"Auxiliares de diagnósticos"}];
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    //document.getElementById("catalogos").click();  
  }
  
}