let config;
let files;
function init(appConfig, filesObject){
    config = appConfig;
    files = filesObject;

    return {
        reqFilter,
        clientFilter
    }
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

    console.log(`Recived IP : ${reqIP}`);

    // Check if the origin IP is accepted for that method
    if(config.origin[method]?.includes(reqIP)){
        console.log("IP filter passed");
        next();
    }
    else{
        res.status(403).send('Forbidden: Access is denied.');
        console.log("IP filter not passed");
    }
}

function clientFilter(req, res, next){

    // Check that the Client-Token was provided
    if(!req.headers['Client-Token']){
        res.status(403).send({ message : 'Forbidden'});
        return;
    }

    next();
}

module.exports = init;