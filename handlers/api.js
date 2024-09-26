const ezdn = require('ezdeepnest');

let config;
let files;
function init(appConfig, filesObject){
    config = appConfig;
    files = filesObject;
    return {
        serve,
        cache,
        restart
    }
}

function serve(req, res){
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    
    // Get client token
    const clientToken = req.headers['client-token'];

    // Check if file is loaded
    const clientFiles = files[clientToken];
    const file = ezdn.get(clientFiles, req.path);

    console.log(files);

    if(file){
        res.write(file);
        res.end();
    }
    else{
        res.status(404);
        res.end();
    }
}

function cache(req, res){
    res.status(201);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    
    // Get client token
    const clientToken = req.headers['client-token'];

    // Check if req.body.content is defined
    if (!req.body?.content) {
        res.status(400).send({ message: 'Bad Request: Content is required' });
        return;
    }
    
    // Create client workspace if not exists
    files[clientToken] = files[clientToken] ? files[clientToken] : {};

    // Save file
    const clientFiles = files[clientToken];
    ezdn.set(clientFiles, req.path, req.body.content);
    
    console.log(files);

    // Send a response confirming the save
    res.send({ message: 'File saved successfully', path : req.path });
}

function restart(req, res){ 

    // Get client token 
    const clientToken = req.headers['client-token'];

    // Uncache all files for that client
    delete files[clientToken];

    // Acknowledge restart request
    res.status(200).send({ message : 'File cache cleared.'}); 
}

module.exports = init;