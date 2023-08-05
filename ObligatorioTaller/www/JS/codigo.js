// constantes de ruteo para la navegacion
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");
// Constantes para las URL de la API
const API_BASE_URL = "https://censo.develotion.com/";
const API_LOGIN_ENDPOINT = API_BASE_URL + "login.php";
const API_USUARIOS_ENDPOINT = API_BASE_URL + "usuarios.php";
const API_PERSONAS_ENDPOINT = API_BASE_URL + "personas.php";
const API_DEPARTAMENTOS_ENDPOINT = API_BASE_URL + "departamentos.php";
const API_CIUDADES_ENDPOINT = API_BASE_URL + "ciudades.php";
const API_OCUPACIONES_ENDPOINT = API_BASE_URL + "ocupaciones.php";

// Variable para almacenar el token del usuario
let token;
let idUsuario;
let cacheOcupaciones = [];
let cachePersonas = [];

if(localStorage.getItem("hayUsuarioLogueado") === null) {
localStorage.setItem("hayUsuarioLogueado", "false")
}
let hayUsuarioLogueado = localStorage.getItem("hayUsuarioLogueado");
//localStorage.clear();
autoLogin();
function autoLogin(){
    //validamos que el token no sea nulo
    if(localStorage.getItem("token") != null){
        //si existe token y el usuario esta logueado mostramos su interfaz sino inicializamos
    if(localStorage.getItem("token") != "" && hayUsuarioLogueado === "true" ){
        Inicio(false);
    }else{
    inicializar();
    }
    }else{
        alert("El tiempo de sesión ha expirado. Por favor vuelva a loguearse");
        inicializar();
    }
}
function inicializar() {
    Inicio(true);
    AgregarEventos();
}

function Registro() {
    let nombreUsuario = document.querySelector("#usuario").value;
    let password = document.querySelector("#passRegistro").value;
    document.querySelector("#errorMessageRegistro").innerHTML = "";
    try {
        if (nombreUsuario.trim().length === 0) {
            throw new Error("El nombre de usuario es requerido");
        }
        if (password.trim().length === 0) {
            throw new Error("La password es requerida");
        }

        // Hacer la llamada a la API para el registro
        fetch(API_USUARIOS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "usuario": nombreUsuario,
                "password": password
            })
        })
            .then((response) => {
                if (response.ok) {
                    // si la respuesta es exitosa covertimos la misma a json
                    return response.json();
                } else if (response.status === 409) {
                    return response.json().then((data) => {
                        document.querySelector("#errorMessageRegistro").innerHTML = data.mensaje;
                        LimpiarCampos();
                        return Promise.reject(data);
                    });
                } else {
                    return Promise.reject(response);
                }
            })
            .then((data) => {
                // Si llegamos aquí, no hubo errores en el servidor y se obtuvo la respuesta correctamente
                document.querySelector("#errorMessageRegistro").innerHTML = "Registro exitoso";
                // Si el registro fue exitoso, obtener el token del usuario
                token = data.apiKey;
                idUsuario = data.id;
                // Guardar el token y el estado de sesión en el localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("idUsuario", idUsuario);
                localStorage.setItem("hayUsuarioLogueado", "true");
                // Mostrar la sección de usuario logueado
                Inicio(false);
                // Ocultar los botones de inicio de sesión y registro
                OcultarBotones(false);
            })
            .catch(handleApiError) // Utilizar la función para manejar errores de la API
            .then((data) => {
                // Si hay error en la respuesta de la API, mostrar el mensaje de error
                if (data !== undefined) {
                    document.querySelector("#errorMessageRegistro").innerHTML = data.error;
                }
            });
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("#errorMessageRegistro").innerHTML = error.message;
    }
}
// Función para iniciar sesión
function IniciarSesion() {
    let nombreUsuario = document.querySelector("#nombreUsuario").value;
    let password = document.querySelector("#password").value;
    document.querySelector("#errorMessage").innerHTML = "";

    try {
        if (nombreUsuario.trim().length === 0 || password.trim().length === 0) {
            throw new Error("Los datos no son correctos");
        }

        // Hacer la llamada a la API para el login
        fetch(API_LOGIN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "usuario": nombreUsuario,
                "password": password
            })
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.json().then((data) => {
                        // Mostrar mensaje de usuario ya registrado
                        document.querySelector("#errorMessage").innerHTML = data.mensaje;
                        LimpiarCampos();
                        return Promise.reject(data);
                    });
                } else {
                    return Promise.reject(response);
                }
            })

            .then((data) => {
                // Si el login fue exitoso, se obtiene el token del usuario
                token = data.apiKey;
                idUsuario = data.id;
                // Se guarda el token y el estado de sesión en el localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("idUsuario", idUsuario);
                localStorage.setItem("hayUsuarioLogueado", "true");
                // Mostrar la sección de usuario logueado
                Inicio(false);
                // Ocultar los botones de inicio de sesión y registro
                OcultarBotones(false);
            })
            .catch(handleApiError) // Utilizar la función para manejar errores de la API
            .then((data) => {
                // Si hay error en la respuesta de la API, mostrar el mensaje de error
                if (data !== undefined) {
                    document.querySelector("#errorMessage").innerHTML = data.error;
                }
            });
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("#errorMessage").innerHTML = error.message;
    }
}

// Función para cerrar sesión
function CerrarSesion() {
    // Limpiar el token y el estado de sesión del localStorage
    localStorage.setItem("token", "");
    localStorage.setItem("hayUsuarioLogueado", "false");
    // Mostrar la sección de inicio de sesión
    Inicio(true);
    // Limpiar los campos de usuario y contraseña
    LimpiarCampos();
}
// Función para agregar una nueva persona
function AgregarPersona() {
    let nombrePersona = document.querySelector("#nombrePersona").value;
    let departamento = document.querySelector("#departamento").value;
    let ciudad = document.querySelector("#ciudad").value;
    let fechaNacimiento = document.querySelector("#fechaNacimiento").value;
    let ocupacion = document.querySelector("#ocupacion").value;
    document.querySelector("#errorMessagePersona").innerHTML = "";

    try {
        if (nombrePersona.trim().length === 0) {
            throw new Error("El nombre de la persona es requerido");
        }
        if (departamento.trim().length === 0 || ciudad.trim().length === 0 || fechaNacimiento.trim().length === 0 || ocupacion.trim().length === 0) {
            throw new Error("Por favor, complete todos los campos");
        }

        // Hacer la llamada a la API para agregar una nueva persona
        fetch(API_PERSONAS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "apikey": localStorage.getItem("token"),
                "iduser": localStorage.getItem("idUsuario"),

            },
            body: JSON.stringify({
                "idUsuario": localStorage.getItem("idUsuario"),
                "nombre": nombrePersona,
                "departamento": parseInt(departamento),
                "ciudad": parseInt(ciudad),
                "fechaNacimiento": fechaNacimiento,
                "ocupacion": parseInt(ocupacion)
            })
        })
            .then((response) => {
                if (response.ok) {
                    // Mostrar mensaje de registro exitoso
                    document.querySelector("#errorMessagePersona").innerHTML = "Persona agregada exitosamente";
                    obtenerListadoPersonas() //revisar si es necesario en ionic
                    LimpiarCamposPersona();
                } else if(response.status === 401){
                    alert("El tiempo de sesión ha expirado. Por favor vuelva a loguearse");
                    inicializar();
                } else {
                    return Promise.reject(response);
                }
            })
            .then(() => {
                // Luego de mostrar el mensaje de éxito, actualizamos la lista de ocupaciones nuevamente
                cargarOcupaciones();
            })
            .catch(handleApiError); // Utilizar la función para manejar errores de la API
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("#errorMessagePersona").innerHTML = error.message;
    }
}
// Función para cargar los departamentos en el select
function cargarDepartamentos() {
    fetch(API_DEPARTAMENTOS_ENDPOINT, {
        headers: {
            "Content-Type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario"),
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener los departamentos");
            }
            return response.json();
        })
        .then((data) => {
            const departamentos = data.departamentos;
            const departamentoSelect = document.querySelector("#departamento");
            departamentoSelect.innerHTML =
            "<ion-select-option value='' selected disabled>Seleccione un departamento</ion-slect-option>";
            departamentos.forEach((departamento) => {
                departamentoSelect.innerHTML += `<ion-select-option value="${departamento.id}">${departamento.nombre}</ion-select-option>`;
            });

            // Asociar evento de cambio al select de departamentos
            departamentoSelect.addEventListener("ionChange", (event) => {
                const selectedDepartamento = event.detail.value;
                cargarCiudadesPorDepartamento(selectedDepartamento);
            });
        })
        .catch(handleApiError);
}
//Revisar si está ok
// Asignar evento al botón de "Agregar Persona"
document.querySelector("#btnEnviarDatosPersona").addEventListener("click", AgregarPersona);

// Llamar a la función cargarDepartamentos al cargar la página "agregarPersona"
document.addEventListener("ionViewWillEnter", () => {
    cargarDepartamentos();
});

function cargarCiudadesPorDepartamento(idDepartamento) {
    fetch(API_CIUDADES_ENDPOINT + "?idDepartamento=" + idDepartamento, {
        headers: {
            "Content-Type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario")
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener las ciudades");
            }
            return response.json();
        })
        .then(data => {
            const ciudades = data.ciudades;
            const ciudadSelect = document.querySelector("#ciudad");
            ciudadSelect.innerHTML = "<ion-select-option value='' selected disabled>Seleccione una ciudad</ion-select-option>";
            ciudades.forEach(ciudad => {
                ciudadSelect.innerHTML += `<ion-select-option value="${ciudad.id}">${ciudad.nombre}</ion-select-option>`;
            });
        })
        .catch(error => {
            console.error("Error en fetch:", error);
            document.querySelector("#errorMessagePersona").innerHTML = "Error al obtener las ciudades";
        });
}

// Función para cargar las ocupaciones en el select
function cargarOcupaciones() {
    // Intentamos recuperar cacheOcupaciones del Local Storage
    const cachedData = localStorage.getItem("cacheOcupaciones");
    if (cachedData) {
        cacheOcupaciones = JSON.parse(cachedData);
        cargarSelectOcupaciones();
        //ver de cortar el flujo por acá
    }
    fetch(API_OCUPACIONES_ENDPOINT, {
        headers: {
            "Content-Type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario"),
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener las ocupaciones");
            }
            return response.json();
        })
        .then((data) => {
            cacheOcupaciones = data;
            // Guardamos cacheOcupaciones en el Local Storage
            localStorage.setItem("cacheOcupaciones", JSON.stringify(cacheOcupaciones));

            cargarSelectOcupaciones();
            const ocupacionSelect = document.querySelector("#ocupacion");
            ocupacionSelect.innerHTML =
                "<ion-select-option value='' selected disabled>Seleccione una ocupación</ion-select-option>";
            data.ocupaciones.forEach((ocupacion) => {
                ocupacionSelect.innerHTML += `<ion-select-option value="${ocupacion.id}">${ocupacion.ocupacion}</ion-select-option>`;
            });
        })
        .catch(handleApiError);
}
function obtenerListadoPersonas() {
    fetch(API_PERSONAS_ENDPOINT + "?idUsuario=" + localStorage.getItem("idUsuario"), {
        headers: {
            "Content-Type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario"),
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener el listado de personas");
            }
            return response.json();
        })
        .then((data) => {
            // Guardamos cachePersonas en el Local Storage para futuras referencias
            localStorage.setItem("cachePersonas", JSON.stringify(data.personas));
            // Llamamos a la función para filtrar y mostrar la tabla
            filtrarPersonasPorOcupacion();
        })
        .catch(handleApiError);
}

function eliminarPersona(idPersona) {
    fetch(API_PERSONAS_ENDPOINT + "?idCenso=" + idPersona, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario"),
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Convertimos la respuesta a JSON

            } else if(response.status === 401){
                alert("El tiempo de sesión ha expirado. Por favor vuelva a loguearse");
                inicializar();
            }
            else {
                throw new Error("Error al eliminar la persona");
            }
        })
        //revisar este segundo then
        .then((data) => {
            // Verificamos si la respuesta contiene el mensaje de éxito
            if (data.mensaje) {obtenerListadoPersonas(); // Actualizamos la lista de personas
            } else {
                document.querySelector("#errorMessagePersona").innerHTML = data.mensaje;
                throw new Error("Error al eliminar la persona");
            }
        })
        .catch(handleApiError); // Utilizar la función para manejar errores de la API
}
function filtrarPersonasPorOcupacion() {
    const ocupacionSelect = document.querySelector("#selectOcupacion");
    const filtroOcupacionId = ocupacionSelect.value;

    const tablaInicioBody = document.querySelector("#tablaInicioBody");
    tablaInicioBody.innerHTML = ""; // Limpiamos la tabla antes de agregar los datos

    // Obtenemos los datos del cache del Local Storage
    const cachePersonas = JSON.parse(localStorage.getItem("cachePersonas"));

    if (!cachePersonas) {
        // Si no hay datos en el cache, volvemos a cargar desde la API
        obtenerListadoPersonas();
        return;
    }
//Acá hubo que hacer algunos cambios (se usa la cache), revisar si funciona mal
    if (filtroOcupacionId === "") {
        // Si no hay selección en el filtro, mostramos la tabla completa
        cachePersonas.forEach((persona) => {
            tablaInicioBody.innerHTML +=
            `
            <ion-row style="border-bottom: groove;">
                        <ion-col >
                          <ion-label >${persona.nombre}</ion-label>
                        </ion-col>
                        <ion-col >
                          <ion-label >${persona.fechaNacimiento}</ion-label>
                        </ion-col>
                        <ion-col >
                          <ion-label >${persona.ocupacion}</ion-label>
                        </ion-col>
                        <ion-col >
                        <ion-item><button onclick="eliminarPersona(${persona.id})" ><ion-icon name="person-remove" slot="start"></ion-icon>Eliminar</button></ion-item>
                        </ion-col>
            </ion-row>
            
                
            `
            ;
        });
    } else {
        // Si hay selección en el filtro, mostramos solo las personas con la ocupación seleccionada desde el cache
        const personasFiltradas = cachePersonas.filter(
            (persona) => persona.ocupacion === parseInt(filtroOcupacionId)
        );
        personasFiltradas.forEach((persona) => {
            tablaInicioBody.innerHTML +=
            `
            <ion-row style="border-bottom: groove;">
                        <ion-col>
                          <ion-label >${persona.nombre}</ion-label>
                        </ion-col>
                        <ion-col>
                          <ion-label >${persona.fechaNacimiento}</ion-label>
                        </ion-col>
                        <ion-col>
                          <ion-label >${persona.ocupacion}</ion-label>
                        </ion-col>
                        <ion-col>
                        <ion-item><button onclick="eliminarPersona(${persona.id})" ><ion-icon name="person-remove" slot="start"></ion-icon>Eliminar</button></ion-item>
                        </ion-col>
            </ion-row>
            
            `
            ;
        });
    }

    // Asignamos el evento de cambio al select de ocupaciones para actualizar la tabla al cambiar la selección
    ocupacionSelect.addEventListener("ionChange", () => {
        filtrarPersonasPorOcupacion();
    });
}

function cargarSelectOcupaciones() {
    const ocupacionSelect = document.querySelector("#selectOcupacion");
    ocupacionSelect.innerHTML = "<ion-select-option value=''>Todas las ocupaciones</ion-select-option>";

    // Recuperamos los datos del Local Storage y verificamos si hay ocupaciones guardadas
    const cachedData = localStorage.getItem("cacheOcupaciones");
    const cacheOcupaciones = cachedData ? JSON.parse(cachedData) : { ocupaciones: [] };

    // Agregamos las opciones de ocupaciones al select
    cacheOcupaciones.ocupaciones.forEach((ocupacion) => {
        ocupacionSelect.innerHTML += `<ion-select-option value="${ocupacion.id}">${ocupacion.ocupacion}</ion-select-option>`;
    });

    // Asignar el evento para filtrar al cambiar la ocupación seleccionada
    ocupacionSelect.addEventListener("ionChange", function () {
    });
}


//CORREGIR, existe un endpint en el API que ya te calcula el total. Luego solo hay que filtrar montevideo e interior.
//Está bien así. Se revisó el endpoint totalCensados.php y solo devuelve el total de censados para TODA la API, no hay forma de discernir entre usuarios y menos por departamento o ciudad.
function mostrarTotales() {
    // Obtenemos los datos del cache del Local Storage
    const cachePersonas = JSON.parse(localStorage.getItem("cachePersonas"));

    if (!cachePersonas) {
        // Si no hay datos en el cache, volvemos a cargar desde la API
        obtenerListadoPersonas();
        return; //revisar return
    }

    const totalGeneral = cachePersonas.length;
    let totalMontevideo = 0;
    let totalRestoPais = 0;

    // Contar la cantidad de personas de Montevideo y del resto del país
    cachePersonas.forEach((persona) => {
        if (persona.ciudad === 129833) {
            totalMontevideo++;
        } else {
            totalRestoPais++;
        }
    });

    // Mostrar los totales en la tabla
    const tablaCensadosTotalesBody = document.querySelector("#tablaCensadosTotalesBody");
    tablaCensadosTotalesBody.innerHTML = 
    
    `
    <ion-row style="border-bottom: groove;">
                <ion-col>
                  <ion-label >${totalGeneral}</ion-label>
                </ion-col>
                <ion-col>
                  <ion-label >${totalMontevideo}</ion-label>
                </ion-col>
                <ion-col>
                  <ion-label >${totalRestoPais}</ion-label>
                </ion-col>
    </ion-row>
    `;

    // Mostrar el div de censados totales
    const divCensadosTotales = document.querySelector("#censadosTotales");
    divCensadosTotales.style.display = "block";
}


async function obtenerUbicacion() {
    if (navigator.geolocation) {
        try {
            // Si el navegador admite Geolocation, solicitamos la ubicación
            const posicion = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            // Obtenemos las coordenadas de latitud y longitud
            const latitudCensista = posicion.coords.latitude;
            localStorage.setItem("latitudCensista",latitudCensista);
            const longitudCensista = posicion.coords.longitude;
            localStorage.setItem("longitudCensista",longitudCensista);

        } catch (error) {
            console.error("Error al obtener la ubicación:", error);
            alert("No se pudo obtener la ubicación del censista.");
        }
    } else {
        alert("Geolocation no es soportado por este navegador.");
    }
}
async function obtenerCiudadesEnRadio(latitudCensista, longitudCensista, radioKilometros) {
    try {
        const response = await fetch(API_CIUDADES_ENDPOINT, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "apikey": localStorage.getItem("token"),
                "iduser": localStorage.getItem("idUsuario"),
            },
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el listado de ciudades.");
        }

        const data = await response.json();
        const ciudades = data.ciudades;

        // Filtrar las ciudades según la distancia desde la ubicación del censista
        const ciudadesEnRadio = ciudades.filter((ciudad) => {
            // Calcular la distancia entre la ubicación del censista y la ciudad
            const distanciaKm = calcularDistanciaEntreCoordenadas(
                latitudCensista,
                longitudCensista,
                ciudad.latitud,
                ciudad.longitud
            );

            // Verificar si la distancia está dentro del radio especificado
            return distanciaKm <= radioKilometros;
        });

        return ciudadesEnRadio;
    } catch (error) {
        console.error("Error al obtener las ciudades:", error);
        return [];
    }
}

// Función para calcular la distancia entre dos conjuntos de coordenadas de latitud y longitud
function calcularDistanciaEntreCoordenadas(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = R * c;

    return distanciaKm;
}
// Función para convertir grados a radianes
function degToRad(grados) {
    return grados * (Math.PI / 180);
}

// Función para obtener las personas censadas
async function obtenerPersonasCensadas() {
    try {
        const response = await fetch(API_PERSONAS_ENDPOINT + "?idUsuario=" + localStorage.getItem("idUsuario"), {
            headers: {
                "Content-Type": "application/json",
                "apikey": localStorage.getItem("token"),
                "iduser": localStorage.getItem("idUsuario")
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el listado de personas censadas.");
        }

        const data = await response.json();
        return data.personas;
    } catch (error) {
        console.error("Error al obtener las personas censadas:", error);
        return [];
    }
}

// Función para filtrar las ciudades que tienen personas censadas
function filtrarCiudadesConPersonas(ciudades, personasCensadas) {
    const ciudadesConPersonas = ciudades.filter(ciudad => {
        return personasCensadas.some(persona => persona.ciudad === ciudad.id);
    });

    return ciudadesConPersonas;
}

async function dibujarMapaConCiudadesCensadas() {
    try {
        let radioKilometros = document.querySelector("#radio").value;
        let latitudCensista = localStorage.getItem("latitudCensista");
        let longitudCensista = localStorage.getItem("longitudCensista");
        // Creamos un mapa centrado en la ubicación del censista
        let mapa = L.map('mapa').setView([latitudCensista, longitudCensista], 10);

        // Agregamos una capa de mapa base (usamos OpenStreetMap en este caso)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        // Creamos un icono personalizado rojo para el marcador del censista
        const redIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });

        // Marcamos la ubicación del censista en el mapa usando el icono personalizado rojo
        L.marker([latitudCensista, longitudCensista], { icon: redIcon }).addTo(mapa)
            .bindPopup('¡Aquí estoy!')
            .openPopup();

        // Obtenemos todas las ciudades y personas desde las API
        const ciudades = await obtenerCiudadesEnRadio(latitudCensista, longitudCensista, radioKilometros);
        const personasCensadas = await obtenerPersonasCensadas();

        // Filtramos las ciudades que tienen personas censadas
        const ciudadesConPersonas = filtrarCiudadesConPersonas(ciudades, personasCensadas);

        // Dibujamos un círculo celeste como marca de agua en el mapa con el radio especificado (7000 metros)
        L.circle([latitudCensista, longitudCensista], {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.2,
            radius: 150
        }).addTo(mapa);

        // Marcamos las ciudades con personas censadas dentro del radio en el mapa con un ícono diferente
        ciudadesConPersonas.forEach(ciudad => {
            L.marker([ciudad.latitud, ciudad.longitud]).addTo(mapa)
                .bindPopup(ciudad.nombre);
        });

        // Mostramos el contenedor del mapa
        document.getElementById('mapa').style.display = 'block';
    } catch (error) {
        console.error("Error al dibujar el mapa:", error);
        alert("No se pudo dibujar el mapa.");
    }
}

// Función para manejar el evento de cambio en el campo de fecha de nacimiento
document.querySelector("#fechaNacimiento").addEventListener("change", (event) => {
    // Obtenemos la fecha de nacimiento seleccionada
    const fechaNacimiento = new Date(event.target.value);
    // Obtenemos la fecha actual
    const fechaActual = new Date();
    // Calculamos la diferencia en años entre la fecha actual y la fecha de nacimiento
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();

    // Si la edad es menor de 18 años, seleccionamos automáticamente la ocupación "Estudiante"
    const ocupacionSelect = document.querySelector("#ocupacion");
    if (edad < 18) {
        ocupacionSelect.value = "5"; // ID de la ocupación "Estudiante"
        ocupacionSelect.disabled = true;
    } else {
        ocupacionSelect.value = ""; // Reiniciamos el valor del select
        ocupacionSelect.disabled = false;
    }
});
function LimpiarCampos() {
        document.querySelector("#nombreUsuario").value = "";
        document.querySelector("#password").value = "";
    }

// Función para limpiar los campos de ingreso de persona
function LimpiarCamposPersona() {
    document.querySelector("#nombrePersona").value = "";
    document.querySelector("#departamento").value = "";
    document.querySelector("#ciudad").value = "";
    document.querySelector("#fechaNacimiento").value = "";
    document.querySelector("#ocupacion").value = "";
}
function OcultarDivs() {
    document.querySelector("#login").style.display = "none";
    document.querySelector("#registro").style.display = "none";
    //document.querySelector("#agregarPersona").style.display = "none";
    //document.querySelector("#listadoPersonas").style.display = "none";
    //document.querySelector("#censadosTotales").style.display = "none";
    //document.querySelector("#MapaCiudadesCensadas").style.display = "none";
    
}
function OcultarBotones(showButtons) {
    if (showButtons) {
        document.querySelector("#btnIngreso").style.display = "inline";
        document.querySelector("#btnRegistro").style.display = "inline";
        document.querySelector("#btnCerrarSesion").style.display = "none";
    }
    else {
        document.querySelector("#btnCerrarSesion").style.display = "inline";
        document.querySelector("#btnIngreso").style.display = "none";
        document.querySelector("#btnRegistro").style.display = "none";
    }
}

function AgregarEventos() {
    document.querySelector("#ruteo").addEventListener("ionRouteWillChange", navegar);
    //document.querySelector("#btnInicio").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnIngreso").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnRegistro").addEventListener("click", MostrarOcultarDivs);
    //se agrega el siguiente evento ya que sustituye a MostrarAgregarPersona() y queda unificado el codigo un solo lugar
    document.querySelector("#btnAgregarPersona").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnListadoPersonas").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnCerrarSesion").addEventListener("click", CerrarSesion);
    document.querySelector("#btnLogin").addEventListener("click", IniciarSesion);
    document.querySelector("#btnRegistroUsuario").addEventListener("click", Registro);
    document.querySelector("#btnEnviarDatosPersona").addEventListener("click", AgregarPersona);
    // Evento para obtener la ubicación del censista cuando se hace clic en el botón
    document.getElementById("btnMapa").addEventListener("click",obtenerUbicacion );
    document.getElementById("btnDibujarMapa").addEventListener("click", dibujarMapaConCiudadesCensadas);
    document.querySelector("#btnListadoPersonas").addEventListener("click",() => {
        cargarOcupaciones();
        cargarSelectOcupaciones();
        obtenerListadoPersonas();
    });
    document.querySelector("#btnAgregarPersona").addEventListener("click", () => {
        //MostrarAgregarPersona();
        // Cargamos departamentos y ocupaciones al hacer clic en el botón "Agregar Persona"
        cargarDepartamentos();
        cargarOcupaciones();
    });

    document.querySelector("#btnCensadosTotales").addEventListener("click", () => {
        mostrarTotales();
    });
}
function Inicio(showButtons) {
    OcultarDivs();
    OcultarBotones(showButtons);
    AgregarEventos();
    //document.querySelector("#login").style.display = "block";
    if (localStorage.getItem("hayUsuarioLogueado") === "false") {
        document.querySelector("#divInicioUsuarioDesconocido").style.display = "block";
        //para ionic
        ruteo.push("/")
        document.querySelector("#divInicioUsuarioLogueado").style.display = "none";
    }
    else {
        document.querySelector("#divInicioUsuarioDesconocido").style.display = "none";
        document.querySelector("#divInicioUsuarioLogueado").style.display = "block";
        document.querySelector("#login").style.display = "none";

    }
}

function MostrarOcultarDivs() {
    OcultarDivs();
    switch (this.id) {
        case "btnInicio": document.querySelector("#inicio").style.display = "block";
            break;

        case "btnRegistro": document.querySelector("#registro").style.display = "block";
            break;

        case "btnIngreso": document.querySelector("#login").style.display = "block";
            break;

        case "btnCerrarSesion": OcultarBotones(false);
            break;
        case "btnMapa": document.querySelector("#mapa").style.display = "block";
            break;
    }
}
// Función para manejar los errores de la API
function handleApiError(error) {
    console.error("Error en fetch:", error);
    return error.json().then((data) => {
        if (data !== undefined) {
            document.querySelector("#errorMessage").innerHTML = data.error;
        }
    });
}

function cerrarMenu(){
    menu.close();
}

function atras(){
    ruteo.back();
}

function navegar(event){
    OcultarPaginas()
    let ruta = event.detail.to;
    if (ruta == "/") {
        document.querySelector("#pageLogin").style.display = "block";
    }
    else if (ruta == "/pageRegistro") {
        document.querySelector("#registro").style.display="block";
        //document.querySelector("#pageRegistro").style.display = "block";
    }
    else if (ruta == "/agregarPersona") {
        document.querySelector("#agregarPersona").style.display = "block";
        document.querySelector("#divAtras").innerHTML="<ion-button onclick=atras() id='btnAtras' slot='start'><ion-icon name='arrow-undo'></ion-icon>Volver</ion-button>"
    }
    else if (ruta == "/pageDetalle") {
        document.querySelector("#pageDetalle").style.display = "block";
    }
    else if (ruta == "/listadoPersonas") {
        document.querySelector("#listadoPersonas").style.display = "block";
        //document.querySelector("#listado").style.display = "block";
        document.querySelector("#divAtras").innerHTML="<ion-button onclick=atras() id='btnAtras' slot='start'><ion-icon name='arrow-undo'></ion-icon>Volver</ion-button>"
    }
    else if (ruta == "/censadosTotales") {
        document.querySelector("#censadosTotales").style.display = "block";
        document.querySelector("#divAtras").innerHTML="<ion-button onclick=atras() id='btnAtras' slot='start'><ion-icon name='arrow-undo'></ion-icon>Volver</ion-button>"
    }
    else if (ruta == "/MapaCiudadesCensadas") {
        document.querySelector("#MapaCiudadesCensadas").style.display = "block";
        //document.querySelector("#mapa").style.display = "block"
        document.querySelector("#divAtras").innerHTML="<ion-button onclick=atras() id='btnAtras' slot='start'><ion-icon name='arrow-undo'></ion-icon>Volver</ion-button>"
    }
    else{
        CerrarSesion();
    }
}

function OcultarPaginas() {
    let pages = document.getElementsByClassName("ion-page");
    for (let i = 0; i < pages.length; i++) {

        if (pages[i].id != null && pages[i].id !== "") {
            document.querySelector("#" + pages[i].id).style.display = "none";
        }


    }
}
