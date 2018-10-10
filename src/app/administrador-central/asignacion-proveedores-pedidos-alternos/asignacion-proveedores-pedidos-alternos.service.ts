import { Injectable } from '@angular/core';

import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';


@Injectable()
export class AsignacionProveedoresPedidosAlternosService {

	static readonly URL: string = "administrador-central/pedidos-alternos";
	constructor(private jwtRequest: JwtRequestService) { }

	buscar(payload:any = { q: "", page: 1, per_page: 20 }): Observable<any> {
		return this.jwtRequest.get(AsignacionProveedoresPedidosAlternosService.URL, null, payload).map((response: Response) => response.json().data);
	}

	listaPaginada(payload :any = {  page: 1, per_page: 20 }): Observable<any> {
		return this.jwtRequest.get(AsignacionProveedoresPedidosAlternosService.URL, null, payload).map((response: Response) => response.json().data);
	}

	ver(id: any): Observable<any> {
		return this.jwtRequest.get(AsignacionProveedoresPedidosAlternosService.URL, id, {}).map((response: Response) => {

			let jsonData = response.json().data; 
			var pedido = jsonData as any;
			return pedido;
		}) as Observable<any>;
	}
	asignar(id: any, data: any): Observable<any> {
			return this.jwtRequest.put(AsignacionProveedoresPedidosAlternosService.URL+"/proveedor", id, {data}).map((response: Response) => response.json().data) as Observable<any>;
	}

	proveedores(): Observable<any> {
		return this.jwtRequest.get("proveedor", null, { alterno: 1 }).map((response: Response) => response.json().data);
	}

	firmantes(): Observable<any> {
		return this.jwtRequest.get("personal-puesto", null, { clues: 'CSSSA017213', firmas: 1 }).map((response: Response) => response.json().data);
	}
}