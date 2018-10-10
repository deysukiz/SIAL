import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'

import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-abasto',
  templateUrl: './abasto.component.html',
  styleUrls: ['./abasto.component.css'],

})
export class AbastoComponent implements OnInit {

  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION
  
  // # SECCION: Filtro
  clues:string = "";
  jurisdicciones:any[] = [];
  proveedores:any[] = [];

  jurisdiccionesSeleccionadas:any[] = [];
  proveedoresSeleccionados:any[] = [];

  ordenarCauses:string = '';
  ordenarNoCauses:string = '';
  ordenarMaterialCuracion:string = '';

  // # FIN SECCION

   // # SECCION: Lista
  lista: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 25;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = []
  // # FIN SECCION
  
  constructor(private title: Title, private apiService: AdministradorCentralService) { }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Abasto / Administrador central");
    this.listar(1);
    
    this.cargarJurisdicciones();
    this.cargarProveedores();
  }
  cargarJurisdicciones(){
    this.apiService.jurisdicciones().subscribe(
      respuesta => {
        this.jurisdicciones = respuesta;
      }, error => {

      }
    );
  }
  cargarProveedores(){
    this.apiService.proveedores().subscribe(
      respuesta => {
        console.log(respuesta)
        this.proveedores = respuesta;
        //console.log(this.proveedores)
      }, error => {

      }
    );
  }


  cambioSeleccionJurisdiccion(id){
    if (id == -1){
      this.jurisdiccionesSeleccionadas = [];
    }
    this.agregarJurisdiccion(id);
  }
  cambioSeleccionProveedor(id){
    if (id == -1){
      this.proveedoresSeleccionados = [];
    }

    this.agregarProveedor(id);
  }

  agregarProveedor(id:any){
    if (id == -1){
      return;
    }
    // Si existe en el filtro no la agregamos
    for(var i in this.proveedoresSeleccionados){
      if(this.proveedoresSeleccionados[i].id == id){
        return;
      }
    }

    for(var i in this.proveedores){
      if(this.proveedores[i].id == id){
        this.proveedoresSeleccionados.push(this.proveedores[i]);
        break;
      }
    }
    
  }
  agregarJurisdiccion(id:any){
    if (id == -1){
      return;
    }
    // Si existe en el filtro no la agregamos
    for(var i in this.jurisdiccionesSeleccionadas){
      if(this.jurisdiccionesSeleccionadas[i].id == id){
        return;
      }
    }

    for(var i in this.jurisdicciones){
      if(this.jurisdicciones[i].id == id){
        this.jurisdiccionesSeleccionadas.push(this.jurisdicciones[i]);
        break;
      }
    }
  }
  quitarProveedor(index){        
    this.proveedoresSeleccionados.splice(index,1);
  }
  quitarJurisdiccion(index){    
    this.jurisdiccionesSeleccionadas.splice(index,1);
  }
  filtrarClues(e: KeyboardEvent) {
    if(e.keyCode == 13){
      this.listar(1);
    }
  }

  toggleCauses(){
    switch(this.ordenarCauses){
      case '': this.ordenarCauses = 'ASC'; break;
      case 'ASC': this.ordenarCauses = 'DESC'; break;
      case 'DESC': this.ordenarCauses = ''; break;
      default: this.ordenarCauses = '';
    }
    this.ordenarNoCauses = '';
    this.ordenarMaterialCuracion = '';
    this.listar(1);
  }

  toggleNoCauses(){
    switch(this.ordenarNoCauses){
      case '': this.ordenarNoCauses = 'ASC'; break;
      case 'ASC': this.ordenarNoCauses = 'DESC'; break;
      case 'DESC': this.ordenarNoCauses = ''; break;
      default: this.ordenarNoCauses = '';
    }
    this.ordenarCauses = '';
    this.ordenarMaterialCuracion = '';
    this.listar(1);
  }
  toggleMaterialCuracion(){
    switch(this.ordenarMaterialCuracion){
      case '': this.ordenarMaterialCuracion = 'ASC'; break;
      case 'ASC': this.ordenarMaterialCuracion = 'DESC'; break;
      case 'DESC': this.ordenarMaterialCuracion = ''; break;
      default: this.ordenarMaterialCuracion = '';
    }
    this.ordenarCauses = '';
    this.ordenarNoCauses = '';
    this.listar(1);
  }

  listar(pagina:number): void {
    this.cargando = true;
    this.paginaActual = pagina;



    var proveedoresIds = [];
    for(var i in this.proveedoresSeleccionados){
      proveedoresIds.push(this.proveedoresSeleccionados[i].id);
    }


    var jurisdiccionesIds = [];
    for(var i in this.jurisdiccionesSeleccionadas){
      jurisdiccionesIds.push(this.jurisdiccionesSeleccionadas[i].id);
    }

    var  parametros =  {
      clues: this.clues,
      proveedores: proveedoresIds,
      jurisdicciones: jurisdiccionesIds,
      page: this.paginaActual,
      per_page: this.resultadosPorPagina,
      ordenar_causes: this.ordenarCauses,
      ordenar_no_causes: this.ordenarNoCauses,
      ordenar_material_curacion: this.ordenarMaterialCuracion
    }
    //var parametros = JSON.stringify(parametrosObj);
    this.apiService.abasto(parametros).subscribe(
      respuesta => {
          this.cargando = false;
          this.lista = respuesta.data as any[];
          this.total = respuesta.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          console.log("Items cargados.");
      }, error => {
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
    )
  }
  exportar(){

    var query = "token="+localStorage.getItem('token')+"&ordenar_causes="+this.ordenarCauses+"&ordenar_no_causes="+this.ordenarNoCauses+"&ordenar_material_curacion="+this.ordenarMaterialCuracion;
    
    if(this.clues!= ""){
      query += "&clues="+this.clues;
    }

    var lista_proveedores = "";
    for(var i in this.proveedoresSeleccionados){
      if(lista_proveedores != ""){
        lista_proveedores += ",";
      }
      lista_proveedores += ""+this.proveedoresSeleccionados[i].id;
    }

    if(lista_proveedores != ""){
      query += "&proveedores="+lista_proveedores;
    }
    

    var lista_jurisdicciones = "";
    for(var i in this.jurisdiccionesSeleccionadas){
      if(lista_jurisdicciones != ""){
        lista_jurisdicciones += ",";
      }
      lista_jurisdicciones += ""+this.jurisdiccionesSeleccionadas[i].id;
    }
    if(lista_jurisdicciones != ""){
      query += "&jurisdicciones="+lista_jurisdicciones;
    }
    window.open(`${environment.API_URL}/administrador-central/abasto-excel?${query}`);
   
    
    
  }
  // # SECCION: Paginación
  paginaSiguiente():void {
    this.listar(this.paginaActual+1);
  }
  paginaAnterior():void {
    this.listar(this.paginaActual-1);
  }
}
