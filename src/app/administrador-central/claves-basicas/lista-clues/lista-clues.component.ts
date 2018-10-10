import { Component, OnInit, Input, Output, EventEmitter, ViewChildren } from '@angular/core';
import { ClavesBasicasService } from '../claves-basicas.service';

import { Mensaje } from '../../../mensaje';

@Component({
	selector: 'claves-basicas-lista-clues',
	templateUrl: './lista-clues.component.html',
	styleUrls: ['./lista-clues.component.css']
})
export class ListaCluesComponent implements OnInit {

	@Output() onCerrar = new EventEmitter<void>();
	@Output() onEnviar = new EventEmitter<any>();

	@Input() lista: any;

	cargando: boolean = false;
	cargandoUnidadesMedicasSinAsignar: boolean = false;
	agregandoUnidadMedica;edica: boolean = false;

	// # SECCION: Esta sección es para mostrar mensajes
	mensajeError: Mensaje = new Mensaje();
	mensajeAgregado: Mensaje = new Mensaje();
	ultimaPeticion: any;
  	// # FIN SECCION
	
	// # SECCION:Asignacion de unidades medicas
	unidadesMedicasSinAsignar: any[] = [];
	// # FIN SECCION

	// # SECCION: Lista de unidades medicas asignadas
	unidadesMedicas: any[] = [];
	paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
	paginasTotales = 0;
	indicePaginas: number[] = [];
  	// # FIN SECCION

	constructor(private apiService: ClavesBasicasService) { }

	ngOnInit() {
		this.listar(this.paginaActual);
		this.cargarUnidadesMedicasSinAsignar();
	}
	cerrar() {
		this.onCerrar.emit();
	}

	cargarUnidadesMedicasSinAsignar() {
		this.cargandoUnidadesMedicasSinAsignar = true;
		this.apiService.listaClues(this.lista.id, { sin_asignar: true }).subscribe(
			resultado => {
				this.cargandoUnidadesMedicasSinAsignar = false;
				this.unidadesMedicasSinAsignar = resultado as any[];
				console.log("Items cargados.");
			},
			error => {
				this.cargandoUnidadesMedicasSinAsignar = false;
				this.mensajeError.mostrar = true;
				this.ultimaPeticion = this.cargarUnidadesMedicasSinAsignar;
				try {
					let e = error.json();
					if (error.status == 401) {
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					}
				} catch (e) {
					console.log("No se puede interpretar el error");

					if (error.status == 500) {
						this.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				}

			}
		);
	}

	listar(pagina: number): void {
		this.paginaActual = pagina;
		console.log("Cargando items.");

		this.cargando = true;
		this.apiService.listaClues(this.lista.id, { page: pagina, per_page: this.resultadosPorPagina }).subscribe(
			resultado => {
				this.cargando = false;
				this.unidadesMedicas = resultado.data as any[];

				this.total = resultado.total | 0;
				this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

				this.indicePaginas = [];
				for (let i = 0; i < this.paginasTotales; i++) {
					this.indicePaginas.push(i + 1);
				}

				console.log("Items cargados.");

			},
			error => {
				this.cargando = false;
				this.mensajeError.mostrar = true;
				this.ultimaPeticion = this.listar;
				try {
					let e = error.json();
					if (error.status == 401) {
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					}
				} catch (e) {
					console.log("No se puede interpretar el error");

					if (error.status == 500) {
						this.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				}

			}
		);
	}

	// # SECCION: Paginación
	paginaSiguiente(): void {
		if (this.paginaActual == this.paginasTotales) {
			return;
		}

		this.listar(this.paginaActual + 1);
	}

	paginaAnterior(): void {
		if (this.paginaActual == 1) {
			return;
		}
		this.listar(this.paginaActual - 1);
	}

	// # SECCION: Acciones
	
	eliminar(item: any, index): void {
		item.cargando = true;
		this.apiService.eliminarClues(item.id).subscribe(
			respuesta => {
				this.unidadesMedicas.splice(index, 1);
				this.cargarUnidadesMedicasSinAsignar();
			}, error => {
				item.cargando = false;
				this.mensajeError.mostrar = true;

				try {
					let e = error.json();
					if (error.status == 401) {
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				} catch (e) {
					console.log("No se puede interpretar el error");

					if (error.status == 500) {
						this.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				}
			}
		)
	}

	clues: any = "-1";
	seleccionarClues(value) {
		this.clues = value;
	}

	agregar(event): void {
		event.preventDefault();

		if(this.clues == "-1"){
			return;
		}

		var payload = {};

		if (this.clues != 'TODAS'){
			payload = { claves_basicas_id: this.lista.id, clues: this.clues };
		} else {
			var lista: any[] = [];
			
			for(var i in this.unidadesMedicasSinAsignar) {				
				lista.push(this.unidadesMedicasSinAsignar[i].clues);
			}

			payload = { claves_basicas_id: this.lista.id, lista_clues: lista };
		}
		
		this.agregandoUnidadMedica = true;

		this.apiService.agregarClues(payload).subscribe(
			respuesta => {
				console.log(respuesta);
				this.clues = -1 ;
				this.agregandoUnidadMedica = false;
				this.cargarUnidadesMedicasSinAsignar();
				this.listar(1);
			}, error => {
				this.agregandoUnidadMedica = false;
				this.mensajeError.mostrar = true;

				try {
					let e = error.json();
					if (error.status == 401) {
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				} catch (e) {
					console.log("No se puede interpretar el error");

					if (error.status == 500) {
						this.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				}
			}
		);
	}
	// # FIN SECCION

}
