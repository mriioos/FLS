let config;
let files;
function init(appConfig, filesObject){
    config = appConfig;
    files = filesObject;

    return {
        printInfo,
        reqFilter,
        clientFilter
    }
}

/**
 * Debug function that gathers info about the arriving request
 * @param {object} req Object provided by nodejs/express
 * @param {object} res Object provided by nodejs/express
 * @param {function} next Function to execute
 */
function printInfo(req, res, next){
    console.log('-');
    console.log(`${req.method} ${req.path}`);
    console.log(`Recived IP : ${(req.ip || req.connection.remoteAddress)}`);

    next();
}

/**
 * Function to filter incoming requests at network level
 * @param {object} req Object provided by nodejs/express
 * @param {object} res Object provided by nodejs/express
 * @param {function} next Function to execute
 */
function reqFilter(req, res, next){

    // Get method and origin IP
    const method = req.method.toLowerCase();

    const reqIP = (req.ip || req.connection.remoteAddress).toLowerCase();

    // Check if the origin IP is accepted for that method
    if(config.origin[method]?.includes(reqIP)){
        console.log("IP filter passed");
        next();
    }
    else{
        res.status(403).send('Forbidden: IP access is denied.');
        console.log("IP filter not passed");
    }
}

function clientFilter(req, res, next){

    // Check that the client-token was provided
    if(!req.headers['client-token']){
        res.status(401).send({ message : 'Unidentified: Client-Token not found'});
        return;
    }

    next();
}

module.exports = init;