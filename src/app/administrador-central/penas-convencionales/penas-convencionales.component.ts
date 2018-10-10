import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'

import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-penas-convencionales',
  templateUrl: './penas-convencionales.component.html',
  styleUrls: ['./penas-convencionales.component.css']
})
export class PenasConvencionalesComponent implements OnInit {
  cargandoResumen: boolean = false;
  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  // # SECCION: Lista
  resumen: any[] = [];
  lista: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 10;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = [];
  
  // # FIN SECCION

  // # SECCION: Filtro
  clues:string = "";
  periodos:any[] = [];
  meses:any[] = [];
  tiposUnidad:any[] = [];
  proveedores:any[] = [];

  tipoUnidadSeleccionado:any = "-1";
  periodoSeleccionado:any = "-1";
  mesSeleccionado:any = "-1";
  proveedorSeleccionado:any = "-1";

  cargandoProveedores: boolean = false;
  cargandoPeriodos: boolean = false;
  cargandoMeses: boolean = false;

  constructor(private title: Title, private apiService: AdministradorCentralService) { }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Pedidos / Administrador central");
    //this.listar(1);
    
    
    this.cargarProveedores();
    this.cargarMeses();
    this.cargarPeriodos();

    this.tiposUnidad =  [
      { tipo: 'AJ', descripcion: "Almacén Jurisdiccional"},       
      { tipo: 'HO', descripcion: "Hospital" },
      { tipo: 'HBC', descripcion: "Hospital Básico Comunitario" },
      { tipo: 'CS', descripcion: "Centro de Salud" },
      { tipo: 'HCM', descripcion: "Clínica de la Mujer" },
      { tipo: 'UM', descripcion: "Unidad  Móvil"},
      { tipo: 'OA', descripcion: "Oficina Administrativa" },
      { tipo: 'AC', descripcion: "Almacén Estatal" }
    ];
    
    
  }

  cargarProveedores(){
    this.cargandoProveedores = true;
    this.apiService.proveedores().subscribe(
      respuesta => {
        console.log(respuesta)
        this.proveedores = respuesta;
        this.cargandoProveedores = false;
        //console.log(this.proveedores)
      }, error => {
        this.cargandoProveedores = false;
      }
    );
  }

  cargarMeses(){
    if(this.periodoSeleccionado == "-1"){
      this.meses = [
        { id:1, descripcion: "ENERO"},
        { id:2, descripcion: "FEBRERO"},
        { id:3, descripcion: "MARZO"},
        { id:4, descripcion: "ABRIL"},
        { id:5, descripcion: "MAYO"},
        { id:6, descripcion: "JUNIO"},
        { id:7, descripcion: "JULIO"},
        { id:8, descripcion: "AGOSTO"},
        { id:9, descripcion: "SEPTIEMBRE"},
        { id:10, descripcion: "OCTUBRE"},
        { id:11, descripcion: "NOVIEMBRE"},
        { id:12, descripcion: "DICIEMBRE"}
      ]
      return;
    }
    this.cargandoMeses = true;
    this.meses = [];
    var payload = {};
    if(this.periodoSeleccionado != "-1"){
      payload = { periodo: this.periodoSeleccionado }
    }
    this.apiService.meses(payload).subscribe(
      respuesta => {
        console.log(respuesta)
        this.meses = respuesta;
        this.cargandoMeses = false;
        //console.log(this.proveedores)
      }, error => {
        this.cargandoMeses = false;
      }
    );
  }

  cargarPeriodos(){
    this.cargandoPeriodos = true;
    this.periodos = [];
    this.apiService.periodos().subscribe(
      respuesta => {
        console.log(respuesta)
        this.periodos = respuesta;
        this.cargandoPeriodos = false;
        //console.log(this.proveedores)
      }, error => {
        this.cargandoPeriodos = false;
      }
    );
  }

  seleccionarTipo(valor:any){
    this.tipoUnidadSeleccionado = valor;
    console.log(this.tipoUnidadSeleccionado);
  }

  seleccionarPeriodo(valor:any){
    this.periodoSeleccionado = valor;
    this.cargarMeses();
  }

  seleccionarMes(valor:any){
    this.mesSeleccionado = valor;
  }

  seleccionarProveedor(valor:any){
    this.proveedorSeleccionado = valor;
  }

  reset(){
    this.clues = "";
    this.tipoUnidadSeleccionado = "-1";
    this.periodoSeleccionado = "-1";
    this.mesSeleccionado = "-1";
    this.proveedorSeleccionado = "-1";
  }

  imprimirExcelIndividual(id){
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/administrador-central/penas-convencionales-excel-individual/${id}?${query}`);
  }

  imprimirExcelResumen(anio:any, mes:any, proveedor_id:any, tipo_unidad:any){
    var query = "token="+localStorage.getItem('token');
    query += "&anio="+anio;
    query += "&mes="+mes;
    query += "&proveedor_id="+proveedor_id;
    query += "&tipo_unidad="+tipo_unidad;
    query += "&clues="+this.clues;
    window.open(`${environment.API_URL}/administrador-central/penas-convencionales-excel-resumen/?${query}`);
  }

  cargarDatos():void{
    this.cargarResumen();
    this.listar(1);
  }
  
  cargarResumen():void{
    this.cargandoResumen = true;
    var  parametros =  {
      clues: this.clues,
      proveedor: this.proveedorSeleccionado,
      tipo_unidad: this.tipoUnidadSeleccionado,
      periodo: this.periodoSeleccionado,
      mes: this.mesSeleccionado,    
    }

    this.apiService.resumenPenasConvencionales(parametros).subscribe(
      respuesta => {
          this.cargandoResumen = false;
          this.resumen = respuesta as any[];
          console.log("Resumen cargado.");
      }, error => {
          this.cargandoResumen = false;
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

  listar(pagina:number): void {
    this.cargando = true;
    this.paginaActual = pagina;

    

    var  parametros =  {
      clues: this.clues,
      proveedor: this.proveedorSeleccionado,
      tipo_unidad: this.tipoUnidadSeleccionado,
      periodo: this.periodoSeleccionado,
      mes: this.mesSeleccionado,
      page: this.paginaActual,
      per_page: this.resultadosPorPagina      
    }
    
    this.apiService.detallePenasConvencionales(parametros).subscribe(
      respuesta => {
          this.cargando = false;
          console.log
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
}
