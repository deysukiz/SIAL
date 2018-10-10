import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'



import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-cumplimiento',
  templateUrl: './cumplimiento.component.html',
  styleUrls: ['./cumplimiento.component.css'],
	host: { '(window:resize)' : 'onResize($event)'}
})
export class CumplimientoComponent implements OnInit {

  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION


  estadisticasGlobales:any[] = [];
  listaEstadisticasProveedores:any[] = [];
  

  cargandoEstadisticasGlobales:boolean = false;


  constructor(private title: Title, private apiService: AdministradorCentralService) { 
   
  }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Cumplimiento / Administrador central");
    
   
    this.generarStats();
    

    
  }
  generarStats(){

    

    this.cargandoEstadisticasGlobales = true;
    this.apiService.cumplimientoStatsGlobales().subscribe(
      respuesta => {
        this.cargandoEstadisticasGlobales = false;
        this.estadisticasGlobales = respuesta;

        this.listaEstadisticasProveedores = [];

        for(var i in this.estadisticasGlobales){
         
          this.listaEstadisticasProveedores.push({
            proveedor_id: this.estadisticasGlobales[i].proveedor_id,
            proveedor: this.estadisticasGlobales[i].proveedor,
            cargando: true,
            tipoDatos: 'monto',
            data: []
          });

          this.generarStatsProveedor(this.listaEstadisticasProveedores.length -1);

        }
        

        
      }, error => {
        this.cargandoEstadisticasGlobales = false;
        console.log(error)
      }
    );


  }

 
  generarStatsProveedor(index){
    
    var proveedor_id = this.listaEstadisticasProveedores[index].proveedor_id;    
    this.listaEstadisticasProveedores[index].cargando = true;

    this.apiService.cumplimientoStatsProveedor(proveedor_id).subscribe(
      respuesta => {
        this.listaEstadisticasProveedores[index].cargando = false;
        this.listaEstadisticasProveedores[index].data = respuesta
        
        this.renderGrafica(index);
      }, error => {
        console.log(error);
        this.listaEstadisticasProveedores[index].cargando = false;
      });
  }


  renderGrafica(index){
    var categorias: string[] = [];

    var solicitado:Number [] = [];
    var entregado:Number [] = [];
    var cumplimiento:Number [] = [];

    for(var i in this.listaEstadisticasProveedores[index].data){
      categorias.push( this.listaEstadisticasProveedores[index].data[i].mes_nombre + " " + this.listaEstadisticasProveedores[index].data[i].anio);
      if(this.listaEstadisticasProveedores[index].tipoDatos == 'claves'){
        solicitado.push(Number(this.listaEstadisticasProveedores[index].data[i].claves_solicitadas) || 0 );
        entregado.push(Number(this.listaEstadisticasProveedores[index].data[i].claves_recibidas) || 0 );
        cumplimiento.push(Number(this.listaEstadisticasProveedores[index].data[i].claves_cumplimiento) || 0.00 );
      }

      if(this.listaEstadisticasProveedores[index].tipoDatos == 'insumos'){
        solicitado.push(Number(this.listaEstadisticasProveedores[index].data[i].cantidad_solicitada) || 0 );
        entregado.push(Number(this.listaEstadisticasProveedores[index].data[i].cantidad_recibida) || 0 );
        cumplimiento.push(Number(this.listaEstadisticasProveedores[index].data[i].cantidad_cumplimiento)|| 0.00 );
      }

      if(this.listaEstadisticasProveedores[index].tipoDatos == 'monto'){
        solicitado.push(Number(this.listaEstadisticasProveedores[index].data[i].monto_solicitado) || 0.00 );
        entregado.push(Number(this.listaEstadisticasProveedores[index].data[i].monto_recibido) || 0.00);
        cumplimiento.push(Number(this.listaEstadisticasProveedores[index].data[i].monto_cumplimiento) || 0.00 );
      }
      
    }

    var yAxis =  {} 
    if(this.listaEstadisticasProveedores[index].tipoDatos == 'claves'){
		yAxis = [
			{
				title: {
					text: 'Total claves'
				}
			},
			{
				title: {
					text: '% Cumplimiento'
				},
				labels: {
					format: '{value} %',
					style: {
						color: '#7cb5ec'
					}					
				},
				max: 100,
				opposite: true
			}
	  	]
    }

    if(this.listaEstadisticasProveedores[index].tipoDatos == 'insumos'){
      	yAxis = [
			{
				title: {
					text: 'Total insumos'
				}
			},
			{
				title: {
					text: '% Cumplimiento'
				},
				labels: {
					format: '{value} %',
					style: {
						color: '#7cb5ec'
					}					
				},
				max: 100,
				opposite: true
			}
	  	]
    }
    if(this.listaEstadisticasProveedores[index].tipoDatos == 'monto'){
		yAxis = [
			{
				title: {
					text: 'Total en monto'
				}
			},
			{
				title: {
					text: '% Cumplimiento',
					style: {
						color: '#7cb5ec'
					}
				},
				labels: {
					format: '{value} %',
					style: {
						color: '#7cb5ec'
					}					
				},
				max: 100,
				opposite: true
			}
		]
    }
    
    this.listaEstadisticasProveedores[index].options = {
		chart: { zoomType: 'xy' },
		xAxis: {
			categories: categorias,
			crosshair:true
		},
		yAxis: yAxis,
		tooltip: {
			shared: true
		},
		legend: {
			align: 'center',
			x: 0,
			verticalAlign: 'bottom',
			/*y: 25,*/
			/*floating: true,*/
			backgroundColor: 'rgba(255,255,255,0.5)',
		/*	borderColor: '#CCC',
			borderWidth: 1,*/
			shadow: false
		},
	/*	plotOptions: {
			column: {
				stacking: 'normal',
				dataLabels: {
					enabled: true,
				}
			}
		},*/
		title : { text : 'Cumplimiento del proveedor: '+ this.listaEstadisticasProveedores[index].proveedor },
		subtitle: { text: "Cantidades expresadas en "+this.listaEstadisticasProveedores[index].tipoDatos},
		series: [
			{
				type: 'column',
				name: 'Pedido',
				data: solicitado,
			},
			{
				type: 'column',
				name: 'Entregado',
				data: entregado,
			},
			{
				type: 'column',
				name: '%',
				yAxis: 1,
				data: cumplimiento,
			},
			{
				type: 'spline',
				name: 'Cumplimiento',
				yAxis: 1,
				data: cumplimiento,
				tooltip: {
					valueSuffix: '%'
				}
				
			}
		]} 

  }

 
  

  parseNaN(val: any){
    if(isNaN(val)) { return 0; }
    return val;
  }
	
	mostrarGraficas:boolean = true;
	onResize(event){
		this.mostrarGraficas = false;
		try{
      setTimeout(() => { 	this.mostrarGraficas = true;} ); 
      
    } catch(e){
      console.log(e);
    }  
	}
}
