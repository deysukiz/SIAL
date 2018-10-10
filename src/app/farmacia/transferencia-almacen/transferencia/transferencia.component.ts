
import { Component, OnInit, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router }   from '@angular/router'
import { DatePipe } from '@angular/common';

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
import { EntregasService } from '../../entregas/entregas.service';
import { StockService } from '../../stock/stock.service';

import { TransferenciaAlmacenService } from '../transferencia-almacen.service';

import { Pedido } from '../../pedidos/pedido';
import { Mensaje } from '../../../mensaje';

import { Almacen } from '../../../catalogos/almacenes/almacen';


@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.css'],
  host: { '(window:keydown)' : 'keyboardInput($event)'},
  providers: [StockService, EntregasService]
})
export class TransferenciaComponent implements OnInit {

  //@ViewChildren('searchBoxStock') searchBoxStockViewChildren;
  
    id:string ;

    soloLectura: boolean = false;
    cargando: boolean = false;
    cargandoStock: boolean = false;
    
    guardando:boolean = false;
    finalizando:boolean = false;

    cluesSinAlmacenes:boolean = false;

     // # SECCION: Esta sección es para mostrar mensajes
    mensajeError: Mensaje = new Mensaje();
    mensajeAdvertencia: Mensaje = new Mensaje()
    mensajeExito: Mensaje = new Mensaje();
    ultimaPeticion: any;
    // # FIN SECCION

    // # SECCION: Modal Insumos
    mostrarModalInsumos = false;
    
    // Akira: Lo volvy tipo any en lugar de string porque en pedidos jurisdiccionales se agregan más datos :P
    listaLotesAgregados: any = {};
    // # FIN SECCION

    private listaStock: any[] = [];  

    pedido: Pedido; 
    datosPedido: any = {};
    movimiento: any;
  
    private lotesSurtidos:any[] = [];
    
    private claveInsumoSeleccionado:string = null;
    private claveNoSolicitada:boolean = false;
    private itemSeleccionado: any = null;

    cargandoAlmacenes:boolean = false;
    almacenDelUsuario:any = {};
    almacenes: any[];

    cargandoUnidadesMedicas:boolean = false;
	  unidadesMedicas: any [];
	
    errores:any = {
      clues_destino: null,
      almacen_solicitante: null,
      descripcion: null,
      fecha: null,
      observaciones: null,
      insumos: null
    }
    
    constructor(private title: Title, 
      private route:ActivatedRoute, 
      private router: Router,
      private entregasService:EntregasService,
      private pedidosService:PedidosService,
      private stockService:StockService,
      private apiService:TransferenciaAlmacenService
    ) { }

    ngOnInit() {

      this.route.params.subscribe(params => {
        this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
        //this.cargarDatos();
      });

      this.route.params.subscribe(params => {
        this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      });

      if(this.id!= null){
      this.title.setTitle('Editar transferencia / Farmacia');
      } else {
      this.title.setTitle('Nueva transferencia / Farmacia');
      }

      var usuario =  JSON.parse(localStorage.getItem("usuario"));
      this.almacenDelUsuario = usuario.almacen_activo;

      this.soloLectura = usuario.solo_lectura;

      this.cargarUnidadesMedicas();
      this.pedido = new Pedido(true);

      this.datosPedido = {
        almacen_proveedor:null,
        almacen_solicitante: null,
        clues: null,
        clues_destino: null,
        fecha: new Date(),
        descripcion: null,
        observaciones: null,
      }

      this.pedido.paginacion.resultadosPorPagina = 10;
      this.pedido.filtro.paginacion.resultadosPorPagina = 10;

      this.pedido.lista = [];
      this.pedido.indexar();

      if(this.id!= null){
        this.cargando = true;
        this.apiService.ver(this.id).subscribe(
          respuesta => {
            this.cargando = false;
            console.log(respuesta);
            // Akira:
            // Vamos a darle formato para que lo veamos bien en la interfaz
            // A este punto todo es una melcocha porque se mexclaron modulos
            // Y pues ni modo jajajaja

            this.movimiento = respuesta.historial_transferencia_completo[0].movimiento;

            // Akira:
            // Aqui hacemos push a la lista de almacenes con el solicitante, pero faltarian los demas almacenes
            // pero si tenemos en cuenta que solo hay un almacen principal pues no habria problema,
            // Si no pues habria que actualizar la lista
            this.almacenes = [];
            this.almacenes.push(respuesta.almacen_solicitante);

            this.datosPedido.almacen_solicitante = respuesta.almacen_solicitante.id;
            this.datosPedido.clues_destino = respuesta.clues_destino;

            this.datosPedido.fecha  = new Date(respuesta.fecha);
            this.datosPedido.descripcion = respuesta.descripcion;
            this.datosPedido.observaciones =  respuesta.observaciones;
            console.log("aqui")

            for(let i in respuesta.insumos){
              let dato = respuesta.insumos[i];
              let insumo = dato.insumos_con_descripcion;
              if (insumo != null){
                insumo.cantidad = +dato.cantidad_solicitada;
                insumo.precio = +dato.precio_unitario;
                insumo.listaStockAsignado = [];
                insumo.totalStockAsignado = insumo.cantidad
                this.pedido.lista.push(insumo);
              }

              for(let j in this.movimiento.insumos){
                if(this.movimiento.insumos[j].clave_insumo_medico == dato.insumo_medico_clave){
                  insumo.listaStockAsignado.push({
                    clave_insumo_medico: this.movimiento.insumos[j].clave_insumo_medico,
                    cantidad: +this.movimiento.insumos[j].cantidad,
                    tipo_insumo_id: this.movimiento.insumos[j].tipo_insumo_id,
                    insumo: dato.insumos_con_descripcion,
                    precio: +this.movimiento.insumos[j].precio_unitario,
                    id: this.movimiento.insumos[j].stock.id,
                    lote: this.movimiento.insumos[j].stock.lote,
                    fecha_caducidad: this.movimiento.insumos[j].stock.fecha_caducidad,
                    codigo_barras: this.movimiento.insumos[j].stock.codigo_barras,
                    existencia: this.movimiento.insumos[j].stock.existencia
                  });

                  if(!this.listaLotesAgregados[this.movimiento.insumos[j].stock.id]){
                    this.listaLotesAgregados[this.movimiento.insumos[j].stock.id] = this.movimiento.insumos[j].cantidad;
                  }else{
                    console.log('################################################ lote duplicado ################################################');
                  }
                }
              }
            }
            console.log(this.listaLotesAgregados);
            this.pedido.indexar();
            this.pedido.listar(1);

          }, error => {
            this.cargando = false;
            console.log(error);
            this.router.navigate(['/almacen/transferencia-almacen/nueva']);
          }
        )
      }
    }
  
    agregarItem(item:any = {}){
      console.log('agregado');
      console.log(item);

      var item_previamente_agregado = false;
      for(var i in this.pedido.lista){
        if(this.pedido.lista[i].clave == item.insumo.clave){
          this.itemSeleccionado = this.pedido.lista[i];
          item_previamente_agregado = true;
        }
      }
      
      this.listaStock = [];

      if(!item_previamente_agregado){
        //console.log(item);
        var last = this.pedido.lista.push({
            clave: item.insumo.clave,
            tipo: item.insumo.tipo,
            informacion: item.insumo.informacion,
            descripcion: item.insumo.descripcion,
            generico_nombre: item.insumo.generico.nombre,
            cantidad: 0,
            totalStockAsignado: 0,
            es_causes: item.insumo.es_causes,
            es_cuadro_basico: item.es_cuadro_basico,
            listaStockAsignado:[]
        });
        this.pedido.indexar();
        this.pedido.listar(1);
        this.itemSeleccionado = this.pedido.lista[last-1];
      }
      
      if( this.itemSeleccionado.listaStockAsignado == null ){
        this.itemSeleccionado.listaStockAsignado = [];
        this.itemSeleccionado.totalStockAsignado = 0;
      }
      
      for(var i in this.itemSeleccionado.listaStockAsignado) {
        if(item.id == this.itemSeleccionado.listaStockAsignado[i].id){
          // No podemos asignar dos veces el mismo item
          return;
        }
      }
      this.itemSeleccionado.cantidad += item.cantidad;
      this.itemSeleccionado.totalStockAsignado += item.cantidad;
      item.lote.cantidad = item.cantidad;
      item.lote.precio = item.insumo.precio;
      item.lote.tipo_insumo_id = item.insumo.tipo_insumo_id;

      this.itemSeleccionado.listaStockAsignado.push(item.lote)

      //console.log(this.pedido.lista);
      console.log(this.listaLotesAgregados);
    }
    
    seleccionarItem(item){  
      this.itemSeleccionado = item; 
      this.buscarStockApi(null,item.clave)
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
        console.log(arregloResultados)
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
                // Akira
                existeClaveEnPedido = true;
              }
            }
            
            if(!existeClaveEnPedido){
              //Akira
              this.claveNoSolicitada = true;
              this.listaStock =[];
            } else {
              this.verificarItemsAsignadosStockApi();
            }
          } else {
            /*if( this.searchBoxStockViewChildren.first.nativeElement.value != ""){
              this.itemSeleccionado = null;
            }*/
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

    buscarStock(e: KeyboardEvent, input:HTMLInputElement, term:string){
      if(e.keyCode == 13){
        e.preventDefault();
        e.stopPropagation();
        if (term == ""){
          return false;
        }
        this.buscarStockApi(term);
        input.select();
        return false;
      }
      return false;
    }

    limpiarStock(){
      this.listaStock = [];
      this.itemSeleccionado = null;
      //this.searchBoxStockViewChildren.first.nativeElement.value = "";
    }

	eliminarInsumo(index): void {
    if(this.pedido.lista[index] == this.itemSeleccionado){
      this.itemSeleccionado = null;
      this.listaStock = [];
    }

    let lotes = this.pedido.lista[index].listaStockAsignado;

    for(let i in lotes){
      delete this.listaLotesAgregados[lotes[i].id];
    }

		this.pedido.lista.splice(index, 1);  
		this.pedido.indexar();
    this.pedido.listar(1);
	}
	
	eliminarStock(item): void {
    let index = this.itemSeleccionado.listaStockAsignado.indexOf(item);
    
    let stock_id = this.itemSeleccionado.listaStockAsignado[index].id;
    
    delete this.listaLotesAgregados[stock_id];

    this.itemSeleccionado.listaStockAsignado.splice(index, 1);

    this.calcularTotalStockItem();
    if(this.itemSeleccionado.cantidad <= 0){
      var indice = 0;
      for(var x in this.pedido.paginacion.lista){
        if(this.pedido.paginacion.lista[x].clave == this.itemSeleccionado.clave){
          this.pedido.paginacion.lista.splice(indice, 1);
        }
        indice++;
      } 
      this.itemSeleccionado = null;
    } else{
      this.verificarItemsAsignadosStockApi();
    }
  }


  asignarStock(item:any){
    var item_previamente_agregado = false;
    for(var i in this.pedido.lista){
      if(this.pedido.lista[i].clave == item.clave_insumo_medico){

        this.itemSeleccionado = this.pedido.lista[i];
        item_previamente_agregado = true;
      }
    }

    if(!item_previamente_agregado){
      var last = this.pedido.lista.push({
          clave: item.insumo.clave,
          tipo: item.insumo.tipo,
          informacion: item.insumo.informacion,
          descripcion: item.insumo.descripcion,
          generico_nombre: item.insumo.generico.nombre,
          cantidad:0,
          es_causes: item.insumo.es_causes,
          es_cuadro_basico: item.es_cuadro_basico,
          listaStockAsignado:[]
      });
      this.pedido.indexar();
      this.pedido.listar(1);
      this.itemSeleccionado = this.pedido.lista[last-1];
    }

    if( this.itemSeleccionado.listaStockAsignado == null ){
      this.itemSeleccionado.listaStockAsignado = [];
    }

    for(var i in this.itemSeleccionado.listaStockAsignado) {
      if(item.id == this.itemSeleccionado.listaStockAsignado[i].id){
        // No podemos asignar dos veces el mismo item
        return;
      }
    }

    this.itemSeleccionado.listaStockAsignado.push(item)

    console.log(this.pedido.lista);
  }
  
  
  validarItemStock(item:any, setMaxVal:boolean = false){ 
    if(item.cantidad == null){
      item.cantidad = 0;
      this.calcularTotalStockItem();
      return;
    }

    var cantidad = parseInt(item.cantidad);

    if(isNaN(cantidad)){
      item.cantidad = 0;
      this.calcularTotalStockItem();
      return;
    }

    if(cantidad <= 0){
      item.cantidad = 0;
      this.calcularTotalStockItem();
      return;
    }

    if( cantidad > item.existencia){
      item.cantidad = item.existencia;
    }

    this.listaLotesAgregados[item.id] = item.cantidad;

    this.calcularTotalStockItem();
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

  calcularTotalStockItem(){
    var acumulado = 0;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
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
    this.itemSeleccionado.cantidad = acumulado;
  }

    cargarUnidadesMedicas(){
      this.cargandoUnidadesMedicas = true;
      this.apiService.unidadesMedicas().subscribe(
        respuesta =>{
          this.cargandoUnidadesMedicas = false;
          this.unidadesMedicas = respuesta;
        }, error => {
          this.cargandoUnidadesMedicas = false;
          console.log(error);
        }
      )
    }

    seleccionarClues(clues){
      this.cargandoAlmacenes = true;
      this.cluesSinAlmacenes = false;
      this.apiService.almacenes(clues).subscribe(
        respuesta =>{
          this.cargandoAlmacenes = false;
          this.almacenes = respuesta;
          if(this.almacenes.length > 0){
            this.datosPedido.almacen_solicitante = this.almacenes[0].id;
          }else{
            this.cluesSinAlmacenes = true;
          }
        }, error => {
          this.cargandoAlmacenes = false;
          console.log(error);
        }
      )
    }

    guardar(finalizar:boolean = false){
      if(finalizar){
        this.finalizando = true;
      } else {
        this.guardando = true;
      }
      
      
      this.errores = {
        clues_destino: null,
        almacen_solicitante: null,
        descripcion: null,
        fecha: null,
        observaciones: null,
        insumos: null
      }

      var fecha = null;
      if(this.datosPedido.fecha != null){
        fecha = this.datosPedido.fecha.getFullYear() + "-" + ('0' + (this.datosPedido.fecha.getMonth() + 1) ).slice(-2)  + "-" + ('0' + this.datosPedido.fecha.getDate()).slice(-2)
      }
      // Vamos a dar formato a la lista del pedido 
      var listaStock = [];
      var insumos = [];
      console.log(this.pedido.lista);
      for(var i in this.pedido.lista){
        // Vamos a obtener todos lo del movimiento
        var precio = 0.00;
        var tipo_insumo_id = null;
        for( var j in this.pedido.lista[i].listaStockAsignado){
          
          listaStock.push({
            stock_id: this.pedido.lista[i].listaStockAsignado[j].id,
            clave: this.pedido.lista[i].listaStockAsignado[j].clave_insumo_medico,
            cantidad: this.pedido.lista[i].listaStockAsignado[j].cantidad != null ? this.pedido.lista[i].listaStockAsignado[j].cantidad : 0,
            precio: this.pedido.lista[i].listaStockAsignado[j].precio,
            tipo: this.pedido.lista[i].tipo,
            tipo_insumo_id: this.pedido.lista[i].listaStockAsignado[j].tipo_insumo_id		
          });
          // Asignamos el ultimo precio
          precio = this.pedido.lista[i].listaStockAsignado[j].precio	;
          tipo_insumo_id = this.pedido.lista[i].listaStockAsignado[j].tipo_insumo_id;
        }

        insumos.push({
          clave: this.pedido.lista[i].clave,
          cantidad : this.pedido.lista[i].cantidad != null ? this.pedido.lista[i].cantidad : 0,
          precio : precio,
          tipo: this.pedido.lista[i].tipo,
          tipo_insumo_id : tipo_insumo_id
        });
      }

      var payload = {
        finalizar: finalizar? true : null,
        almacen_proveedor:this.datosPedido.almacen_proveedor,
        almacen_solicitante: this.datosPedido.almacen_solicitante,
        clues: this.datosPedido.clues,
        clues_destino: this.datosPedido.clues_destino,
        fecha: fecha,
        descripcion: this.datosPedido.descripcion,
        observaciones: this.datosPedido.observaciones,
        insumos : insumos,
        movimiento: this.movimiento,
        movimiento_insumos: listaStock
      }
      this.apiService.guardarTransferencia(this.id != null? this.id : null,payload).subscribe(
        respuesta => {
          if(finalizar){
            this.finalizando = false;
          } else {
            this.guardando = false;
          }
          console.log(respuesta);
          if(respuesta.pedido.status == 'BR'){
            this.router.navigate(['/almacen/transferencia-almacen/editar/'+respuesta.pedido.id]);
          } else {
            this.router.navigate(['/almacen/transferencia-almacen/']);
          }
          console.log(respuesta);
        }, error => {
          if(finalizar){
            this.finalizando = false;
          } else {
            this.guardando = false;
          }
          try {
            let e = error.json();
            this.mensajeError = new Mensaje(true)
            switch(error.status){
              case 401: 
              this.mensajeError.texto =  "No tiee permiso para realizar esta acción.";
              break;
              case 409:
              this.mensajeError.texto = "Verifique la información marcada de color rojo";
              for (var input in e.error){
                // Iteramos todos los errores
                for (var i in e.error[input]){
                this.errores[input] = e.error[input][i];
                }                      
              }
              break;
              case 500:
              this.mensajeError.texto = "500 (Error interno del servidor)";
              break;
              default: 
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
            console.log(this.errores);
            } catch (e){
            this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
            this.mensajeError.mostrar = true;
        }
      );
    }

    finalizar() {
      var validacion_palabra = prompt("Atención la transferencia ya no podra editarse, para confirmar que desea concluir el movimiento por favor escriba: CONCLUIR TRANSFERENCIA");
      if(validacion_palabra == 'CONCLUIR TRANSFERENCIA'){
        this.guardar(true);
      }else{
        if(validacion_palabra != null){
          alert("Error al ingresar el texto para confirmar la acción.");
        }
        return false;
      }
    }
    // # SECCION: Eventos del teclado
    keyboardInput(e: KeyboardEvent) {
      
      /*if(e.keyCode == 32 &&  e.ctrlKey){ // Ctrl + barra espaciadora
        event.preventDefault();
        event.stopPropagation();

         this.searchBoxStockViewChildren.first.nativeElement.focus();
      }*/
      
          
    }

}
