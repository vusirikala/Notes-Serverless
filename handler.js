'use strict';
const { DataBrew } = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({
  region: 'us-east-1', 
  maxRetries: 3,        //If dynamodDB has some errors, then sdk retries with exponential backoff with 50ms, 100ms, 200ms, ... gap. Maximum retries is 10. 
  httpOptions: {
    timeout: 5000       //Setting MongoDB timeout period to 5 seconds. After 5 seconds, sdk will retry the request. 
  }
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

module.exports.createNote = async (event, context, cb) => {   //cb means callback. We use callback to send response to client
  // Node js maintains an event queue. 
  // The lamdba function stops only after the event queue is empty. 
  // Waiting for API calls is one of the events stored in the event queue. 
  // By setting callbackWaitsForEmptyEventLoop to false, we are specifying not to wait until event queue is empty
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);    //event.body is stringified. 
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: 'attribute_not_exists(notesId)'  //This condition is always checked before inserting the document.  
    }
    // The lambda function makes a http request to dynamodb to perform this operation. 
    await documentClient.put(params).promise();   //AWS allows us to call put method as a promise
    cb(null, {            //Second argument contains response in the {statusCode, body} format
      statusCode: 201,
      body: JSON.stringify(data)
    })
  } catch (err) {
      cb(null, {            
        statusCode: 500,
        body: JSON.stringify(err.message)
      })
  }
}

module.exports.getAllNotes = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    }
    const notes = await documentClient.scan(params).promise();
    cb(null, {
      statusCode: 200,
      body: JSON.stringify(notes)
    })
  } catch (err) {
    cb(null, { 
      statusCode: 500,
      body: JSON.stringify(err.message)
    })
  }
}

module.exports.updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId }, 
      UpdateExpression: 'set #title = :title, #body = :body',  //The variables used are just placeholders. Their values are defined in ExpressionAttributeNames and ExpressionAttributeValues. We used placebolders instead of original names to avoid conflicts with reserved dynamodb names. 
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    await documentClient.update(params).promise();
    cb(null, {           
      statusCode: 200,
      body: JSON.stringify(data)
    })
  } catch (err) {
    cb(null, {           
      statusCode: 500,
      body: JSON.stringify(err.message)
    })
  }

  console.log("update note ", id)
  return {
    statusCode: 200,
    body: JSON.stringify("Your note " + id + " is updated")
  }
}

module.exports.deleteNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const notesId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId }, 
      ConditionExpression: 'attribute_exists(notesId)'
    }
    await documentClient.delete(params).promise();
    cb(null, {
      statusCode: 200,
      body: "Deleted " + notesId
    })
  } catch (err) {
    cb(null, {
      statusCode: 500,
      body: JSON.stringify(err.message)
    })
  }
}

// export {createNote, getNote, updateNote, deleteNote};

// module.exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
