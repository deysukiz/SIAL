import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
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
  form_almacen_tipos_movimientos: any;
  tieneid: boolean = false;
  tipos_almacen: any[] = [
                            { id: "ALMPAL", nombre: "ALMPAL"},
                            { id: "JURIS", nombre: "JURIS"},
                            { id: "UNMED", nombre: "UNMED"},
                            { id: "LAB", nombre: "LAB"},
                            { id: "FARMACIA", nombre: "FARMACIA"},
                            { id: "CENDIS", nombre: "CENDIS"}
                         ];

  niveles_almacen: any[] = [
                              { id: 1, nombre: "HACE PEDIDOS AL PROVEEDOR"},
                              { id: 2, nombre: "HACE PEDIDOS A OTRO ALMACEN DENTRO DE LA CLUES"}
                           ];  
  tab:number = 1;                           
  public clues_term: string = `${environment.API_URL}/clues-auto?term=:keyword`;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private _sanitizer: DomSanitizer) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.dato = this.fb.group({
      id: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      nivel_almacen: ['', [Validators.required]] ,
      tipo_almacen: ['', [Validators.required]] ,
      clues: ['', [Validators.required]] ,
      subrogado: [''] ,
      proveedor_id: [''] ,
      unidosis: [''] ,
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
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();  
  }
  autocompleListFormatter = (data: any) => {
    let html = `<span>(${data.clues}) - ${data.nombre} </span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  
}