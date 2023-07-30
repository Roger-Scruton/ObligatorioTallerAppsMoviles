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
let cachePersonas = []
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
        inicializar();
        document.querySelector("#errorMessage").innerHTML = "El tiempo a expirado debe volver a iniciar sesion";
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
                    LimpiarCamposPersona();
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
            departamentoSelect.addEventListener("change", () => {
                const selectedDepartamento = departamentoSelect.value;
                cargarCiudadesPorDepartamento(selectedDepartamento);
            });
        })
        .catch(handleApiError);
}
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
            cacheOcupaciones = data; //Usado para cargar el select implementado para el filtro del listado de personas por ocupaciones
            //cargarSelectOcupaciones()
            const ocupacionSelect = document.querySelector("#ocupacion");
            ocupacionSelect.innerHTML =
                "<ion-select-option value='' selected disabled>Seleccione una ocupación</ion-slect-option>";
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
            "iduser": localStorage.getItem("idUsuario")
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener el listado de personas");
            }
            return response.json();
        })
        .then((data) => {
            cachePersonas = data.personas;
            // Llamamos a la función para filtrar y mostrar la tabla
            filtrarPersonasPorOcupacion(data.personas);
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
            } else {
                throw new Error("Error al eliminar la persona");
            }
        })
        .then((data) => {
            // Verificamos si la respuesta contiene el mensaje de éxito
            if (data.mensaje) {
                console.log(data.mensaje); // Mostramos el mensaje en la consola (opcional)
                obtenerListadoPersonas(); // Actualizamos la lista de personas
            } else {
                throw new Error("Error al eliminar la persona");
            }
        })
        .catch(handleApiError); // Utilizar la función para manejar errores de la API
}
function filtrarPersonasPorOcupacion(listaCompleta) {
    const ocupacionSelect = document.querySelector("#selectOcupacion");
    const filtroOcupacionId = ocupacionSelect.value;

    const tablaInicioBody = document.querySelector("#tablaInicioBody");
    tablaInicioBody.innerHTML = ""; // Limpiamos la tabla antes de agregar los datos

    if (filtroOcupacionId === "") {
        // Si no hay selección en el filtro, mostramos la tabla completa
        listaCompleta.forEach((persona) => {
            tablaInicioBody.innerHTML += `
                <tr>
                    <td>${persona.nombre}</td>
                    <td>${persona.fechaNacimiento}</td>
                    <td>${persona.ocupacion}</td>
                    <td><button onclick="eliminarPersona(${persona.id})">Eliminar</button></td>
                </tr>
            `;
        });
    } else {
        // Si hay selección en el filtro, mostramos solo las personas con la ocupación seleccionada
        const personasFiltradas = listaCompleta.filter((persona) => persona.ocupacion === parseInt(filtroOcupacionId));
        personasFiltradas.forEach((persona) => {
            tablaInicioBody.innerHTML += `
                <tr>
                    <td>${persona.nombre}</td>
                    <td>${persona.fechaNacimiento}</td>
                    <td>${persona.ocupacion}</td>
                    <td><button onclick="eliminarPersona(${persona.id})">Eliminar</button></td>
                </tr>
            `;
        });
    }

    // Asignamos el evento de cambio al select de ocupaciones para actualizar la tabla al cambiar la selección
    ocupacionSelect.addEventListener("change", () => {
        filtrarPersonasPorOcupacion(listaCompleta);
    });
}
function cargarSelectOcupaciones() {
    const ocupacionSelect = document.querySelector("#selectOcupacion");
    ocupacionSelect.innerHTML = "<ion-select-option value=''>Todas las ocupaciones</ion-select-option>";

    // Agregar las opciones de ocupaciones al select
    cacheOcupaciones.ocupaciones.forEach((ocupacion) => {
        ocupacionSelect.innerHTML += `<ion-select-option value="${ocupacion.id}">${ocupacion.ocupacion}</ion-select-option>`;
    });

    // Asignar el evento para filtrar al cambiar la ocupación seleccionada
    ocupacionSelect.addEventListener("change", function () {
    });
}

//CORREGIR, existe un endpint en el API que ya te calcula el total. Luego solo hay que filtrar montevideo e interior.
function mostrarTotales(listaCompleta) {
    const totalGeneral = listaCompleta.length;
    let totalMontevideo = 0;
    let totalRestoPais = 0;

    // Contar la cantidad de personas de Montevideo y del resto del país
    listaCompleta.forEach((persona) => {
        if (persona.ciudad === 129833) {
            totalMontevideo++;
        } else {
            totalRestoPais++;
        }
    });

    // Mostrar los totales en la tabla
    const tablaCensadosTotalesBody = document.querySelector("#tablaCensadosTotalesBody");
    tablaCensadosTotalesBody.innerHTML = `
        <tr>
            <td>${totalGeneral}</td>
            <td>${totalMontevideo}</td>
            <td>${totalRestoPais}</td>
        </tr>
    `;

    // Mostrar el div de censados totales
    const divCensadosTotales = document.querySelector("#censadosTotales");
    divCensadosTotales.style.display = "block";
}
/*async function obtenerTodasLasCiudades() {
    const url = "{{censo}}/ciudades.php";
    const headers = {
        "Content-Type": "application/json",
        "apikey": "4171e00ddf882b0c971147a8fb2dce72",
        "iduser": "6" // Reemplaza este valor con el id del usuario adecuado
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error("Error al obtener las ciudades");
        }
        const data = await response.json();
        return data.ciudades;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Función para mostrar el mapa con las ciudades dentro del radio
function mostrarMapa(latitudCensista, longitudCensista, radioKilometros, ciudades) {
    const mapaDiv = document.querySelector("#mapa");
    mapaDiv.innerHTML = ""; // Limpiamos cualquier contenido anterior del div

    // Creamos el mapa en la posición del censista
    const mymap = L.map('mapa').setView([latitudCensista, longitudCensista], 13);

    // Agregamos una capa de mapa base (por ejemplo, OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mymap);

    // Marcador para la ubicación del censista
    L.marker([latitudCensista, longitudCensista]).addTo(mymap);

    // Creamos un círculo alrededor del censista con el radio dado en metros
    L.circle([latitudCensista, longitudCensista], {
        color: 'blue',
        fillColor: '#blue',
        fillOpacity: 0.2,
        radius: radioKilometros * 1000
    }).addTo(mymap);

    // Marcadores para las ciudades dentro del radio
    ciudades.forEach((ciudad) => {
        L.marker([ciudad.latitud, ciudad.longitud]).addTo(mymap).bindPopup(ciudad.nombre);
    });
}

// Función para mostrar el div del mapa y el mapa con las ciudades dentro del radio
async function mostrarMapaCensista(latitudCensista, longitudCensista, radioKilometros) {
    const ciudades = await obtenerTodasLasCiudades();

    // Lógica para filtrar las ciudades dentro del radio y mostrar el mapa
    // ...

    const mapaDiv = document.querySelector("#mapa");
    mapaDiv.style.display = "block"; // Mostramos el div del mapa
}

// Asignamos el evento al botón "btnMapa" para que muestre el mapa cuando se haga clic en él
document.querySelector("#btnCensadosTotales").addEventListener("click", () => {
    mostrarMapaCensista(latitudCensista, longitudCensista, radioKilometros); // Reemplaza estos parámetros con los valores correctos
}); */


// Función para manejar el evento de cambio en el campo de fecha de nacimiento
/*document.querySelector("#fechaNacimiento").addEventListener("change", (event) => {
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
});*/
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
    document.querySelector("#agregarPersona").style.display = "none";
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
// Nueva función para mostrar el div agregarPersona y ocultar los demás botones del div divInicioUsuarioLogueado
function MostrarAgregarPersona() {
    OcultarDivs();
    document.querySelector("#agregarPersona").style.display = "block";
}
function AgregarEventos() {
    document.querySelector("#ruteo").addEventListener("ionRouteWillChange", navegar);
    //document.querySelector("#btnInicio").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnIngreso").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnRegistro").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnCerrarSesion").addEventListener("click", CerrarSesion);
    document.querySelector("#btnLogin").addEventListener("click", IniciarSesion);
    document.querySelector("#btnRegistroUsuario").addEventListener("click", Registro);
    document.querySelector("#btnEnviarDatosPersona").addEventListener("click", AgregarPersona);
   /*document.querySelector("#btnListadoPersonas").addEventListener("click",() => {
       cargarOcupaciones();
       obtenerListadoPersonas();
   });*/
    document.querySelector("#btnAgregarPersona").addEventListener("click", () => {
        MostrarAgregarPersona();
        // Cargamos departamentos y ocupaciones al hacer clic en el botón "Agregar Persona"
        cargarDepartamentos();
        cargarOcupaciones();
    });

    document.querySelector("#btnCensadosTotales").addEventListener("click", () => {
        mostrarTotales(cachePersonas);
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

        case "btnAgregarPersona": document.querySelector("#agregarPersona").style.display = "block";
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
    OcultarDivs();
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
        document.querySelector("#divAtras").innerHTML="<ion-button onclick=atras() id='btnAtras'>Volver</ion-button>"
    }
    else if (ruta == "/pageDetalle") {
        document.querySelector("#pageDetalle").style.display = "block";
    }
    else{
        CerrarSesion();
    }
}
