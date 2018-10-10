import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { Mensaje } from '../../mensaje';

import  * as FileSaver    from 'file-saver'; 

import { Subscription }   from 'rxjs/Subscription';

import { CambiarEntornoService } from '../../perfil/cambiar-entorno.service';

import { AdministradorProveedoresService } from '../administrador-proveedores.service';

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
  meses:any[] = [];
  jurisdicciones:any[] = [];

  statusSeleccionados:any[] = [];
  jurisdiccionesSeleccionadas:any[] = [];

  mes:number = null;
  anio:number = null;
  sin_pedidos:boolean = false;

  ordenarCauses:string = '';
  ordenarNoCauses:string = '';
  ordenarMaterialCuracion:string = '';

  // # FIN SECCION

  // # SECCION: Resumen presupuesto
  presupuesto:any = {};
  // # FIN SECCION

  // # SECCION: Para Imprimir Pedidos
  datosPedido:any = {};
  verDialogoPedido:boolean = false;
  verDialogoArchivo:boolean = false;
  tiposSubPedidos:string[] = [];
  subPedidos:any = {};
  cargandoDatosPedido:boolean = false;
  cargandoDatosArchivo:boolean = true;
  // # FIN SECCION

  // # SECCION: Lista
  lista: any[] = [];
  lista_repositorio: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 30;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = [];
  // # FIN SECCION

  // # SECCION: Reportes
  pdfworker:Worker;
  cargandoPdf:any = {};
  errorEnPDF:boolean = false;
  // # FIN SECCION
  tag:any;
  id_pedido:string;
  nombre_pedido:string;
  cargando_archivo:number = 0;
  subir_archivo:boolean = true;
    
    

  cambiarEntornoSuscription: Subscription;

  constructor(private title: Title, private apiService: AdministradorProveedoresService, private _ngZone: NgZone, private cambiarEntornoService:CambiarEntornoService) { }

  ngOnInit() {
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    
    this.title.setTitle("Pedidos / Administrador Proveedores");

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker("web-workers/farmacia/pedidos/pedido-proveedor.js")
    
    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    var self = this;    
    var $ngZone = this._ngZone;
    
    this.pdfworker.onmessage = function( evt ) {       
      // Esto es un hack porque estamos fuera de contexto dentro del worker
      // Y se usa esto para actualizar alginas variables
      $ngZone.run(() => {
          self.cargandoPdf[evt.data.tipoPedido] = false;
      });

      FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
      //open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };

    this.pdfworker.onerror = function( e ) {
      $ngZone.run(() => {
          //self.cargandoPdf = false;
          self.errorEnPDF = true;
      });
      console.log(e)
    };
    
    let fecha_actual = new Date();

    this.anio = fecha_actual.getFullYear();
    this.mes = fecha_actual.getMonth()+1;

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.listar(1);
      this.cargarJurisdicciones();
    });

    this.listar(1);

    this.cargarJurisdicciones();

    this.status = [
      { id: 'PS', descripcion: 'Por surtir'},
      { id: 'FI', descripcion: 'Surtido'},
      { id: 'EF', descripcion: 'En Farmacia'},
      { id: 'EX', descripcion: 'Expirados'},
      { id: 'EX-CA', descripcion: 'Cancelados'}
    ];

    this.meses = [
      {id:0, nombre:'Todos'},
      {id:1, nombre:'Enero'},
      {id:2, nombre:'Febrero'},
      {id:3, nombre:'Marzo'},
      {id:4, nombre:'Abril'},
      {id:5, nombre:'Mayo'},
      {id:6, nombre:'Junio'},
      {id:7, nombre:'Julio'},
      {id:8, nombre:'Agosto'},
      {id:9, nombre:'Septiembre'},
      {id:10, nombre:'Octubre'},
      {id:11, nombre:'Noviembre'},
      {id:12, nombre:'Diciembre'}
    ];
  }

  cargarJurisdicciones(){
    this.apiService.jurisdicciones().subscribe(
      respuesta => {
        this.jurisdicciones = respuesta;
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

  cambioSeleccionStatus(id){
    if (id == -1){
      this.statusSeleccionados = [];
    }
    this.agregarStatus(id);
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

  quitarJurisdiccion(index){    
    this.jurisdiccionesSeleccionadas.splice(index,1);
  }

  quitarStatus(index){        
    this.statusSeleccionados.splice(index,1);
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

    var jurisdiccionesIds = [];
    for(var i in this.jurisdiccionesSeleccionadas){
      jurisdiccionesIds.push(this.jurisdiccionesSeleccionadas[i].id);
    }

    var statusIds = [];
    for(var i in this.statusSeleccionados){
      statusIds.push(this.statusSeleccionados[i].id);
    }

    var  parametros =  {
      q: this.q,
      mes: this.mes,
      anio: this.anio,
      jurisdicciones: jurisdiccionesIds,
      status: statusIds,
      page: this.paginaActual,
      per_page: this.resultadosPorPagina,
      ordenar_causes: this.ordenarCauses,
      ordenar_no_causes: this.ordenarNoCauses,
      ordenar_material_curacion: this.ordenarMaterialCuracion
    }
    //console.log(parametros);
    this.cargandoPresupuestos = true;
    this.apiService.presupuesto(parametros).subscribe(
      response => {
        this.cargandoPresupuestos = false;
        this.presupuesto = response.data;

        this.presupuesto.total_comprometido = (+response.data.causes_comprometido) + (+response.data.no_causes_comprometido) + (+response.data.material_curacion_comprometido);
        this.presupuesto.total_devengado = (+response.data.causes_devengado) + (+response.data.no_causes_devengado) + (+response.data.material_curacion_devengado);
        
        this.presupuesto.total_causes = (+this.presupuesto.causes_comprometido) + (+this.presupuesto.causes_devengado);
        this.presupuesto.total_no_causes = (+this.presupuesto.no_causes_comprometido) + (+this.presupuesto.no_causes_devengado);
        this.presupuesto.total_material_curacion = (+this.presupuesto.material_curacion_comprometido) + (+this.presupuesto.material_curacion_devengado);
        this.presupuesto.total_pedido = (+this.presupuesto.total_comprometido) + (+this.presupuesto.total_devengado);

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
            }else{
              this.mensajeError.texto = e.error;
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

    fileChanged(e: Event) {
      var element: HTMLInputElement = e.target as HTMLInputElement;
      this.tag = element;    
    }

    upload() {
        if(this.tag)
        {
          this.subir_archivo = false;
          let img:any = this.tag.files[0];
          var formData: FormData = new FormData();
          formData.append("file", img, img.name);
          formData.append("id_pedido", this.id_pedido);
          var xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (ev: ProgressEvent) => {
              
          });
          var self = this;
          xhr.open("POST", environment.API_URL+"/repository", true);
          xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem('token'));
          var usuario = JSON.parse(localStorage.getItem("usuario"));

          if(usuario.proveedor_activo){
            xhr.setRequestHeader("X-Proveedor-Id", usuario.proveedor_activo.id);
          }

          xhr.onreadystatechange = function () {
              if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                 self.actualiza_lista();
              }

              if(xhr.readyState === XMLHttpRequest.DONE && xhr.status != 200) {
                 self.error_envio();
                 self.subir_archivo = true;        
              }
              self.cargando_archivo = xhr.readyState;
          };        
          xhr.send(formData);
        }else{
          alert("ES NECESARIO ELEGIR UN ARCHIVO A SUBIR, VUELVA A INTENTARLO POR FAVOR");
        }
    }

    actualiza_lista()
    {
      this.subir_archivo = true;
      this.cargando_archivo = 0;
      this.mostrarDialogoArchivos(this.id_pedido, this.nombre_pedido);
      this.mensajeExito.mostrar = true;
      this.mensajeExito.iniciarCuentaAtras();
      this.mensajeExito.texto = "Se ha Guardado Exitosamente el documento";
      for(var i in this.lista){
        if(this.lista[i].pedido_id == this.id_pedido){
          this.lista[i].repositorio += 1;
          break;
        }
      }
    }

    error_envio()
    {
      this.mensajeError.mostrar = true;
      this.mensajeError.texto = "Ha ocurrido un error al enviar el archivo";
    }
  
  exportar(){
    var query = "token="+localStorage.getItem('token')+"&ordenar_causes="+this.ordenarCauses+"&ordenar_no_causes="+this.ordenarNoCauses+"&ordenar_material_curacion="+this.ordenarMaterialCuracion;
    
    let usuario = JSON.parse(localStorage.getItem("usuario"));
    if(usuario.proveedor_activo){
      query += "&proveedor="+usuario.proveedor_activo.id;
    }

    if(this.q!= ""){
      query += "&q="+this.q;
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

    if(this.mes != null){
      query += "&mes="+this.mes;
    }
    if(this.anio != null){
      query += "&anio="+this.anio;
    }
    window.open(`${environment.API_URL}/pedidos-administrador-proveedores-excel?${query}`); 
  }

  mostrarDialogoPedidos(id:string){
    this.cargandoDatosPedido = true;
    this.datosPedido = {folio:id};
    this.tiposSubPedidos = [];
    this.subPedidos = {};

    this.apiService.verPedido(id).subscribe(
        pedido => {
          this.datosPedido = pedido;
          
          for(let i in pedido.insumos){
            let dato = pedido.insumos[i];
            let insumo = dato.insumos_con_descripcion;
            insumo.cantidad = +dato.cantidad_solicitada;
            insumo.monto = +dato.monto_solicitado;
            insumo.precio = +dato.precio_unitario;
            
            let tiene_iva = false;
            let clave_tipo_insumo = 'SC';
            clave_tipo_insumo = dato.tipo_insumo.clave;
            if(dato.tipo_insumo.clave == 'MC'){
              tiene_iva = true;
            }
            

            if(!this.subPedidos[clave_tipo_insumo]){
              this.tiposSubPedidos.push(clave_tipo_insumo);
              this.cargandoPdf[clave_tipo_insumo] = false;
              this.subPedidos[clave_tipo_insumo] = {
                'titulo':dato.tipo_insumo.nombre,
                'clave_folio':clave_tipo_insumo,
                'claves':0,
                'cantidad':0,
                'monto':0,
                'iva':0,
                'tiene_iva':tiene_iva,
                'lista':[]
              }
            }
            insumo.lote = this.subPedidos[clave_tipo_insumo].lista.length+1;
            this.subPedidos[clave_tipo_insumo].claves++;
            this.subPedidos[clave_tipo_insumo].cantidad += insumo.cantidad;
            this.subPedidos[clave_tipo_insumo].monto += insumo.monto;
            this.subPedidos[clave_tipo_insumo].lista.push(insumo);
          }
          pedido.insumos = undefined;

          this.cargandoDatosPedido = false;
        },
        error => {
          this.cargandoDatosPedido = false;

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


    this.verDialogoPedido = true;
  }

  mostrarDialogoArchivos(id:string, nombre:string){
    this.cargando_archivo = 0;
    this.cargandoDatosArchivo = true;
    this.datosPedido = {folio:id};
    this.nombre_pedido = nombre;
    this.id_pedido = id;
    
    this.apiService.verArchivos(id).subscribe(
        repositorio => {
        this.lista_repositorio =repositorio;
        this.cargandoDatosArchivo = false;
        },
        error => {
          this.cargandoDatosArchivo = false;

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
    this.verDialogoArchivo = true;
  }

  eliminar_archivo(id:string)
  {
    if(confirm("¿Desea eliminar el archivo realmente?"))
    {
      this.apiService.eliminarArchivos(id).subscribe(
        repositorio => {
          this.mostrarDialogoArchivos(this.id_pedido, this.nombre_pedido);
           this.mensajeExito.mostrar = true;
           this.mensajeExito.iniciarCuentaAtras();
          this.mensajeExito.texto = "Se ha Elimiinado Exitosamente el archivo";
          for(var i in this.lista){
            if(this.lista[i].pedido_id == this.id_pedido){
              this.lista[i].repositorio -= 1;
              break;
            }
          }
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
    }
  }

  descargar(id:string)
  {
    let id_pedido = id;
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
            self.mostrarDialogoArchivos(self.id_pedido, self.nombre_pedido);
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

  imprimirExcelPedido(){
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/generar-excel-pedido/${this.datosPedido.id}?${query}`); 
  }

  imprimirPedido(tipo:string = '') {
    try {
      this.cargandoPdf[tipo] = true;
      var pedidos_imprimir = {
        datos: this.datosPedido,
        insumos: this.subPedidos[tipo]
      };
      this.pdfworker.postMessage(JSON.stringify(pedidos_imprimir));
    } catch (e){
      this.cargandoPdf[tipo] = false;
      console.log(e);
    }
  }

  cerrarDialogoPedidos(){
    this.verDialogoPedido = false;
  }

  cerrarDialogoArchivos(){
    this.verDialogoArchivo = false;
  }

  // # SECCION: Paginación
  paginaSiguiente():void {
    this.listar(this.paginaActual+1);
  }
  paginaAnterior():void {
    this.listar(this.paginaActual-1);
  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }

  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }

}
