import { Injectable } from '@angular/core';

import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';


@Injectable()
export class ValidacionPedidosAlternosService {

	static readonly URL: string = "administrador-central/pedidos-alternos";
	constructor(private jwtRequest: JwtRequestService) { }

	/*lista(): Observable<any[]> {
		return this.jwtRequest.get(ValidacionPedidosAlternosService.URL).map((response: Response) => response.json().data) as Observable<any[]>;
	}*/

	buscar(payload:any = { q: "", page: 1, per_page: 20 }): Observable<any> {
		return this.jwtRequest.get(ValidacionPedidosAlternosService.URL, null, payload).map((response: Response) => response.json().data);
	}

	listaPaginada(payload :any = {  page: 1, per_page: 20 }): Observable<any> {
		return this.jwtRequest.get(ValidacionPedidosAlternosService.URL, null, payload).map((response: Response) => response.json().data);
	}

	ver(id: any): Observable<any> {
		return this.jwtRequest.get(ValidacionPedidosAlternosService.URL, id, {}).map((response: Response) => {

			let jsonData = response.json().data; 
			var pedido = jsonData as any;
			return pedido;
		}) as Observable<any>;
	}
	validar(id: any): Observable<any> {
			return this.jwtRequest.put(ValidacionPedidosAlternosService.URL+"/validacion", id, null).map((response: Response) => response.json().data) as Observable<any>;
	}
}