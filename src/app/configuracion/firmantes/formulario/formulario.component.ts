import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription }   from 'rxjs/Subscription';

import { FirmanteService } from '../firmante.service';
import { environment } from '../../../../environments/environment';

import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  firmantes: FormGroup;
  cargando:boolean = false;
  cargando_personal:boolean = false;
  showFirmante:boolean = false;
  agregando_personal:boolean = false;
  personal_seleccionado:number = 0;
  buscarPersonal:string = "";

  paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
  personal:any[] = [];
  pedidos:any[] = [];
  pedidos_check:any[] = [];

	paginasTotales = 0;
	indicePaginas:number[] = [];
	// # SECCION: Resultados de búsqueda
	ultimoTerminoBuscado = "";
	terminosBusqueda = new Subject<string>();
	resultadosBusqueda: any;
	busquedaActivada:boolean = false;
	paginaActualBusqueda = 1;
	resultadosPorPaginaBusqueda = 10;
	totalBusqueda = 0;
	paginasTotalesBusqueda = 0;
	indicePaginasBusqueda:number[] = [];

	mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion:any;
  
  constructor(
  	private title: Title, 
    private location: Location, 
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone, 
    private fb: FormBuilder,
    private firmanteService: FirmanteService
    ) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
  	this.firmantes = this.fb.group({
        firma_director:     ['', []],
        id_firma_director:  ['', []],
        firma_almacen: ['', []],
        id_firma_almacen:  ['', []],
        pedidos: this.fb.array([])
    });

    this.listar_pedido();
    

    this.title.setTitle('Firmantes / Configuración');

    var self = this;

    var busquedaSubject = this.terminosBusqueda
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  { 

      this.ultimoTerminoBuscado = term;
      this.paginaActualBusqueda = 1;
      this.cargando_personal = true; 	  
 	    return this.firmanteService.buscar_personal(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda)
    
    }).catch( function handleError(error){ 
     
      self.cargando_personal = false;      
      self.mensajeError.mostrar = true;
      self.ultimaPeticion = function(){self.listarBusqueda(self.ultimoTerminoBuscado,self.paginaActualBusqueda);};//OJO
      try {
        let e = error.json();
        if (error.status == 401 ){
          self.mensajeError.texto = "No tiene permiso para hacer esta operación.";
        }
      } catch(e){
        console.log("No se puede interpretar el error");
        
        if (error.status == 500 ){
          self.mensajeError.texto = "500 (Error interno del servidor)";
        } else {
          self.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
        }            
      }
      // Devolvemos el subject porque si no se detiene el funcionamiento del stream 
      return busquedaSubject
    
    });

    busquedaSubject.subscribe(
      resultado => {
        this.cargando_personal = false;
        this.personal = resultado.data;
        this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }
       
      }

    );
  }

   buscar_firmante(id:number, text:string):void
   {
      this.personal = [];
  		this.showFirmante = !this.showFirmante;
      this.personal_seleccionado = id; 
      this.buscarPersonal = text;
   }

   buscar_personal(term:string):void
   {
      this.terminosBusqueda.next(term);
   }

   listar(pagina:number): void {
    this.paginaActual = pagina;
    
    this.cargando_personal = true;
    this.firmanteService.lista(pagina,this.resultadosPorPagina).subscribe(
        resultado => {

          this.cargando_personal = false;
          this.personal = resultado.data;
          this.totalBusqueda = resultado.total | 0;
          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

          this.indicePaginasBusqueda = [];
          for(let i=0; i< this.paginasTotalesBusqueda; i++){
            this.indicePaginasBusqueda.push(i+1);
          }
          
        },
        error => {
          this.cargando_personal = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = this.listar;
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
          } catch(e){
            console.log("No se puede interpretar el error");
            
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }            
          }

        }
      );
    }

    obtener_firmantes(): void {
      this.cargando = true;
      this.firmanteService.firmantes().subscribe(
        resultado => {

         this.cargando = false;
          if(resultado['unidad']['director'])
          {
              this.firmantes.patchValue({firma_director: resultado['unidad']['director']['nombre'], id_firma_director: resultado['unidad']['director']['id']});
          }
          if(resultado['almacen']['encargado'])
          {
            this.firmantes.patchValue({firma_almacen: resultado['almacen']['encargado']['nombre'], id_firma_almacen: resultado['almacen']['encargado']['id']});
          }
        },
        error => {
          this.cargando = false;
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
          } catch(e){
            console.log("No se puede interpretar el error");
            
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }            
          }

        }
      );
    }

    listar_pedido(): void {
    
      this.cargando = true;
      this.firmanteService.lista_pedido().subscribe(
          resultado => {

            this.pedidos = resultado;
            this.obtener_firmantes();
            
          },
          error => {
            this.cargando = false;
            this.mensajeError.mostrar = true;
            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
            } catch(e){
              console.log("No se puede interpretar el error");
              
              if (error.status == 500 ){
                this.mensajeError.texto = "500 (Error interno del servidor)";
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }            
            }

          }
        );
    }

   listarBusqueda(term:string ,pagina:number): void {
      this.paginaActualBusqueda = pagina;
      console.log("Cargando búsqueda.");
     
      this.cargando_personal = true;
      this.firmanteService.buscar(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
          resultado => {
            this.cargando_personal = false;
            this.personal = resultado.data;
            this.totalBusqueda = resultado.total | 0;
            this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

            this.indicePaginasBusqueda = [];
            for(let i=0; i< this.paginasTotalesBusqueda; i++){
              this.indicePaginasBusqueda.push(i+1);
            }
            
          },
          error => {
            this.cargando_personal = false;
            this.mensajeError.mostrar = true;
            this.ultimaPeticion = function(){this.listarBusqueda(term,pagina);};
            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
            } catch(e){
              console.log("No se puede interpretar el error");
              
              if (error.status == 500 ){
                this.mensajeError.texto = "500 (Error interno del servidor)";
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }            
            }

          }
        );
    }

    AgregarPersonal(personal:string):void
    {
      this.agregando_personal = true;
      if(this.personal_seleccionado == 1)
      {
        this.firmantes.patchValue({firma_director:personal, id_firma_director:0});
      }
      else if(this.personal_seleccionado == 2)
      {
        this.firmantes.patchValue({firma_almacen:personal, id_firma_almacen:0});
      }
      this.showFirmante = false;
      this.asignar_firmantes();
    }

    asignar_firmantes(): void
    {
      if(prompt("Para actualizar los firmastes de esta unidad por favor escriba ACTUALIZAR ") == "ACTUALIZAR")
      {
        this.firmanteService.actualizar_firmantes(this.firmantes.value).subscribe(
          resultado => {
            this.agregando_personal = false;
            this.mensajeExito = new Mensaje(true);
            this.mensajeExito.mostrar = true;             
            this.mensajeExito.texto = "Se ha asignado correctamente los firmantes";
            this.reset_pedidos();
            this.listar_pedido();
          },
          error => {
            this.mensajeError = new Mensaje(true);
           this.agregando_personal = false;
            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
            } catch(e){
              console.log("No se puede interpretar el error");
              
              if (error.status == 500 ){
                this.mensajeError.texto = "500 (Error interno del servidor)";
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }            
            }
            this.mensajeError.texto = "Ha ocurrido un error al asignar los firmantes";
            this.mensajeError.mostrar = true; 

          }
        );
      }
    }

  

  seleccionarPersonal(obj:any):void
  {
    if(this.personal_seleccionado == 1)
    {
      this.firmantes.patchValue({firma_director:obj.nombre, id_firma_director:obj.id});
    }
    else if(this.personal_seleccionado == 2)
    {
      this.firmantes.patchValue({firma_almacen:obj.nombre, id_firma_almacen:obj.id});
    }

    this.showFirmante = false;

  }

  eliminar_firmante(id:number):void
  {
      if(id == 1)
      {
          this.firmantes.patchValue({firma_director:'', id_firma_director:'NULL'});
      }
      if(id == 2)
      {
          this.firmantes.patchValue({firma_almacen:'', id_firma_almacen:'NULL'});
      }
  }

  reset_pedidos():void
  {
      const pedidosFormArray = <FormArray>this.firmantes.controls.pedidos;
      console.log(pedidosFormArray.length);
      for(var i = (pedidosFormArray.length-1); i>=0; i--)
        pedidosFormArray.removeAt(i);
    
  }

  updateCheckedOptions(item:string, isChecked: any): void
  {
    const pedidosFormArray = <FormArray>this.firmantes.controls.pedidos;

      if(isChecked.target.checked) {
        pedidosFormArray.push(new FormControl(item));
      } else {
        let index = pedidosFormArray.controls.findIndex(x => x.value == item)
        pedidosFormArray.reset();
      }  

      console.log(this.firmantes);
  }

  paginaSiguiente():void {
      this.listar(this.paginaActual+1);
  }

	paginaAnterior():void {
	    this.listar(this.paginaActual-1);
	}

	paginaSiguienteBusqueda(term:string):void {
	    this.listarBusqueda(term,this.paginaActualBusqueda+1);
	}
	paginaAnteriorBusqueda(term:string):void {
	    this.listarBusqueda(term,this.paginaActualBusqueda-1);
	}
}
