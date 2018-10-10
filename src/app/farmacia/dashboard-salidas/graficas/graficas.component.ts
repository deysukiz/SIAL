import { Component, OnInit } from '@angular/core';
import { HttpModule,Http }   from '@angular/http';

import { CrudService    } from '../../../crud/crud.service';
import { PedidosService } from '../../../farmacia/pedidos/pedidos.service';

import { GraficasService } from '../graficas/graficas.service';

@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrls: ['./graficas.component.css']
})

export class GraficasComponent {
    /**
     * Calcula el tamaño de la
     * @type {number}
     */
  tamano = document.body.clientHeight;
  constructor(
      private http: Http,
      private crudService: CrudService,
      private graficasService: GraficasService,
      private pedidosService: PedidosService) {
      
        this.grafica_opciones = {
            chart: {
                type: 'column'
            },
            xAxis: {
                categories: this.grafica_categorias
            },
            yAxis: {
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
            },
            title : { text : 'Entrega por insumos' },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                //backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            plotOptions: { //plotOptions sirve para poner las columnas en una sola
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white'
                    }
                }
            },
            series: [
                {
                    name: 'Causes',
                    data: this.grafica_causes
                }, 
                {
                    name: 'No Causes',
                    data: this.grafica_no_causes
                }, 
                {
                    name: 'Material Curación',
                    data: this.grafica_mc
                }
            ]
        };
        /*GRAFICA DE CLAVES*/

        this.claves = {
            chart: {
                type: 'column'
            },
            xAxis: {
                categories: this.grafica_categorias
            },
            yAxis: {
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
            },
            title : { text : 'Entrega por claves' },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                //backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            plotOptions: { //plotOptions sirve para poner las columnas en una sola
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white'
                    }
                }
            },
            series: [
                {
                    name: 'Causes',
                    data: this.grafica_causes
                }, 
                {
                    name: 'No Causes',
                    data: this.grafica_no_causes
                }, 
                {
                    name: 'Material Curación',
                    data: this.grafica_mc
                }
            ]
        };

        /*GRAFICA DE INSUMOS*/
        this.insumos = {
            chart: {
                type: 'column'
            },
            xAxis: {
                categories: ['2017-04-10', '2017-04-15', '2017-04-20', '2017-04-25', '2017-04-28', '2017-04-30', '2017-04-30', '2017-04-30']
            },
            yAxis: {
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
            },
            title : { text : 'Entrega por insumos' },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                //backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            plotOptions: { //plotOptions sirve para poner las columnas en una sola
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white'
                    }
                }
            },
            series: [
                {
                    name: 'Causes',
                    data: [5, 3, 4, 7, 2, 7, 2, 7]
                }, 
                {
                    name: 'No Causes',
                    data: [2, 2, 3, 2, 1, 0, 2, 7]
                }, 
                {
                    name: 'Material Curación',
                    data: [3, 4, 4, 2, 5, 3, 2, 7]
                }
            ]
        };
        /*GRAFICA DE MONTO*/
        this.monto = {
            chart: {
                type: 'column'
            },
            xAxis: {
                categories: ['2017-04-10', '2017-04-15', '2017-04-20', '2017-04-25', '2017-04-28', '2017-04-30', '2017-04-30', '2017-04-30']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total monto'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    }
                }
            },
            title : { text : 'Entrega por monto' },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                //backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            plotOptions: { //plotOptions sirve para poner las columnas en una sola
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white'
                    }
                }
            },
            series: [
                {
                    name: 'Causes',
                    data: [5, 3, 4, 7, 2, 7, 2, 7]
                }, 
                {
                    name: 'No Causes',
                    data: [2, 2, 3, 2, 1, 0, 2, 7]
                }, 
                {
                    name: 'Material Curación',
                    data: [3, 4, 4, 2, 5, 3, 2, 7]
                }
            ]
        };
//http://sialapi.yoursoft.com.mx/public/index.php/grafica-entregas
        http.get('https://cdn.rawgit.com/gevgeny/angular2-highcharts/99c6324d/examples/aapl.json').subscribe(res => {
            this.datos = {
                title : { text : 'AAPL Stock Price' },   
                series : [{
                    name : 'AAPL', 
                    data : res.json(), 
                    tooltip: {
                        valueDecimals: 2 
                    }
                }]
            };
        });
    
        /*this.datos = {
            title : { text : 'Datos' },
            series: [{
                data: [5, 25.5, 106.4, 129.2],
            }]
        };*/
    }
    grafica_opciones: Object;
    jsonPrueba;
    datos: Object;
    claves: Object;
    insumos: Object;
    monto: Object;
    usuario;
    surtido=1;
    grafica=1;
    presupuesto:any = {};
    datosGraficas:any = {};
    claves_categorias: any = {};
    claves_causes: any = {};
    claves_no_causes: any = {};
    claves_mc: any = {};
    grafica_categorias: any[] = [];
    grafica_causes: any[] = [];
    grafica_no_causes: any[] = [];
    grafica_mc: any[] = [];

    
  MinDate = new Date();
  MaxDate = new Date();
  fecha_actual;
  fecha_inicial_actual;
  fecha_inicial;
  fecha_final;

ngOnInit() {

    //obtener los datos del usiario logueado almacen y clues
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
    //console.log(this.usuario);

    //inicializar el data picker minimo y maximo
    var date = new Date();
    
    this.MinDate = new Date(date.getFullYear() - 1, 0, 1);
    this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.fecha_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
    this.fecha_inicial_actual = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + '01';

    this.pedidosService.presupuesto().subscribe(
      response => {
        this.presupuesto = response.data;
      },
      error => {
        console.log(error);
      }
    );

    this.graficasService.listaDatos().subscribe(
        response => {
        this.datosGraficas = response;
        console.log(this.datosGraficas);
        console.log(this.datosGraficas.data);        
      },
      error => {
        console.log(error);
      }
    );

    this.jsonPrueba = {
                        claves: [
                            {
                                fecha: "2017-04-10",
                                causes: 150,
                                no_causes: 200,
                                mat_curacion: 50,
                                total: 320
                            },
                            {
                                fecha: "2017-04-11",
                                causes: 500,
                                no_causes: 300,
                                mat_curacion: 800,
                                total: 320
                            },
                            {
                                fecha: "2017-04-12",
                                causes: 900,
                                no_causes: 500,
                                mat_curacion: 1300,
                                total: 320
                            }
                        ]
                    };
        console.log(this.jsonPrueba);
    let i;
    for(i=0; i<this.jsonPrueba.claves.length; i++){
        this.grafica_categorias.push(this.jsonPrueba.claves[i].fecha);
        this.grafica_causes.push(this.jsonPrueba.claves[i].causes);
        this.grafica_no_causes.push(this.jsonPrueba.claves[i].no_causes);
        this.grafica_mc.push(this.jsonPrueba.claves[i].mat_curacion);
    }
}

cambiarSurtido(surtido){    
    this.surtido = surtido ;
}

cambiarGrafica(grafica){    
    this.grafica = grafica ;
    }

}
