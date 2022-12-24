'use strict';
const axios = require('axios');
const _ = require('lodash');

const makeHttpRequest = async (path, method, options) => {
   let root = process.env.TEST_ROOT;
   let url = `${root}/${path}`;
   let body = _.get(options, "body");
   let idToken = _.get(options, "idToken");
   console.log("Making " + method + " HTTP request to " + url + " with body " + body)
   try {
      const response = await axios({
         method,
         url,
         data: body,
         headers: {'Authorization': idToken}
      })
      return {
         statusCode: response.status,
         body: response.body
      }
   } catch (err) {
      return {
         statusCode: err.status,
         body: null
      }
   }
}

exports.we_invoke_createNote = (options) => {
   let response = makeHttpRequest("notes", "POST", options);
   return response;
}

exports.we_invoke_updateNote = (options) => {
   let response = makeHttpRequest(`notes/${options.noteId}`, "PUT", options);
   return response;
}

exports.we_invoke_deleteNote = (options) => {
   let response = makeHttpRequest(`notes/${options.noteId}`, "DELETE", options);
   return response;
}