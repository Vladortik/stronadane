let files = []; // Tablica do przechowywania przesłanych plików
let selectedFiles = new Set(); // Zestaw do przechowywania zaznaczonych plików (przechowujemy indeksy)
const correctUsername = "vlmo";
const correctPassword = "12345";

// Funkcja do załadowania plików z LocalStorage
function loadFilesFromLocalStorage() {
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles'));
    if (storedFiles) {
        files = storedFiles;
        displayFiles(); // Wyświetlamy pliki na liście
    }
}

// Funkcja do zapisywania plików w LocalStorage
function saveFilesToLocalStorage() {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
}

// Funkcja do przesyłania pliku
function uploadFile() {
    let fileInput = document.getElementById('fileInput');
    let file = fileInput.files[0]; // Pobieranie pliku

    if (file) {
        const reader = new FileReader();
        const now = new Date(); // Pobieramy datę dodania pliku

        reader.onload = function(event) {
            const fileExtension = file.name.split('.').pop(); // Pobieramy rozszerzenie pliku
            files.push({
                name: file.name,
                size: file.size,
                type: file.type,
                date: now.toLocaleDateString(), // Formatujemy datę
                extension: fileExtension,
                content: event.target.result // Zakodowany plik w Base64
            });
            saveFilesToLocalStorage(); // Zapisujemy zaktualizowaną listę do LocalStorage
            displayFiles(); // Wyświetlanie listy plików
        };

        reader.readAsDataURL(file); // Odczytujemy plik jako zakodowany Base64
    }
}

// Funkcja do wyświetlania listy plików
function displayFiles() {
    let fileListTable = document.getElementById('fileListTable');
    fileListTable.innerHTML = ''; // Czyścimy zawartość

    files.forEach((file, index) => {
        let fileRow = document.createElement('tr');
        fileRow.innerHTML = `
            <td>${file.name}</td>
            <td>${file.date}</td>
            <td>${file.extension}</td>
        `;

        // Kliknięcie na wiersz pliku
        fileRow.addEventListener('click', function() {
            if (selectedFiles.has(index)) {
                selectedFiles.delete(index); // Odznacz plik
                fileRow.classList.remove('selected'); // Usuwamy kolor zaznaczenia
            } else {
                selectedFiles.add(index); // Zaznacz plik
                fileRow.classList.add('selected'); // Dodajemy kolor zaznaczenia
            }
        });

        fileListTable.appendChild(fileRow);
    });
}

// Funkcja do pobierania zaznaczonych plików
function downloadSelectedFiles() {
    selectedFiles.forEach((index) => {
        let file = files[index];
        let a = document.createElement('a');
        a.href = file.content; // Pobieranie zakodowanego pliku w Base64
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// Funkcja do usuwania zaznaczonych plików
function deleteSelectedFiles() {
    files = files.filter((file, index) => {
        return !selectedFiles.has(index); // Zatrzymujemy tylko te pliki, które NIE są zaznaczone
    });

    selectedFiles.clear(); // Czyścimy zaznaczone pliki
    saveFilesToLocalStorage(); // Aktualizujemy LocalStorage po usunięciu
    displayFiles(); // Odświeżamy listę plików
}

// Funkcja do logowania
function login(username, password) {
    if (username === correctUsername && password === correctPassword) {
        // Pokaż główną stronę i ukryj ekran logowania
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-container").style.display = "block";
        loadFilesFromLocalStorage(); // Załaduj pliki po zalogowaniu
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
}

// Obsługa formularza logowania
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Zapobiegamy domyślnemu zachowaniu formularza
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    login(username, password); // Próbujemy się zalogować
});

// Funkcja do wylogowania
function logout() {
    document.getElementById("main-container").style.display = "none";
    document.getElementById("login-container").style.display = "block";
    selectedFiles.clear(); // Czyścimy zaznaczone pliki
}

// Ładowanie strony - sprawdzamy, czy użytkownik jest już zalogowany
window.onload = function() {
    if (sessionStorage.getItem('isLoggedIn')) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-container").style.display = "block";
        loadFilesFromLocalStorage();
    }
};
