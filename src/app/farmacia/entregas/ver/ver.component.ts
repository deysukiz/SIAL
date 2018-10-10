import { Component, OnInit, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router }   from '@angular/router'

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import  * as FileSaver    from 'file-saver'; 


import { PedidosService } from '../../pedidos/pedidos.service';
import { EntregasService } from '../entregas.service';
import { StockService } from '../../stock/stock.service';


import { Pedido } from '../../pedidos/pedido';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css'],
  providers: [StockService, EntregasService]
})
export class VerComponent implements OnInit {

  @ViewChildren('searchBoxStock') searchBoxStockViewChildren;


  id:string ;
  cargando: boolean = false;
  cargandoStock: boolean = false;
  
   // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION  

  pedido: Pedido; 
  lotesSurtidos:any[] = [];
  listaStock: any[] = [];  
  claveInsumoSeleccionado:string = null;
  claveNoSolicitada:boolean = false;
  itemSeleccionado: any = null;
  

  
  constructor(private title: Title, private route:ActivatedRoute, private router: Router,private entregasService:EntregasService, private pedidosService:PedidosService, private stockService:StockService) { }

  ngOnInit() {
    this.title.setTitle('Ver entrega / Farmacia');
    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      //this.cargarDatos();
    });

    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number      
    });
    this.cargando = true;
    this.entregasService.ver(this.id).subscribe(
        entrega => {
            this.cargando = false;
            this.pedido = new Pedido(true);
            this.pedido.paginacion.resultadosPorPagina = 10;
            this.pedido.filtro.paginacion.resultadosPorPagina = 10;
            console.log(entrega);
            for(let i in entrega.movimiento_pedido.pedido.insumos){
              let dato = entrega.movimiento_pedido.pedido.insumos[i];
              let insumo = dato.insumos_con_descripcion;
              if(insumo.listaStockAsignado == null) {
                insumo.listaStockAsignado = [];
              }
             
              if (insumo != null){
                insumo.cantidad = +dato.cantidad_solicitada;     
                var cantidad  = 0;
                
                for(let j in entrega.movimiento_insumos){
                  
                  if(entrega.movimiento_insumos[j].stock.clave_insumo_medico == insumo.clave ){
                    insumo.listaStockAsignado.push({
                      codigo_barras: entrega.movimiento_insumos[j].stock.codigo_barras,
                      marca: entrega.movimiento_insumos[j].stock.marca,
                      lote: entrega.movimiento_insumos[j].stock.lote,
                      fecha_caducidad: entrega.movimiento_insumos[j].stock.fecha_caducidad,
                      cantidad: Math.abs(entrega.movimiento_insumos[j].cantidad)

                    });
                    cantidad += Math.abs(entrega.movimiento_insumos[j].cantidad);
                  }
                }
                insumo.totalStockAsignado = cantidad;

                this.pedido.lista.push(insumo);
              } 
             
            }
            console.log(this.pedido.lista);
            this.pedido.indexar();
            this.pedido.listar(1);
        }, error => {
          this.cargando = false;

          this.mensajeError = new Mensaje(true);
          this.mensajeError = new Mensaje(true);
          this.mensajeError.mostrar;

          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
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

  

  seleccionarItem(item){  
    this.itemSeleccionado = item; 
    //this.claveInsumoSeleccionado = item.clave_insumo_medico;
    //this.buscarStockApi(null,item.clave)
  }

  buscar(e: KeyboardEvent, input:HTMLInputElement, inputAnterior: HTMLInputElement,  parametros:any[]){
    
    let term = input.value;

    // Quitamos la busqueda
    if(e.keyCode == 27){
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      inputAnterior.value = "";

      this.pedido.filtro.activo = false;
      this.pedido.filtro.lista = [];      

      return;      
    }

    
    //Verificamos que la busqueda no sea la misma que la anterior para no filtrar en vano
    if(inputAnterior.value == term){      
      return
    }

    e.preventDefault();
    e.stopPropagation();

    inputAnterior.value = term;    

    if(term != ""){
      this.pedido.filtro.activo = true;      
    } else {
      this.pedido.filtro.activo = false;
      this.pedido.filtro.lista = [];
      return;
    }

    var arregloResultados:any[] = []
    for(let i in parametros){

      let termino = (parametros[i].input as HTMLInputElement).value;
      if(termino == ""){
        continue;
      }
            
      let listaFiltrada = this.pedido.lista.filter((item)=> {   
        var cadena = "";
        let campos = parametros[i].campos;
        for (let l in campos){
          try{
            // Esto es por si escribieron algo como "objeto.propiedad" en lugar de: "propiedad"
            let prop = campos[l].split(".");            
            if (prop.length > 1){
              cadena += " " + item[prop[0]][prop[1]].toLowerCase();
            } else {
               cadena += " " + item[campos[l]].toLowerCase();
            }
           
          } catch(e){}
          
        }
        return cadena.includes(termino.toLowerCase())
      });

      arregloResultados.push(listaFiltrada)
    }
    
    if(arregloResultados.length > 1 ){
      // Ordenamos Ascendente

      arregloResultados = arregloResultados.sort( function(a,b){ return  a.length - b.length });
      
      var filtro = arregloResultados[0];
      var match: any[] = [];
      for(let k = 1; k <  arregloResultados.length ; k++){
        
        for(let i in arregloResultados[k]){
          for(let j in filtro){
            if(arregloResultados[k][i] === filtro[j]){
              match.push(filtro[j]);
            }
          }
        };
      }
      this.pedido.filtro.lista = match;
    } else {
      this.pedido.filtro.lista = arregloResultados[0];
    }


    this.pedido.filtro.indexar(false);
    
    this.pedido.filtro.paginacion.paginaActual = 1;
    this.pedido.filtro.listar(1); 

  }



}
