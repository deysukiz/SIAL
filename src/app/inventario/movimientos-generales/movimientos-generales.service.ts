import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class AdministradorProveedoresService {

  constructor(private http: Http,  private jwtRequest: JwtRequestService) { }

  listar(parametros): Observable<any> {
    return this.jwtRequest.get('movimientos', null, parametros).map( (response: Response) => response.json());
  }
}
