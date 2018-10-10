import { Paginacion } from '../../paginacion/paginacion';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

class InventarioFiltro {
    public lista:any[];
    public paginacion:Paginacion;
}
export class Inventario {
  public id:String;
  public tipo_inicializacion: string;
  public datos: FormGroup; //Harima: Agregamos los datos para el formulario y la validación
  public datosImprimir?: any; //Harima: para el modulo de ver, sin edición
  
  public lista:any[] = [];
  public lista_inventario:any[] = [];
  public lista_completa:any[] = [];
  public solo_inventario:boolean = false;
  
  public totalInsumos:number = 0;
  public totalMonto:number = 0;
  public totalMontoCauses:number = 0;
  public totalMontoNoCauses:number = 0;
  public totalMontoMaterialCuracion:number = 0;
  public paginacion:Paginacion = new Paginacion();
  public filtro: Inventario;
  //Harima: Para tener acceso al objeto que contiene la lista principal sin filtro
  padre: Inventario;
  public activo:boolean = false;
  public cargando:boolean = false;
  fb:FormBuilder;

  constructor(conFiltro:boolean = false){
    if (conFiltro){
        this.filtro = new Inventario();
        //Harima: se asigna el pedido actual como padre del filtro
        this.filtro.padre = this;

        //Harima: se crea el formulario para las validaciones
        this.fb  = new FormBuilder();
        this.datos = this.fb.group({
            almacen_id: ['',[Validators.required]],
            descripcion: ['', [Validators.required]],
            observaciones: ''
        });
    }
    this.paginacion.resultadosPorPagina = 10;
  }

  public tieneError = function(atributo:string, error:string){
    return (this.datos.get(atributo).hasError(error) && this.datos.get(atributo).touched);
  }

  public inicializarDatos = function(datos:any={}){
    let almacen_id = '';
    if(datos.almacen_id){
      almacen_id = datos.almacen_id;
    }
    this.datos.setValue({almacen_id: almacen_id, descripcion:'', observaciones:''});
  }

  //Harima: es necesario para evitar un error al enviar los datos al servidor
  public obtenerDatosGuardar = function(){
    var datos = {
      datos: this.datos.value,
      insumos: this.lista
    };
    return datos;
  }

  public actualizarTotales = function(conLote: boolean = false ){
    let inventario;
    
    //Harima: Si se llama la funcion desde el filtro, hay que actualizar los valores del padre
    if(this.padre){
      inventario = this.padre;
    }else{
      inventario = this;
    }

    inventario.totalInsumos = 0;
    inventario.totalMonto = 0;
    inventario.totalMontoCauses = 0;
    inventario.totalMontoNoCauses = 0;
    inventario.totalMontoMaterialCuracion = 0;

    let para_iva = 0;
    let iva = 0;
    var contador = 1;
    for(let i in inventario.lista){
      if(conLote){
        inventario.lista[i].lote = contador++;
      }
      inventario.totalInsumos += +inventario.lista[i].cantidad;
      if(inventario.lista[i].monto){
        inventario.totalMonto += inventario.lista[i].monto;

        if(inventario.lista[i].tipo == 'ME'){
          if(inventario.lista[i].es_causes){
            inventario.totalMontoCauses += inventario.lista[i].monto;
          }else{
            inventario.totalMontoNoCauses += inventario.lista[i].monto;
          }
        }else if(inventario.lista[i].tipo == 'MC'){
          inventario.totalMontoMaterialCuracion += inventario.lista[i].monto;
          para_iva += inventario.lista[i].monto;
        }
      }
    }
    if(para_iva > 0){
      iva = para_iva*16/100;
      inventario.totalMontoMaterialCuracion += iva;
      inventario.totalMonto += iva;
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
    var contador: number = 0;
    for(let i in this.lista){
      if(this.lista[i] === item){
        this.paginacion.lista.splice(index, 1);  
        this.lista.splice(contador, 1);  
        this.indexar();
        
        //Harima: con esto calculamos el siguiente indice, de la lista total de elementos, a agregar al final de la página
        let proximoIndice = (contador + (this.paginacion.resultadosPorPagina - index)) - 1;
        //Harima:  si ese indice existe, lo agregamos al final de la pagina
        if(this.lista[proximoIndice]){
          this.paginacion.lista.push(this.lista[proximoIndice]);
        }

        //Harima: Si la pagina quedo vacía, listamos la pagina anterior, en caso de que la página actual sea mayor a 1
        if(this.paginacion.lista.length == 0){
          if(this.paginacion.paginaActual > 1){
            this.listar(this.paginacion.paginaActual-1);
          }else{
            this.listar(1);
          }
        }

        //Harima: si el objeto padre esta inicializado, significa que se esta eliminando desde una busqueda, por tanto hay que eliminar también en el objeto padre
        if(this.padre){
          //Harima: se obtiene el indice y la pagina del item eliminado
          var indice = this.padre.lista.indexOf(item);
          var pagina = Math.ceil(indice/this.padre.paginacion.resultadosPorPagina);
          //Harima: se calcula el indice que tiene el item en la pagina en la que se encuentra
          var ajusteIndices = (pagina-1) * this.padre.paginacion.resultadosPorPagina;
          var indiceEnPagina = indice - ajusteIndices;

          //Harima: eliminamos el elemento del padre, de ser necesario cambiamos de pagina
          if(this.padre.paginacion.paginaActual == pagina){
            this.padre.eliminarItem(item,indiceEnPagina);
          }else{
            var respaldoPagina = this.padre.paginacion.paginaActual;
            this.padre.listar(pagina);
            this.padre.eliminarItem(item,indiceEnPagina);
            this.padre.listar(respaldoPagina);

            //Harima: tenemos que checar si en la pagina actual del padre aun hay elementos, de lo contrario listamos la pagina anterior, cuando sea posible
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