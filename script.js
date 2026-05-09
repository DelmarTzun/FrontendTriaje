// URL base de tu API alojada en Azure
const API_URL = 'https://sistemagestion4544-aqc2a9dqd7dsbzgf.northcentralus-01.azurewebsites.net/api/Triaje';

// =======================================================
// LÓGICA PARA OBTENER LOS PACIENTES (GET)
// =======================================================
async function cargarPacientes() {
    const tbody = document.getElementById('tablaPacientesBody');
    const mensajeError = document.getElementById('mensajeError');

    try {
        mensajeError.classList.add('d-none');
        // Usamos colspan="7" porque ahora tenemos 7 columnas en la tabla
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando datos del servidor...</td></tr>';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const pacientes = await response.json();
        tbody.innerHTML = '';

        if (pacientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pacientes en espera.</td></tr>';
            return;
        }

        pacientes.forEach(paciente => {
            const fila = document.createElement('tr');
            const fechaFormateada = new Date(paciente.fechaIngreso).toLocaleString();

            if (paciente.nivelGravedad === 5) {
                fila.classList.add('table-danger');
            }

            // Agregamos las columnas y la protección "||" para los datos nulos
            fila.innerHTML = `
                <td><strong>${paciente.idPaciente}</strong></td>
                <td>${paciente.nombre || '<span class="text-muted">No registrado</span>'}</td>
                <td>${paciente.sintomas || '<span class="text-muted">No registrado</span>'}</td>
                <td>Nivel ${paciente.nivelGravedad}</td>
                <td><span class="badge bg-secondary">${paciente.estado}</span></td>
                <td>${paciente.medicoResponsable}</td>
                <td>${fechaFormateada}</td>
            `;

            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Detalle del error:", error);
        tbody.innerHTML = ''; 
        mensajeError.classList.remove('d-none'); 
    }
}

// Ejecutamos la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarPacientes);

// =======================================================
// LÓGICA PARA EL FORMULARIO DE REGISTRO (POST)
// =======================================================
document.getElementById('formularioRegistro').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const inputNombre = document.getElementById('nombrePaciente').value;
    const inputSintomas = document.getElementById('sintomas').value;
    const inputGravedad = document.getElementById('gravedad').value;
    const inputMedico = document.getElementById('medicoResponsable').value;
    const divMensaje = document.getElementById('mensajePost');

    divMensaje.innerHTML = '<div class="alert alert-info">Procesando registro...</div>';

    const datosPaciente = {
        nombre: inputNombre,
        sintomas: inputSintomas,
        nivelGravedad: parseInt(inputGravedad),
        medicoResponsable: inputMedico
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosPaciente)
        });

        if (response.status === 401) {
            divMensaje.innerHTML = '<div class="alert alert-danger"><strong>Acceso Denegado:</strong> El carnet del médico no está autorizado.</div>';
            return; 
        }

        if (response.status === 400) {
            const error = await response.json();
            divMensaje.innerHTML = `<div class="alert alert-warning"><strong>Aviso:</strong> ${error.mensaje}</div>`;
            return;
        }

        if (!response.ok) {
            throw new Error('Ocurrió un problema al guardar.');
        }

        const pacienteGuardado = await response.json();
        divMensaje.innerHTML = `<div class="alert alert-success"><strong>¡Éxito!</strong> Paciente registrado bajo el código: ${pacienteGuardado.idPaciente}</div>`;
        document.getElementById('formularioRegistro').reset();
        
        cargarPacientes();

    } catch (error) {
        console.error("Error en el POST:", error);
        divMensaje.innerHTML = '<div class="alert alert-danger">Error de conexión con el servidor.</div>';
    }
});