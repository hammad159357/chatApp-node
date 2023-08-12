const successResponse = (msg='', data={} ) => ( { message: msg, data: data, success: true} );
const errorResponse = (msg='', data={}) => ({ message: msg, data: data, success: false});

module.exports = {
    successResponse,
    errorResponse
}