import {APIGatewayTokenAuthorizerEvent, AuthResponse, Context, PolicyDocument} from 'aws-lambda';

//This library checks if the token is indeed generated from the specified user pool and if the token is expired. 
//The library also supports user pool groups. We can see what group the user belongs to. 
const {CognitoJwtVerifier} = require("aws-jwt-verify")
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id", //can be "id" or "access". "id" token will contains ome information about the user
    clientId: COGNITO_WEB_CLIENT_ID  //We can create multiple clients for the same user pool. 
})

const generatePolicy = (principalId, effect, resource) : AuthResponse => {
    var authResponse = {} as AuthResponse;
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
export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context, cb) => {
    var token = event.authorizationToken;
    try {
        const payload = await jwtVerifier.verify(token);
        console.log(payload);
        cb(null, generatePolicy("user", "allow", event.methodArn))
    }  catch (err) {
        cb(null, "Error: Invalid token")
    } 
    
    // switch (token) {
    //     case "allow":
    //         cb(null, generatePolicy("user", "Allow", event.methodArn))
    //     case "deny":
    //         cb(null, generatePolicy("user", "Deny", event.methodArn))
    //     default:
    //         cb(null, "Error: Invalid token")
    // }
}