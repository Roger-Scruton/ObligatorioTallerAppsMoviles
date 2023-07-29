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
                iduser: localStorage.getItem("idUsuario"),

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
            apikey: localStorage.getItem("token"),
            iduser: localStorage.getItem("idUsuario"),
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
        .catch(handleApiErrorDepartamentos);
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
            apikey: localStorage.getItem("token"),
            iduser: localStorage.getItem("idUsuario"),
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener las ocupaciones");
            }
            return response.json();
        })
        .then((data) => {
            const ocupacionSelect = document.querySelector("#ocupacion");
            ocupacionSelect.innerHTML =
                "<option value='' selected disabled>Seleccione una ocupación</option>";
            data.ocupaciones.forEach((ocupacion) => {
                ocupacionSelect.innerHTML += `<option value="${ocupacion.id}">${ocupacion.ocupacion}</option>`;
            });
        })
        .catch(handleOcupacionesApiError);
}
// Llamamos a la función para cargar los departamentos y ocupaciones al cargar la página
window.addEventListener("load", () => {
    cargarDepartamentos();
    cargarOcupaciones();
});

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
    // Agregamos el evento al botón btnAgregarPersona para mostrar el div agregarPersona
    document.querySelector("#btnAgregarPersona").addEventListener("click", MostrarAgregarPersona);

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
// Función para agregar una nueva persona

/*
Este switch se puede refactorizar resolviendo en una linea , siempre y cuando el id del boton
y el id del div solo se diferencien por el prefijo.
Ejemplo el boton es btnInicio y el div es Inicio*/
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
function handleApiErrorDepartamentos(error) {
    console.error("Error en fetch:", error);
    return error.json().then((data) => {
        if (data !== undefined) {
            if (data.mensaje === "API Key o usuario inválido") {
                // Si el mensaje de error es "API Key o usuario inválido", el token está vencido, así que volvemos a iniciar sesión para obtener un nuevo token.
                return IniciarSesion().then(() => {
                    // Después de obtener el nuevo token, llamamos a la función original nuevamente para reintentar la llamada a la API.
                    if (error.url === API_DEPARTAMENTOS_ENDPOINT) {
                        return cargarDepartamentos();
                    } else if (error.url.startsWith(API_CIUDADES_ENDPOINT)) {
                        const idDepartamento = error.url.split("=")[1];
                        return cargarCiudadesPorDepartamento(idDepartamento);
                    } else {
                        // Otra posibilidad sería mostrar un mensaje de error general.
                        throw new Error("Error en la llamada a la API");
                    }
                });
            } else if (data.mensaje === "Debe proporcionar una API Key e id de usuario") {
                // Si el mensaje de error es "Debe proporcionar una API Key e id de usuario", significa que faltan los headers mandatorios, por lo que debemos mostrar un mensaje de error apropiado.
                if (error.url.startsWith(API_DEPARTAMENTOS_ENDPOINT) || error.url.startsWith(API_CIUDADES_ENDPOINT)) {
                    document.querySelector("#errorMessagePersona").innerHTML = "Debe proporcionar una API Key e id de usuario";
                } else {
                    document.querySelector("#errorMessage").innerHTML = data.error;
                }
            } else {
                // Otra posibilidad sería mostrar un mensaje de error general.
                throw new Error("Error en la llamada a la API");
            }
        }
    });
}
// Función para manejar los errores de la API al cargar ocupaciones
function handleOcupacionesApiError(error) {
    console.error("Error en fetch de ocupaciones:", error);
    return error.json().then((data) => {
        if (data !== undefined) {
            if (data.mensaje === "API Key o usuario inválido") {
                // Si el mensaje de error es "API Key o usuario inválido", el token está vencido, así que volvemos a iniciar sesión para obtener un nuevo token.
                return IniciarSesion().then(() => {
                    // Después de obtener el nuevo token, llamamos a la función original nuevamente para reintentar la llamada a la API.
                    return cargarOcupaciones();
                });
            } else if (data.mensaje === "Debe proporcionar una API Key e id de usuario") {
                // Si el mensaje de error es "Debe proporcionar una API Key e id de usuario", significa que faltan los headers mandatorios, por lo que debemos mostrar un mensaje de error adecuado.
                document.querySelector("#errorMessagePersona").innerHTML =
                    "Debe proporcionar una API Key e id de usuario";
            } else {
                // Otra posibilidad sería mostrar un mensaje de error general.
                throw new Error("Error en la llamada a la API");
            }
        }
    });
}
