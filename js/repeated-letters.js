var checkNameForm = document.querySelector('#checkNameForm');
var input = document.querySelector('#usernameInput');
var submitButton = document.querySelector('#submit');
var clearButton = document.querySelector('#clearForm');
var enterKeyUpCounter = 0; //contador de nº de enters

//Listeners

//Botones
submitButton.addEventListener("click", onSubmit);
clearButton.addEventListener("click", onClear);

//Teclas
document.body.addEventListener("keypress", function(event) {
    //Info: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    if (event.keyCode == 13) { //Enter
        /*
        Contamos el nº de veces que presionamos la tecla Enter.
        Al pasar de 1 prevenimos seguir llamando a la función onSubmit y añador contadores.
        Con preventDefault evitamos que se reincie la página al enviar el form.
        */
        if (enterKeyUpCounter < 1) {
            onSubmit();
            enterKeyUpCounter++;
        }
        event.preventDefault();
    }
});
document.body.addEventListener("keyup", function(event) {
    if (event.keyCode == 27) { //Escape
        onClear();
    }
});

//Containers
var usernameContainer = document.querySelector("#username");
var vowelsContainer = document.querySelector('#vowelsContainer');
var totalVowelsContainer = document.querySelector('#totalVowelsContainer');
var consonantsContainer = document.querySelector('#consonantsContainer');
var totalConsonantsContainer = document.querySelector('#totalConsonantsContainer');
var allowedCharsContainer = document.querySelector('#allowedCharsContainer');
var totalAllowedCharsContainer = document.querySelector('#totalAllowedCharsContainer');

//Mapa de contadores
var elementsCounterMap = new Map();

//localStorage
var username = usernameContainer.innerHTML;
var totalVowels = totalVowelsContainer.innerHTML;
var totalConsonants = totalConsonantsContainer.innerHTML;
var totalAllowed = totalAllowedCharsContainer.innerHTML;

//Arrays de comprobación
var vowels = ["a", "e", "i", "o", "u"];
var consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "ñ", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"];
var allowedChars = [" ", "-"];
var letters = [];

function onSubmit() {
    var inputString = input.value;
    mergeArrays(vowels, consonants, allowedChars, letters);
    blockForm();
    checkString(inputString);
    saveInitialWebState();
}

function mergeArrays(vowels, consonants, allowedChars, letters) {
    //Fusionamos los arrays con tipos de elementos permitidos en uno nuevo.
    letters.push.apply(letters, vowels);
    letters.push.apply(letters, consonants);
    letters.push.apply(letters, allowedChars);
}

function blockForm() {
    //Bloqueamos los elementos del formulario
    submitButton.classList.add('disabled');
    clearButton.classList.remove('disabled');
    input.setAttribute("disabled", "");
}

function checkString(inputString) {
    var letterArray = inputString.split("");
    try {
        if (inputString == "") { //Valor vacío
            throw new Error("no puedes introducir el nombre en blanco.");
        } else if (!isNaN(inputString)) { //Número
            throw new Error("no puedes introducir números. Solo puedes introducir letras, espacios y/o guiones.");
        } else if (checkElementOfString(letterArray, letters) == false) { //Contiene caracteres no permitidos
            throw new Error("solo puedes introducir letras, espacios y/o guiones. Tu nombre tiene caracteres no permitidos.");
        } else {
            usernameContainer.innerHTML = inputString;
            inicializeMap(letterArray, letters);
        }
    } catch (error) {
        warning(error);
    }
}

function normalize(letterArray) {
    /*
    Cogemos el array y pasamos cada elemento a minúsculas y quitamos signos ortográficos.
    Una vez completado el proceso, llamamos a la función de iniciar el mapa de contadores.
    */
    var letterArrayLC = letterArray.map((val) => {
        return val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    });
    return letterArrayLC;
}

function checkElementOfString(letterArray, letters) {
    /*
    Comprobamos que el nombre tenga caracteres permitidos. 
    Si encuentra un elemento que no coincide, devuelve error y finaliza el programa.
    */
    var letterArrayLC = normalize(letterArray);
    var stopCheck = false;
    for (var index = 0; index < letterArrayLC.length && stopCheck == false; index++) {
        var allowed = letters.indexOf(letterArrayLC[index]);
        if (allowed != -1) {
            stopCheck = false; //seguimos recorriendo el array
        } else {
            stopCheck = true; //paramos el recorrido del array
            return false;
        }
    }
}

function inicializeMap(letterArray, letters) {
    var letterArrayLC = normalize(letterArray);
    //Inicializamos el objeto mapa de contadores a 0
    setMapToZero(elementsCounterMap, letters);
    countLetters(letterArrayLC, letters, elementsCounterMap);
}

function setMapToZero(elementsCounterMap, letters) {
    for (index = 0; index < letters.length; index++) {
        elementsCounterMap.set(letters[index], 0);
    }
    return elementsCounterMap;
}

function countLetters(letterArrayLC, letters, elementsCounterMap) {
    /*
    Comparamos cada elemento del array de caracteres con el array del nombre. 
    Por cada coincidencia, sumamos 1. Luego, devolvemos los contadores.
    */
    for (index = 0; index < letters.length; index++) {
        var counter = 0;
        for (indexJ = 0; indexJ < letterArrayLC.length; indexJ++) {
            if (letters[index] == letterArrayLC[indexJ]) {
                elementsCounterMap.set(letters[index], counter += 1);
            }
        }
    }
    returnCounters(elementsCounterMap);
}

function returnCounters(elementsCounterMap) {
    //Devolvemos todos los contadores
    returnVowelsCounters(elementsCounterMap);
    returnConsonantsCounters(elementsCounterMap);
    returnAllowedChars(elementsCounterMap);
}

function returnVowelsCounters(elementsCounterMap) {
    //Creamos los contadores de vocales
    returnLettersCounters(elementsCounterMap, vowels, vowelsContainer, totalVowelsContainer);
}

function returnConsonantsCounters(elementsCounterMap) {
    //Creamos los contadores de consonantes
    returnLettersCounters(elementsCounterMap, consonants, consonantsContainer, totalConsonantsContainer);
}

function returnLettersCounters(elementsCounterMap, lettersArray, lettersContainer, totalLettersContainer) {
    var total = 0;
    for (var [key, value] of elementsCounterMap.entries()) {
        for (index = 0; index < lettersArray.length; index++) {
            if (key === lettersArray[index] && value >= 1) {
                total += value;
                var container = lettersContainer;
                var totalContainer = totalLettersContainer;
                createCounters(key, value, total, container, totalContainer);
            }
        }
    }
}

function returnAllowedChars(elementsCounterMap) {
    //Creamos los contadores de caracteres permitidos y cambiamos los elementos a palabras legibles.
    var total = 0;
    for (var [key, value] of elementsCounterMap.entries()) {
        for (index = 0; index < allowedChars.length; index++) {
            if (key === allowedChars[index] && value >= 1) {
                var container = allowedCharsContainer;
                var totalContainer = totalAllowedCharsContainer;
                switch (key) {
                    case " ":
                        key = "Espacio";
                        total += value;
                        createCounters(key, value, total, container, totalContainer);
                        break;

                    case "-":
                        key = "Guión";
                        total += value;
                        createCounters(key, value, total, container, totalContainer);
                        break;
                }
            }
        }
    }
}

function createCounters(key, value, total, container, totalContainer) {
    //Creamos los contadores y los añadimos a cada sección que corresponda
    var element = document.createElement("p");
    createKeys(key, element);
    createValues(value, element);
    container.appendChild(element);
    totalContainer.innerHTML = "<strong>Total: " + total + "</strong>";
}

function createKeys(key, element) {
    //Añadimos cada clave del mapa
    var letterTxt = document.createTextNode(key + ": ");
    var letter = document.createElement("span");
    letter.appendChild(letterTxt);
    element.appendChild(letter);
}

function createValues(value, element) {
    //Añadimos el valor para cada clave del mapa
    var counterTxt = document.createTextNode(value + ".");
    var counter = document.createElement("span");
    counter.appendChild(counterTxt);
    element.appendChild(counter);
}

function warning(error) {
    //Comprobamos si existe o no el container para el warning.
    if (!!document.querySelector('#info')) {
        //Si existe, añadimos el error.
        appendError(error);
    } else {
        //Si no existe, creamos la div de info y añadimos el error.
        createError();
        appendError(error);
    }
}

function appendError(error) {
    //Cambiamos la clase de la alerta y añadimos el mensaje de error.
    var info = document.querySelector('#info');
    var infoTxt = document.querySelector('#infoTxt');
    info.classList.remove('alert-primary');
    info.classList.add('alert-danger');
    infoTxt.innerHTML = error;
}

function createError() {
    /*
    Si la div de info no existe, buscamos el elemento que le va después (el formulario),
    creamos la div con su id y clases tal y como está en el HTML, le
    añadimos su contenido y la insertamos antes del formulario.
    */
    var form = document.querySelector('#checkNameForm');
    var divInfo = document.createElement('div');
    divInfo.className = 'alert alert-primary alert-dismissible fade show shadow-sm';
    divInfo.setAttribute('id', 'info');
    divInfo.setAttribute('role', 'alert');
    divInfo.innerHTML =
        '<span id="infoTxt">A continuación, introduce tu <strong>nombre completo</strong> (nombre y apellidos) y contaremos cuántas veces aparece cada letra.</span>\
    <button type = "button" class="close" data-dismiss="alert" aria-label="Close">\
        <span aria-hidden="true">&times;</span>\
    </button>';
    form.parentNode.insertBefore(divInfo, form);
}

function saveInitialWebState() {
    //Guardamos en localStorage los valores iniciales de los containers de totales.
    localStorage.setItem("usernameInitial", username);
    localStorage.setItem("totalVowelsInitial", totalVowels);
    localStorage.setItem("totalConsonantsInitial", totalConsonants);
    localStorage.setItem("totalAllowdInitial", totalAllowed);
}

function onClear() {
    unblockForm();
    enterKeyUpCounter = 0; //Volvemos a reiniciar el contador de Enters a 0 para poder seguir usándolo.
    checkNameForm.reset();
    /*
    Comprobando la longitud del localStorage  previnimos de asignar valores
    vacíos a los párrafos por defecto dentro los contadores.
    */
    if (localStorage.length != 0) {
        setInitialWebState();
        localStorage.clear();
    }
    resetMap(elementsCounterMap, letters);
}

function unblockForm() {
    submitButton.classList.remove('disabled');
    clearButton.classList.add('disabled');
    input.removeAttribute("disabled", "");
    input.focus(); //devolvemos el foco al input
}

function setInitialWebState() {
    /*
    Al resetear, devolvemos los valores iniciales del localStorage guardados en saveInitialWebState()
    Y borramos los contadores de letras.
    */
    setInitialValues();
    deleteChilds(vowelsContainer);
    deleteChilds(consonantsContainer);
    deleteChilds(allowedCharsContainer);
}

function setInitialValues() {
    //Devolvemos valores iniciales localStorage
    var initialUsername = localStorage.getItem("usernameInitial");
    var initialTotalVowels = localStorage.getItem("totalVowelsInitial");
    var initialTotalConsonants = localStorage.getItem("totalConsonantsInitial");
    var initialTotalAllowed = localStorage.getItem("totalAllowdInitial");

    usernameContainer.innerHTML = initialUsername;
    totalVowelsContainer.innerHTML = initialTotalVowels;
    totalConsonantsContainer.innerHTML = initialTotalConsonants;
    totalAllowedCharsContainer.innerHTML = initialTotalAllowed;
}

function deleteChilds(countersContainer) {
    //Borramos contadores
    while (countersContainer.firstChild) {
        countersContainer.removeChild(countersContainer.firstChild);
    }
}

function resetMap(elementsCounterMap, letters) {
    setMapToZero(elementsCounterMap, letters);
}