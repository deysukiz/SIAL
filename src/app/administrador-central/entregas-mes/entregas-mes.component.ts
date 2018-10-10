import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'



import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-entregas-mes',
  templateUrl: './entregas-mes.component.html',
  styleUrls: ['./entregas-mes.component.css'],
  host: { '(window:resize)' : 'onResize($event)'}
})
export class EntregasMesComponent implements OnInit {

  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION
  
  listaMesesAnios:any[] = [];
  fecha:any = -1;

  estadisticasGlobales:any[] = [];
  listaEntregasEstadisticaDiaria:any[] = [];
  listaPedidosClues: any[] = [];
  
  cargandoFechas:boolean = false;
  cargandoEstadisticasGlobales:boolean = false;

  //Harima: Se agrego dialogo para ver los pedidos por separado, asi como sus entregas
  mostrarDialogoPedidos: boolean = false;
  pedidosUnidadMedica: any[] = [];
  cargandoPedidosUnidadMedica: boolean = false;
  tituloDialogoPedidos: string;

  constructor(private title: Title, private apiService: AdministradorCentralService) { 
   
  }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Entregas del mes / Administrador central");
    
    this.cargandoFechas = true;
    this.apiService.mesesAniosPedidos().subscribe(
      respuesta => {
        this.cargandoFechas = false;
        this.listaMesesAnios = respuesta;
        if(this.listaMesesAnios.length > 0){
          this.fecha = this.listaMesesAnios[0].fecha
          this.generarStats();
        }
        
      }, error => {
        this.cargandoFechas = false;
        console.log(error)
      }
    );

    

    
  }
  generarStats(){
    if(this.listaMesesAnios.length <= 0){
      return;
    } 

    var fecha_seleccionada = this.fecha.split("/");
    if(fecha_seleccionada.length != 2){
      return;
    }

    var entregasPedidosStatsPayload = {
      mes: fecha_seleccionada[0],
      anio: fecha_seleccionada[1]
    }

    this.cargandoEstadisticasGlobales = true;
    this.apiService.entregasPedidosStatsMesesAnios(entregasPedidosStatsPayload).subscribe(
      respuesta => {
        this.cargandoEstadisticasGlobales = false;
        this.estadisticasGlobales = respuesta;

        this.listaEntregasEstadisticaDiaria = [];
        this.listaPedidosClues = [];

        for(var i in this.estadisticasGlobales){
         
          this.listaEntregasEstadisticaDiaria.push({
            proveedor_id: this.estadisticasGlobales[i].proveedor_id,
            proveedor: this.estadisticasGlobales[i].proveedor,
            cargando: true,
            tipoDatos: 'claves',
            data: []
          });

          this.listaPedidosClues.push({
            proveedor_id: this.estadisticasGlobales[i].proveedor_id,
            proveedor: this.estadisticasGlobales[i].proveedor_nombre_completo,
            cargando: true,
            data: []

          })

          this.mostrarPedidosCluesProveedor(this.listaPedidosClues.length -1);
          this.generarStatsDiariasProveedor(this.listaEntregasEstadisticaDiaria.length -1);

        }
        

        
      }, error => {
        this.cargandoEstadisticasGlobales = false;
        console.log(error)
      }
    );


  }

  mostrarPedidosCluesProveedor(index){
    var fecha_seleccionada = this.fecha.split("/");
    if(fecha_seleccionada.length != 2){
      return;
    }

    var payload = {
      mes: fecha_seleccionada[0],
      anio: fecha_seleccionada[1],
      proveedor_id: this.listaPedidosClues[index].proveedor_id
    }
    this.listaPedidosClues[index].cargando = true;
    this.apiService.pedidosCluesMesAnio(payload).subscribe(
      respuesta => {
        this.listaPedidosClues[index].cargando = false;
        this.listaPedidosClues[index].data = respuesta
        
        
      }, error => {
        console.log(error);
        this.listaPedidosClues[index].cargando = false;
      });
  }

  generarStatsDiariasProveedor(index){
    
    var fecha_seleccionada = this.fecha.split("/");
    if(fecha_seleccionada.length != 2){
      return;
    }

    var payload = {
      mes: fecha_seleccionada[0],
      anio: fecha_seleccionada[1],
      proveedor_id: this.listaEntregasEstadisticaDiaria[index].proveedor_id
    }
    this.listaEntregasEstadisticaDiaria[index].cargando = true;
    this.apiService.entregasPedidosStatsDiarias(payload).subscribe(
      respuesta => {
        this.listaEntregasEstadisticaDiaria[index].cargando = false;
        this.listaEntregasEstadisticaDiaria[index].data = respuesta
        
        this.renderGrafica(index);
      }, error => {
        console.log(error);
        this.listaEntregasEstadisticaDiaria[index].cargando = false;
      });
  }


  renderGrafica(index){
    var categorias: string[] = [];

    var causes:any [] = [];
    var no_causes:any [] = [];
    var material_curacion:any [] = [];

    for(var i in this.listaEntregasEstadisticaDiaria[index].data){
      categorias.push(this.listaEntregasEstadisticaDiaria[index].data[i].dia + " " + this.listaEntregasEstadisticaDiaria[index].data[i].mes_nombre);
      if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'claves'){
        causes.push(this.listaEntregasEstadisticaDiaria[index].data[i].causes_claves || 0 );
        no_causes.push(this.listaEntregasEstadisticaDiaria[index].data[i].no_causes_claves || 0 );
        material_curacion.push(this.listaEntregasEstadisticaDiaria[index].data[i].material_curacion_claves || 0 );
      }

      if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'insumos'){
        causes.push(this.listaEntregasEstadisticaDiaria[index].data[i].causes_cantidad || 0 );
        no_causes.push(this.listaEntregasEstadisticaDiaria[index].data[i].no_causes_cantidad || 0 );
        material_curacion.push(this.listaEntregasEstadisticaDiaria[index].data[i].material_curacion_cantidad || 0 );
      }

      if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'monto'){
        causes.push(Number(this.listaEntregasEstadisticaDiaria[index].data[i].causes_monto) || 0.00 );
        no_causes.push(Number(this.listaEntregasEstadisticaDiaria[index].data[i].no_causes_monto) || 0.00);
        material_curacion.push(Number(this.listaEntregasEstadisticaDiaria[index].data[i].material_curacion_monto) || 0.00 );
      }
      
    }

    var yAxis =  {} 
    if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'claves'){
      yAxis = {
          min: 0,
          title: {
              text: 'Total claves'
          },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: 'gray'
              }
          }
      }
    }

    if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'insumos'){
      yAxis = {
          min: 0,
          title: {
              text: 'Total insumos'
          },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: 'gray'
              }
          }
      }
    }
    if(this.listaEntregasEstadisticaDiaria[index].tipoDatos == 'monto'){
      yAxis = {
          min: 0,
          title: {
              text: 'Total en monto'
          },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: 'gray'
              }
          }
      }
    }
    
    this.listaEntregasEstadisticaDiaria[index].options = {
      chart:{type: 'column'},
      xAxis: {
          categories: categorias
      },
      yAxis: yAxis,
      legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor: 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true,
              }
          }
      },
      title : { text : 'Entrega de insumos' },
      series: [{
          name: 'Causes',
          data: causes,
      },
      {
          name: 'No Causes',
          data: no_causes,
      },
      {
          name: 'Material Curacion',
          data: material_curacion,
      }]
    } 

  }

  generarExcel(clues:string, proveedor_id:any){

    var fecha_seleccionada = this.fecha.split("/");
    if(fecha_seleccionada.length != 2){
      return;
    }
    console.log(fecha_seleccionada[0]);

    var mes = ('' + fecha_seleccionada[0]).length < 2 ? '0' + fecha_seleccionada[0] : fecha_seleccionada[0];

    var fecha_desde = new Date(fecha_seleccionada[1],fecha_seleccionada[0] - 1, 1);
    var fecha_hasta = new Date(fecha_seleccionada[1],fecha_seleccionada[0], 0);
    

    var cadena_fecha_desde = fecha_seleccionada[1]+"-"+mes+"-01";
    var cadena_fecha_hasta = fecha_seleccionada[1]+"-"+mes+"-"+fecha_hasta.getDate();
    
    var query = "token="+localStorage.getItem('token')+"&q="+clues + "&proveedores="+proveedor_id+"&status=TR,PS,FI,EF,EX&fecha_desde="+cadena_fecha_desde+"&fecha_hasta="+cadena_fecha_hasta;
    
    window.open(`${environment.API_URL}/administrador-central/pedidos-excel?${query}`);
   
    
    
  }
  
  verDialogoPedidos(proveedor_id:any, unidad_medica:any){
    this.tituloDialogoPedidos = unidad_medica.clues + ' - ' + unidad_medica.unidad_medica;
    this.mostrarDialogoPedidos = true;
    

    var fecha_seleccionada = this.fecha.split("/");
    if(fecha_seleccionada.length != 2){
      return;
    }

    var payload = {
      mes: fecha_seleccionada[0],
      anio: fecha_seleccionada[1],
      proveedor_id: proveedor_id,
      clues: unidad_medica.clues
    }
    this.cargandoPedidosUnidadMedica = true;

    this.apiService.pedidosEntregasCluesMesAnio(payload).subscribe(
      respuesta => {
        console.log(respuesta);
        let pedidos_procesados = [];

        for(let i in respuesta){
          let pedido = {
            folio: respuesta[i].folio,
            nombre_pedido: respuesta[i].descripcion,
            tipo_pedido_id: respuesta[i].tipo_pedido_id,
            status: respuesta[i].status,
            fecha: respuesta[i].fecha,
            fecha_concluido: respuesta[i].fecha_concluido,
            fecha_expiracion: respuesta[i].fecha_expiracion,
            fecha_cancelacion: respuesta[i].fecha_cancelacion,
            total_monto_solicitado: +respuesta[i].total_monto_solicitado,
            total_monto_recibido: +respuesta[i].total_monto_recibido,
            total_claves_solicitadas: +respuesta[i].total_claves_solicitadas,
            total_claves_recibidas: +respuesta[i].total_claves_recibidas,
            total_cantidad_solicitada: +respuesta[i].total_cantidad_solicitada,
            total_cantidad_recibida: +respuesta[i].total_cantidad_recibida,
            entregas:[]
          };

          if(respuesta[i].tipo_pedido_id != 'PFS'){
            if(respuesta[i].recepciones.length){

              let acumulado_total_claves = 0;
              let acumulado_total_cantidad = 0;
              let acumulado_total_monto = 0;
              let acumulado_claves_encontradas = {};
              
              for(let j in respuesta[i].recepciones){                
                let recepcion = respuesta[i].recepciones[j];
                
                if(recepcion.entrada.status == 'FI'){
                  let entrega = {
                    fecha: recepcion.entrada.fecha_movimiento,
                    total_claves: 0,
                    total_cantidad: 0,
                    total_monto: 0,
                    acumulado_claves: 0,
                    acumulado_cantidad: 0,
                    acumulado_monto: 0
                  };

                  let claves_encontradas = {};
                  let calculo_iva = 0;
                  for(let k in recepcion.entrada.insumos_detalles){
                    let insumo = recepcion.entrada.insumos_detalles[k];

                    entrega.total_cantidad += +insumo.cantidad;
                    entrega.total_monto += +insumo.precio_total;

                    if(insumo.detalles.tipo == 'MC'){
                      calculo_iva += +insumo.precio_total;
                    }

                    if(!claves_encontradas[insumo.clave_insumo_medico]){
                      claves_encontradas[insumo.clave_insumo_medico] = true;
                      entrega.total_claves += 1;
                    }

                    if(!acumulado_claves_encontradas[insumo.clave_insumo_medico]){
                      acumulado_claves_encontradas[insumo.clave_insumo_medico] = true;
                      acumulado_total_claves += 1;
                    }
                  }

                  if(calculo_iva > 0){
                    entrega.total_monto += (calculo_iva*16/100);
                  }

                  acumulado_total_cantidad += entrega.total_cantidad;
                  acumulado_total_monto += entrega.total_monto;

                  entrega.acumulado_cantidad = acumulado_total_cantidad;
                  entrega.acumulado_claves = acumulado_total_claves;
                  entrega.acumulado_monto = acumulado_total_monto;

                  pedido.entregas.push(entrega);
                }
              }
            }
          }
          
          pedidos_procesados.push(pedido);
        }

        this.pedidosUnidadMedica = pedidos_procesados;
        console.log(pedidos_procesados);
        this.cargandoPedidosUnidadMedica = false;
      }, error => {
        console.log(error);
        this.cargandoPedidosUnidadMedica = false;
      });
  }

  cerrarDialogoPedidos(){
    this.mostrarDialogoPedidos = false;
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
