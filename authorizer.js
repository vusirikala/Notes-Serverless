
const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        authResponse.policyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke"
                }
            ]
        };
    }
    //context is the additional information the target lambda function may need.    
    authResponse.context = {
        foo: "bar"
    }
    console.log(authResponse);
    return authResponse;
}

//lamdba authorizer
module.exports.handler = (event, context, cb) => {
    var token = event.authorizationToken;
    switch (token) {
        case "allow":
            cb(null, generatePolicy("user", "Allow", event.methodArn))
        case "deny":
            cb(null, generatePolicy("user", "Deny", event.methodArn))
        default:
            cb(null, "Error: Invalid token")
    }
}