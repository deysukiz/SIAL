import { Paginacion } from '../../paginacion/paginacion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

class PedidoFiltro {
    public lista: any[];
    public paginacion: Paginacion;
}
export class Pedido {
  public id: String;
  public status: string;
  public recepcionPermitida: boolean;
  public tipo_pedido: string;
  public datos: FormGroup; // Harima: Agregamos los datos para el formulario y la validación
  public datosImprimir?: any;
  // public nombre:String;
  // public observaciones:string;
  public lista: any[] = [];
  public totalInsumos: number = 0;
  public totalMonto: number = 0;
  public totalMontoCauses:number = 0;
  public totalMontoNoCauses:number = 0;
  public totalMontoMaterialCuracion:number = 0;
  public paginacion:Paginacion = new Paginacion();
  public filtro: Pedido;
  // Harima: Para tener acceso al objeto que contiene la lista principal sin filtro
  padre: Pedido;
  public activo:boolean = false;
  public cargando:boolean = false;
  fb: FormBuilder;

  constructor(conFiltro:boolean = false) {
    if (conFiltro) {
        this.filtro = new Pedido();
        // Harima: se asigna el pedido actual como padre del filtro
        this.filtro.padre = this;

        // Harima: se crea el formulario para las validaciones
        this.fb  = new FormBuilder();
        this.datos = this.fb.group({
          fecha_movimiento: ['', [Validators.required]],
          almacen_proveedor: [''],
          programa_id: ['', [Validators.required]],
          proveedor_id: ['', [Validators.required]],
          clues_destino: ['', [Validators.required]],
          almacen_destino: ['', [Validators.required]],
          observaciones: ''
        });
        // Harima: Al crear el objeto, se crea como borrador
        this.status = 'BR';
        this.recepcionPermitida = false;
    }
    this.paginacion.resultadosPorPagina = 10;
  }

  public tieneError = function(atributo:string, error:string){
    return (this.datos.get(atributo).hasError(error));
  }

  public inicializarDatos = function(datos:any={}){
    let today = datos.fecha;
    let almacen_proveedor = '';

    if (!datos.fecha) {
      // Harima:obtenemos la fecha actual
      let now = new Date();
      let day = ('0' + now.getDate()).slice(-2);
      let month = ('0' + (now.getMonth() + 1)).slice(-2);
      today = now.getFullYear() + '-' + (month) + '-' + (day);
    }

    
    if(datos.almacen_proveedor){
      almacen_proveedor = datos.almacen_proveedor;
    }

    this.datos.setValue(
      {
        almacen_proveedor: almacen_proveedor,
        almacen_destino: '',
        clues_destino: '',
        fecha_movimiento: today,
        observaciones: '',
        programa_id: '',
        proveedor_id: ''
      });
  }

  // Harima: es necesario para evitar un error al enviar los datos al servidor
  public obtenerDatosGuardar = function(){
    let datos = {
      datos: this.datos.value,
      insumos: this.lista
    };
    return datos;
  }

  public actualizarTotales = function(conLote: boolean = false ){
    let pedido;
    
    // Harima: Si se llama la funcion desde el filtro, hay que actualizar los valores del padre
    if(this.padre){
      pedido = this.padre;
    }else{
      pedido = this;
    }

    pedido.totalInsumos = 0;
    pedido.totalMonto = 0;
    pedido.totalMontoCauses = 0;
    pedido.totalMontoNoCauses = 0;
    pedido.totalMontoMaterialCuracion = 0;

    let para_iva = 0;
    let iva = 0;
    let contador = 1;
    for(let i in pedido.lista){
      if(conLote){
        pedido.lista[i].lote = contador++;
      }
      pedido.totalInsumos += +pedido.lista[i].cantidad;
      if(pedido.lista[i].monto){
        pedido.totalMonto += pedido.lista[i].monto;

        if(pedido.lista[i].tipo == 'ME'){
          if(pedido.lista[i].es_causes){
            pedido.totalMontoCauses += pedido.lista[i].monto;
          }else{
            pedido.totalMontoNoCauses += pedido.lista[i].monto;
          }
        }else if(pedido.lista[i].tipo == 'MC'){
          pedido.totalMontoMaterialCuracion += pedido.lista[i].monto;
          para_iva += pedido.lista[i].monto;
        }
      }
    }
    if(para_iva > 0){
      iva = para_iva*16/100;
      pedido.totalMontoMaterialCuracion += iva;
      pedido.totalMonto += iva;
    }
  }

  public indexar = function(conLote: boolean = true ){
    if(conLote){
      this.actualizarTotales(conLote);
    }
    
    this.paginacion.totalPaginas = Math.ceil(this.lista.length / this.paginacion.resultadosPorPagina);

    this.paginacion.indice = [];
    for(let i=0; i< this.paginacion.totalPaginas; i++){
      this.paginacion.indice.push(i+1);
    }
  }

  public listar = function(pagina: number = 1){
    this.paginacion.paginaActual = pagina; 
    let inicio = (this.paginacion.paginaActual - 1) * this.paginacion.resultadosPorPagina;
    let fin = inicio + this.paginacion.resultadosPorPagina;
    try {
      this.paginacion.lista = this.lista.slice(inicio,fin);
    } catch(e){
      this.paginacion.lista = [];
    }    
  }
  public paginaSiguiente():void {
    if (this.paginacion.paginaActual == this.paginacion.totalPaginas){
        return;
    }
    this.listar(this.paginacion.paginaActual+1);
  }
  public paginaAnterior():void {
    if (this.paginacion.paginaActual == 1){
        return;
    }
    this.listar(this.paginacion.paginaActual-1);
  }
  
  public  eliminarItem = function (item:any, index:number){
    let contador: number = 0;
    for(let i in this.lista){
      if(this.lista[i] === item){
        this.paginacion.lista.splice(index, 1);  
        this.lista.splice(contador, 1);  
        this.indexar();
        
        // Harima: con esto calculamos el siguiente indice, de la lista total de elementos, a agregar al final de la página
        let proximoIndice = (contador + (this.paginacion.resultadosPorPagina - index)) - 1;
        // Harima:  si ese indice existe, lo agregamos al final de la pagina
        if(this.lista[proximoIndice]){
          this.paginacion.lista.push(this.lista[proximoIndice]);
        }

        // Harima: Si la pagina quedo vacía, listamos la pagina anterior, en caso de que la página actual sea mayor a 1
        if(this.paginacion.lista.length == 0){
          if(this.paginacion.paginaActual > 1){
            this.listar(this.paginacion.paginaActual-1);
          }else{
            this.listar(1);
          }
        }

        // Harima: si el objeto padre esta inicializado, significa que se esta eliminando desde una busqueda, por tanto hay que eliminar también en el objeto padre
        if(this.padre){
          // Harima: se obtiene el indice y la pagina del item eliminado
          let indice = this.padre.lista.indexOf(item);
          let pagina = Math.ceil(indice/this.padre.paginacion.resultadosPorPagina);
          // Harima: se calcula el indice que tiene el item en la pagina en la que se encuentra
          let ajusteIndices = (pagina-1) * this.padre.paginacion.resultadosPorPagina;
          let indiceEnPagina = indice - ajusteIndices;

          // Harima: eliminamos el elemento del padre, de ser necesario cambiamos de pagina
          if(this.padre.paginacion.paginaActual == pagina){
            this.padre.eliminarItem(item,indiceEnPagina);
          }else{
            let respaldoPagina = this.padre.paginacion.paginaActual;
            this.padre.listar(pagina);
            this.padre.eliminarItem(item,indiceEnPagina);
            this.padre.listar(respaldoPagina);

            // Harima: tenemos que checar si en la pagina actual del padre aun hay elementos, de lo contrario listamos la pagina anterior, cuando sea posible
            if(this.padre.paginacion.lista.length == 0){
              if(this.padre.paginacion.paginaActual > 1){
                this.padre.listar(this.padre.paginacion.paginaActual-1);
              }else{
                this.padre.listar(1);
              }
            }
          }
        }
        return;
      }
      contador++;
    }
  }
}