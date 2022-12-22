'use strict';
const { DataBrew } = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

module.exports.createNote = async (event, context, cb) => {   //cb means callback. We use callback to send response to client
  console.log("Create note")
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

module.exports.getNote = async (event, context, cb) => {
  const id = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {

  } catch (err) {
    cb(null, { 
      statusCode: 500,
      body: JSON.stringify(err.message)
    })
  }
  return {
    statusCode: 200,
    body: JSON.stringify("Your note is " + id)
  }
}

module.exports.updateNote = async (event, context, cb) => {
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
