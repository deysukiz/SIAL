import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'

import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-transferencias-recursos',
  templateUrl: './transferencias-recursos.component.html',
  styleUrls: ['./transferencias-recursos.component.css']
})
export class TransferenciasRecursosComponent implements OnInit {

  cargando: boolean = false;
  //cargandoPresupuestos: boolean = false;  

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION
  
  // # SECCION: Filtro

  filtro_clues_origen:string = '';
  filtro_clues_destino:string = '';
  filtro_mes_origen:number = -1;
  filtro_anio_origen:number = -1;
  filtro_mes_destino:number = -1;
  filtro_anio_destino:number = -1;

  ligarCluesOrigenDestino:boolean = true;

  // # FIN SECCION

  // # SECCION TRANSFERENCIA
  listaClues:any[] = [];
  listaMeses:any[] = [];
  listaAnios:any[] = [];
  listaAlmacenesOrigen:any[] = [];
  listaAlmacenesDestino:any[] = [];
  // # FIN SECCION

  // # SECCION ARRASTRAR SALDOS
  listaCluesConSaldo:any[] = [];
  listaMesesAniosAnteriorFechaActual:any[] = [];
  // # FIN SECCION

   // # SECCION: Lista
  lista: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 25;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = []
  // # FIN SECCION
  
  constructor(private title: Title, private apiService: AdministradorCentralService) { }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Transferencias / Administrador central");
    this.listar(1);
    
    this.cargarUnidadesMedicas();
    this.cargarMeses();
    this.cargarAnios();
    this.cargarMesesAniosAnteriorMesActual();
  }

  cargarUnidadesMedicas(){
    this.apiService.unidadesMedicasConPresupuesto().subscribe(
      respuesta => {
        this.listaClues = respuesta;
      }, error => {
        console.log(error)
      }
    );
  }

  cargarMeses(){
    this.apiService.mesesPresupuestoActual().subscribe(
      respuesta => {
        this.listaMeses = respuesta;
      }, error => {
        console.log(error)
      }
    );
  }

  cargarAnios(){
    this.apiService.aniosPresupuestoActual().subscribe(
      respuesta => {
        
        if(respuesta.length == 1){
          this.transaccion_anio_origen = respuesta[0].anio;
          this.transaccion_anio_destino = respuesta[0].anio;
        }
        this.listaAnios = respuesta;

      }, error => {
        console.log(error)
      }
    );
  }

  cargarMesesAniosAnteriorMesActual(){
    this.apiService.mesesAniosAnteriorFechaActual().subscribe(
      respuesta => {
        this.listaMesesAniosAnteriorFechaActual = respuesta;
      }, error => {
        console.log(error)
      }
    );
  }


  listar(pagina:number): void {
    this.cargando = true;
    this.paginaActual = pagina;

    var  parametros =  {
      clues_origen: this.filtro_clues_origen,
      mes_origen: this.filtro_mes_origen,
      anio_origen: this.filtro_anio_origen,
      clues_destino: this.filtro_clues_destino,
      mes_destino: this.filtro_mes_destino,
      anio_destino: this.filtro_anio_destino,
      page: this.paginaActual,
      per_page: this.resultadosPorPagina
    }
    //var parametros = JSON.stringify(parametrosObj);
    this.apiService.transferenciasLista(parametros).subscribe(
      respuesta => {
          this.cargando = false;
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
  // # SECCION: Paginación
  paginaSiguiente():void {
    this.listar(this.paginaActual+1);
  }
  paginaAnterior():void {
    this.listar(this.paginaActual-1);
  }

  // # SECCION: Realizar transaccion

  mostrarVentanaNuevaTransferencia:boolean = false;

  monto_transferir_insumos:any = null;
  monto_transferir_no_causes:any = null;
  //monto_transferir_causes:any = null;
  //monto_transferir_material_curacion:any = null;  

  transaccion_clues_origen: any = {clues:''}; //string = '';
  transaccion_clues_destino: any = {clues:''};

  transaccion_almacen_origen: string = "";
  transaccion_almacen_destino: string = "";

  transaccion_mes_origen: number = -1;
  transaccion_mes_destino: number = -1;

  transaccion_anio_origen: number = -1;
  transaccion_anio_destino: number = -1;

  datosOrigenValidos:boolean = false;
  datosDestinoValidos:boolean = false;

  conPresupuestoOrigen:boolean= true;
  conPresupuestoDestino:boolean= true;

  cargandoPresupuestoOrigen:boolean = false;  
  cargandoPresupuestoDestino:boolean = false;  

  presupuestoOrigen = {
    insumos: 0,
    no_causes: 0
    //causes: 0,
    //material_curacion: 0
  }

  presupuestoDestino = {
    insumos: 0,
    no_causes: 0
    //causes: 0,
    //material_curacion: 0
  }

  errores_transferencia = {
    insumos: '',
    no_causes: ''
    //causes: '',
    //material_curacion: ''
  }

  nuevaTransferencia(){
    this.monto_transferir_insumos = null;
    this.monto_transferir_no_causes = null;
    //this.monto_transferir_causes = null;
    //this.monto_transferir_material_curacion = null;  

    this.transaccion_clues_origen = {clues:''}; //"";
    this.transaccion_almacen_origen = "";
    this.datosOrigenValidos = false;
    this.transaccion_clues_destino = {clues:''};
    this.transaccion_almacen_destino = "";
    this.datosDestinoValidos = false;

    this.transaccion_mes_origen = -1;
    this.transaccion_mes_destino = -1;

    this.errores_transferencia = {
      insumos: '',
      no_causes: ''
      //causes: '',
      //material_curacion: ''
    }

    this.mostrarVentanaNuevaTransferencia = true;
  }


  enviando_transferencia:boolean = false;
  realizarTransferencia(){


    if(this.transaccion_clues_origen.clues == this.transaccion_clues_destino.clues && this.transaccion_anio_origen == this.transaccion_anio_destino && this.transaccion_mes_origen == this.transaccion_mes_destino && this.transaccion_almacen_origen == this.transaccion_almacen_destino){
      alert("No se puede realizar la transferencia. Los datos de origen y destino son los mismos.");
      return;
    }

    this.errores_transferencia = {
      insumos: '',
      no_causes: ''
      //causes: '',
      //material_curacion: ''
    }
    
    if(this.monto_transferir_insumos != null){
      if(isNaN(Number(this.monto_transferir_insumos))){
        this.errores_transferencia.insumos = "El monto debe ser un número válido (sólo numeros decimales sin coma).";
      }

      if(this.monto_transferir_insumos > this.presupuestoOrigen.insumos){
        console.log(this.monto_transferir_insumos + ":"+this.presupuestoOrigen.insumos);
        this.errores_transferencia.insumos = "El monto no puede ser mayor al presupuesto disponible del origen.";
      }
      
      if(this.monto_transferir_insumos < 0){
        this.errores_transferencia.insumos = "El monto no puede ser menor a 0.";      
      }
    }

    if(this.monto_transferir_no_causes != null){
      if(isNaN(Number(this.monto_transferir_no_causes))){
        this.errores_transferencia.no_causes = "El monto debe ser un número válido (sólo numeros decimales sin coma).";
      }

      if(this.monto_transferir_no_causes > this.presupuestoOrigen.no_causes){
        this.errores_transferencia.no_causes = "El monto no puede ser mayor al presupuesto disponible del origen.";
      }
      
      if(this.monto_transferir_no_causes < 0){
        this.errores_transferencia.no_causes = "El monto no puede ser menor a 0.";     
      }
    }

    /*if(this.monto_transferir_causes != null){
      if(isNaN(Number(this.monto_transferir_causes))){
        this.errores_transferencia.causes = "El monto debe ser un número válido (sólo numeros decimales sin coma).";
      }

      if(this.monto_transferir_causes > this.presupuestoOrigen.causes){
        console.log(this.monto_transferir_causes + ":"+this.presupuestoOrigen.causes);
        this.errores_transferencia.causes = "El monto no puede ser mayor al presupuesto disponible del origen.";
      }
      
      if(this.monto_transferir_causes < 0){
        this.errores_transferencia.causes = "El monto no puede ser menor a 0.";      
      }
    }

    if(this.monto_transferir_material_curacion != null){
      if(isNaN(Number(this.monto_transferir_material_curacion))){
        this.errores_transferencia.material_curacion = "El monto debe ser un número válido (sólo numeros decimales sin coma).";
      }
      
      if(this.monto_transferir_material_curacion > this.presupuestoOrigen.material_curacion){
        this.errores_transferencia.material_curacion = "El monto no puede ser mayor al presupuesto disponible del origen.";
      } 
      
      if(this.monto_transferir_material_curacion < 0){
        this.errores_transferencia.material_curacion = "El monto no puede ser menor a 0.";
      }
    }*/

    //if(this.errores_transferencia.causes != "" || this.errores_transferencia.no_causes != "" || this.errores_transferencia.material_curacion != ""){
    if(this.errores_transferencia.insumos != "" || this.errores_transferencia.no_causes != ""){
      return;
    }
    var payload = {
      clues_origen: this.transaccion_clues_origen.clues,
      clues_destino: this.transaccion_clues_destino.clues,
      almacen_origen: this.transaccion_almacen_origen,
      almacen_destino: this.transaccion_almacen_destino,
      mes_origen: this.transaccion_mes_origen,
      mes_destino: this.transaccion_mes_destino,
      anio_origen: this.transaccion_anio_origen,
      anio_destino: this.transaccion_anio_destino,
      insumos: this.monto_transferir_insumos,
      no_causes: this.monto_transferir_no_causes,
      //causes: this.monto_transferir_causes,
      //material_curacion: this.monto_transferir_material_curacion
    }

    // Quizás haya que hacer una pausa para darle tiempo refrescar a la pantalla antes de sacar el modal y borrar los mensajes de error
    var validacion_palabra = prompt("Para confirmar esta transacción, por favor escriba: TRANSFERIR");
    if(validacion_palabra == 'TRANSFERIR'){
      this.enviando_transferencia = true;
      this.apiService.transferirPresupuesto(payload).subscribe(
        respuesta => {
          //this.transaccion_clues_origen = {clues:''}; //"";
          this.datosOrigenValidos = false;
          this.listar(1);
          this.obtenerPresupuestoDestino();
          this.enviando_transferencia = false;
          // Akira: Quizás aquí deberia limpiar el filtro pa ver el registro.
        }, error =>{
          console.log(error);
          this.enviando_transferencia = false;
        }
      );
    }else{
      alert("Error al ingresar el texto para confirmar la transferencia.");
      return;
    }
  }

  obtenerPresupuestoOrigen(){
    this.datosOrigenValidos = false;
    
    if(this.listaAlmacenesOrigen.length == 0 || this.transaccion_clues_origen.clues != this.listaAlmacenesOrigen[0].clues){
      this.transaccion_almacen_origen = '';
      this.listaAlmacenesOrigen = this.transaccion_clues_origen.unidad_medica.almacenes;
    }

    if(this.transaccion_mes_origen != -1 && this.transaccion_anio_origen != -1 && this.transaccion_clues_origen.clues != '' && this.transaccion_almacen_origen != ''){      
      this.datosOrigenValidos = true;
      this.cargarPresupuestoUnidadMedica(true,false,this.transaccion_clues_origen.clues,this.transaccion_almacen_origen,this.transaccion_mes_origen,this.transaccion_anio_origen);
    }

    if(this.ligarCluesOrigenDestino && this.transaccion_clues_destino != this.transaccion_clues_origen){
      this.transaccion_clues_destino = this.transaccion_clues_origen;
      this.obtenerPresupuestoDestino();
    }
  }

  obtenerPresupuestoDestino(){
    this.datosDestinoValidos = false;
    
    if(this.listaAlmacenesDestino.length == 0 || this.transaccion_clues_destino.clues != this.listaAlmacenesDestino[0].clues){
      this.transaccion_almacen_destino = '';
      this.listaAlmacenesDestino = this.transaccion_clues_destino.unidad_medica.almacenes;
    }

    if(this.transaccion_mes_destino != -1 && this.transaccion_anio_destino != -1 && this.transaccion_clues_destino.clues != '' && this.transaccion_almacen_destino != ''){
      this.datosDestinoValidos = true;
      this.cargarPresupuestoUnidadMedica(false,true,this.transaccion_clues_destino.clues,this.transaccion_almacen_destino,this.transaccion_mes_destino,this.transaccion_anio_destino);
    }
  }

  cargarPresupuestoUnidadMedica(origen:boolean, destino:boolean, clues: string, almacen: string, mes:number, anio:number){
    if(origen){
      this.conPresupuestoOrigen = true;
      this.cargandoPresupuestoOrigen = true;
    }else if(destino){
      this.conPresupuestoDestino = true;
      this.cargandoPresupuestoDestino = true;
    }
    var payload = {
      clues: clues,
      almacen: almacen,
      mes: mes,
      anio: anio
    }
    this.apiService.presupuestoUnidadMedica(payload).subscribe(
      respuesta => {
        if(origen){
          //this.datosOrigenValidos = true;
          if(respuesta){
            this.presupuestoOrigen.insumos = Number(respuesta.insumos_disponible);
            this.presupuestoOrigen.no_causes = Number(respuesta.no_causes_disponible);
            //this.presupuestoOrigen.causes = Number(respuesta.causes_disponible);
            //this.presupuestoOrigen.material_curacion = Number(respuesta.material_curacion_disponible);
          }else{
            this.conPresupuestoOrigen = false;
            this.datosOrigenValidos = false;
          }
          this.cargandoPresupuestoOrigen = false;
        }

        if(destino){
          //this.datosDestinoValidos = true;
          if(respuesta){
            this.presupuestoDestino.insumos = Number(respuesta.insumos_disponible);
            this.presupuestoDestino.no_causes = Number(respuesta.no_causes_disponible);
            //this.presupuestoDestino.causes = Number(respuesta.causes_disponible);
            //this.presupuestoDestino.material_curacion = Number(respuesta.material_curacion_disponible);
          }else{
            this.conPresupuestoDestino = false;
            this.datosDestinoValidos = false;
          }
          this.cargandoPresupuestoDestino = false;
        }
        //this.cargandoPresupuestos = false;
      }, error => {
        console.log(error);
        this.mensajeError.mostrar = true;
        this.mensajeError.texto = "Ocurrio un error durante la petición.";
        if(origen){
          this.cargandoPresupuestoOrigen = false;
        }else if(destino){
          this.cargandoPresupuestoDestino = false;
        }
      }
    );
  }

  // # SECCION: Realizar arrastre de saldo

  mostrarVentanaArrastrarSaldos:boolean = false;
  fecha_arrastrar_saldos:any = -1;
  todas_clues_con_saldo_seleccionadas: boolean = false;
  cargando_clues_con_saldo: boolean = false;
  enviando_transferencia_saldos_mes_actual:boolean = false;

  nuevaTransferenciaArrastrarSaldos(){
    this.mostrarVentanaArrastrarSaldos = true;
  }

  seleccionarTodasCluesConSaldo(){
    this.todas_clues_con_saldo_seleccionadas = !this.todas_clues_con_saldo_seleccionadas;
    for(var i in this.listaCluesConSaldo){
      this.listaCluesConSaldo[i].seleccionada = this.todas_clues_con_saldo_seleccionadas;
    }
  }

  obtenerCluesConSaldo(){
    if(this.fecha_arrastrar_saldos == -1){
      return;
    }
    var fecha = this.fecha_arrastrar_saldos.split("/");
    if(fecha.length != 2){
      return;
    }
    var payload = {
      mes: fecha[0],
      anio: fecha[1],
      clues_con_saldo: true
    }
    this.cargando_clues_con_saldo = true;
    this.listaCluesConSaldo = [];
    this.apiService.unidadesMedicasConPresupuesto(payload).subscribe(
      respuesta => {
        this.cargando_clues_con_saldo = false;
        this.listaCluesConSaldo = respuesta;
      }, error => {
        console.log(error)
        this.cargando_clues_con_saldo = false;
      }
    );
  }

  transferirSaldosAlMesActual(){
    if(this.fecha_arrastrar_saldos == -1){
      return;
    }
    var fecha = this.fecha_arrastrar_saldos.split("/");
    if(fecha.length != 2){
      return;
    }

    var payload = {
      mes: fecha[0],
      anio: fecha[1],
      lista_clues: []
    }
    var seSelecciono1Almenos = false;
    for(var i in this.listaCluesConSaldo){
      if(this.listaCluesConSaldo[i].seleccionada){
        seSelecciono1Almenos = true;
        payload.lista_clues.push(this.listaCluesConSaldo[i].clues);
      }
    }

    if(!seSelecciono1Almenos){
      return;
    }

    // Quizás haya que hacer una pausa para darle tiempo refrescar a la pantalla antes de sacar el modal y borrar los mensajes de error
    var validacion_palabra = prompt("Para confirmar esta transacción, por favor escriba: TRANSFERIR");
    if(validacion_palabra == 'TRANSFERIR'){
      this.enviando_transferencia_saldos_mes_actual = true;
      this.apiService.transferirSaldosAlMesActual(payload).subscribe(
        respuesta => {
          this.listar(1);
          this.mostrarVentanaArrastrarSaldos = false;
          this.fecha_arrastrar_saldos = -1;
          this.todas_clues_con_saldo_seleccionadas = false;
          this.listaCluesConSaldo = [];
          this.enviando_transferencia_saldos_mes_actual = false;
        }, error =>{
          console.log(error);
          this.enviando_transferencia_saldos_mes_actual = false;
        }
      );
    } 

  }
}

