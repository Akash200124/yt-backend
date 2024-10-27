class apiError extends Error {
    constructor(statusCode, message = "Something went wrong",error = [],stack= "") {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.success = false ;
        this.data = null ; //what is this learn 
        this.errors = error;

        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export  {apiError};