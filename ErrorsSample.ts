// ----------  With Official Error Handler ---------
// when manually throw
const whenUserThrow = {
  message: 'No data found with this id',
  name: 'BadRequestError'
};

//Issues
// 1. Don't handle DB error'

// ------------ With Custom Error Handler ----------

// when no primary key passed
const DatabaseError = {
  error: {
    name: 'ValidationError',
    message:
      'Id is a required property but has no value when trying to save document'
  },
  message:
    'Id is a required property but has no value when trying to save document'
};

// when manually throw using http-errors
const WhenUserThrow = {
  error: {
    message: 'No data found with this id'
  },
  message: 'No data found with this id'
};

//Issues
// 1. No error shown neither data not saved on DB.
//    Can be fixed by adding type safety on Table Name.


// First Block Raw Error
// const firstBlockRawError = 



const data = {
  status: 'error',
  data: {
    messages: [{text: 'title requierd', code: 'required'}, ] 
  }
}