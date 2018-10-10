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

import { TransferenciaAlmacenService } from '../transferencia-almacen.service';
import { StockService } from '../../stock/stock.service';

import { Pedido } from '../../pedidos/pedido';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css'],
  //host: { '(window:keydown)' : 'keyboardInput($event)'},
  providers: [StockService, TransferenciaAlmacenService]
})

export class VerComponent implements OnInit {
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
  private itemSeleccionado: any = null;
  
  constructor(private title: Title, private route:ActivatedRoute, private router: Router,private transferenciaAlmacenService:TransferenciaAlmacenService, private stockService:StockService) { }

  ngOnInit() {
    this.title.setTitle('Ver Pedido');
    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      //this.cargarDatos();
    });

    this.cargando = true;
    this.transferenciaAlmacenService.ver(this.id).subscribe(
          pedido => {
            this.cargando = false;
            this.pedido = new Pedido(true);
            this.pedido.paginacion.resultadosPorPagina = 10;
            this.pedido.filtro.paginacion.resultadosPorPagina = 10;

            let historial_movimientos = [];
            //let historial_por_claves = {}; //{ 'clave.insumo.medico': [{historial},{historial},{historial}] }
            if(pedido.historial_transferencia_completo.length > 0){
              for(let i in pedido.historial_transferencia_completo){
                let historial = pedido.historial_transferencia_completo[i];

                let movimiento = {fecha_movimiento:'',insumos:[]};
                let status = '';

                if(historial.evento == 'SURTIO PEA' && historial.status == 'FI'){ //El pedido ya fue surtido al menos una vez, si se surte mas de una vez, se va guardando el ultimo movimiento capturado
                  movimiento = historial.movimiento;
                  status = 'SURTIDO';
                }else if(historial.evento == 'RECEPCION PEA' && historial.status == 'FI'){ //El pedido ya fue entregado, si se entrega mas de una vez, se guarda el ultimo movimiento capturado
                  movimiento = historial.movimiento;
                  status = 'RECIBIDO';
                }else if(historial.evento == 'REINTEGRACION INVENTARIO' && historial.status == 'FI'){
                  movimiento = historial.movimiento;
                  status = 'REINTEGRADO';
                }else if(historial.evento == 'ELIMINACION INVENTARIO' && historial.status == 'FI'){
                  movimiento = historial.movimiento;
                  status = 'ELIMINADO';
                }

                if(status){
                  let item_movimiento = {
                    'estatus':status,
                    'fecha_movimiento':movimiento.fecha_movimiento,
                    'insumos':{}
                  };
                  for(let j in movimiento.insumos){
                    let insumo = movimiento.insumos[j];

                    if(!item_movimiento.insumos[insumo.clave_insumo_medico]){
                      item_movimiento.insumos[insumo.clave_insumo_medico] = [];
                    }

                    item_movimiento.insumos[insumo.clave_insumo_medico].push({
                      'lote':insumo.stock.lote,
                      'fecha_caducidad':insumo.stock.fecha_caducidad,
                      'cantidad':insumo.cantidad
                    });
                  }
                  historial_movimientos.push(item_movimiento);
                }
              }
            }
            /*
            if(pedido.historial_transferencia_completo.length > 0){
              let movimiento_entrega:any; //La recepcion, aparecera aqui cuando se haya finalizado
              let movimiento_surtido:any;
              let movimiento_eliminados:any[] = [];
              let movimiento_reintegrados:any[] = [];

              let lotes_eliminados:any = {};
              let lotes_reintegrados:any = {};

              for(var i in pedido.historial_transferencia_completo){
                let historial = pedido.historial_transferencia_completo[i];
                
                if(historial.evento == 'SURTIO PEA' && historial.status == 'FI'){ //El pedido ya fue surtido al menos una vez, si se surte mas de una vez, se va guardando el ultimo movimiento capturado
                  movimiento_surtido = historial.movimiento;
                  movimiento_entrega = null;
                  movimiento_eliminados = [];
                  movimiento_reintegrados = [];
                }else if(historial.evento == 'RECEPCION PEA' && historial.status == 'FI'){ //El pedido ya fue entregado, si se entrega mas de una vez, se guarda el ultimo movimiento capturado
                  movimiento_entrega = historial.movimiento;
                }else if(historial.evento == 'REINTEGRACION INVENTARIO' && historial.status == 'FI'){
                  movimiento_reintegrados.push(historial.movimiento);
                }else if(historial.evento == 'ELIMINACION INVENTARIO' && historial.status == 'FI'){
                  movimiento_eliminados.push(historial.movimiento);
                }
              }

              let lotes_entregados = {};
              if(movimiento_entrega){
                for(var i in movimiento_entrega.insumos){
                  var insumo = movimiento_entrega.insumos[i];
                  var llave = insumo.stock.clave_insumo_medico+'-'+insumo.stock.fecha_caducidad+'-'+insumo.stock.lote;
                  lotes_entregados[llave] = {
                    clave: insumo.stock.clave_insumo_medico,
                    lote: insumo.stock.lote,
                    fecha_caducidad: insumo.stock.fecha_caducidad,
                    cantidad: +insumo.cantidad
                  };

                }

                for(var i in movimiento_surtido.insumos){
                  var insumo = movimiento_surtido.insumos[i];
                  var llave = insumo.stock.clave_insumo_medico+'-'+insumo.stock.fecha_caducidad+'-'+insumo.stock.lote;
                  let status_lote = null;
                  let lote_activo = true;

                  if(lotes_eliminados[insumo.stock_id] || lotes_reintegrados[insumo.stock_id]){
                    lote_activo = false;

                    if(lotes_eliminados[insumo.stock_id]){
                      status_lote = 'eliminado';
                    }else if (lotes_reintegrados[insumo.stock_id]){
                      status_lote = 'reintegrado';
                    }
                  }
                }
              }
            }
            */
            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              let insumo = dato.insumos_con_descripcion;
             
              if (insumo != null){
                insumo.cantidad_a_surtir = (+dato.cantidad_solicitada - +dato.cantidad_recibida); // + (+dato.cantidad_enviada - +dato.cantidad_recibida);
                
                insumo.cantidad_solicitada = +dato.cantidad_solicitada;
                insumo.cantidad_enviada = +dato.cantidad_enviada;
                insumo.cantidad_recibida = +dato.cantidad_recibida;
                insumo.historial_lotes = [];

                for(let j in historial_movimientos){
                  let movimiento = historial_movimientos[j];
                  if(movimiento.insumos[insumo.clave]){
                    let lotes = movimiento.insumos[insumo.clave];
                    for(let k in lotes){
                      insumo.historial_lotes.push({
                        'estatus':movimiento.estatus,
                        'fecha_movimiento':movimiento.fecha_movimiento,
                        'lote':lotes[k].lote,
                        'fecha_caducidad':lotes[k].fecha_caducidad,
                        'cantidad':lotes[k].cantidad
                      });
                    }
                  }else{
                    if(movimiento.estatus == 'SURTIDO' || movimiento.estatus == 'RECIBIDO'){
                      insumo.historial_lotes.push({
                        'estatus':movimiento.estatus,
                        'fecha_movimiento':movimiento.fecha_movimiento,
                        'lote':'---',
                        'fecha_caducidad':'---',
                        'cantidad':0
                      });
                    }
                  }
                }

                this.pedido.lista.push(insumo);
              }
            }

            pedido.insumos = undefined;
            this.pedido.datosImprimir = pedido;

            this.pedido.indexar();
            this.pedido.listar(1);
          },
          error => {
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
  
  // # SECCION: Eventos del teclado
  //keyboardInput(e: KeyboardEvent) {}

}
