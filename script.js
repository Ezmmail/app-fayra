// Función de texto a voz para accesibilidad
function hablar(texto) {
    if ('speechSynthesis' in window) {
        // Cancelar cualquier mensaje anterior
        window.speechSynthesis.cancel();
        
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-ES'; // voz en español
        msg.rate = 1;       // velocidad normal
        msg.pitch = 1;      // tono normal
        window.speechSynthesis.speak(msg);
    }
}

// Función para obtener hora de Buenos Aires CORREGIDA
function getBuenosAiresTime() {
    return new Date().toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires"
    });
}

// Función para formatear el tiempo
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDateTime() {
    const now = new Date();
    return now.toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// Función para calcular el factor de temperatura
function calcularFactorTemperatura(temperatura) {
    if (temperatura <= 5) {
        return 3; // Triple de tiempo para 5°C o menos
    } else if (temperatura > 5 && temperatura <= 12) {
        return 2; // Doble de tiempo entre 5°C y 12°C
    } else {
        return 1; // Tiempo normal para 20°C o más
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const foodTypeSelect = document.getElementById('foodType');
    const temperatureInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    const checkButton = document.getElementById('checkButton');
    const resultDiv = document.getElementById('result');
    const foodInfoDiv = document.getElementById('foodInfo');
    const infoContent = document.getElementById('infoContent');
    const maxTimeInfo = document.getElementById('maxTimeInfo');
    const considerationsInfo = document.getElementById('considerationsInfo');

    // Elementos UI existentes
    const iconResult = document.getElementById('iconResult');
    const messageResult = document.getElementById('messageResult');
    const progressBar = document.getElementById('progressBar');
    const tempDisplay = document.getElementById('tempDisplay');
    const humDisplay = document.getElementById('humDisplay');
    const timeDisplay = document.getElementById('timeDisplay');
    const repeatButton = document.getElementById('repeatButton');
    
    // Elementos del temporizador
    const currentTimeDisplay = document.getElementById('currentTime');
    const exposureTimerDisplay = document.getElementById('exposureTimer');
    const startTimerBtn = document.getElementById('startTimer');
    const stopTimerBtn = document.getElementById('stopTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    const timerSection = document.querySelector('.timer-section');
    
    // Variables del temporizador
    let startTime = null;
    let elapsedSeconds = 0;
    let timerInterval = null;
    let isTimerRunning = false;
    let mensajeVozActual = '';
    
    // Ocultar botón de repetir inicialmente
    repeatButton.style.display = 'none';
    
    // Actualizar hora actual cada segundo - CORREGIDO
    function updateCurrentTime() {
        currentTimeDisplay.textContent = formatDateTime();
    }
    
    // Actualizar temporizador de exposición
    function updateExposureTimer() {
        if (isTimerRunning) {
            const currentTime = new Date().getTime();
            elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        }
        exposureTimerDisplay.textContent = formatTime(elapsedSeconds);
    }
    
    // Iniciar temporizador
    function startTimer() {
        if (!isTimerRunning) {
            startTime = new Date().getTime() - (elapsedSeconds * 1000);
            isTimerRunning = true;
            
            timerInterval = setInterval(() => {
                updateExposureTimer();
            }, 1000);
            
            // Actualizar UI
            startTimerBtn.disabled = true;
            stopTimerBtn.disabled = false;
            timerSection.classList.add('timer-active');
            
            hablar("Temporizador iniciado. El tiempo de exposición está siendo monitoreado.");
        }
    }
    
    // Detener temporizador
    function stopTimer() {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            
            // Actualizar UI
            startTimerBtn.disabled = false;
            stopTimerBtn.disabled = true;
            timerSection.classList.remove('timer-active');
            
            hablar("Temporizador detenido. Tiempo total: " + formatTimeForSpeech(elapsedSeconds));
        }
    }
    
    // Reiniciar temporizador
    function resetTimer() {
        stopTimer();
        elapsedSeconds = 0;
        updateExposureTimer();
        
        hablar("Temporizador reiniciado.");
    }
    
    // Formatear tiempo para voz
    function formatTimeForSpeech(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let speech = "";
        if (hours > 0) {
            speech += `${hours} hora${hours !== 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (hours > 0) speech += ' y ';
            speech += `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        }
        if (hours === 0 && minutes === 0) {
            speech = "menos de 1 minuto";
        }
        
        return speech;
    }
    
    // Inicializar
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    updateExposureTimer();
    
    // Event listeners para el temporizador
    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    
    // Datos de seguridad alimentaria
    const foodSafetyData = {
        'carne': {
            maxTime: 3,
            highTempThreshold: 32,
            highTempReduction: 1,
            info: 'Carne de res, aves de corral, mariscos. Altamente susceptibles a bacterias. Desechar si supera 2 horas a temperatura ambiente (solo 1 hora si la temperatura es superior a 32°C).',
            considerations: 'El tiempo se reduce a 1 hora si la temperatura ambiente es superior a 32°C. Son altamente susceptibles a las bacterias.',
            unsafeMessage: 'Desechar - Riesgo alto de contaminación bacteriana'
        },
        'lacteos': {
            maxTime: 3,
            highTempThreshold: 32,
            highTempReduction: 1,
            info: 'Leche, yogur, queso blando, huevos cocidos. Son un caldo de cultivo ideal para bacterias. El queso duro puede durar un poco más, pero no es recomendable.',
            considerations: 'Son un caldo de cultivo ideal para bacterias. El queso duro puede durar un poco más, pero no es recomendable.',
            unsafeMessage: 'Desechar - Productos lácteos son propensos al crecimiento bacteriano'
        },
        'frutas': {
            maxTime: 4,
            info: 'Frutas enteras: manzanas, plátanos, naranjas. El recipiente térmico puede generar humedad, acelerando su maduración o deterioro.',
            considerations: 'El recipiente térmico puede generar humedad, acelerando su maduración o deterioro. La superficie cortada aumenta el riesgo de crecimiento bacteriano.',
            unsafeMessage: 'Desechar - Frutas cortadas o en condiciones de riesgo'
        },
        'granos': {
            maxTime: 24,
            info: 'Pan. Se mantiene bien a temperatura ambiente por varios días.',
            considerations: 'El pan se mantiene bien a temperatura ambiente. Los granos cocidos como arroz y pasta deben tratarse como alimentos perecederos.',
            unsafeMessage: 'Evaluar - El pan generalmente se conserva bien, pero verificar signos de moho'
        },
        'azucar': {
            maxTime: 168, // 7 días
            info: 'Mermeladas, jaleas. El alto contenido de azúcar actúa como conservante natural, pero una vez abiertos, pueden fermentar si se exponen al calor.',
            considerations: 'El alto contenido de azúcar actúa como un conservante natural, pero una vez abiertos, pueden fermentar si se exponen al calor.',
            unsafeMessage: 'Evaluar - Verificar si hay signos de fermentación o moho'
        },
        'cocinados': {
            maxTime: 3,
            info: 'Arroz cocido, pasta cocida. Puede desarrollar la bacteria Bacillus cereus, que causas intoxicación alimentaria, si se deja a temperatura ambiente por mucho tiempo.',
            considerations: 'Puede desarrollar la bacteria Bacillus cereus, que causa intoxicación alimentaria, si se dejan a temperatura ambiente por mucho tiempo.',
            unsafeMessage: 'Desechar - Alto riesgo de intoxicación por Bacillus cereus'
        },
        'ensaladas': {
            maxTime: 4,
            info: 'Ensaladas preparadas o cortadas. La superficie cortada aumenta el riesgo de crecimiento bacteriano. Las ensaladas con aderezos cremosos son más vulnerables.',
            considerations: 'La superficie cortada aumenta el riesgo de crecimiento bacteriano. Las ensaladas con aderezos cremosos son más vulnerables.',
            unsafeMessage: 'Desechar - Alto riesgo de contaminación en ensaladas preparadas'
        },
        'salsas': {
            maxTime: 3,
            info: 'Salsas y aderezos. Las salsas a base de mayonesa o crema son especialmente vulnerables a temperaturas ambiente.',
            considerations: 'Las salsas con aderezos cremosos son más vulnerables. Mayonesa y salsas a base de huevo deben refrigerarse después de 2 horas.',
            unsafeMessage: 'Desechar - Salsas con base láctea o de huevo son de alto riesgo'
        }
    };
    
    checkButton.addEventListener('click', function() {
        const foodType = foodTypeSelect.value;
        const temperature = parseFloat(temperatureInput.value);
        const humidity = parseFloat(humidityInput.value);
        
        // Usar el tiempo del temporizador automático
        const exposureTime = elapsedSeconds / 3600; // Convertir a horas
        
        if (!foodType || isNaN(temperature)) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }
        
        if (elapsedSeconds === 0) {
            alert('Por favor, inicia el temporizador para medir el tiempo de exposición.');
            return;
        }
        
        const foodData = foodSafetyData[foodType];
        let maxSafeTime = foodData.maxTime;
        let considerations = foodData.considerations;
        
        // Calcular factor de temperatura
        const factorTemperatura = calcularFactorTemperatura(temperature);
        let maxSafeTimeAjustado = maxSafeTime * factorTemperatura;
        
        // Ajustar por temperatura alta si aplica (sobreescribe el ajuste por frío si la temperatura es muy alta)
        if (foodData.highTempThreshold && temperature > foodData.highTempThreshold) {
            maxSafeTimeAjustado = foodData.highTempReduction;
            considerations += ` Tiempo reducido a ${maxSafeTimeAjustado} hora(s) debido a alta temperatura (más de ${foodData.highTempThreshold}°C).`;
        } else if (factorTemperatura > 1) {
            // Solo mostrar mensaje de ajuste por frío si no estamos en alta temperatura
            let mensajeTemperatura = '';
            if (temperature <= 5) {
                mensajeTemperatura = `Tiempo extendido al triple (${maxSafeTimeAjustado}h) por temperatura baja (${temperature}°C).`;
            } else if (temperature <= 12) {
                mensajeTemperatura = `Tiempo extendido al doble (${maxSafeTimeAjustado}h) por temperatura fresca (${temperature}°C).`;
            }
            considerations += ` ${mensajeTemperatura}`;
        }
        
        // Determinar si es seguro
        let isSafe = exposureTime <= maxSafeTimeAjustado;
        let icon = "";
        let message = "";
        mensajeVozActual = "";

        if (isSafe) {
            resultDiv.className = 'result safe';
            icon = "✅";
            message = "ALIMENTO APTO PARA CONSUMO";
            mensajeVozActual = `Alimento apto para consumo. Tiempo de exposición: ${formatTimeForSpeech(elapsedSeconds)}. Puede consumirse sin riesgo.`;
        } else {
            resultDiv.className = 'result unsafe';
            icon = "❌";
            message = foodData.unsafeMessage;
            mensajeVozActual = `Alimento no seguro. Tiempo de exposición: ${formatTimeForSpeech(elapsedSeconds)}. ${foodData.unsafeMessage}`;
        }

        // Mostrar en UI mejorada
        iconResult.textContent = icon;
        messageResult.textContent = message;
        tempDisplay.textContent = temperature;
        humDisplay.textContent = humidity;
        timeDisplay.textContent = formatTimeForSpeech(elapsedSeconds);

        // Barra de progreso
        let porcentaje = Math.min((exposureTime / maxSafeTimeAjustado) * 100, 100);
        progressBar.style.width = porcentaje + "%";

        resultDiv.style.display = 'block';
        
        // 🔊 HABLAR el resultado automáticamente
        hablar(mensajeVozActual);
        
        // Mostrar botón de repetir con animación
        setTimeout(() => {
            repeatButton.style.display = 'block';
            repeatButton.style.animation = 'fadeIn 0.5s ease';
        }, 500);
        
        // Mostrar información adicional
        infoContent.innerHTML = `<p>${foodData.info}</p>`;
        
        // Formatear el tiempo máximo seguro
        const maxHours = Math.floor(maxSafeTimeAjustado);
        const maxMinutes = Math.round((maxSafeTimeAjustado - maxHours) * 60);
        let maxTimeText = '';
        
        if (maxHours > 0) {
            maxTimeText += `${maxHours} hora${maxHours !== 1 ? 's' : ''}`;
        }
        if (maxMinutes > 0) {
            if (maxHours > 0) maxTimeText += ' y ';
            maxTimeText += `${maxMinutes} minuto${maxMinutes !== 1 ? 's' : ''}`;
        }
        
        // Mostrar información del ajuste por temperatura
        let infoTemperatura = '';
        if (foodData.highTempThreshold && temperature > foodData.highTempThreshold) {
            infoTemperatura = ` (reducido por alta temperatura >${foodData.highTempThreshold}°C)`;
        } else if (temperature <= 5) {
            infoTemperatura = ` (extendido al triple por temperatura ≤5°C)`;
        } else if (temperature <= 12) {
            infoTemperatura = ` (extendido al doble por temperatura 5-12°C)`;
        }
        
        maxTimeInfo.textContent = maxTimeText + infoTemperatura;
        
        considerationsInfo.textContent = considerations;
        
        foodInfoDiv.style.display = 'block';
        
        // Scroll hacia resultados
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    // Evento para el botón de repetir mensaje
    repeatButton.addEventListener('click', function() {
        if (mensajeVozActual) {
            hablar(mensajeVozActual);
        }
    });

});
