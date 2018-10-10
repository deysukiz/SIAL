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

//import { PedidosService } from '../../pedidos/pedidos.service';
//import { StockService } from '../../stock/stock.service';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

/*import { AlmacenesService } from '../../../catalogos/almacenes/almacenes.service';
import { Almacen } from '../../../catalogos/almacenes/almacen';*/

import { InicializacionInventarioService } from '../inicializacion-inventario.service';

import { Inventario } from '../inventario';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})

export class FormularioComponent implements OnInit {
  id: string;
  folio: string;
  cargando: boolean = false;
  guardando: boolean = false;
  cargandoStock: boolean = false;
  capturarStock: boolean = false;

  almacen_seleccionado:any = {};
  formulario:any;// = {datos:{},validacion:{}};

  mostrarDialogo: boolean = false;

  erroresFormularioStock:any = {cantidad:{error:false}, lote:{error:false}, fecha_caducidad:{error:false}};

  public formularioRecepcion: FormGroup;
  fb:FormBuilder;

  statusCaptura: string = 'NV';

   // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION  

  formStock: any = {};
  inventario: Inventario; 
  lotesSurtidos:any[] = [];
  listaStock: any[] = [];  
  claveInsumoSeleccionado:string = null;
  claveNoSolicitada:boolean = false;
  itemSeleccionado: any = null;

  cambiarEntornoSuscription: Subscription;
  
  constructor(private title: Title, private route:ActivatedRoute, private inicializacionInventarioService:InicializacionInventarioService, private router: Router, private cambiarEntornoService:CambiarEntornoService) {
    /*this.fb  = new FormBuilder();
    let now = new Date();
    let day = ("0" + now.getDate()).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    let today = now.getFullYear() + "-" + (month) + "-" + (day);
    this.formularioRecepcion = this.fb.group({
      entrega: ['', [Validators.required]],
      recibe: ['', [Validators.required]],
      fecha_movimiento: [today,[Validators.required]],
      observaciones: ''
    });*/
    this.formulario = {datos:{},validacion:{}};
  }

  ngOnInit() {
    this.cargando = true;
    this.title.setTitle('Surtir pedido / Almacén');

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      //this.router.navigate(['/almacen/pedidos']);
    });

    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
    });

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.almacen_seleccionado = usuario.almacen_activo;

    this.formulario.validacion.valido = false;
    this.formulario.validacion.errores = {};
    
    this.inicializacionInventarioService.insumos().subscribe(
          insumos => {
            this.cargando = false;
            this.inventario = new Inventario(true);
            this.inventario.paginacion.resultadosPorPagina = 10;
            this.inventario.filtro.paginacion.resultadosPorPagina = 10; 

            for(let i in insumos){
              let dato = insumos[i];
              let insumo = dato;

              insumo.cantidad = 0;
              insumo.monto = 0.00;
              insumo.precio = +dato.precio;
              insumo.totalStockAsignado = 0;

              /*if(recepcion_insumos[insumo.clave]){
                insumo.listaStockAsignado = [];
                insumo.totalStockAsignado += recepcion_insumos[insumo.clave].cantidad;
                for(let j in recepcion_insumos[insumo.clave].stock){
                  let stock = recepcion_insumos[insumo.clave].stock[j];
                  insumo.listaStockAsignado.push({
                    codigo_barras: stock.codigo_barras,
                    //marca: stock.marca,
                    lote: stock.lote,
                    fecha_caducidad: stock.fecha_caducidad,
                    cantidad: stock.cantidad,
                  });
                }
              }*/

              this.inventario.lista.push(insumo);
            }
            this.inventario.indexar();
            this.inventario.listar(1);
            this.cargando = false;
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

    //this.inventariosService.ver(this.id).subscribe(
    /*this.inicializacionInventarioService.verRecepcionPedido(this.id).subscribe(
          pedido => {
            this.cargando = false;
            this.inventario = new Inventario(true);
            this.inventario.paginacion.resultadosPorPagina = 10;
            this.inventario.filtro.paginacion.resultadosPorPagina = 10;
            this.folio = pedido.folio;

            let recepcion_insumos = {};

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
              this.statusCaptura = 'BR';              
            }

            if(pedido.status == 'FI'){
              this.statusCaptura = 'FI';
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
                    cantidad: stock.cantidad,
                  });
                }
              }

              this.inventario.lista.push(insumo);
            }

            pedido.insumos = undefined;

            this.inventario.datosImprimir = pedido;
            this.inventario.indexar();
            this.inventario.listar(1);
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
    );*/
  }

  seleccionarItem(item){  
    this.itemSeleccionado = item; 
    this.capturarStock = true;
    this.formStock = {};
    this.erroresFormularioStock = {cantidad:{error:false}, lote:{error:false}, fecha_caducidad:{error:false}};
  }

  buscar(e: KeyboardEvent, input:HTMLInputElement, inputAnterior: HTMLInputElement,  parametros:any[]){
    
    let term = input.value;

    // Quitamos la busqueda
    if(e.keyCode == 27){
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      inputAnterior.value = "";

      this.inventario.filtro.activo = false;
      this.inventario.filtro.lista = [];      

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
      this.inventario.filtro.activo = true;      
    } else {
      this.inventario.filtro.activo = false;
      this.inventario.filtro.lista = [];
      return;
    }

    var arregloResultados:any[] = []
    for(let i in parametros){

      let termino = (parametros[i].input as HTMLInputElement).value;
      if(termino == ""){
        continue;
      }
            
      let listaFiltrada = this.inventario.lista.filter((item)=> {   
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
      this.inventario.filtro.lista = match;
    } else {
      this.inventario.filtro.lista = arregloResultados[0];
    }


    this.inventario.filtro.indexar(false);
    
    this.inventario.filtro.paginacion.paginaActual = 1;
    this.inventario.filtro.listar(1); 

  }

  finalizar(){
    this.mostrarDialogo = true;
  }

  cerrarDialogo(){
    this.mostrarDialogo = false;
  }

  guardar(finalizar:boolean = false){
    this.guardando = true;
    //console.log(this.inventario);
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

    for(var i in this.inventario.lista){
      let item = this.inventario.lista[i];
      if(item.totalStockAsignado > 0){
        for(var j in item.listaStockAsignado){
          var stock = {
            clave_insumo_medico: item.clave,
            lote: item.listaStockAsignado[j].lote,
            fecha_caducidad: item.listaStockAsignado[j].fecha_caducidad,
            cantidad: item.listaStockAsignado[j].cantidad,
            existencia: item.listaStockAsignado[j].cantidad,
            codigo_barras: item.listaStockAsignado[j].codigo_barras,
            precio_unitario: 0,
            precio_total: 0
          };
          guardar_recepcion.stock.push(stock);
        }
      }
    }

    /*this.inicializacionInventarioService.guardarRecepcionPedido(this.inventario.datosImprimir.id,guardar_recepcion).subscribe(
      pedido => {
        this.mostrarDialogo = false;
        this.guardando = false;
        this.mensajeExito = new Mensaje(true);

        if(guardar_recepcion.status == 'FI'){
          this.statusCaptura = 'FI';
          this.mensajeExito.texto = 'Recepción Finalizada';
        }else{
          this.statusCaptura = 'BR';
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
    */
    console.log(guardar_recepcion);
    this.guardando = false;
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
    let caducado = false;

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

        if(meses < 0){
          //this.erroresFormularioStock.fecha_caducidad = {error:true, texto:'Medicamento caducado.'};
          caducado = true;
        }

        /*if(meses < 6){
          this.erroresFormularioStock.fecha_caducidad = {error:true, texto:'La fecha de caducidad no puede ser menor a 6 meses.'};
          errores++;
        }*/
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
    console.log(this.itemSeleccionado);
    if( this.itemSeleccionado.listaStockAsignado == null ){
      this.itemSeleccionado.listaStockAsignado = [];
    }
    var acumulado = 0;
    for(var i in this.itemSeleccionado.listaStockAsignado) {
      acumulado += this.itemSeleccionado.listaStockAsignado[i].cantidad;
    }
    acumulado += this.formStock.cantidad;

    this.itemSeleccionado.totalStockAsignado = acumulado;
    this.itemSeleccionado.listaStockAsignado.push({
        codigo_barras: this.formStock.codigo_barras,
        lote: this.formStock.lote,
        fecha_caducidad: this.formStock.fecha_caducidad,
        cantidad: this.formStock.cantidad,
        esta_caducado: caducado
    });
    this.resetearFormStock();
    this.calcularTotalStockItem();
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
    this.itemSeleccionado.monto = acumulado * this.itemSeleccionado.precio;
    this.inventario.actualizarTotales();
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
