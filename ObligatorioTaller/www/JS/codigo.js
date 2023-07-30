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
                "<option value='' selected disabled>Seleccione un departamento</option>";
            departamentos.forEach((departamento) => {
                departamentoSelect.innerHTML += `<option value="${departamento.id}">${departamento.nombre}</option>`;
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
            ciudadSelect.innerHTML = "<option value='' selected disabled>Seleccione una ciudad</option>";
            ciudades.forEach(ciudad => {
                ciudadSelect.innerHTML += `<option value="${ciudad.id}">${ciudad.nombre}</option>`;
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
            cargarSelectOcupaciones()
            const ocupacionSelect = document.querySelector("#ocupacion");
            ocupacionSelect.innerHTML =
                "<option value='' selected disabled>Seleccione una ocupación</option>";
            data.ocupaciones.forEach((ocupacion) => {
                ocupacionSelect.innerHTML += `<option value="${ocupacion.id}">${ocupacion.ocupacion}</option>`;
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
            const personas = data.personas;
            // Llamamos a la función para filtrar y mostrar la tabla
            filtrarPersonasPorOcupacion(personas);
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
    ocupacionSelect.innerHTML = "<option value=''>Todas las ocupaciones</option>";

    // Agregar las opciones de ocupaciones al select
    cacheOcupaciones.ocupaciones.forEach((ocupacion) => {
        ocupacionSelect.innerHTML += `<option value="${ocupacion.id}">${ocupacion.ocupacion}</option>`;
    });

    // Asignar el evento para filtrar al cambiar la ocupación seleccionada
    ocupacionSelect.addEventListener("change", function () {
    });
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
        document.querySelector("#usuario").value = "";
        document.querySelector("#passRegistro").value = "";
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
    document.querySelector("#btnInicio").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnIngreso").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnRegistro").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnCerrarSesion").addEventListener("click", CerrarSesion);
    document.querySelector("#btnLogin").addEventListener("click", IniciarSesion);
    document.querySelector("#btnRegistroUsuario").addEventListener("click", Registro);
    document.querySelector("#btnEnviarDatosPersona").addEventListener("click", AgregarPersona);
   document.querySelector("#btnListadoPersonas").addEventListener("click",() => {
       cargarOcupaciones();
       obtenerListadoPersonas();
   });
    document.querySelector("#btnAgregarPersona").addEventListener("click", () => {
        MostrarAgregarPersona();
        // Cargamos departamentos y ocupaciones al hacer clic en el botón "Agregar Persona"
        cargarDepartamentos();
        cargarOcupaciones();
    });

}
function Inicio(showButtons) {
    OcultarDivs();
    OcultarBotones(showButtons);
    AgregarEventos();
    document.querySelector("#inicio").style.display = "block";
    if (localStorage.getItem("hayUsuarioLogueado") === "false") {
        document.querySelector("#divInicioUsuarioDesconocido").style.display = "block";
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
