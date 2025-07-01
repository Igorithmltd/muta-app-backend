const Validator = require('validatorjs')

Validator.register(
    'object',
    function(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    'The :attribute must be an object.'
  );
  

function validateData(body, rules, messages){
    const result = new Validator(body, rules, messages)
    if(result.fails()){
        const error_object = result.errors.all()
        const first_key = Object.keys(result.errors.all())[0]

        const error_message = error_object[first_key][0]
        return {success: false, data:  error_message}
    }
    return {success: true, data: null}
}


module.exports = validateData