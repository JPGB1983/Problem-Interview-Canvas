document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    // Establecer fecha actual
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }

    // Inicializar slider de frustración
    const frustracionSlider = document.getElementById('frustracion');
    const frustracionValue = document.getElementById('frustracion-value');
    
    if (frustracionSlider && frustracionValue) {
        frustracionSlider.addEventListener('input', function() {
            frustracionValue.textContent = this.value;
        });
    }

    // Agregar listeners para el scoring
    setupScoringCalculation();
}

function setupEventListeners() {
    // Listener para el formulario principal
    const form = document.getElementById('problemInterviewForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Validación en tiempo real
    document.addEventListener('input', handleInputValidation);
    document.addEventListener('change', handleInputValidation);
}

function setupScoringCalculation() {
    const scoreSelects = document.querySelectorAll('.score-select');
    scoreSelects.forEach(select => {
        select.addEventListener('change', calculateTotalScore);
    });
}

function calculateTotalScore() {
    const scoreSelects = document.querySelectorAll('.score-select');
    let total = 0;
    let count = 0;

    scoreSelects.forEach(select => {
        if (select.value && select.value !== '') {
            total += parseInt(select.value);
            count++;
        }
    });

    const totalScoreElement = document.getElementById('total-score');
    if (totalScoreElement) {
        if (count === 0) {
            totalScoreElement.textContent = '__/25';
        } else {
            totalScoreElement.textContent = `${total}/25`;
            
            // Cambiar color según el score
            if (total >= 20) {
                totalScoreElement.style.color = '#28a745'; // Verde
            } else if (total >= 15) {
                totalScoreElement.style.color = '#ffc107'; // Amarillo
            } else {
                totalScoreElement.style.color = '#dc3545'; // Rojo
            }
        }
    }
}

function addToolRow() {
    const tableBody = document.getElementById('toolsTableBody');
    if (!tableBody) return;

    const rowCount = tableBody.rows.length + 1;
    const newRow = document.createElement('tr');
    newRow.className = 'fade-in';
    
    newRow.innerHTML = `
        <td><input type="text" name="tool_name_${rowCount}" placeholder="Nombre de herramienta"></td>
        <td><input type="text" name="tool_frequency_${rowCount}" placeholder="Diario/Semanal/Mensual"></td>
        <td><input type="number" name="tool_satisfaction_${rowCount}" min="1" max="10" placeholder="1-10"></td>
        <td><input type="text" name="tool_cost_${rowCount}" placeholder="$0/mes"></td>
    `;
    
    tableBody.appendChild(newRow);
}

function addStakeholderRow() {
    const tableBody = document.getElementById('stakeholdersTableBody');
    if (!tableBody) return;

    const rowCount = tableBody.rows.length + 1;
    const newRow = document.createElement('tr');
    newRow.className = 'fade-in';
    
    newRow.innerHTML = `
        <td><input type="text" name="stakeholder_${rowCount}" placeholder="Nombre o rol"></td>
        <td>
            <select name="stakeholder_influence_${rowCount}">
                <option value="">Seleccionar</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
            </select>
        </td>
        <td><input type="text" name="stakeholder_concerns_${rowCount}" placeholder="Sus principales preocupaciones"></td>
    `;
    
    tableBody.appendChild(newRow);
}

function handleInputValidation(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        if (event.target.value.length > 0) {
            event.target.style.borderColor = '#28a745';
        } else {
            event.target.style.borderColor = '#e9ecef';
        }
    }
}

function handleSubmit(event) {
    event.preventDefault();
    
    // Validar campos requeridos
    const requiredFields = [
        'proyecto', 'entrevistador', 'entrevistado', 'fecha'
    ];
    
    let isValid = true;
    const missingFields = [];
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            isValid = false;
            missingFields.push(fieldName);
            field.style.borderColor = '#dc3545';
        }
    });
    
    if (!isValid) {
        alert(`Por favor complete los siguientes campos obligatorios: ${missingFields.join(', ')}`);
        return;
    }
    
    // Recopilar datos del formulario
    const formData = new FormData(event.target);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }

    // Calcular y agregar score total
    const totalScore = document.getElementById('total-score').textContent;
    data.total_score = totalScore;

    // Mostrar confirmación
    showSuccessMessage('Entrevista guardada exitosamente!');
    console.log('Datos de la entrevista:', data);
    
    // Generar resumen
    generateSummary(data);
}

function exportData() {
    const form = document.getElementById('problemInterviewForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }

    // Agregar metadatos
    data.export_date = new Date().toISOString();
    data.export_version = '1.0';
    data.total_score = document.getElementById('total-score').textContent;
    
    // Crear archivo JSON para descargar
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `problem-interview-${data.proyecto || 'entrevista'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showSuccessMessage('Datos exportados exitosamente!');
}

function generateSummary(data) {
    const summaryData = {
        proyecto: data.proyecto,
        entrevistado: data.entrevistado,
        fecha: data.fecha,
        problema_validado: data.validacion_problema === 'confirmado',
        score_total: data.total_score,
        prioridad: data.prioridad,
        dispuesto_pagar: data.pagar,
        principales_insights: data.principales_insights || 'No especificado'
    };
    
    console.log('Resumen de la entrevista:', summaryData);
    
    // Mostrar resumen en modal (opcional)
    if (confirm('¿Desea ver un resumen de la entrevista?')) {
        showSummaryModal(summaryData);
    }
}

function showSummaryModal(summary) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Resumen de la Entrevista</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Proyecto:</strong> ${summary.proyecto || 'No especificado'}
                </div>
                <div class="summary-item">
                    <strong>Entrevistado:</strong> ${summary.entrevistado || 'No especificado'}
                </div>
                <div class="summary-item">
                    <strong>Fecha:</strong> ${new Date(summary.fecha).toLocaleDateString('es-ES')}
                </div>
                <div class="summary-item">
                    <strong>Problema Validado:</strong> ${summary.problema_validado ? '✅ Sí' : '❌ No'}
                </div>
                <div class="summary-item">
                    <strong>Score Total:</strong> ${summary.score_total}
                </div>
                <div class="summary-item">
                    <strong>Prioridad:</strong> ${summary.prioridad || 'No especificado'}
                </div>
                <div class="summary-item">
                    <strong>Dispuesto a Pagar:</strong> ${summary.dispuesto_pagar || 'No especificado'}
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="closeModal()" class="btn-primary">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Función para limpiar formulario con confirmación
function clearForm() {
    if (confirm('¿Está seguro de que desea limpiar todo el formulario? Esta acción no se puede deshacer.')) {
        document.getElementById('problemInterviewForm').reset();
        
        // Restablecer fecha actual
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.valueAsDate = new Date();
        }
        
        // Restablecer slider
        const frustracionSlider = document.getElementById('frustracion');
        const frustracionValue = document.getElementById('frustracion-value');
        if (frustracionSlider && frustracionValue) {
            frustracionSlider.value = 5;
            frustracionValue.textContent = '5';
        }
        
        // Restablecer score
        const totalScoreElement = document.getElementById('total-score');
        if (totalScoreElement) {
            totalScoreElement.textContent = '__/25';
            totalScoreElement.style.color = '';
        }
        
        showSuccessMessage('Formulario limpiado exitosamente');
    }
}

// Función para auto-guardar (opcional)
function autoSave() {
    const formData = new FormData(document.getElementById('problemInterviewForm'));
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Guardar en localStorage
    localStorage.setItem('problemInterviewDraft', JSON.stringify(data));
}

// Auto-guardar cada 30 segundos
setInterval(autoSave, 30000);

// Cargar borrador al iniciar
document.addEventListener('DOMContentLoaded', function() {
    const draft = localStorage.getItem('problemInterviewDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            
            // Preguntar si quiere cargar el borrador
            if (confirm('Se encontró un borrador guardado. ¿Desea cargarlo?')) {
                Object.keys(data).forEach(key => {
                    const field = document.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (field.type === 'radio') {
                            const radio = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            field.value = data[key];
                        }
                    }
                });
                
                showSuccessMessage('Borrador cargado exitosamente');
            }
        } catch (error) {
            console.error('Error al cargar borrador:', error);
        }
    }
});

// Función para validar email (si se agrega campo de email)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar teléfono (si se agrega campo de teléfono)
function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para exportar a CSV (alternativa)
function exportToCSV() {
    const form = document.getElementById('problemInterviewForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Convertir a CSV
    const headers = Object.keys(data);
    const values = Object.values(data);
    
    const csvContent = [
        headers.join(','),
        values.map(value => `"${value}"`).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `problem-interview-${data.proyecto || 'entrevista'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Función para imprimir entrevista
function printInterview() {
    window.print();
}

// Estilos adicionales para notificaciones y modal
const additionalStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .summary-grid {
        display: grid;
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .summary-item {
        padding: 0.5rem;
        border-left: 4px solid #667eea;
        background: #f8f9fa;
    }
    
    .modal-actions {
        text-align: center;
        margin-top: 2rem;
    }
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
