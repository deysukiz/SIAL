Esta herramienta digital forma parte del catálogo de herramientas del **Banco Interamericano de Desarrollo*. Puedes conocer más sobre la iniciativa del BID en [code.iadb.org](https://code.iadb.org)*


## Cliente Web SIAL (Sistema de Información para la Administración Logística).

[![Build Status](https://travis-ci.org/EL-BID/SIAL-cliente.svg?branch=master)](https://travis-ci.org/EL-BID/SIAL-cliente)
  
### Descripción y contexto

Iniciativa Salud Mesoamérica, ME-G1001 & ME-G1004

La secretaría de salud (ISECH) a través de la Dirección de Informática, con el apoyo del Proyecto Salud Mesoamérica 2015 (SM2015), desarrolla el proyecto Sistema de Información para la Administración Logística (SIAL), cuyo objetivo es facilitar y fortalecer el control de almacenes, a nivel central y jurisdiccional.
Una de las principales funciones de la Secretaría de Salud es abastecer a las diferentes unidades médicas del estado de Chiapas de medicamentos y materiales necesarios para una atención adecuada a la población. Es por ello, que implementar herramientas para el control y distribución de los insumos médicos es una prioridad.

El desarrollo de una herramienta como el SIAL ayuda en la toma de decisiones para abastecer de medicamentos, material e insumos de laboratorio, y/o insumos de activo fijo, para atender de una manera eficaz las necesidades de las diferentes poblaciones que abarca el servicio de salud del estado de Chiapas, apoyando tanto al personal médico como administrativo.


  

---
### Guía de usuario
---
##### Manual de Usuario:
Es una guía que se proporciona para facilitar el uso de la herramienta SIAL.

  
##### Manual Técnico:
Esta guía se proporciona para facilitar el desarrollo del cliente web SIAL; después de instalar el proyecto, dependencias y paquetes, se genera de la siguiente manera:

1. Ingresar a la carpeta raíz del proyecto.
2. Abrir una consola de comandos dentro de la carpeta.
3. y ejecutar el siguiente comando:
```
npm run compodoc
```
Se creará una carpeta dentro del proyecto llamada **documentation**, dentro de la carpeta se encuentra un archivo llamado **index.html** se abre este archivo en el navegador y podrá visualizar los componentes de la herramienta SIAL, así como su código fuente con breves explicaciones de su fucnionamiento.
> documentation
> > index.html

### Guía de instalación

---

#### Requisitos de Instalación.

##### Software:

El desarrollo del Cliente web de SIAL se programó con:
- [Angular 4](https://angular.io/)
- [Bulma](https://bulma.io/)
- [Angular CLI](https://cli.angular.io/)

  
Para poder instalar y utilizar el Cliente web, deberá asegurarse que su servidor cumpla con los siguientes requisitos, se dejan los links de descarga:

  

1. [Node.js](https://nodejs.org/es/) Descargar: "Recomendado para la mayoría"

2. [Npm](https://www.npmjs.com/get-npm) es un manejador de paquetes para el proyecto de Angular 4

3. [Git](https://git-scm.com/) es un sistema de control de versiones distribuidas de [código abierto y gratuito](https://git-scm.com/about/free-and-open-source).

4. [Angular CLI](https://cli.angular.io/) Hace que sea fácil crear una aplicación que ya funciona.

5. [Google Chrome](https://www.google.com.mx/intl/es_ALL/chrome/) El navegador optimo para acceder a SIAL.

6. [Visual Studio Code](https://code.visualstudio.com/download) Es el editor de código en el que se desarrolló el cliente web SIAL, pueden usar el editor de su preferencia.

*Si algo de lo anterior mencionado no se instalara correctamente, podrá consultar la documentación oficial de cada paquete de instalación*
  

#### Instalación y Configuración:

Una ves instalado todo lo anterior, abrimos una consola en nuestro servidor para clonar el proyecto en base al [Repositorio](https://github.com/).

  

Ejecutamos el siguiente comando en nuestra consola:

```

git clone https://github.com/

```

  

Una ves clonado el proyecto, cargamos e instalamos todos los paquetes y sus dependencias, siempre y cuando estemos dentro de la carpeta del proyecto raíz y ejecutando el siguiente comando:

```

npm install

```
Una vez instaladas nuestras las dependencias con el comando anterior, inicializamos nuestro proyecto, existen 2 formas de hacerlo:

- Este comando inicializa todas las dependencias que node instalo de nuestro archivo [package.json](https://github.com/EL-BID/CLIENTE-SIAL/blob/master/package.json) y a su ves inicia el servidor del cliente web en el puerto 4200.

```
npm start
```

- O también este comando inicializa el servidor del cliente web, también en el puerto 4200.

```
ng serve
```
Si esta ocupando el puerto 4200 en otra aplicación, pueden inicializar el proyecto cambiando dicho puerto de la siguiente manera:

```
ng serve --port 9000
```
 


#### Dependencias:

Todas la dependencias que requiere SIAL para funcionar, están en el archivo [package.json](https://github.com/package.json):

El desarrollo de SIAL esta construido en 2 partes:

1.  La [API](https://github.com/) que se conecta la arquitectura de Base de Datos. (Seguir los pasos de instalación y configuración de la API).

2. El [Cliente Web](https://github.com/EL-BID/CLIENTE-SIAL) que solicita y envía datos a la API antes mencionada.


### Instrucciones para publicar en producción

- Crear el directorio en el servidor donde se va alojar:

```
mkdir mi_proyecto  && cd mi_proyecto
```
- Inicializar repositorio apuntando al proyecto cambiamos la palabra **origin** por **github** para saber de donde viene:
```
git init
git remote add -f github https://github.com/XXAI/X3-C.git
```

- Configuramos para que solo baje la carpeta de distribucion:
```
git config core.sparsecheckout true
echo dist/ >> .git/info/sparse-checkout
echo dist/assets >> .git/info/sparse-checkout
echo dist/scripts >> .git/info/sparse-checkout
echo dist/web-workers >> .git/info/sparse-checkout
```

- La configuración anterior solo es al inicio y una sola vez, a partir de aqui, solo hacemos pull y nada mas bajaremos el directorio de distribución de angular cli.
```
git pull github master
```

- La estructura interna de nuestra carpeta quedaría como sigue
```
.
+-- .git
+-- dist/
|   +-- assets/
|   |   +-- *.*
|   +-- scripts/
|   |   +-- *.*
|   +-- web-workers/
|   |   +-- *.*
|   +-- favicon.ico
|   +-- index.html
|   +-- *.*
```
  

### Cómo contribuir

  

---

Si deseas contribuir con este proyecto, por favor lee las siguientes guías que establece el [BID](https://www.iadb.org/es  "BID"):

*  [Guía para Publicar Herramientas Digitales](https://el-bid.github.io/guia-de-publicacion/  "Guía para Publicar")

*  [Guía para la Contribución de Código](https://github.com/EL-BID/Plantilla-de-repositorio/blob/master/CONTRIBUTING.md  "Guía de Contribución de Código")

  

### Código de conducta

---

Puedes ver el código de conducta para este proyecto en el siguiente archivo [CODEOFCONDUCT.md](https://github.com/EL-BID/Supervision-SISBEN-ML/blob/master/CODEOFCONDUCT.md)

  

### Autor/es

  

---
* **[Deysi Helen Ortega Román](https://github.com/deysukiz "Github")** - [Email](mailto:deysukiz@gmail.com "Correo electrónico")
* **[Ramiro Gabriel Alférez Chavez](mailto:ramiro.alferez@gmail.com "Correo electrónico")**
* **[Eliecer Ramirez Esquinca](https://github.com/checherman "Github")**
* **[Joram Roblero Pérez](https://github.com/joramdeveloper  "Github")**


    

### Licencia
---


La Documentación de Soporte y Uso del software se encuentra licenciada bajo Creative Commons IGO 3.0 Atribución-NoComercial-SinObraDerivada (CC-IGO 3.0 BY-NC-ND).

El código de este repo usa la [ Licencia AM-331-A3](LICENSE.md).

  

## Limitación de responsabilidades

  

El BID no será responsable, bajo circunstancia alguna, de daño ni indemnización, moral o patrimonial; directo o indirecto; accesorio o especial; o por vía de consecuencia, previsto o imprevisto, que pudiese surgir:

I. Bajo cualquier teoría de responsabilidad, ya sea por contrato, infracción de derechos de propiedad intelectual, negligencia o bajo cualquier otra teoría; y/o

II. A raíz del uso de la Herramienta Digital, incluyendo, pero sin limitación de potenciales defectos en la Herramienta Digital, o la pérdida o inexactitud de los datos de cualquier tipo. Lo anterior incluye los gastos o daños asociados a fallas de comunicación y/o fallas de funcionamiento de computadoras, vinculados con la utilización de la Herramienta Digital.
