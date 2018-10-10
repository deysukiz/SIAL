import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'articulos-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  form_articulos_metadatos;
  tipos;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],
      categoria_id: ['' , [Validators.required]]    ,
      articulo_id: ['']    ,
      nombre: ['', [Validators.required]],
      descripcion:[''],
      es_activo_fijo:[false], // SI es activo fijo:  lleva" vida útil", si NO no es necesario
      vida_util:[''],
      precio_referencia:['', [Validators.required, Validators.min(1)]],
      tiene_caducidad:[''],
      articulos_metadatos: this.fb.array([])
    });
    this.form_articulos_metadatos = {
      campo:['', [Validators.required]],
      valor: ['', [Validators.required]],
      tipo:[''],
      longitud:[''],
      requerido_inventario:[0]
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
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();
  }

  cambioActivoFijo(modelo){
    modelo.controls.vida_util.clearValidators();
    if(modelo.controls.es_activo_fijo.value){ // ES ACTIVO FIJO
      modelo.controls.vida_util.setValidators(Validators.required);
    } else {
      modelo.controls.articulos_metadatos.controls.forEach(element => {
        // console.log(element.value.requerido_inventario)
        element.controls.requerido_inventario.setValue(false);
        element.controls.tipo.setValue('');
        element.controls.longitud.setValue('');
      });
    }
    modelo.controls.vida_util.updateValueAndValidity();
  }

  cambioCheck(modelo, indice){
    modelo.controls.longitud.clearValidators();
    modelo.controls.tipo.clearValidators();
    modelo.controls.valor.clearValidators();
    //console.log(modelo.controls.requerido_inventario.value)
    if(modelo.controls.requerido_inventario.value){ // Si es requerido een inventario
      modelo.controls.longitud.setValidators(Validators.required);
      modelo.controls.tipo.setValidators(Validators.required);
    } else {
      modelo.controls.valor.setValidators(Validators.required);
    }

    modelo.controls.tipo.updateValueAndValidity();
    modelo.controls.longitud.updateValueAndValidity();
    modelo.controls.valor.updateValueAndValidity();
  }

}
