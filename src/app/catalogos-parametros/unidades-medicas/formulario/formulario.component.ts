import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'unidades-medicas-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  form_clues_servicios: any;
  tab:number = 1;
  public clues_term: string = `${environment.API_URL}/clues-auto?term=:keyword`;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private _sanitizer: DomSanitizer) { }
  
  ngOnInit() {
    this.dato = this.fb.group({
      nombre: ['', [Validators.required]],     
      clues: ['', [Validators.required]]  ,
      activa:[''] ,
      director:[''] ,
      director_id:[''] ,
      jurisdiccion_id:[''] ,
      tipo:[''] ,
      clues_servicios: this.fb.array([]),
      almacenes: this.fb.array([]),
    });  

    this.form_clues_servicios = {
      servicio_id:['', [Validators.required]]
    };
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();  
  }
}