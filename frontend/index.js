const { app, BrowserWindow } = require('electron');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

//for getting data from rest api
async function uploadStudent() {
    const form = new FormData();
    form.append
}


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadFile(path.join(__dirname, 'views/home.html'));
}

app.whenReady().then(createWindow);
