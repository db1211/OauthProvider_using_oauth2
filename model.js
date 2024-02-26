const bcrypt = require('bcryptjs');


const crypto = require('crypto');

//  mock authorization code


function generateAuthorizationCode() {
    // return crypto.randomBytes(16)
    return crypto.randomBytes(16).toString('hex');  
    // console.log(crypto.randomBytes(16).toString('hex'))
}   


const dummyDB = {
    clients: [
        { clientId: 'application', clientSecret: 'secret', grants: ['authorization_code'],
         redirectUris: ['http://localhost/callback'] }],
    tokens: [],
    users: [
        { id: '1', username: 'user', password: bcrypt.hashSync('password', 8) }
    ],
    authorizationCodes: []
};
const authorizationCode = generateAuthorizationCode();
console.log('authorizationCode', authorizationCode);




const mockAuthCodeData = {
    code: authorizationCode,
    clientId: 'application',
    redirectUri: 'http://localhost/callback',
    userId: '1', 
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
  };
  
  dummyDB.authorizationCodes.push(mockAuthCodeData);
  console.log("dummyDB",dummyDB)





  
const model = {
    // getClient(clientId, clientSecret, callback) {
    //     const client = dummyDB.clients.find(client => client.clientId === clientId && (clientSecret === null || client.clientSecret === clientSecret));
    //     console.log("getClient" ,clientId,clientSecret)
    //     callback(null, client || false);
    // },
   
    getClient(clientId, clientSecret, callback) {
        // const client = dummyDB.clients.find(c => c.clientId === clientId && (clientSecret === null || c.clientSecret === clientSecret));
        const client = dummyDB.clients.find(c => c.clientId === clientId && (!clientSecret || c.clientSecret === clientSecret));
        if (!client) {
            return callback(new Error("Client not found"), null);
        }
        
        const clientObject = {
            id: client.clientId,
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            grants: client.grants,
            redirectUris: client.redirectUris,
           
        };
        callback(null, clientObject);
    },
    // getClient(clientId, clientSecret, callback) {
    //     const client = { // Simplify for testing purposes
    //         id: clientId,
    //         clientId: clientId,
    //         clientSecret: clientSecret,
    //         grants: ['authorization_code'], // Assuming 'authorization_code' grant is used
    //         redirectUris: ['http://localhost/callback'],
    //     };
    //     callback(null, client);
    // },
    
    
    


    getAccessToken(bearerToken, callback) {
        const accessToken = dummyDB.tokens.find(token => token.accessToken === bearerToken);
        if (!accessToken) return callback(null, false);
        console.log("getAccessToken",accessToken);
        callback(null, accessToken);
    },
    saveToken(token, client, user, callback) {


        if (!token.accessToken || !client.id || !user.id) {
            return callback(new Error("Missing parameter"), null);
        }
        
        dummyDB.tokens.push({
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            clientId: client.clientId,
            userId: user.id,
            // Include scope if it's used in your application
            scope: token.scope,
        });
        
        return callback(null, {
            ...token,
            client: client,
            user: user,
        });
    },
        // console.log("saveToken", token, client, user);
       
        // const tokenData = {
        //     accessToken: token.accessToken,
        //     accessTokenExpiresAt: token.accessTokenExpiresAt,
        //     refreshToken: token.refreshToken,
        //     refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        //     clientId: client.clientId,
        //     userId: user.id,
        // };
        // dummyDB.tokens.push(tokenData);
        // callback(null, tokenData);
    // },
    

    getAuthorizationCode(code, callback) {
       
         const authCode = dummyDB.authorizationCodes.find(authCode => authCode.code === code);
        if (!authCode) {
            // No authorization code 
            return callback(new Error("Authorization code not found"), null);
        }
        
        
        const client = dummyDB.clients.find(client => client.clientId === authCode.clientId);
        if (!client) {
            // no client
            // console.log("no client found");
            return callback(new Error("Client not found"), null);
        }
        
        
        const user = dummyDB.users.find(user => user.id === authCode.userId); //check with auth code
        if (!user) {
            // No user found 
            return callback(new Error("User not found"), null);
        }
        
        
        const extendedAuthCode = {
            ...authCode,
            client: {
                id: client.clientId,
                clientId: client.clientId,
                clientSecret: client.clientSecret,
                grants: client.grants,
                redirectUris: client.redirectUris,
            },
            user: {
                id: user.id,
            },
        };

        console.log("extendedAuthCode",extendedAuthCode)
        return callback(null, extendedAuthCode);
    },
    
    
    
    

    saveAuthorizationCode(code, client, expires, user, callback) {
        console.log("saveAuthorizationCode",code)
        const authCode = {
            authorizationCode: code.authorizationCode,
            expiresAt: expires,
            clientId: client.clientId,
            userId: user.id,
            redirectUri: code.redirectUri
        };
        dummyDB.authorizationCodes.push(authCode);
        callback(null, authCode);
    },

    revokeAuthorizationCode(code, callback) {
        console.log("revokeAuthorizationCode")
        const idx = dummyDB.authorizationCodes.findIndex(authCode => authCode.authorizationCode === code.authorizationCode);
        if (idx === -1) return callback(null, false);
        dummyDB.authorizationCodes.splice(idx, 1);
        callback(null, true);
    },

    getUser: function(userId, callback) {
        console.log("getUser")
        const user = dummyDB.users.find(user => user.id === userId);
        if (!user) {
            return callback(new Error("User not found"), null);
        }
        callback(null, user);
    },
    
};

module.exports = model;
    
    //oauth flow

//getClient: Validates the client's credentials.
// getAccessToken: Retrieves an existing access token from the database.
// saveToken: Saves a new token object in the database.
// getAuthorizationCode: Retrieves an authorization code.
// saveAuthorizationCode: Saves a new authorization code object in the database.
// revokeAuthorizationCode: Removes an authorization code from the database.
// getUser: Retrieves a user object from the database.//