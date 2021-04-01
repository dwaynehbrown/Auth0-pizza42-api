
module.exports = function (req, res, next) {

    var whitelist = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://build-dwaynehbrown.vercel.app'
    ];

    var origin = req.header('origin') || req.header('Origin');

    console.log('------------------ CORS --------------------');
    console.log('for host: ', origin)
    // console.log (req.headers);



    if (whitelist.indexOf(origin) != -1) {

        if (req.method === 'OPTIONS') {
            res.status(200).end()
            return;
        }

        console.log('CORS ALLOW ', origin);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, authorization");



        next();
    } else {
        console.log('CORS DISALLOW');
        res.header('Access-Control-Allow-Methods', 'OPTIONS');
        res.header('Access-Control-Allow-Origin', '');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
        )
        res.status(401).send(
            {
                reason: 'requests to this resource are not allowed from ' + req.header('origin')
            }
        );
    }
};
