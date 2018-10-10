import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buscarModulo'
})
export class BuscarModuloPipe implements PipeTransform {

  transform(value: any, term): any {
    return value.filter((item)=> {     
      return item.titulo.toLowerCase().includes(term.toLowerCase())
    });
  }

}
