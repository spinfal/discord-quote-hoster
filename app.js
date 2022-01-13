"use strict";

// modules
const helmet = require('helmet');
const express = require('express');
const upload = require('express-fileupload');
const editJsonFile = require("edit-json-file");
const { v4: uuidv4 } = require('uuid');

// variables
const { port, domain, filetypes } = require('./config');
const app = express();
// const db = new JSONdb('data/accounts.json');
// const users = db.get('users');
// const metadata = new JSONdb('data/metadata.json');
// const filenames = new JSONdb('data/filenames.json');
const db = editJsonFile(`${__dirname}/data/accounts.json`);
const files = editJsonFile(`${__dirname}/data/files.json`);
const invites = editJsonFile(`${__dirname}/data/invites.json`);

// set views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// static files
app.use(helmet());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/imgs', express.static(__dirname + 'public/imgs'));

// admin routes
app.get('/bruh', (req, res) => {
    if (getCookie(req.headers.cookie, 'uuid') !== config.owner) return res.redirect(403, '/');
    res.render('bruh');
});

app.get('/api/create/invites', (req, res) => {
    if (getCookie(req.headers.cookie, 'uuid') !== config.owner) return res.redirect(403, '/');
    const newInvite = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    invites.append('invites', newInvite);
    invites.save();
    return res.status(200).send(newInvite);
});

// frontend routes
app.get('', (req, res) => {
    const uuid = getCookie(req.headers.cookie, 'uuid');
    // const username = getCookie(req.headers.cookie, 'username');
    // const password = unescape(getCookie(req.headers.cookie, 'password'));
    const UN = db.get("users").find(u => u.id === uuid);
    if (UN?.id === uuid) {
        return res.render('index', {
            loggedIn: `You are already logged in as <strong>${UN?.username}</strong>. You may open the <a href="/quotes">quotes page</a>.`,
        });
    }

    res.render('index', { loggedIn: 'Please login to continue' });
});

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/quotes', (req, res) => {
    const uuid = getCookie(req.headers.cookie, 'uuid');
    // const username = getCookie(req.headers.cookie, 'username');
    // const password = unescape(getCookie(req.headers.cookie, 'password'));
    const UN = db.get("users").find(u => u.id === uuid);
    
    if (UN?.id === uuid) {
        let fileNames = [];

        files.get("files")?.forEach(data => {
            fileNames.push({name: data.name, path: data.path, author: data.author, quoted: data.quoted, date: data.date});
        });

        res.render('quotes', {
            username: UN.username,
            quotes: fileNames
        });
    } else {
        return res.redirect(401, '/');
    }
});

app.get('/quotes/private', (req, res) => {
    const uuid = getCookie(req.headers.cookie, 'uuid');
    // const username = getCookie(req.headers.cookie, 'username');
    // const password = unescape(getCookie(req.headers.cookie, 'password'));
    const UN = db.get("users").find(u => u.id === uuid);
    
    if (UN?.id === uuid) {
        let fileNames = [];

        UN.privateFiles?.forEach(data => {
            fileNames.push({name: data.name, path: data.path, quoted: data.quoted, date: data.date});
        });

        res.render('private-quotes', {
            username: UN.username,
            quotes: fileNames
        });
    } else {
        return res.redirect(401, '/');
    }
});

// backend routes
app.post('/api/login', express.json(), (req, res) => {
    const { event, username, password } = req.body;
    if (!event.isTrusted) return res.status(418).send('bruh');
    if (!event && !username && !password) res.status(400).send('Required fields are missing.');

    const UN = db.get("users").find(u => u.username === username);

    if (UN?.username === username && UN?.password === password) {
        res.cookie('uuid', UN.id, { maxAge: 9000000 });
        // res.cookie('username', UN.username, { maxAge: 9000000 });
        // res.cookie('password', UN.password, { maxAge: 9000000 });
        res.sendStatus(204);
    } else {
        return res.status(401).send('Invalid account details.');
    }
});

app.post('/api/register', express.json(), (req, res) => {
    const { username, password, invite } = req.body;
    
    if (username === "" || password === "" || invite === "") return res.status(400).send('You are missing required fields');
    if (!/^[a-z0-9_-]{3,10}$/i.test(username)) return res.status(400).send('Username must be between 3 and 10 characters long and contain only letters, numbers, underscores and dashes.');
    if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/i.test(password)) return res.status(400).send('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character.');
    if (!invites.get("invites").includes(invite)) return res.status(400).send('Invalid invite code');

    const UN = db.get("users").find(u => u.username === username);
    if (UN?.username === username) return res.status(409).send('Username already exists');


    const newUser = {
        id: uuidv4(),
        username: username,
        password: password
    };

    db.get("users").push(newUser);
    const arr = invites.get("invites");
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == invite) {
            arr.splice(i, 1);
        }
    }
    db.save();
    invites.save();

    res.cookie('uuid', newUser.id, { maxAge: 9000000 });
    // res.cookie('username', newUser.username, { maxAge: 9000000 });
    // res.cookie('password', newUser.password, { maxAge: 9000000 });
    res.sendStatus(204);
});

// app.get('/api/quotes', (req, res) => {
//     updateImageList();
//     return res.status(200).send(fileList);
// });

app.post('/api/upload', upload(), (req, res) => {
    if (!req.files) return res.status(400).send('No files were provided.');
    if (!filetypes.includes(req.files.file.mimetype)) return res.status(400).send('Invalid file type.');

    const isPrivate = req.body.private;
    const fileName = `${Date.now()}-${req.files.file.name}`;
    const path = `imgs/${fileName}`;
    const uuid = getCookie(req.headers.cookie, 'uuid');
    const UN = db.get("users").find(u => u.id === uuid);

    if (UN?.id === uuid) {
        if (isPrivate === 'true') {
            req.files.file.mv(__dirname + `/public/private-content/${path}`, (err) => console.error(err));
            UN.privateFiles.push({ "name": fileName, "quoted": req.body.quoted || 'Not provided', "date": new Date(parseInt(fileName.split('-')[0])), "path": `${domain}/private-content/${path}` });
            db.save();
        } else {
            req.files.file.mv(__dirname + `/public/${path}`, (err) => console.error(err));
            files.append("files", { "name": fileName, "author": UN?.username || 'Unknown author', "quoted": req.body.quoted || 'Not provided', "date": new Date(parseInt(fileName.split('-')[0])), "path": `${domain}/imgs/${fileName}` });
            files.save();
        }
        // metadata.set(fileName, UN?.username);
        // metadata.set(`${fileName}-quoted`, req.body.quoted);
        // filenames.set(fileName, new Date());
        return res.status(200).send('<div style="font-family: Verdana"><h1>Quote uploaded successfully.</h1><p><a href="/quotes">View the quotes page</a>.</p><p><a href="/quotes/private">View your private quotes</a>.</p></div>');
    } else {
        return res.status(401).send('Unauthorized.');
    }
});

// app.delete('/api/delete', express.json(), (req, res) => {
//     if (!req.body.file) return res.status(400).send('No file name provided.');

//     if (UN?.id === uuid) {
//         if (filenames.has(req.body.file)) {
//             filenames.delete(req.body.file);
//             files.save();
//             return res.sendStatus(204);
//         } else {
//             return res.status(404).send('File not found.');
//         }
//     } else {
//         return res.status(401).send('Unauthorized.');
//     }
// });

app.listen(port, () => {
    console.clear();
    console.log('Server is listening on port ' + port)
});


// functions

function getCookie(cookies, name) {
    if (cookies === undefined) return null;
    const cookie = cookies.split('; ').find(c => c.startsWith(name));
    if (!cookie) return null;
    return cookie.split('=')[1];
}


// files.json structure
// {
//     "files": [
//          {
//              "name": fileName,
//              "author": UN?.username || 'Unknown author',
//              "quoted": req.body.quoted || 'Not provided',
//              "date": new Date(parseInt(fileName.split('-')[0])),
//              "path": `${domain}/imgs/${fileName}`
//          }
//     ]
// }