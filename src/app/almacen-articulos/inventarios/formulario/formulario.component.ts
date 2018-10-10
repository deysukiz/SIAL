import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'inventarios-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  tab = 1;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dato = this.fb.group({
      id: [''],
      articulo_id: ['', [Validators.required]],
      numero_inventario: ['', [Validators.required]],
      existencia: ['', [Validators.required]],
      baja: [0],
      observaciones: [''],
      inventario_metadato: this.fb.array([])
    });
    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();
  }
  valor = [];
  seleccionar_articulo(articulos){
    var id = this.dato.get('articulo_id').value;
    var campos = {};
    this.dato.controls.inventario_metadato.reset();
    articulos.forEach(element => {
      if(element.id == id){        
        element.categoria.categorias_metadatos.forEach(ele => {
          this.valor.push('');
          campos["metadatos_id"] = [ele.id];
          campos["campo"] = [ele.campo,[Validators.required]];
          campos["descripcion"] = [ele.descripcion];
          campos["longitud"] = [ele.longitud];
          campos["tipo"] = [ele.tipo];
          campos["requerido"] = [ele.requerido];
          
          if(ele.requerido == 1){            
            campos["valor"] = ['',[Validators.required]];
          }
          else{
            campos["valor"] = [''];
          }  
          const im = <FormArray>this.dato.controls.inventario_metadato;  
          im.push(this.fb.group(campos));      
        });
        return;
      }
    });    
  }
  asignar_fecha(i){
    setTimeout(()=> {     
      var v = <HTMLInputElement>document.getElementById("valor"+i);
      
      const im = <FormArray>this.dato.controls.inventario_metadato;  
      const ii = <FormGroup>im.controls[i];
      ii.controls.valor.patchValue(v.value);
    }, 300);    
  }
}