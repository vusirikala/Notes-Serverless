'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});

module.exports.createNote = async (event, context, cb) => {   //cb means callback. We use callback to send response to client
  console.log("Create note")
  let data = JSON.parse(event.body);    //event.body is stringified. 
  try {
    const params = {
      TableName: 'notes',
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
      cb(null, {            //
        statusCode: 500,
        body: JSON.stringify(err.message)
      })
  }

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(
  //     {
  //       message: "Go Serverless v3.0! Your function executed successfully!",
  //     },
  //     null,
  //     2
  //   ),
  // };
}

module.exports.getNote = async (event) => {
  const id = event.pathParameters.id;
  console.log("get note ", id)
  return {
    statusCode: 200,
    body: JSON.stringify("Your note is " + id)
  }
}

module.exports.updateNote = async (event) => {
  const id = event.pathParameters.id;
  console.log("update note ", id)
  return {
    statusCode: 200,
    body: JSON.stringify("Your note " + id + " is updated")
  }
}

module.exports.deleteNote = async (event) => {
  const id = event.pathParameters.id;
  console.log("delete note ", id)
  return {
    statusCode: 200,
    body: JSON.stringify("Your note " + id + " is deleted")
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
