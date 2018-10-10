import { Component, OnInit, NgZone, ViewChild, ElementRef  } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription }   from 'rxjs/Subscription';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { RecetaService } from '../receta.service';

import { Mensaje } from '../../../mensaje';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';


@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

   @ViewChild("searchBoxPersonal") inputSearchPersonal: ElementRef;
   @ViewChild("searchBoxPaciente") inputSearchPaciente: ElementRef;



  datos_receta: FormGroup;
  datos_paciente: FormGroup;
  insumo_receta: FormGroup;
  id_receta: number;
  folio: string ="";
  usuario: any = {}

  erroresEnInsumos:any = {lista:{}, errores:0};

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;

  // # FIN SECCION

  // Variables del sistema
  buscarPersonal = "";
  buscarPaciente = "";
  cargando_personal:boolean = false;
  cargando_personal_pacientes:boolean = false;
  cargando_insumos:boolean = false;
  cargando: boolean = false;
  guardando: boolean = false;
  cargandoInsumos: boolean = false;
  lista_insumos: boolean = true;
  formularioTitulo: string = "";
  // Fiin de variables del entonno del sistema

  // # SECCION: Modal Insumos
  mostrarModalInsumos = false;
  mostrarBuscadorPersonas = false;
  mostrarBuscadorPacientes = false;
  form_paciente = false;
  datos_insumo = false;
  // Akira: Lo volvy tipo any en lugar de string porque en pedidos jurisdiccionales se agregan más datos :P
  listaClaveAgregadas: any[] = [];
  // # FIN SECCION


  // Personal busqueda
  paginaActual = 1;
  resultadosPorPagina = 6;
  total = 0;
  personal_medico:any[] = [];
  personal_paciente:any[] = [];
  insumos:any[] = [];
  insumos_busqueda:any[] = [];

  paginasTotales = 0;
  indicePaginas:number[] = [];
  // # SECCION: Resultados de búsqueda
  ultimoTerminoBuscado = "";
  terminosBusqueda = new Subject<string>();
  terminosBusquedaPaciente = new Subject<string>();
  terminosBusquedaInsumo = new Subject<string>();
  resultadosBusqueda: any;
  busquedaActivada:boolean = false;
  paginaActualBusqueda = 1;
  resultadosPorPaginaBusqueda = 6;
  totalBusqueda = 0;
  paginasTotalesBusqueda = 0;
  indicePaginasBusqueda:number[] = [];

  //Fin busqueda
  // # FIN SECCION

  // ######### PEDIDOS JURISDICCIONALES #########

  constructor(
    private title: Title,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone,
    private fb: FormBuilder,
    private cambiarEntornoService:CambiarEntornoService,
    private recetaService: RecetaService
  ) { }

  ngOnInit() {
  	var usuario =  JSON.parse(localStorage.getItem("usuario"));
    this.title.setTitle('Formulario receta');

    this.formularioTitulo = "Receta Nueva";

    this.datos_receta = this.fb.group({
      paciente_id: ['', [Validators.required]],
      paciente_name: ['', [Validators.required]],
      personal_id: ['', [Validators.required]],
      personal_name: ['', [Validators.required]],
      diagnostico: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      insumos: this.fb.array([])
    });

    this.datos_paciente = this.fb.group({
           nombre: ['', [Validators.required]],
           sexo: ['', [Validators.required]],
           fecha_nacimiento: ['', [Validators.required]],
           no_expediente: ['', [Validators.required]],
           no_afiliacion: ['', [Validators.required]],
           receta: ['1', [Validators.required]],
           conocido: ['1', [Validators.required]],
           responsableconocido: ['0', [Validators.required]],

    });

    this.insumo_receta = this.fb.group({
           dosis: ['', [Validators.required]],
           frecuencia: ['', [Validators.required]],
           duracion: ['', [Validators.required]],
           sugerido: ['', [Validators.required]],
           cantidad: ['', [Validators.required]],
       
    });

    
    this.usuario = JSON.parse(localStorage.getItem('usuario'));


    this.route.params.subscribe(params => {
      this.id_receta = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
    });

    if(!this.id_receta)
    {
    	let date = new Date();
    	this.datos_receta.patchValue({fecha: date.toISOString().substring(0, 10)});
    }

    var self = this;

    var busquedaSubject = this.terminosBusqueda
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  {

      /*this.ultimoTerminoBuscado = term;
      this.paginaActualBusqueda = 1;*/
      this.cargando_personal = true;
      //console.log("entro en busqueda "+term);
      return this.recetaService.buscar_personal(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda)

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
        //console.log(resultado);
        this.cargando_personal = false;
        this.personal_medico = resultado.data;
        /*this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }*/

      }

    );

    var busquedaPacienteSubject = this.terminosBusquedaPaciente
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  {

      this.ultimoTerminoBuscado = term;
      //this.paginaActualBusqueda = 1;
      this.cargando_personal_pacientes = true;
      return this.recetaService.buscar_pacientes(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda)

    }).catch( function handleError(error){

      self.cargando_personal_pacientes = false;
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
      return busquedaPacienteSubject

    });

    busquedaPacienteSubject.subscribe(
      resultado => {
        this.cargando_personal_pacientes = false;
        this.personal_paciente = resultado.data;
        /*this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }*/

      }

    );

    var busquedaInsumoSubject:any = this.terminosBusquedaInsumo
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  {

      this.ultimoTerminoBuscado = term;
      this.paginaActualBusqueda = 1;
      this.cargando_insumos = true;
      return this.recetaService.buscar_insumo(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda)

    }).catch( function handleError(error){

      self.cargando_insumos = false;
      self.mensajeError.mostrar = true;
      self.ultimaPeticion = function(){self.listarBusquedaInsumo(self.ultimoTerminoBuscado,self.paginaActualBusqueda);};//OJO
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
      return busquedaPacienteSubject

    });

    busquedaInsumoSubject.subscribe(
      resultado => {
        this.cargando_insumos = false;
        this.insumos_busqueda = resultado.data;
        this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }

        console.log(this.indicePaginasBusqueda);

      }

    );

  }



  listarBusqueda(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;
    console.log("Cargando búsqueda.");

    this.cargando_personal = true;
    this.recetaService.buscar(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando_personal = false;
          this.personal_medico = resultado.data;
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


  listarBusquedaPaciente(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;
    console.log("Cargando búsqueda.");

    this.cargando_personal = true;
    this.recetaService.buscar_pacientes(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando_personal = false;
          this.personal_paciente = resultado.data;
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

  listarBusquedaInsumo(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;

    this.cargando_insumos = true;
    this.recetaService.buscar_insumo(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando_insumos = false;
          this.insumos_busqueda = resultado.data;
          this.totalBusqueda = resultado.total | 0;
          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

          this.indicePaginasBusqueda = [];
          for(let i=0; i< this.paginasTotalesBusqueda; i++){
            this.indicePaginasBusqueda.push(i+1);
          }

        },
        error => {
          this.cargando_insumos = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){this.listarBusquedaInsumo(term,pagina);};
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

   buscar_personal(term:string):void
  {
    this.terminosBusqueda.next(term);
  }

  buscar_paciente(term:string):void
  {
    this.terminosBusquedaPaciente.next(term);
  }

  buscar_insumos(term:string):void
  {
    this.terminosBusquedaInsumo.next(term);
  }

  paginaSiguiente(term:string):void {

      this.listar(term, this.paginaActual+1);
  }
  paginaAnterior(term:string):void {
      this.listar(term, this.paginaActual-1);
  }

  modal_personal(value, id):void
  {
    if(id == 1)
    {
    	this.mostrarBuscadorPersonas = true;
    	this.buscarPersonal = value;
    	this.inputSearchPersonal.nativeElement.focus();

    }else if(id==2)
    {
       this.mostrarBuscadorPacientes = true;
       this.buscarPaciente = value;
       this.inputSearchPaciente.nativeElement.focus();
    }

  }

  obtener_personal(obj_personal:any):void
  {
    this.datos_receta.patchValue({personal_name: obj_personal.nombre, personal_id:obj_personal.id});
    this.mostrarBuscadorPersonas = false;
    this.buscarPersonal = "";
    this.personal_medico = [];
  }

  obtener_pacientes(obj_paciente:any):void
  {
    this.datos_receta.patchValue({paciente_name: obj_paciente.nombre, paciente_id:obj_paciente.id});
    this.mostrarBuscadorPacientes = false;
    this.buscarPaciente = "";
    this.personal_paciente = [];
  }

  AgregarPacientes():void
  {
    this.form_paciente = true;
  }

  agregar_paciente():void
  {
    //this.datos_paciente.patchValue({receta:1, conocido:1});
    this.recetaService.crear(this.datos_paciente.value).subscribe(
        paciente => {
          console.log(paciente);
          this.cargando = false;
          console.log("Usuario creado.");

        },
        error => {
          console.log(error);
          this.cargando = false;

          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = "No especificado.";
          this.mensajeError.mostrar = true;

          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
            // Problema de validación
            if (error.status == 409){
              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";

            }
          } catch(e){

            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }

          }


        }
      );
  }

  listar(term:string, pagina:number): void {
    this.paginaActual = pagina;

    this.cargando = true;

    this.recetaService.buscar_insumo(term, pagina,this.resultadosPorPagina).subscribe(
        resultado => {

          this.cargando_insumos = false;
          this.insumos_busqueda = resultado.data;
          this.totalBusqueda = resultado.total | 0;
          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

          this.indicePaginasBusqueda = [];
          for(let i=0; i< this.paginasTotalesBusqueda; i++){
            this.indicePaginasBusqueda.push(i+1);
          }

        },
        error => {
          this.cargando = false;
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

  toggleModalInsumos():void
  {
    this.mostrarModalInsumos = true;
  }

  seleccionar_insumo(obj:any):void
  {
    this.insumos_busqueda = [];
    this.insumos_busqueda[0] = obj;
    this.datos_insumo = true;
    this.lista_insumos = false;
    
  }

  /*this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.router.navigate(['/almacen/pedidos']);
    });*/

}
