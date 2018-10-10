import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje';

import { AdministradorCentralService } from '../administrador-central.service';

@Component({
	selector: 'app-reporte-financiero',
	templateUrl: './reporte-financiero.component.html',
	styleUrls: ['./reporte-financiero.component.css']
})
export class ReporteFinancieroComponent implements OnInit {
	cargando: boolean = false;

	// # SECCION: Esta sección es para mostrar mensajes
	mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion:any;
	// # FIN SECCION
	
	// # SECCION: Filtro

	clues:any = "";
	tiposUnidad:any[] = [];
	proveedores:any[] = [];
	jurisdicciones:any[] = [];
	status:any[] = [];
	agrupacion:any[] = [];

	tiposUnidadSeleccionados:any[] = [];
	proveedoresSeleccionados:any[] = [];
	jurisdiccionesSeleccionadas:any[] = [];

	agrupadoPor:any;
	statusSeleccionado:any = -1;
	

	listaMesesAnios:any[] = [];
	fechaInicio:any = -1;
	fechaFin:any = -1;

	
	
	cargandoFechas:boolean = false;
	cargandoJurisdicciones:boolean = false;
	cargandoProveedores:boolean = false;
	// # FIN SECCION

	// # SECCION: Lista
	lista: any[] = [];
	totalModificado = 0;
	totalComprometido = 0;
	totalDevengado = 0;
	totalDisponible = 0;
	
	totalMontoSolicitadoCausesMatCur = 0;
	totalMontoRecibidoCausesMatCur = 0;
	totalCantidadSolicitadaCausesMatCur = 0;
	totalCantidadRecibidaCausesMatCur = 0;

	totalMontoSolicitadoNoCauses = 0;
	totalMontoRecibidoNoCauses = 0;
	totalCantidadSolicitadaNoCauses = 0;
	totalCantidadRecibidaNoCauses = 0;

	// # FIN SECCION


	constructor(private title: Title, private apiService: AdministradorCentralService) { }

	ngOnInit() {

		this.title.setTitle("Reporte financiero/ Administrador central");
		this.status = [ 
			{id:'C', nombre: "Completados"},
			{id:'B', nombre: "Borradores"}
		];
		this.tiposUnidad = [ 
			{ id: 'HO', nombre: 'Hospital General' },
			{ id: 'HBC', nombre: 'Hospital Básico Comunitario' },
			{ id: 'AJ', nombre: 'Almacén Jurisddiccional' },
			{ id: 'AC', nombre: 'Almacén Central' },
			{ id: 'CS', nombre: 'Centro de Salud' }
		];
		this.agrupacion = [ 
			{id:'UM', nombre: "Unidad médica"},
			{id:'P', nombre: "Proveedor"},
			{id:'NA', nombre: "Nivel de atención"}
		 ];
		this.agrupadoPor = 'UM';
		this.cargarProveedores();
		this.cargarJurisdicciones();
		this.cargarFechas();
	}

	cargarJurisdicciones(){
		this.cargandoJurisdicciones = true;
		this.apiService.jurisdicciones().subscribe(
		  respuesta => {
			this.jurisdicciones = respuesta;
			this.cargandoJurisdicciones = false;
		  }, error => {
			this.cargandoJurisdicciones = false;
			console.log(error)
		  }
		);
	}
	cargarProveedores(){
		this.cargandoProveedores = true;
		this.apiService.proveedores().subscribe(
		  respuesta => {
			this.cargandoProveedores = false;
			this.proveedores = respuesta;
		  }, error => {
			this.cargandoProveedores = false;
			console.log(error)
		  }
		);
	}

	cargarFechas(){
		this.cargandoFechas = true;
		this.apiService.mesesAniosPedidos().subscribe(
		  respuesta => {
			this.cargandoFechas = false;
			this.listaMesesAnios = respuesta;
		  }, error => {
			this.cargandoFechas = false;
			console.log(error)
		  }
		);
	}



	cambioSeleccionTipoUnidad(id){
		if (id == -1){
		  this.tiposUnidadSeleccionados = [];
		}
		this.agregarTipoUnidad(id);
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
	
	agregarTipoUnidad(id:any){
		if (id == -1){
		  return;
		}
		// Si existe en el filtro no la agregamos
		for(var i in this.tiposUnidadSeleccionados){
		  if(this.tiposUnidadSeleccionados[i].id == id){
			return;
		  }
		}
	
		for(var i in this.tiposUnidad){
		  if(this.tiposUnidad[i].id == id){
			this.tiposUnidadSeleccionados.push(this.tiposUnidad[i]);
			break;
		  }
		}
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
	
	quitarTipoUnidad(index){        
		this.tiposUnidadSeleccionados.splice(index,1);
	}

	quitarProveedor(index){        
		this.proveedoresSeleccionados.splice(index,1);
	}
	
	quitarJurisdiccion(index){    
		this.jurisdiccionesSeleccionadas.splice(index,1);
	}


	listar(): void {
		this.cargando = true;
		

		var fechaInicioSeleccionada = this.fechaInicio != -1 ? this.fechaInicio.split("/") : -1;
		var fechaFinSeleccionada = this.fechaFin !=-1? this.fechaFin.split("/"): -1;
	
		var proveedoresIds = [];
		for(var i in this.proveedoresSeleccionados){
		  proveedoresIds.push(this.proveedoresSeleccionados[i].id);
		}
		var jurisdiccionesIds = [];
		for(var i in this.jurisdiccionesSeleccionadas){
		  jurisdiccionesIds.push(this.jurisdiccionesSeleccionadas[i].id);
		}

		var tiposUnidadIds = [];
		for(var i in this.tiposUnidadSeleccionados){
			tiposUnidadIds.push(this.tiposUnidadSeleccionados[i].id);
		}
	
		var  parametros =  {
		  clues: this.clues == '' ? null : this.clues,
		  proveedores: proveedoresIds.length > 0 ? proveedoresIds: null,
		  jurisdicciones: jurisdiccionesIds.length > 0 ? jurisdiccionesIds: null,
			tipos_unidad: tiposUnidadIds.length > 0 ? tiposUnidadIds: null,
			status_pedido: this.statusSeleccionado != -1 ? this.statusSeleccionado: null,
			agrupado_por: this.agrupadoPor,		  
		  mes_inicio: fechaInicioSeleccionada != -1 ? fechaInicioSeleccionada[0] : null,
		  anio_inicio: fechaInicioSeleccionada != -1 ? fechaInicioSeleccionada[1] : null,
		  mes_fin: fechaFinSeleccionada != -1 ? fechaFinSeleccionada[0] : null,
			anio_fin: fechaFinSeleccionada != -1 ? fechaFinSeleccionada[1] : null
		}
		//var parametros = JSON.stringify(parametrosObj);

		this.totalCantidadRecibidaCausesMatCur = 0;
		this.totalCantidadSolicitadaCausesMatCur = 0;
		this.totalMontoRecibidoCausesMatCur = 0;
		this.totalMontoSolicitadoCausesMatCur = 0;
		this.totalCantidadRecibidaNoCauses = 0;
		this.totalCantidadSolicitadaNoCauses = 0;
		this.totalMontoRecibidoNoCauses = 0;
		this.totalMontoSolicitadoNoCauses = 0;
		this.totalModificado  = 0;
		this.totalComprometido = 0;
		this.totalDevengado = 0;
		this.totalDisponible = 0;
		this.apiService.reporteFinanciero(parametros).subscribe(
		  respuesta => {
				this.cargando = false;
				
			  this.lista = respuesta.data as any[];
				this.totalModificado = 0;
				for(var x in this.lista){
					this.totalModificado += +this.lista[x].modificado;
					this.totalComprometido += +this.lista[x].comprometido;
					this.totalDevengado += +this.lista[x].devengado;
					this.totalDisponible += +this.lista[x].disponible;
					this.totalMontoSolicitadoCausesMatCur += +this.lista[x].causes_mat_cur_monto_solicitado;
					this.totalMontoRecibidoCausesMatCur += +this.lista[x].causes_mat_cur_monto_recibido;
					this.totalCantidadSolicitadaCausesMatCur += +this.lista[x].causes_mat_cur_cantidad_solicitada;
					this.totalCantidadRecibidaCausesMatCur += +this.lista[x].causes_mat_cur_cantidad_recibida;
					this.totalMontoSolicitadoNoCauses += +this.lista[x].no_causes_monto_solicitado;
					this.totalMontoRecibidoNoCauses += +this.lista[x].no_causes_monto_recibido;
					this.totalCantidadSolicitadaNoCauses += +this.lista[x].no_causes_cantidad_solicitada;
					this.totalCantidadRecibidaNoCauses += +this.lista[x].no_causes_cantidad_recibida;
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
		var fechaInicioSeleccionada = this.fechaInicio != -1 ? this.fechaInicio.split("/") : -1;
		var fechaFinSeleccionada = this.fechaFin !=-1? this.fechaFin.split("/"): -1;

		var query = "token="+localStorage.getItem('token')+"&agrupado_por="+this.agrupadoPor;
		
		if(this.clues!= ""){
		  query += "&clues="+this.clues;
		}

		if(this.statusSeleccionado!= -1){
		  query += "&status_pedido="+this.statusSeleccionado;
		}
		
		if(fechaInicioSeleccionada != -1){
			query += "&mes_inicio="+fechaInicioSeleccionada[0];
			query += "&anio_inicio="+fechaInicioSeleccionada[1];
		}

		if(fechaFinSeleccionada != -1){
			query += "&mes_fin="+fechaFinSeleccionada[0];
			query += "&anio_fin="+fechaFinSeleccionada[1];
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

		var lista_tipos = "";
		for(var i in this.tiposUnidadSeleccionados){
		  if(lista_tipos != ""){
				lista_tipos += ",";
		  }
		  lista_tipos += ""+this.tiposUnidadSeleccionados[i].id;
		}
		if(lista_tipos != ""){
		  query += "&tipos_unidad="+lista_tipos;
		}

		
		window.open(`${environment.API_URL}/administrador-central/reporte-financiero-excel?${query}`);
	   
		
		
	}
	
}
