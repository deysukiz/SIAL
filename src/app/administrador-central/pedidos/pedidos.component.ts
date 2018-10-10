import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje'

import { AdministradorCentralService } from '../administrador-central.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  cargando: boolean = false;
  cargandoPresupuestos: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION
  
  // # SECCION: Filtro
  q:string = "";
  status:any[] = [];
  status_recepcion_filtro:any[] = [];
  mes_filtro:any[] = [];
  jurisdicciones:any[] = [];
  proveedores:any[] = [];

  statusSeleccionados:any[] = [];
  jurisdiccionesSeleccionadas:any[] = [];
  mesSeleccionados:any[] = [];
  proveedoresSeleccionados:any[] = [];
  statusRecepcionSeleccionados:any[] = [];

  fecha_desde:Date = null;
  fecha_hasta:Date = null;
  sin_pedidos:boolean = false;

  ordenarCauses:string = '';
  ordenarNoCauses:string = '';
  ordenarMaterialCuracion:string = '';

  // # FIN SECCION

  // # SECCION: Resumen presupuesto
  presupuesto:any = {};
  presupuestoActual:any = {};
  // # FIN SECCION

  // # SECCION: Lista
  lista: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 10;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = [];
  showPedido:boolean = false;
  datos_pedido:any = {};
  recepciones:any[] = [];
  transaccion:any[] = [];
  pedido_status:string = '';
  borrador:boolean = true;
  borrador_cancelado:boolean = true;
  cargaRecepciones:boolean = false;
  // # FIN SECCION

  verDialogoArchivos:boolean = false;
  cargandoArchivos:boolean = false;
  lista_archivos_pedido:any[] = [];
  tituloDialogoArchivos: string = '';
  datosPedido:any = {};

  constructor(private title: Title, private apiService: AdministradorCentralService) { }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Pedidos / Administrador central");
    this.listar(1);
    
    this.cargarJurisdicciones();
    this.cargarProveedores();
    this.cargarMes();

    this.status = [
      { id: 'BR', descripcion: 'Borradores'},
      { id: 'TR', descripcion: 'En Tránsito'},
      { id: 'PS', descripcion: 'Por surtir'},
      { id: 'FI', descripcion: 'Finalizados'},
      { id: 'EF', descripcion: 'En Farmacia'},
      { id: 'EX', descripcion: 'Expirados'},
      { id: 'EX-CA', descripcion: 'Cancelados'}
    ];
    
    this.status_recepcion_filtro = [
      { id: 1, descripcion: 'Con Insumos Faltantes'},
      { id: 2, descripcion: 'Sin Insumos Faltante'}
    ];
    
  }

  verInformacion(obj:any)
  {
    this.cargaRecepciones = true;
    this.datos_pedido = {}; 
    this.datos_pedido = obj;
    this.showPedido = true;
    this.borrador = true;
    this.borrador_cancelado = true;
    switch (this.datos_pedido.status) {
      case 'BR':
        this.pedido_status = 'Borrador';
        break;
      case 'FI':
        this.pedido_status = 'Finalizado';
        break;
      case 'PS':
        this.pedido_status = 'Por Surtir';
        break;
      case 'EX':
        this.pedido_status = 'Expirado';
        break;
      case 'EX-CA':
        this.pedido_status = 'Cancelado';
        break;
      case 'EF':
        this.pedido_status = 'En Farmacia';
        break;
      default:
        break;
    }

    this.apiService.verRecepciones(this.datos_pedido.pedido_id).subscribe(
      respuesta => {
          this.cargaRecepciones = false; 
          if(respuesta.recepciones)
            this.recepciones = respuesta.recepciones;
          else
            this.recepciones = [];

          if(respuesta.status != 'BR' && respuesta.status != 'EX-CA')
              this.borrador = false;
          if(respuesta.status == 'EX-CA')
          {
              this.borrador_cancelado = false;  
              //console.log(respuesta.log_pedido_cancelado);
              this.transaccion = Array(respuesta.log_pedido_cancelado);
          }
      }, error => {
        this.cargaRecepciones = false;
        this.mensajeError.mostrar = true;
        this.mensajeError.texto = "Ocurrio un error al ver la información por favor vuelva a intentarlo";
      }
    );

  } 

  regresarBorrador(id:string)
  {
    if(prompt("Para confirmar que desea regresar el pedido a borrador, ingrese PEDIDO BORRADOR ") == "PEDIDO BORRADOR")
    {
      this.cargaRecepciones = true;
      this.apiService.pedidoBorrador(id).subscribe(
        respuesta => {
          this.cargaRecepciones = false;
          this.showPedido = false;
          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.mostrar = true;
          this.mensajeExito.texto = "Se ha regresado correctamente el pedido a borrador";
          
          this.listar(1);
           
        }, error => {
          this.cargaRecepciones = false;
          this.mensajeError = new Mensaje(true);
          
          this.mensajeError.mostrar = true;
          this.mensajeError.texto = "Se ha encontrador un error al regresar a borrador el pedido, por favor vuelva a intentarlo ";
        }
      );
    }
  }

  regresarBorradorCancelador(id:string)
  {
    if(prompt("Para confirmar que desea regresar el pedido a borrador, ingrese PEDIDO BORRADOR") == "PEDIDO BORRADOR")
    {
      this.cargaRecepciones = true;
      this.apiService.pedidoBorradorCancelado(id).subscribe(
        respuesta => {
          this.cargaRecepciones = false;
          this.showPedido = false;
          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.mostrar = true;
          this.mensajeExito.texto = "Se ha regresado correctamente el pedido a borrador";
          
          this.listar(1);
           
        }, error => {
          this.cargaRecepciones = false;
          this.mensajeError = new Mensaje(true);
          this.mensajeError.mostrar = true;
          this.mensajeError.texto = "Se ha encontrador un error al regresar a borrador el pedido, por favor vuelva a intentarlo ";
          try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
              if (error.status == 500 ){
                this.mensajeError.texto = e.error;
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }
            } catch(e){
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";           
            }
          
        }
      );
    }
  }

  borrarRecepcion(id:string)
  {
    if(prompt("Para confirmar que desea borrar la recepcion, ingrese BORRAR RECEPCION") == "BORRAR RECEPCION")
    {
      this.cargaRecepciones = true;
      this.apiService.recepcionBorrador(id, 1).subscribe(
          respuesta => {
            //this.showPedido = false;
            this.mensajeExito = new Mensaje(true);
            this.mensajeExito.mostrar = true;
            this.mensajeExito.texto = "Se ha borrado correctamente la recepcion de medicamento";
            
            this.listar(1);
            this.apiService.verRecepciones(respuesta.id).subscribe(
              respuesta => {
                  this.cargaRecepciones = false;
                  this.recepciones = respuesta.recepciones;
                  this.datos_pedido.total_claves_recibidas = respuesta.total_claves_recibidas;
                  this.datos_pedido.total_cantidad_recibida = respuesta.total_cantidad_recibida;
                  this.datos_pedido.total_monto_recibido = respuesta.total_monto_recibido;
                  if(respuesta.status != 'BR')
                      this.borrador= false;
              }, error => {
                this.mensajeError = new Mensaje(true);
                  this.cargaRecepciones = false;
                  this.mensajeError.mostrar = true;
                  this.mensajeError.texto = "Ocurrio un error al cargar los datos de recepciones, por favor vuelva a intentarlo";
              }
            );
          }, error => {
            this.cargaRecepciones = false;
            this.mensajeError = new Mensaje(true);
            this.mensajeError.mostrar = true;
            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
              if (error.status == 500 ){
                this.mensajeError.texto = e.error;
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }
            } catch(e){
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";           
            }
          }
        );
    }
  }

  regresarBorrarRecepcion(id:string)
  {
    if(prompt("Para confirmar que desea regresar la recepcion, ingrese REGRESAR RECEPCION") == "REGRESAR RECEPCION")
    {
      this.cargaRecepciones = true;
      this.apiService.recepcionBorrador(id, 2).subscribe(
          respuesta => {
            this.mensajeExito = new Mensaje(true);
            this.mensajeExito.mostrar = true;
            this.mensajeExito.texto = "Se ha borrado correctamente la recepcion de medicamento";
            
            this.listar(1);
            this.apiService.verRecepciones(respuesta.id).subscribe(
              respuesta => {
                  this.cargaRecepciones = false;
                  this.recepciones = respuesta.recepciones;
                 
                  this.datos_pedido.total_claves_recibidas = respuesta.total_claves_recibidas;
                  this.datos_pedido.total_cantidad_recibida = respuesta.total_cantidad_recibida;
                  this.datos_pedido.total_monto_recibido = respuesta.total_monto_recibido;
                  if(respuesta.status != 'BR')
                    this.borrador= false;
              }, error => {
                  this.cargaRecepciones = false;
                  this.mensajeError = new Mensaje(true);
                  this.mensajeError.mostrar = true;
                  this.mensajeError.texto = "Ocurrio un error al cargar los datos de recepciones, por favor vuelva a intentarlo";
              }
            );
          }, error => {
            this.cargaRecepciones = false;
            this.mensajeError = new Mensaje(true);
            this.mensajeError.mostrar = true;
            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
              if (error.status == 500 ){
                this.mensajeError.texto = e.error;
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }
            } catch(e){
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";           
            }
          }
        );
    }
  }

  cargarJurisdicciones(){
    this.apiService.jurisdicciones().subscribe(
      respuesta => {
        this.jurisdicciones = respuesta;
      }, error => {

      }
    );
  }
  cargarProveedores(){
    this.apiService.proveedores().subscribe(
      respuesta => {
        console.log(respuesta)
        this.proveedores = respuesta;
        //console.log(this.proveedores)
      }, error => {

      }
    );
  }

  cargarMes(){
    this.apiService.mes().subscribe(
      respuesta => {
        console.log(respuesta)
        this.mes_filtro = respuesta;
        //console.log(this.proveedores)
      }, error => {

      }
    );
  }


  cambioSeleccionJurisdiccion(id){
    if (id == -1){
      this.jurisdiccionesSeleccionadas = [];
    }
    this.agregarJurisdiccion(id);
  }
  
  cambioSeleccionMes(id){
    if (id == -1){
      this.mesSeleccionados = [];
    }
    this.agregarMes(id);
  }

  cambioSeleccionStatusRecepcion(id)
  {
      if (id == -1){
        this.statusRecepcionSeleccionados = [];
      }
      this.agregarStatusRecepcion(id);
  }
  cambioSeleccionProveedor(id){
    if (id == -1){
      this.proveedoresSeleccionados = [];
    }

    this.agregarProveedor(id);
  }

  cambioSeleccionStatus(id){
    if (id == -1){
      this.statusSeleccionados = [];
    }
    this.agregarStatus(id);
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

  agregarMes(id:any){
    this.mesSeleccionados = [];
    if (id == -1){
      return;
    }
    // Si existe en el filtro no la agregamos
    for(var i in this.mesSeleccionados){
      if(this.mesSeleccionados[i].id == id){
        return;
      }
    }

    for(var i in this.mes_filtro){
      if(this.mes_filtro[i].id == id){
        this.mesSeleccionados.push(this.mes_filtro[i]);
        break;
      }
    }
    
  }
  
  agregarStatusRecepcion(id:any){
    this.statusRecepcionSeleccionados = [];
    if (id == -1){
      return;
    }
    // Si existe en el filtro no la agregamos
    for(var i in this.statusRecepcionSeleccionados){
      if(this.statusRecepcionSeleccionados[i].id == id){
        return;
      }
    }

    for(var i in this.status_recepcion_filtro){
      if(this.status_recepcion_filtro[i].id == id){
        this.statusRecepcionSeleccionados.push(this.status_recepcion_filtro[i]);
        break;
      }
    }
    
  }

  agregarStatus(id:any){
    if (id == -1){
      return;
    }
    // Si existe en el filtro no la agregamos
    for(var i in this.statusSeleccionados){
      if(this.statusSeleccionados[i].id == id){
        return;
      }
    }

    for(var i in this.status){
      if(this.status[i].id == id){
        this.statusSeleccionados.push(this.status[i]);
        break;
      }
    }
  }
  quitarProveedor(index){        
    this.proveedoresSeleccionados.splice(index,1);
  }
  quitarJurisdiccion(index){    
    this.jurisdiccionesSeleccionadas.splice(index,1);
  }
  quitarStatus(index){        
    this.statusSeleccionados.splice(index,1);
  }
  quitarMes(index){        
    this.mesSeleccionados.splice(index,1);
  }
  
  quitarStatusRecepcion(index){        
    this.statusRecepcionSeleccionados.splice(index,1);
  }
  filtrarQuery(e: KeyboardEvent) {
    if(e.keyCode == 13){
      this.listar(1);
    }
  }

  toggleCauses(){
    switch(this.ordenarCauses){
      case '': this.ordenarCauses = 'ASC'; break;
      case 'ASC': this.ordenarCauses = 'DESC'; break;
      case 'DESC': this.ordenarCauses = ''; break;
      default: this.ordenarCauses = '';
    }
    this.ordenarNoCauses = '';
    this.ordenarMaterialCuracion = '';
    this.listar(1);
  }

  toggleNoCauses(){
    switch(this.ordenarNoCauses){
      case '': this.ordenarNoCauses = 'ASC'; break;
      case 'ASC': this.ordenarNoCauses = 'DESC'; break;
      case 'DESC': this.ordenarNoCauses = ''; break;
      default: this.ordenarNoCauses = '';
    }
    this.ordenarCauses = '';
    this.ordenarMaterialCuracion = '';
    this.listar(1);
  }
  toggleMaterialCuracion(){
    switch(this.ordenarMaterialCuracion){
      case '': this.ordenarMaterialCuracion = 'ASC'; break;
      case 'ASC': this.ordenarMaterialCuracion = 'DESC'; break;
      case 'DESC': this.ordenarMaterialCuracion = ''; break;
      default: this.ordenarMaterialCuracion = '';
    }
    this.ordenarCauses = '';
    this.ordenarNoCauses = '';
    this.listar(1);
  }

  listar(pagina:number): void {
    this.cargando = true;
    this.paginaActual = pagina;

    var proveedoresIds = [];
    for(var i in this.proveedoresSeleccionados){
      proveedoresIds.push(this.proveedoresSeleccionados[i].id);
    }


    var jurisdiccionesIds = [];
    for(var i in this.jurisdiccionesSeleccionadas){
      jurisdiccionesIds.push(this.jurisdiccionesSeleccionadas[i].id);
    }

    var statusIds = [];
    for(var i in this.statusSeleccionados){
      statusIds.push(this.statusSeleccionados[i].id);
    }

    var mesesIds = [];
    for(var i in this.mesSeleccionados){
      mesesIds.push(this.mesSeleccionados[i].id);
    }
    

    var statusRecepcionIds = [];
    for(var i in this.statusRecepcionSeleccionados){
      statusRecepcionIds.push(this.statusRecepcionSeleccionados[i].id);
    }

    var  parametros =  {
      q: this.q,
      proveedores: proveedoresIds,
      jurisdicciones: jurisdiccionesIds,
      status: statusIds,
      meses: mesesIds,
      statusRecepcion: statusRecepcionIds,
      page: this.paginaActual,
      per_page: this.resultadosPorPagina,
      ordenar_causes: this.ordenarCauses,
      ordenar_no_causes: this.ordenarNoCauses,
      ordenar_material_curacion: this.ordenarMaterialCuracion,
      fecha_desde: this.fecha_desde,
      fecha_hasta: this.fecha_hasta
    }
    
    this.cargandoPresupuestos = true;
    this.apiService.presupuesto(parametros).subscribe(
      response => {
        this.cargandoPresupuestos = false;
        this.presupuesto = response.data;

        this.presupuesto.total_modificado = (+response.data.insumos_modificado) + (+response.data.no_causes_modificado);
        this.presupuesto.total_comprometido = (+response.data.insumos_comprometido) + (+response.data.no_causes_comprometido);
        this.presupuesto.total_devengado = (+response.data.insumos_devengado) + (+response.data.no_causes_devengado);
        this.presupuesto.total_disponible = (+response.data.insumos_disponible) + (+response.data.no_causes_disponible);

        this.presupuestoActual = response.presupuesto;
      },
      error => {
        this.cargandoPresupuestos = false;
        console.log(error);
      }
    );
    
    this.apiService.pedidos(parametros).subscribe(
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
  
  exportar(){

    var query = "token="+localStorage.getItem('token')+"&ordenar_causes="+this.ordenarCauses+"&ordenar_no_causes="+this.ordenarNoCauses+"&ordenar_material_curacion="+this.ordenarMaterialCuracion;
    
    if(this.q!= ""){
      query += "&q="+this.q;
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

    var lista_status = "";
    for(var i in this.statusSeleccionados){
      if(lista_status != ""){
        lista_status += ",";
      }
      lista_status += ""+this.statusSeleccionados[i].id;
    }
    if(lista_status != ""){
      query += "&status="+lista_status;
    }

    if(this.fecha_desde != null){
      query += "&fecha_desde="+this.fecha_desde;
    }
    if(this.fecha_hasta != null){
      query += "&fecha_hasta="+this.fecha_hasta;
    }
    window.open(`${environment.API_URL}/administrador-central/pedidos-excel?${query}`);
   
    
    
  }

  imprimirExcelItem(id){
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/generar-excel-pedido/${id}?${query}`);
  }

  cerrarDialogoArchivos(){
    this.verDialogoArchivos = false;
    this.cargandoArchivos = false;
    this.lista_archivos_pedido = [];
  }

  mostrarDialogoArchivos(item:any){
    this.verDialogoArchivos = true;
    this.cargandoArchivos = true;
    this.tituloDialogoArchivos = 'Folio: ' + item.folio;
    this.datosPedido = {folio:item.folio,pedido_id:item.pedido_id};
   
   
    this.apiService.verArchivosPedidoProveedor(item.pedido_id).subscribe(
      repositorio => {
        this.lista_archivos_pedido = repositorio;
        this.cargandoArchivos = false;
      },
      error => {
        this.cargandoArchivos = false;

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

  descargar(item){
    let id_pedido = item.id;
    var query = "token="+localStorage.getItem('token');
    var self = this;

    var download = window.open(`${environment.API_URL}/download-file/${id_pedido}?${query}`);
    var contador = 0;
    var timer = setInterval(function ()
    {
       contador = contador + 1;
        if (download.closed)
        {
            clearInterval(timer);
            self.mostrarDialogoArchivos(self.datosPedido);
             self.mensajeError.mostrar = false;
             self.mensajeExito.mostrar = true;
             self.mensajeExito.iniciarCuentaAtras();
            self.mensajeExito.texto = "Se ha descargado correctamente el archivo";
        }else{
          if(contador == 5)
          {
            clearInterval(timer);
            download.close();
            self.mensajeError.mostrar = true;
            self.mensajeError.iniciarCuentaAtras();
            self.mensajeError.texto = "Ocurrio un error al intentar descargar el archivo.";
          }
        }
    }, 1000);
  }

  permitirRecepcion(pedido_id,permitir){
    var validacion_palabra = prompt("Para permitir la recepcion en este pedido, por favor escriba: PERMITIR RECEPCION");
    if(validacion_palabra == 'PERMITIR RECEPCION'){
      //let pedido_id = this.datos_pedido.id;
      
      this.apiService.cambiarPermisoRecepcion(pedido_id,permitir).subscribe(
        respuesta => {
          this.datos_pedido.recepcion_permitida = permitir;
          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.mostrar = true;
          this.mensajeExito.texto = "Pedido actualizado";
        }, error => {
          this.mensajeError = new Mensaje(true);
          this.mensajeError.mostrar = true;
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
            if (error.status == 500 ){
              this.mensajeError.texto = e.error;
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
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
	  }else{
      console.log('palabra incorrecta.'+validacion_palabra);
    }
  }

  /*descargars(item){
    console.log(item);
    let id_pedido = item.id;
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/download-file/${id_pedido}?${query}`);
    
    this.apiService.descargarArchivosPedidoProveedor(id_pedido).subscribe(
      repositorio => {
          //this.mostrarDialogoArchivos(this.id_pedido, this.nombre_pedido);
      },
      error => {
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
  }*/
  // # SECCION: Paginación
  paginaSiguiente():void {
    this.listar(this.paginaActual+1);
  }
  paginaAnterior():void {
    this.listar(this.paginaActual-1);
  }

}
