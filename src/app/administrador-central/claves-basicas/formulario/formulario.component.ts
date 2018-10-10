import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';

import { ClavesBasicasService } from '../claves-basicas.service';
import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

import { Mensaje } from '../../../mensaje';
import { Lista } from '../lista';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  providers: [ ClavesBasicasService ]
})
export class FormularioComponent implements OnInit {
  
	cargando: boolean = false;  
	guardando: boolean = false;  
	esEditar:boolean = false;
	formularioTitulo:string = 'Nueva lista';

	lista: Lista;

	errores = {
		nombre: null,
		items: null
	}

	// # SECCION: Esta sección es para mostrar mensajes
	mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion:any;
	// # FIN SECCION

	// # SECCION: Modal Insumos
	mostrarModalInsumos = false;
	//Lista de claves agregadas al pedido, para checar duplicidad
	listaClaveAgregadas: Array<string> = [];
	// # FIN SECCION


	// # SECCION: Cambios de Entorno
	cambiarEntornoSuscription: Subscription;
	// # FIN SECCION

	constructor(
		private title: Title, 
		private location: Location, 
		private router: Router,
		private route: ActivatedRoute,
		private apiService: ClavesBasicasService,
		private cambiarEntornoService:CambiarEntornoService
		
	) { }

	ngOnInit() {
		this.lista = new Lista(true);

		this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
			if(this.esEditar){
				this.cargarLista();
			}
		});
		this.route.params.subscribe(params => {
			if(params['id']){
				this.lista.id = params['id'];
				this.cargarLista();			
			}else{
				this.title.setTitle('Nueva lista');        
			}
		});
	}

	cargarLista(){
		this.cargando = true;
		

		//cargar datos del pedido
		this.esEditar = true;
		this.formularioTitulo = 'Editar lista';
		this.title.setTitle('Editar lista');
	
		this.apiService.ver(this.lista.id).subscribe(
			respuesta => {
				this.cargando = false;
				console.log(respuesta);

				this.lista.nombre = respuesta.nombre;
				
				for(let i in respuesta.detalles){
					let dato = respuesta.detalles[i];
					let insumo = dato.insumo_con_descripcion;
					this.lista.items.push(insumo);
					this.listaClaveAgregadas.push(insumo.clave);
				}
				this.lista.indexar();
				this.lista.listar(1);
			},
			error => {
				this.cargando = false;
				
				this.mensajeError = new Mensaje(true);				

				try {
					let e = error.json();
					if (error.status == 401 || error.status == 403 ){
						
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
						this.router.navigate(['/administrador-central/claves-basicas/']);
					}
				
				} catch(e){
							
					if (error.status == 500 ){
						this.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}            
				}
				this.mensajeError.mostrar = true;
			}
		);
	}

	toggleModalInsumos(){
		this.mostrarModalInsumos = !this.mostrarModalInsumos
	}
	buscar(e: KeyboardEvent, input:HTMLInputElement, inputAnterior: HTMLInputElement,  parametros:any[]){	
		let term = input.value;

		// Quitamos la busqueda
		if(e.keyCode == 27){
			e.preventDefault();
			e.stopPropagation();
			input.value = "";
			inputAnterior.value = "";

			this.lista.filtro.activo = false;
			this.lista.filtro.items = [];

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
			this.lista.filtro.activo = true;
		} else {
			this.lista.filtro.activo = false;
			this.lista.filtro.items = [];
			return;
		}

		var arregloResultados:any[] = []
		for(let i in parametros){

			let termino = (parametros[i].input as HTMLInputElement).value;
			if(termino == ""){
			continue;
			}
			
			let listaFiltrada = this.lista.items.filter((item)=> {   
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
			this.lista.filtro.items = match;
		} else {
			this.lista.filtro.items = arregloResultados[0];
		}
		this.lista.filtro.indexar(false);
		this.lista.filtro.paginacion.paginaActual = 1;
		this.lista.filtro.listar(1); 
	}

	//Harima: necesitamos eliminar también de la lista de claves agregadas
	eliminarInsumo(item,index,filtro:boolean = false){
		//Harima: eliminar el elemento en la lista de claves agregadas, para poder agregarla de nuevo si se desea
		var i = this.listaClaveAgregadas.indexOf(item.clave);
		this.listaClaveAgregadas.splice(i,1);

		//Harima: si no es el filtro(busqueda), borrar de la lista principal de insumos
		if(!filtro){
			this.lista.eliminarItem(item,index);
		}else{
			this.lista.filtro.eliminarItem(item,index);
		}
	}

	agregarItem(item:any = {}){
		let auxPaginasTotales = this.lista.paginacion.totalPaginas;

		
		this.lista.items.push(item);
		this.lista.indexar();

		if(this.lista.paginacion.lista.length == this.lista.paginacion.resultadosPorPagina
			&& this.lista.paginacion.paginaActual == auxPaginasTotales
			&& !this.lista.filtro.activo){
			this.lista.listar(this.lista.paginacion.paginaActual + 1);
		} else {
			this.lista.listar(this.lista.paginacion.paginaActual);
		}	
	}


	guardar(){
		this.guardando = true;
		
		var payload = {
				nombre: this.lista.nombre,
				items: []
		}

		for(var i in this.lista.items){
			payload.items.push(this.lista.items[i].clave);
		}

		this.errores = {
			nombre: null,
			items: null
		}

		if(this.esEditar){
			
			this.apiService.editar(this.lista.id, payload).subscribe(
			respuesta => {
				this.guardando = false;
			},
			error => {
				this.guardando = false;
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
				} catch (e){
					this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
				}
				this.mensajeError.mostrar = true;
			});
		}else{
			this.apiService.crear(payload).subscribe(
			respuesta => {
				this.guardando = false;
				this.router.navigate(['/administrador-central/claves-basicas/editar/'+respuesta.id]);
			},
			error => {
				this.guardando = false;
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
				} catch (e){
					this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
				}
				this.mensajeError.mostrar = true;
							
			});
		}
	}

}
