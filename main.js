// Zmienna do przechowywania plików
let files = []; 
let selectedFiles = new Set(); // Zestaw do przechowywania zaznaczonych plików (przechowujemy indeksy)

// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDs3rhvEoXsP740sRyAh2aI8fj-OXhnWe0",
    authDomain: "plikiprojekt-2a5fc.firebaseapp.com",
    databaseURL: "https://plikiprojekt-2a5fc-default-rtdb.firebaseio.com",
    projectId: "plikiprojekt-2a5fc",
    storageBucket: "plikiprojekt-2a5fc.appspot.com",
    messagingSenderId: "599280046815",
    appId: "1:599280046815:web:b621520264e21b77720f6a"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);

// Referencje do Firebase Storage i Realtime Database
const storage = firebase.storage();
const database = firebase.database();

const correctUsername = "vlmo";
const correctPassword = "12345";

// Funkcja do załadowania plików z Realtime Database
function loadFiles() {
    const filesRef = database.ref('files');
    filesRef.once('value').then((snapshot) => {
        files = [];
        snapshot.forEach((childSnapshot) => {
            const file = childSnapshot.val();
            files.push({ id: childSnapshot.key, ...file });
        });
        displayFiles();
    });
}

// Funkcja do zapisywania plików w Realtime Database
function saveFileToDatabase(file) {
    const filesRef = database.ref('files');
    const newFileRef = filesRef.push();
    return newFileRef.set(file);
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
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                date: now.toLocaleDateString(), // Formatujemy datę
                extension: fileExtension,
                content: event.target.result // Zakodowany plik w Base64
            };

            // Zapisujemy plik do Firebase Realtime Database
            saveFileToDatabase(fileData).then(() => {
                console.log('Plik został zapisany w bazie danych.');
                loadFiles(); // Ładujemy pliki
            }).catch((error) => {
                console.error('Błąd zapisywania pliku w bazie danych:', error);
            });
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
    selectedFiles.forEach((index) => {
        let file = files[index];
        deleteFile(file.id, file.name);
    });

    selectedFiles.clear(); // Czyścimy zaznaczone pliki
    loadFiles(); // Odświeżamy listę plików
}

// Funkcja do usuwania pliku z Firebase Storage i Realtime Database
function deleteFile(fileId, fileName) {
    if (confirm(`Czy na pewno chcesz usunąć plik ${fileName}?`)) {
        const storageRef = storage.ref('files/' + fileName);
        
        // Próba usunięcia pliku z Firebase Storage
        storageRef.delete().then(function() {
            // Plik usunięty z Firebase Storage, teraz usuwamy wpis z bazy danych
            database.ref('files/' + fileId).remove().then(() => {
                console.log(`Plik ${fileName} został usunięty z Firebase Storage i Realtime Database.`);
                loadFiles(); // Odśwież listę po usunięciu
            }).catch(function(error) {
                console.error('Błąd podczas usuwania wpisu z bazy danych:', error);
            });
        }).catch(function(error) {
            console.error('Błąd usuwania pliku z Firebase Storage:', error);

            // Jeśli plik nie istnieje w Firebase Storage (błąd 404), usuwamy go z bazy danych
            if (error.code === 'storage/object-not-found') {
                alert(`Plik ${fileName} nie istnieje w Firebase Storage. Usuwanie wpisu z bazy danych.`);
                
                // Usuwamy plik z Firebase Realtime Database
                database.ref('files/' + fileId).remove().then(() => {
                    console.log(`Wpis pliku ${fileName} został usunięty z bazy danych.`);
                    loadFiles(); // Odśwież listę po usunięciu
                }).catch(function(error) {
                    console.error('Błąd podczas usuwania wpisu z bazy danych:', error);
                });
            }
        });
    }
}

// Funkcja logowania
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === correctUsername && password === correctPassword) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
        loadFiles(); // Ładujemy pliki po zalogowaniu
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Funkcja wylogowywania
function logout() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
}

// Nasłuchujemy na formularz logowania
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});
