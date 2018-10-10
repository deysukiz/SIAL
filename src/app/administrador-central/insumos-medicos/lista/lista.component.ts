import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Headers, Http, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { InsumosMedicosService } from '../insumos-medicos.service';
import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';
import { environment } from '../../../../environments/environment';


import { Mensaje } from '../../../mensaje';

@Component({
	selector: 'app-lista',
	templateUrl: './lista.component.html',
	styleUrls: ['./lista.component.css'],
	providers: [InsumosMedicosService]
})
export class ListaComponent implements OnInit {

	cargando: boolean = false;
	mostrarModalClues: boolean = false;
	listaSeleccionada: any = null;


	// # SECCION: Esta sección es para mostrar mensajes
	mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion: any;
	// # FIN SECCION


	// # SECCION: Lista 
	lista: any[] = [];
	paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
	paginasTotales = 0;
	indicePaginas: number[] = []
	// # FIN SECCION

	// # SECCION: Resultados de búsqueda
	ultimoTerminoBuscado = "";
	terminosBusqueda = new Subject<string>();
	resultadosBusqueda: any[] = [];
	busquedaActivada: boolean = false;
	paginaActualBusqueda = 1;
	resultadosPorPaginaBusqueda = 25;
	totalBusqueda = 0;
	paginasTotalesBusqueda = 0;
	indicePaginasBusqueda: number[] = []
	// # FIN SECCION



	errores = {
		archivo: null
	}
	mostrarModalCarga: boolean = false;
	mostrarModalEditarRegistro: boolean = false;

	mensajeErrorSync: string = "";
	archivo: File = null;
	archivoSubido: boolean = false;
	enviandoDatos: boolean = false;
	progreso: number = 0;

	tabMedicamentos: boolean = false;
	tabMaterialCuracion: boolean = false;

	tabMedicamentosCorrectos: boolean = false;
	tabMedicamentosPorValidar: boolean = false;
	tabMedicamentosErrores: boolean = false;

	tabMaterialCuracionCorrectos: boolean = false;
	tabMaterialCuracionPorValidar: boolean = false;
	tabMaterialCuracionErrores: boolean = false;

	listaCargaMasiva = {
		medicamentos: { correctos: [], por_validar: [], errores: [] },
		material_curacion: { correctos: [], por_validar: [], errores: [] }
	}

	constructor(
		private title: Title,
		private apiService: InsumosMedicosService,
		private http: Http) { }

	ngOnInit() {
		this.title.setTitle("Insumos médicos / Administrador central");
		this.listar(1);
		this.mensajeError = new Mensaje();
		this.mensajeExito = new Mensaje();

		var self = this;

		var busquedaSubject = this.terminosBusqueda
			.debounceTime(300) // Esperamos 300 ms pausando eventos
			.distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
			.switchMap((term: string) => {
				console.log("Cargando búsqueda.");
				this.busquedaActivada = term != "" ? true : false;
				this.tabMedicamentos = true;
				this.ultimoTerminoBuscado = term;
				this.paginaActualBusqueda = 1;
				this.cargando = true;

				var payload =
				{
					q: term,
					tipo: this.filtro_tipo,
					causes: this.filtro_causes,
					unidosis: this.filtro_unidosis,
					descontinuado: this.filtro_descontinuado,
					atencion_medica: this.filtro_atencion_medica,
					salud_publica: this.filtro_salud_publica,
					page: this.paginaActualBusqueda,
					per_page: this.resultadosPorPaginaBusqueda
				}

				return term ? this.apiService.buscar(payload) : Observable.of<any>({ data: [] })
			}


			).catch(function handleError(error) {

				self.cargando = false;
				self.mensajeError.mostrar = true;
				self.ultimaPeticion = function () { self.listarBusqueda(self.ultimoTerminoBuscado, self.paginaActualBusqueda); };//OJO
				try {
					let e = error.json();
					if (error.status == 401) {
						self.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					}
				} catch (e) {
					console.log("No se puede interpretar el error");

					if (error.status == 500) {
						self.mensajeError.texto = "500 (Error interno del servidor)";
					} else {
						self.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
					}
				}
				// Devolvemos el subject porque si no se detiene el funcionamiento del stream 
				return busquedaSubject

			});

		busquedaSubject.subscribe(
			resultado => {
				this.cargando = false;
				this.resultadosBusqueda = resultado.data as any[];
				this.totalBusqueda = resultado.total | 0;
				this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

				this.indicePaginasBusqueda = [];
				for (let i = 0; i < this.paginasTotalesBusqueda; i++) {
					this.indicePaginasBusqueda.push(i + 1);
				}

				console.log("Búsqueda cargada.");
			}

		);

		this.cargarPresentaciones();
		this.cargarUnidadesMedida();
		this.cargarViasAdministracion();

	}

	buscar(term: string): void {
		this.terminosBusqueda.next(term);
	}

	filtro_tipo: string = "";
	filtro_causes: number = -1;
	filtro_unidosis: number = -1;
	filtro_atencion_medica: number = -1;
	filtro_salud_publica: number = -1;
	filtro_descontinuado: number = -1;
	filtro_no_disponible_pedidos: number = -1;

	listarBusqueda(term: string, pagina: number): void {
		this.paginaActualBusqueda = pagina;
		console.log("Cargando búsqueda.");

		this.cargando = true;


		var payload =
		{
			q: term,
			tipo: this.filtro_tipo,
			causes: this.filtro_causes,
			unidosis: this.filtro_unidosis,
			descontinuado: this.filtro_descontinuado,
			atencion_medica: this.filtro_atencion_medica,
			salud_publica: this.filtro_salud_publica,
			no_disponible_pedidos: this.filtro_no_disponible_pedidos,
			page: pagina,
			per_page: this.resultadosPorPaginaBusqueda
		}

		this.apiService.buscar(payload).subscribe(
			resultado => {
				this.cargando = false;

				this.resultadosBusqueda = resultado.data as any[];

				this.totalBusqueda = resultado.total | 0;
				this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

				this.indicePaginasBusqueda = [];
				for (let i = 0; i < this.paginasTotalesBusqueda; i++) {
					this.indicePaginasBusqueda.push(i + 1);
				}

				console.log("Búsqueda cargada.");

			},
			error => {
				this.cargando = false;
				this.mensajeError.mostrar = true;
				this.ultimaPeticion = function () { this.listarBusqueda(term, pagina); };
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
		this.apiService.listaPaginada(pagina, this.resultadosPorPagina).subscribe(
			resultado => {
				this.cargando = false;
				this.lista = resultado.data as any[];

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
	exportarExcel() {
		var query = "token=" + localStorage.getItem('token');
		window.open(`${environment.API_URL}/administrador-central/insumos-medicos-excel?${query}`);
	}
	eliminar(item: any, index): void {
		if (!confirm("¿Estás seguro de eliminar esta lista?, Se eliminará de todas las unidades médicas donde esté asignada.")) {
			return;
		}
		item.cargando = true;
		this.apiService.eliminar(item.id).subscribe(
			data => {
				item.cargando = false;

				if (this.busquedaActivada) {
					this.resultadosBusqueda.splice(index, 1);
				} else {
					this.lista.splice(index, 1);
				}

				this.mensajeExito = new Mensaje(true)
				this.mensajeExito.mostrar = true;
				this.mensajeExito.texto = "item eliminado";
			},
			error => {
				item.cargando = false;
				this.mensajeError.mostrar = true;
				this.ultimaPeticion = function () {
					this.eliminar(item, index);
				}

				try {
					let e = error.json();
					if (error.status == 401) {
						this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
					}
				} catch (e) {

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
		this.listar(this.paginaActual + 1);
	}
	paginaAnterior(): void {
		this.listar(this.paginaActual - 1);
	}

	paginaSiguienteBusqueda(term: string): void {
		this.listarBusqueda(term, this.paginaActualBusqueda + 1);
	}
	paginaAnteriorBusqueda(term: string): void {
		this.listarBusqueda(term, this.paginaActualBusqueda - 1);
	}


	// # SECCION: Importación

	cambiarArchivo() {
		this.errores = { archivo: null }
		this.mensajeErrorSync = "";
		this.archivo = null;
		this.archivoSubido = false;
		this.enviandoDatos = false;
		this.progreso = 0;
	}
	cerrarModalCarga() {
		this.mostrarModalCarga = false;
		this.cambiarArchivo();
	}
	fileChange(event) {
		let fileList: FileList = event.target.files;
		if (fileList.length > 0) {
			this.archivo = fileList[0];
		}
	}

	descargarFormato() {
		var query = "token=" + localStorage.getItem('token');
		window.open(`${environment.API_URL}/administrador-central/formato-insumos-medicos-excel?${query}`);
	}

	confirmando: boolean = false;
	confirmar() {
		var total_registros = this.listaCargaMasiva.medicamentos.correctos.length + this.listaCargaMasiva.medicamentos.por_validar.length + this.listaCargaMasiva.material_curacion.correctos.length + this.listaCargaMasiva.material_curacion.por_validar.length;
		var registros_ignorados = this.listaCargaMasiva.medicamentos.errores.length + this.listaCargaMasiva.material_curacion.errores.length;
		var cadena_ignorados = registros_ignorados > 0 ? ", se van a perder '" + registros_ignorados + "' registros debido a que contienen errores y no pueden ser importados" : "";

		var word = prompt("Se van a enviar '" + (total_registros) + "' registros para su importación" + cadena_ignorados + ". En caso de error, ningún registro será guardado en la base de datos, sin embargo, podrá revisar los registros e intentar de nuevo. Para continuar escriba: CONFIRMAR");

		if (word != null) {
			if (word == "CONFIRMAR") {
				// Aquí deberíamos mandar los datos
				this.confirmando = true;
				this.apiService.confirmarCargaMasivaDatos(this.listaCargaMasiva).subscribe(
					data => {

						if (data.error == true) {

							this.tabMedicamentos = this.tabMedicamentosCorrectos = this.tabMaterialCuracionCorrectos = true;
							this.tabMaterialCuracion = this.tabMaterialCuracionErrores = this.tabMedicamentosErrores = false;
							this.listaCargaMasiva.medicamentos.errores = [];
							this.listaCargaMasiva.medicamentos.correctos = [];
							this.listaCargaMasiva.medicamentos.por_validar = [];
							this.listaCargaMasiva.material_curacion.errores = [];
							this.listaCargaMasiva.material_curacion.correctos = [];
							this.listaCargaMasiva.material_curacion.por_validar = [];

							for (var i in data.medicamentos) {
								if (data.medicamentos[i].error != null) {
									this.listaCargaMasiva.medicamentos.errores.push(data.medicamentos[i]);
								} else {
									this.listaCargaMasiva.medicamentos.correctos.push(data.medicamentos[i]);
								}
							}

							for (var i in data.material_curacion) {
								if (data.material_curacion[i].error != null) {
									this.listaCargaMasiva.material_curacion.errores.push(data.material_curacion[i]);
								} else {
									this.listaCargaMasiva.material_curacion.correctos.push(data.material_curacion[i]);
								}
							}

							alert("Alguno de los registros contiene errores por favor revise.");

						} else {
							alert("¡Datos importados correctamente!.");
							this.listar(1);
							this.cerrarModalCarga();
						}
						this.confirmando = false;



					}, error => {
						this.confirmando = false;
						alert("Hubo un error en el servidor al intentar importar los datos. Intente de nuevo o llame a soporte técnico.");
						console.log(error);
					}
				)

			} else {
				alert("Palabra incorrecta.")
			}
		}


	}

	subir() {
		if (this.archivo) {
			this.listaCargaMasiva = {
				medicamentos: { correctos: [], por_validar: [], errores: [] },
				material_curacion: { correctos: [], por_validar: [], errores: [] }
			}
			this.errores = {
				archivo: null
			}
			this.mensajeErrorSync = "";
			this.archivoSubido = false;
			this.enviandoDatos = true;

			let usuario = JSON.parse(localStorage.getItem("usuario"));

			let formData: FormData = new FormData();
			formData.append('archivo', this.archivo, this.archivo.name);

			let headers = new Headers();
			headers.delete('Content-Type');
			headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
			let options = new RequestOptions({ headers: headers });
			//let options = new RequestOptions({ headers: headers });


			var responseHeaders: any;
			var contentDisposition: any;
			this.http.post(`${environment.API_URL}/administrador-central/cargar-insumos-excel/`, formData, options)
				.subscribe(
					response => {
						this.archivoSubido = true;
						this.enviandoDatos = false;
						//this.mostrarModalSubirArchivoSQL = false;
						this.progreso = 100;
						this.archivo = null;

						this.tabMedicamentos = this.tabMedicamentosCorrectos = this.tabMaterialCuracionCorrectos = true;


						this.tabMaterialCuracion = this.tabMaterialCuracionErrores = this.tabMedicamentosErrores = false;

						var data = response.json().data;


						for (var i in data.medicamentos) {
							if (data.medicamentos[i].error != null) {
								this.listaCargaMasiva.medicamentos.errores.push(data.medicamentos[i]);
							} else {
								this.listaCargaMasiva.medicamentos.correctos.push(data.medicamentos[i]);
								console.log(data.medicamentos[i]);
							}
						}

						for (var i in data.material_curacion) {
							if (data.material_curacion[i].error != null) {
								this.listaCargaMasiva.material_curacion.errores.push(data.material_curacion[i]);
							} else {
								this.listaCargaMasiva.material_curacion.correctos.push(data.material_curacion[i]);
							}
						}

					},
					error => {
						if (error.status == 409) {
							this.mensajeErrorSync = "No se pudo subir el archivo, verifica que el archivo que tratas de subir sea correcto, que el nombre no haya sido modificado. Verifica que el archivo que intentas subir ya ha sido sincronizado previamente.";
						} else if (error.status == 401) {
							this.mensajeErrorSync = "El archivo que intentas subir ya ha sido sincronizado previamente";
						} else {
							this.mensajeErrorSync = "Hubo un problema al sincronizar, prueba recargar el sitio de lo contrario llama a soporte técnico.";
						}
						this.progreso = 100;
						this.enviandoDatos = false;

					}
				);
		}
	}

	errorRegistro: string = "";
	insumo_medico: any = {};
	index_registro_seleccionado = -1;
	editando_error: boolean = false;
	editando_por_validar: boolean = false;
	editarRegistroListaMasiva(index, tipo, editarError, porValidar) {
		this.editando_por_validar = porValidar;
		if (porValidar) {
			editarError = false;
		}

		this.editando_error = editarError;
		this.mostrarModalEditarRegistro = true;
		var insumo_seleccionado;
		this.errorRegistro = "";
		this.index_registro_seleccionado = index;
		if (tipo == "MC") {

			if (editarError) {
				insumo_seleccionado = this.listaCargaMasiva.material_curacion.errores[index];
				this.errorRegistro = insumo_seleccionado.error_detectado;
			} else if (porValidar) {
				insumo_seleccionado = this.listaCargaMasiva.material_curacion.por_validar[index];
			} else {
				insumo_seleccionado = this.listaCargaMasiva.material_curacion.correctos[index];
			}



		} else {
			if (editarError) {
				insumo_seleccionado = this.listaCargaMasiva.medicamentos.errores[index];
				this.errorRegistro = insumo_seleccionado.error_detectado;
			} else if (porValidar) {
				insumo_seleccionado = this.listaCargaMasiva.medicamentos.por_validar[index];
			} else {
				insumo_seleccionado = this.listaCargaMasiva.medicamentos.correctos[index];
			}
		}

		this.insumo_medico = JSON.parse(JSON.stringify(insumo_seleccionado));

		if (this.insumo_medico.tipo == "ME") {
			var bandera_via_administracion = false;
			var bandera_presentacion = false;
			var bandera_unidad_medida = false;
			for (var i = 0; i < this.vias_administracion.length; i++) {
				if (this.vias_administracion[i].id == this.insumo_medico.medicamento.via_administracion_id) {
					bandera_via_administracion = true;
				}
			}
			for (var i = 0; i < this.presentaciones.length; i++) {
				if (this.presentaciones[i].id == this.insumo_medico.medicamento.presentacion_id) {
					bandera_presentacion = true;
				}
			}

			for (var i = 0; i < this.unidades_medida.length; i++) {
				if (this.unidades_medida[i].id == this.insumo_medico.medicamento.unidad_medida_id) {
					bandera_unidad_medida = true;
				}
			}

			if (!bandera_via_administracion) {
				this.insumo_medico.medicamento.via_administracion_id = '';
			}
			if (!bandera_presentacion) {
				this.insumo_medico.medicamento.presentacion_id = '';
			}
			if (!bandera_unidad_medida) {
				this.insumo_medico.medicamento.unidad_medida_id = '';
			}
		} else {
			var bandera_unidad_medida = false;
			for (var i = 0; i < this.unidades_medida.length; i++) {
				if (this.unidades_medida[i].id == this.insumo_medico.material_curacion.unidad_medida_id) {
					bandera_unidad_medida = true;
				}
			}
			if (!bandera_unidad_medida) {
				this.insumo_medico.material_curacion.unidad_medida_id = '';
			}
		}

	}
	aplicarCambiosRegistro() {
		var insumo_correcto = JSON.parse(JSON.stringify(this.insumo_medico));
		if (this.insumo_medico.tipo == "ME") {
			if (this.editando_error) {
				this.listaCargaMasiva.medicamentos.por_validar.push(insumo_correcto);
				this.listaCargaMasiva.medicamentos.errores.splice(this.index_registro_seleccionado, 1);
			} else if (this.editando_por_validar) {
				this.listaCargaMasiva.medicamentos.por_validar[this.index_registro_seleccionado] = insumo_correcto;
			} else {
				this.listaCargaMasiva.medicamentos.por_validar.push(insumo_correcto);
				this.listaCargaMasiva.medicamentos.correctos.splice(this.index_registro_seleccionado, 1);
			}

		} else {
			if (this.editando_error) {
				this.listaCargaMasiva.material_curacion.por_validar.push(insumo_correcto);
				this.listaCargaMasiva.material_curacion.errores.splice(this.index_registro_seleccionado, 1);
			} else if (this.editando_por_validar) {
				this.listaCargaMasiva.material_curacion.por_validar[this.index_registro_seleccionado] = insumo_correcto;
			} else {
				this.listaCargaMasiva.material_curacion.por_validar.push(insumo_correcto);
				this.listaCargaMasiva.material_curacion.correctos.splice(this.index_registro_seleccionado, 1);
			}
		}

		this.mostrarModalEditarRegistro = false;
		this.insumo_medico = null;

	}
	cerrarModalEditarRegistro() {
		this.mostrarModalEditarRegistro = false;
		this.insumo_medico = null;
	}


	presentaciones: any[] = [];
	unidades_medida: any[] = [];
	vias_administracion: any[] = [];

	cargandoPresentaciones: boolean = false;
	cargandoUnidadesMedida: boolean = false;
	cargandoViasAdministracion: boolean = false;

	cargarPresentaciones() {
		this.cargandoPresentaciones = true;

		this.apiService.presentaciones().subscribe(
			respuesta => {
				this.presentaciones = respuesta;
				this.cargandoPresentaciones = false;
			}, error => {
				this.presentaciones = [];
				this.cargandoPresentaciones = false;
			}
		)
	}

	cargarUnidadesMedida() {
		this.cargandoUnidadesMedida = true;

		this.apiService.unidadesMedida().subscribe(
			respuesta => {
				this.unidades_medida = respuesta;
				this.cargandoUnidadesMedida = false;
			}, error => {
				this.presentaciones = [];
				this.cargandoUnidadesMedida = false;
			}
		)
	}

	cargarViasAdministracion() {
		this.cargandoViasAdministracion = true;

		this.apiService.viasAdministracion().subscribe(
			respuesta => {
				this.vias_administracion = respuesta;
				this.cargandoViasAdministracion = false;
			}, error => {
				this.presentaciones = [];
				this.cargandoViasAdministracion = false;
			}
		)
	}

	seleccionarPresentacion(value) {
		this.insumo_medico.medicamento.presentacion_id = value;
	}
	seleccionarUnidadMedida(value) {
		if (this.insumo_medico.tipo == "ME") {
			this.insumo_medico.medicamento.unidad_medida_id = value;
		}

		if (this.insumo_medico.tipo == "MC") {
			this.insumo_medico.material_curacion.unidad_medida_id = value;
		}

	}
	seleccionarViaAdministracion(value) {
		this.insumo_medico.medicamento.via_administracion_id = value;
	}


	seleccionarFiltroTipo(value) {
		this.filtro_tipo = value;
	}
	seleccionarFiltroCauses(value) {
		this.filtro_causes = value;
	}
	seleccionarFiltroUnidosis(value) {
		this.filtro_unidosis = value;
	}
	seleccionarFiltroDescontinuados(value) {
		this.filtro_descontinuado = value;
	}
	seleccionarFiltroAtencionMedica(value) {
		this.filtro_atencion_medica = value;
	}
	seleccionarFiltroSaludPublica(value) {
		this.filtro_salud_publica = value;
	}
}
