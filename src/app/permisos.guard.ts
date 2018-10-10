import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PermisosGuard implements CanActivate {
  
  constructor(private router: Router) { }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if(!usuario.permisos){
      this.router.navigate(['/']);
      return false;
    }
    var permisos =  usuario.permisos.split("|")
    
    for(var i in permisos){
      if(next.data.key && next.data.key == permisos[i]) {
        return true;
      }
    }
    
    this.router.navigate(['/']);
    return false;
  }
}
