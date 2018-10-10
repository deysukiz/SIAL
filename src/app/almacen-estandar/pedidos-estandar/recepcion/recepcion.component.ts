import { Component, OnInit, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router'

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

import  * as FileSaver    from 'file-saver'; 

import { PedidosEstandarService } from '../../pedidos-estandar/pedidos.service';
import { RecepcionEstandarService } from './recepcion.service';
import { StockService } from '../stock/stock.service';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

import { Pedido } from '../../pedidos-estandar/pedido';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.css']
})
export class RecepcionComponent implements OnInit {
  id: string;
  folio: string;
  cargando: boolean = false;
  guardando: boolean = false;
  cargandoStock: boolean = false;
  capturarStock: boolean = false;

  minDate = new Date();
  maxDate = new Date();

  puedeEliminarStock: boolean = true;

  mostrarDialogo: boolean = false;

  erroresFormularioStock:any = {cantidad:{error:false}, lote:{error:false}, fecha_caducidad:{error:false}};

  public formularioRecepcion: FormGroup;
  fb:FormBuilder;

  statusRecepcion: string = 'NV';

   // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION  

  //marcas = [{id:1,nombre:'Sin Especificar'}];
  formStock: any = {};
  pedido: Pedido; 
  lotesSurtidos:any[] = [];
  listaStock: any[] = [];  
  claveInsumoSeleccionado:string = null;
  claveNoSolicitada:boolean = false;
  itemSeleccionado: any = null;

  cambiarEntornoSuscription: Subscription;
  
  constructor(
    private title: Title,
    private route:ActivatedRoute,
    private pedidosService:PedidosEstandarService,
    private recepcionService:RecepcionEstandarService,
    private stockService:StockService,
    private router: Router,
    private cambiarEntornoService:CambiarEntornoService) {
    this.fb  = new FormBuilder();
    let now = new Date();
    let day = ("0" + now.getDate()).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    let today = now.getFullYear() + "-" + (month) + "-" + (day);
    this.formularioRecepcion = this.fb.group({
      entrega: ['', [Validators.required]],
      recibe: ['', [Validators.required]],
      fecha_movimiento: [today,[Validators.required]],
      observaciones: ''
    });
  }

  ngOnInit() {
    this.title.setTitle('Surtir pedido / Almacén');

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.router.navigate(['/almacen/pedidos']);
    });

    /*if(this.marcas.length == 1){
      this.formStock.marca = this.marcas[0];
    }*/

    let date = new Date();    
    this.minDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.maxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      //this.cargarDatos();
    });

    this.cargando = true;
    //this.pedidosService.ver(this.id).subscribe(
    this.recepcionService.verRecepcionPedido(this.id).subscribe(
          pedido => {
            this.cargando = false;
            this.pedido = new Pedido(true);
            this.pedido.paginacion.resultadosPorPagina = 10;
            this.pedido.filtro.paginacion.resultadosPorPagina = 10;
            this.folio = pedido.folio;

            let recepcion_insumos = {};

            if(pedido.tipo_pedido_id == 'PA' || pedido.tipo_pedido_id == 'PJS' || pedido.tipo_pedido_id == 'PFS'){
              if(pedido.recepciones.length == 1){
                let recepcion_insumos_guardados = pedido.recepciones[0].entrada_abierta.insumos;
                for(var i in recepcion_insumos_guardados){
                  let insumo = recepcion_insumos_guardados[i];
                  if(!recepcion_insumos[insumo.stock.clave_insumo_medico]){
                    recepcion_insumos[insumo.stock.clave_insumo_medico] = {
                      cantidad:0,
                      stock:[]
                    };
                  }
                  recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                  insumo.stock.cantidad = +insumo.cantidad;
                  recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                }
                for(var clave in recepcion_insumos){
                  this.lotesSurtidos.push({ clave: clave, cantidad: recepcion_insumos[clave].cantidad});
                }
                this.statusRecepcion = 'BR';              
              }
            }else if(pedido.tipo_pedido_id == 'PEA'){

              if(pedido.historial_transferencia_completo.length > 0){
                let transferencia_recibida:any = null;
                let transferencia_recibida_borrador:any = null;
                let transferencia_surtida:any = null;

                for(var i in pedido.historial_transferencia_completo){
                  let historial = pedido.historial_transferencia_completo[i];
                  if(historial.evento == 'SURTIO PEA'){
                    transferencia_surtida = historial.movimiento;
                    transferencia_recibida_borrador = null;
                    transferencia_recibida = null;
                  }else if(historial.evento == 'RECEPCION PEA'){
                    if(historial.status == 'BR'){
                      transferencia_recibida_borrador = historial.movimiento;
                    }else{
                      transferencia_recibida = historial.movimiento;
                    }
                  }
                }
                //
                if(transferencia_recibida){
                  this.statusRecepcion = 'FI';
                }else if(transferencia_surtida){
                  let recepcion_insumos_guardados = transferencia_surtida.insumos;
                  for(var i in recepcion_insumos_guardados){
                    let insumo = recepcion_insumos_guardados[i];
                    if(!recepcion_insumos[insumo.stock.clave_insumo_medico]){
                      recepcion_insumos[insumo.stock.clave_insumo_medico] = {
                        cantidad:0,
                        stock:[]
                      };
                    }
                    if(!transferencia_recibida_borrador){
                      recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                      //insumo.stock.cantidad = +insumo.cantidad;
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = +insumo.cantidad;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }else{
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = 0;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }
                  }

                  if(!transferencia_recibida_borrador){
                    for(var clave in recepcion_insumos){
                      this.lotesSurtidos.push({ clave: clave, cantidad: recepcion_insumos[clave].cantidad});
                    }
                    this.statusRecepcion = 'NV'; 
                    this.puedeEliminarStock = false;
                  }
                }
                
                if(transferencia_recibida_borrador){
                  let recepcion_insumos_guardados = transferencia_recibida_borrador.insumos;
                  
                  for(var i in recepcion_insumos_guardados){
                    let insumo = recepcion_insumos_guardados[i];

                    if(recepcion_insumos[insumo.stock.clave_insumo_medico]){
                      for(var j in recepcion_insumos[insumo.stock.clave_insumo_medico].stock){
                        let insumo_recibido = recepcion_insumos[insumo.stock.clave_insumo_medico].stock[j];
                        //if(recepcion_insumos[insumo.stock.clave_insumo_medico].stock[j].id == insumo.stock.id){ //El stock id no es el mismo, hay que comprar todo, fecha caducidad, lote, y codigo de barras
                        if(insumo_recibido.lote == insumo.stock.lote && insumo_recibido.fecha_caducidad == insumo.stock.fecha_caducidad && insumo_recibido.codigo_barras == insumo.stock.codigo_barras ){
                          insumo_recibido.cantidad_recibida = +insumo.cantidad;
                        }
                      }
                      recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                    }
                  }
                  for(var clave in recepcion_insumos){
                    this.lotesSurtidos.push({ clave: clave, cantidad: recepcion_insumos[clave].cantidad});
                  }
                  this.statusRecepcion = 'BR'; 
                  this.puedeEliminarStock = false;
                }
              }

              /////#########################################################################################      desde aqui ------------------------------------------------------------------------------------------------
              /*
              if(pedido.movimientos.length > 0){
                let transferencia_recibida:any = null;
                let transferencia_recibida_borrador:any = null;
                let transferencia_surtida:any = null;

                for(var i in pedido.movimientos){
                  if(pedido.movimientos[i].transferencia_recibida){
                    transferencia_recibida = pedido.movimientos[i].transferencia_recibida;
                  }else if(pedido.movimientos[i].transferencia_recibida_borrador){
                    transferencia_recibida_borrador = pedido.movimientos[i].transferencia_recibida_borrador;
                  }else if(pedido.movimientos[i].transferencia_surtida){
                    transferencia_surtida = pedido.movimientos[i].transferencia_surtida;
                  }
                }

                if(transferencia_recibida){
                  let recepcion_insumos_guardados = transferencia_surtida.insumos;
                  for(var i in recepcion_insumos_guardados){
                    let insumo = recepcion_insumos_guardados[i];

                    if(!recepcion_insumos[insumo.stock.clave_insumo_medico]){
                      recepcion_insumos[insumo.stock.clave_insumo_medico] = {
                        cantidad:0,
                        stock:[]
                      };
                    }

                    if(!transferencia_recibida_borrador){
                      recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                      //insumo.stock.cantidad = +insumo.cantidad;
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = +insumo.cantidad;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }else{
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = 0;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }
                  }
                }else if(transferencia_surtida){
                  let recepcion_insumos_guardados = transferencia_surtida.insumos;
                  for(var i in recepcion_insumos_guardados){
                    let insumo = recepcion_insumos_guardados[i];
                    if(!recepcion_insumos[insumo.stock.clave_insumo_medico]){
                      recepcion_insumos[insumo.stock.clave_insumo_medico] = {
                        cantidad:0,
                        stock:[]
                      };
                    }
                    if(!transferencia_recibida_borrador){
                      recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                      //insumo.stock.cantidad = +insumo.cantidad;
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = +insumo.cantidad;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }else{
                      insumo.stock.cantidad_enviada = +insumo.cantidad;
                      insumo.stock.cantidad_recibida = 0;
                      recepcion_insumos[insumo.stock.clave_insumo_medico].stock.push(insumo.stock);
                    }
                  }

                  if(!transferencia_recibida_borrador){
                    for(var clave in recepcion_insumos){
                      this.lotesSurtidos.push({ clave: clave, cantidad: recepcion_insumos[clave].cantidad});
                    }
                    this.statusRecepcion = 'NV'; 
                    this.puedeEliminarStock = false;
                  }
                }
                
                if(transferencia_recibida_borrador){
                  let recepcion_insumos_guardados = transferencia_recibida_borrador.insumos;
                  
                  for(var i in recepcion_insumos_guardados){
                    let insumo = recepcion_insumos_guardados[i];

                    if(recepcion_insumos[insumo.stock.clave_insumo_medico]){
                      for(var j in recepcion_insumos[insumo.stock.clave_insumo_medico].stock){
                        let insumo_recibido = recepcion_insumos[insumo.stock.clave_insumo_medico].stock[j];
                        //if(recepcion_insumos[insumo.stock.clave_insumo_medico].stock[j].id == insumo.stock.id){ //El stock id no es el mismo, hay que comprar todo, fecha caducidad, lote, y codigo de barras
                        if(insumo_recibido.lote == insumo.stock.lote && insumo_recibido.fecha_caducidad == insumo.stock.fecha_caducidad && insumo_recibido.codigo_barras == insumo.stock.codigo_barras ){
                          insumo_recibido.cantidad_recibida = +insumo.cantidad;
                        }
                      }
                      recepcion_insumos[insumo.stock.clave_insumo_medico].cantidad += +insumo.cantidad;
                    }
                  }
                  for(var clave in recepcion_insumos){
                    this.lotesSurtidos.push({ clave: clave, cantidad: recepcion_insumos[clave].cantidad});
                  }
                  this.statusRecepcion = 'BR'; 
                  this.puedeEliminarStock = false;
                }
              }
              */
              /////#########################################################################################      hasta aqui ------------------------------------------------------------------------------------------------
            }

            if(pedido.status == 'FI'){
              this.statusRecepcion = 'FI';
            }   

            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              let insumo = dato.insumos_con_descripcion;
             
              insumo.cantidad = +dato.cantidad_solicitada;
              insumo.cantidad_recibida = +dato.cantidad_recibida;
              insumo.monto = +dato.monto_solicitado;
              insumo.precio = +dato.precio_unitario;
              insumo.totalStockAsignado = +dato.cantidad_recibida;

              if(recepcion_insumos[insumo.clave]){
                insumo.listaStockAsignado = [];
                insumo.totalStockAsignado += recepcion_insumos[insumo.clave].cantidad;
                for(let j in recepcion_insumos[insumo.clave].stock){
                  let stock = recepcion_insumos[insumo.clave].stock[j];
                  insumo.listaStockAsignado.push({
                    codigo_barras: stock.codigo_barras,
                    //marca: stock.marca,
                    lote: stock.lote,
                    fecha_caducidad: stock.fecha_caducidad,
                    cantidad_enviada: stock.cantidad_enviada,
                    cantidad_recibida: stock.cantidad_recibida,
                    cantidad: stock.cantidad
                  });
                }
              }

              this.pedido.lista.push(insumo);
            }

            pedido.insumos = undefined;

            this.pedido.tipo_pedido = pedido.tipo_pedido_id;
            this.pedido.datosImprimir = pedido;
            this.pedido.indexar();
            this.pedido.listar(1);
          },
          error => {
            this.cargando = false;

            this.mensajeError = new Mensaje(true);
            this.mensajeError.mostrar;

            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }else{
                this.mensajeError.texto = e.error;
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

  formularioTieneError = function(atributo:string, error:string){
    return (this.formularioRecepcion.get(atributo).hasError(error) && this.formularioRecepcion.get(atributo).touched);
  }

  seleccionarItem(item){  
    this.itemSeleccionado = item; 
    this.capturarStock = true;
    this.formStock = {};
    this.erroresFormularioStock = {cantidad:{error:false}, lote:{error:false}, fecha_caducidad:{error:false}};
    /*if(this.marcas.length == 1){
      this.formStock.marca = this.marcas[0];
    }*/
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


  buscarStockApi(term:string, clave:string = null){
    this.cargandoStock = true;
    this.stockService.buscar(term, clave).subscribe(
        resultado => {
          this.cargandoStock = false;
          this.claveNoSolicitada = false;

          this.listaStock = resultado ;

          if(resultado.length>0){
            this.claveInsumoSeleccionado = resultado[0].clave_insumo_medico;

            var existeClaveEnPedido = false;

            for(var  i = 0; i < this.pedido.lista.length ; i++){
          
              if(this.pedido.lista[i].clave == this.claveInsumoSeleccionado){
                // Calculamos la pagina
                this.pedido.filtro.activo = false;
                let pag = Math.ceil((i + 1) /this.pedido.paginacion.resultadosPorPagina);
                this.pedido.listar(pag);
                this.itemSeleccionado = this.pedido.lista[i] ;
                existeClaveEnPedido = true;
              }
            }

            if(!existeClaveEnPedido){
              this.claveNoSolicitada = true;
              this.listaStock =[];
            } else {
              this.verificarItemsAsignadosStockApi();
            }

          } else {
            //
          }
          console.log("Stock cargado.");
        },
        error => {
          this.cargandoStock = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){ /*this.listarBusqueda(term);*/ };
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

  finalizar(){
    this.mostrarDialogo = true;
  }

  cerrarDialogo(){
    this.mostrarDialogo = false;
  }

  guardar(finalizar:boolean = false){
    this.guardando = true;
    //console.log(this.pedido);
    let guardar_recepcion:any;

    if(finalizar){
      this.formularioRecepcion.get('entrega').markAsTouched();
      this.formularioRecepcion.get('recibe').markAsTouched();
      this.formularioRecepcion.get('fecha_movimiento').markAsTouched();

      if(!this.formularioRecepcion.valid){
        return false;
      }

      var validacion_palabra = prompt("Atención la recepción ya no podra editarse, para confirmar que desea concluir la recepción por favor escriba: CONCLUIR RECEPCION");

      //if(confirm('Atención la recepción ya no podra editarse, Esta seguro que desea concluir el movimiento?')){
      if(validacion_palabra == 'CONCLUIR RECEPCION'){
        guardar_recepcion = this.formularioRecepcion.value;
        guardar_recepcion.fecha_movimiento = guardar_recepcion.fecha_movimiento.toString().substr(0,10);
        guardar_recepcion.status = 'FI';
        guardar_recepcion.stock = [];
      }else{
        if(validacion_palabra != null){
          alert("Error al ingresar el texto para confirmar la acción.");
        }
        this.guardando = false;
        return false;
      }
    }else{
      guardar_recepcion = {status:'BR', observaciones:'',stock:[]};
    }

    for(var i in this.pedido.lista){
      let item = this.pedido.lista[i];
      if(item.totalStockAsignado > 0){
        for(var j in item.listaStockAsignado){
          var stock = {
            clave_insumo_medico: item.clave,
            lote: item.listaStockAsignado[j].lote,
            fecha_caducidad: item.listaStockAsignado[j].fecha_caducidad,
            cantidad:0,
            existencia:0,
            codigo_barras: item.listaStockAsignado[j].codigo_barras,
            precio_unitario: 0,
            precio_total: 0
          };
          if(this.pedido.tipo_pedido != 'PEA'){
            stock.cantidad = item.listaStockAsignado[j].cantidad;
            stock.existencia = item.listaStockAsignado[j].cantidad;
          }else{
            stock.cantidad = item.listaStockAsignado[j].cantidad_recibida;
            stock.existencia = item.listaStockAsignado[j].cantidad_recibida;
          }
          guardar_recepcion.stock.push(stock);
        }
      }
    }

    this.recepcionService.guardarRecepcionPedido(this.pedido.datosImprimir.id,guardar_recepcion).subscribe(
      pedido => {
        this.mostrarDialogo = false;
        this.guardando = false;
        this.mensajeExito = new Mensaje(true);

        if(guardar_recepcion.status == 'FI'){
          this.statusRecepcion = 'FI';
          this.mensajeExito.texto = 'Recepción Finalizada';
        }else{
          this.statusRecepcion = 'BR';
          this.mensajeExito.texto = 'Datos Guardados';
        }
        this.mensajeExito.mostrar = true;
        console.log('Recepción guardada');
        //console.log(pedido);
        //this.router.navigate(['/farmacia/pedidos/editar/'+pedido.id]);
        //hacer cosas para dejar editar
      },
      error => {
        this.guardando = false;
        this.mostrarDialogo = false;
        console.log(error);
        this.mensajeError = new Mensaje(true);
        this.mensajeError.texto = 'No especificado';
        this.mensajeError.mostrar = true;

        try{
          let e = error.json();
          console.log(e);
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
            // Problema de validación
            if (error.status == 409){
              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
              /*for (var input in e.error){
                // Iteramos todos los errores
                for (var i in e.error[input]){

                  if(input == 'id' && e.error[input][i] == 'unique'){
                    this.usuarioRepetido = true;
                  }
                  if(input == 'id' && e.error[input][i] == 'email'){
                    this.usuarioInvalido = true;
                  }
                }                      
              }*/
            }

            if(error.status == 500){
              if(e.error){
                this.mensajeError.texto = e.error;
                this.mensajeError.cuentaAtras = 1000;
              }
            }
        }catch(e){
          if (error.status == 500 ){
            this.mensajeError.texto = "500 (Error interno del servidor)";
          } else {
            console.log(e);
            this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
        }
      }
    );
  }

  buscarStock(e: KeyboardEvent, input:HTMLInputElement, term:string) {
    if(e.keyCode == 13) {
      e.preventDefault();
      e.stopPropagation();
      if (term == "") {
        return false;
      }      
      this.buscarStockApi(term);
      input.select();
      return false;
    }
    return false;
  }

  limpiarStock(){
    this.capturarStock = false;
    this.listaStock = [];
    this.itemSeleccionado = null;
  }

  eliminarStock(item): void {
    let index = this.itemSeleccionado.listaStockAsignado.indexOf(item);
    
    this.itemSeleccionado.listaStockAsignado.splice(index, 1);  
     
    this.calcularTotalStockItem();
    
    this.verificarItemsAsignadosStockApi();
  }

  asignarStock(){
    this.erroresFormularioStock = {cantidad:{error:false}, lote:{error:false}, fecha_caducidad:{error:false}};
    let errores = 0;

    if(!this.formStock.cantidad){
      this.erroresFormularioStock.cantidad = {error:true, texto:'Este campo es requerido.'};
      errores++;
    }else if(this.formStock.cantidad <= 0){
      this.erroresFormularioStock.cantidad = {error:true, texto:'La cantidad recibida debe ser mayor a 0.'};
      errores++;
    }

    if(this.itemSeleccionado.tiene_fecha_caducidad && !this.formStock.fecha_caducidad){
      this.erroresFormularioStock.fecha_caducidad = {error:true, texto:'Este campo es requerido.'};
      errores++;
    //}else if(this.itemSeleccionado.tiene_fecha_caducidad){
    }else if(this.formStock.fecha_caducidad){
      this.formStock.fecha_caducidad = this.formStock.fecha_caducidad.toString().substr(0,10);
      //console.log(fecha_caducidad);
      let fecha = this.formStock.fecha_caducidad.split('-');
      let fecha_invalida = false;
      if(fecha.length != 3){
        fecha_invalida = true;
      }else if(fecha[0].length != 4 || fecha[1].length != 2 || fecha[2].length != 2){
        fecha_invalida = true;
      }else if(parseInt(fecha[1]) < 1 || parseInt(fecha[1]) > 12 ){
        fecha_invalida = true;
      }else if(parseInt(fecha[2]) < 1 || parseInt(fecha[2]) > 31 ){
        fecha_invalida = true;
      }

      if(fecha_invalida){
        this.erroresFormularioStock.fecha_caducidad = {error:true, texto:'El formato de fecha no es correcto.'};
        errores++;
      }else{
        let d1 = new Date();
        let d2 = new Date(fecha[0],(parseInt(fecha[1])-1),parseInt(fecha[2]));
        let meses;
        meses = (d2.getFullYear() - d1.getFullYear()) * 12;
        meses -= d1.getMonth();
        meses += d2.getMonth();

        if(meses < 6){
          this.erroresFormularioStock.fecha_caducidad = {error:true, texto:'La fecha de caducidad no puede ser menor a 6 meses.'};
          errores++;
        }
        console.log(meses);
      }
    }

    if(!this.formStock.lote){
      this.erroresFormularioStock.lote = {error:true, texto:'Este campo es requerido.'};
      errores++;
    }

    if(errores){
      return false;
    }

    if( this.itemSeleccionado.listaStockAsignado == null ){
      this.itemSeleccionado.listaStockAsignado = [];
    }
    var acumulado = this.itemSeleccionado.cantidad_recibida;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
    }
    acumulado += this.formStock.cantidad;

    if (acumulado <= this.itemSeleccionado.cantidad){
      this.itemSeleccionado.totalStockAsignado = acumulado;
      this.itemSeleccionado.listaStockAsignado.push({
        codigo_barras: this.formStock.codigo_barras,
        //marca: this.formStock.marca,
        lote: this.formStock.lote,
        fecha_caducidad: this.formStock.fecha_caducidad,
        cantidad: this.formStock.cantidad,
      });
      this.resetearFormStock();
      this.calcularTotalStockItem()
    } else {
      this.erroresFormularioStock.cantidad = {error:true, texto:'La cantidad recibida supera la cantidad solicitada.'};
      //Ya no se puede asignar mas
    }
  }
  
  cancelarCapturaStock(){
    this.resetearFormStock(true);
  }

  resetearFormStock(completo:boolean = false){
    if(completo){
      this.formStock = {};
    }else{
      this.formStock.lote = undefined;
      this.formStock.fecha_caducidad = undefined;
      this.formStock.cantidad = undefined;
    }
    /*if(this.marcas.length == 1){
      this.formStock.marca = this.marcas[0];
    }*/
  }

  validarItemStock(item:any, setMaxVal:boolean = false){
    
    if(this.pedido.tipo_pedido != 'PEA'){
      if(item.cantidad == null){
        if(setMaxVal){
          this.asignarMaximoPosible(item)
        }
        this.calcularTotalStockItem();
        return;
      }
      
      var cantidad = parseInt(item.cantidad);
      
      if(isNaN(cantidad)){
        this.asignarMaximoPosible(item)
        this.calcularTotalStockItem();
        return;
      }
      
      if(cantidad <= 0){
        this.asignarMaximoPosible(item)
        this.calcularTotalStockItem();
        return;
      }
      
      if( cantidad > item.existencia){
        item.cantidad = item.existencia;
      }

      if(!this.verificarTotalStockItem()){
        this.asignarMaximoPosible(item)
      }

      this.calcularTotalStockItem();
    }else{
      if(item.cantidad_recibida == null){
        item.cantidad_recibida = 0;
        this.calcularTotalStockItem();
        return;
      }
      
      var cantidad = parseInt(item.cantidad_recibida);
      
      if(isNaN(cantidad) || cantidad <= 0){
        item.cantidad_recibida = 0;
        this.calcularTotalStockItem();
        return;
      }

      if( cantidad > item.cantidad_enviada){
        item.cantidad_recibida = item.cantidad_enviada;
      }

      this.calcularTotalStockItem();
    }
  }

  asignarMaximoPosible(item:any){
    var acumulado = 0;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      if(this.itemSeleccionado.listaStockAsignado[i] != item ){
        acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
      }
      
    }

    var faltante = this.itemSeleccionado.cantidad - acumulado;

    if(faltante >= item.existencia){
      item.cantidad = item.existencia;
    }
    if(faltante < item.existencia){
      item.cantidad = faltante;
    }
  }

  verificarItemsAsignadosStockApi(){
    
    for(var i in this.listaStock){
      this.listaStock[i].asignado = false;
      for(var j in this.itemSeleccionado.listaStockAsignado){
        if(this.itemSeleccionado.listaStockAsignado[j].id == this.listaStock[i].id){
          this.listaStock[i].asignado = true;
          break;
        } 
      }
    }

  }

  verificarTotalStockItem():boolean{
    var acumulado = 0;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
    }
    return this.itemSeleccionado.totalStockAsignado <= this.itemSeleccionado.cantidad;
  }

  calcularTotalStockItem(){  
    var acumulado = this.itemSeleccionado.cantidad_recibida;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      if(this.pedido.tipo_pedido != 'PEA'){
        acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
      }else{
        acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad_recibida;
      }
      
    }
    if (acumulado == 0){
      var indice = 0;
      for(var i  in this.lotesSurtidos) {
        if(this.lotesSurtidos[i].clave == this.itemSeleccionado.clave){
          
          this.lotesSurtidos.splice(indice,1);
        }
        indice++;
      }
    } else {
     
      var bandera = false;
      for(var i  in this.lotesSurtidos) {
        if(this.lotesSurtidos[i].clave == this.itemSeleccionado.clave){
          bandera = true;
          this.lotesSurtidos[i].cantidad = acumulado;
        }
      }
      if(!bandera){
        this.lotesSurtidos.push({ clave: this.itemSeleccionado.clave, cantidad:  acumulado});
      }
    }
    this.itemSeleccionado.totalStockAsignado = acumulado;
  }

  // # SECCION: Eventos del teclado
  keyboardInput(e: KeyboardEvent) {
    
    if(e.keyCode == 32 &&  e.ctrlKey){ // Ctrl + barra espaciadora
      event.preventDefault();
      event.stopPropagation();
    }     
  }

  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }
}
