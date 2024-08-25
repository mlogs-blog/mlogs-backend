class CustomError extends Error {
    statusCode: number;
    data: any;
    success: boolean;
    errors: any[];

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: any[] = [],
        stack = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        // If a stack trace is provided, use it; otherwise, capture the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            // Capture the stack trace, setting the constructor's prototype as the origin
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Method to format the error
    format(): { statusCode: number, message: string, errors: any[], success: boolean } {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            success: this.success,
        };
    }
}

export default CustomError;