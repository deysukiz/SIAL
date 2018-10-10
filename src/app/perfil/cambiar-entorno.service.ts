import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class CambiarEntornoService {

  cambiarEntornoSource = new Subject<boolean>();

    entornoCambiado$ = this.cambiarEntornoSource.asObservable();
    
    cambiarEntorno() {
      console.log("Cambiaste de entorno");
      this.cambiarEntornoSource.next(true);
    }

}
