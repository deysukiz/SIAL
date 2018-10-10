import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../../jwt-request.service';


@Injectable()
export class StockService {

  static readonly URL: string = "stock";

  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }
  
  buscar(term: string, clave: string = null ): Observable<any>{
    return this.jwtRequest.get(StockService.URL,null,{q: term, clave: clave}).map( (response: Response) => response.json().data);
  }

}
