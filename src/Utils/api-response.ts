class APIResponse {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;

    constructor(
        statusCode: number,
        message: string,
        data: any = null,
        success: boolean = true
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success;
    }

    // Static factory method
    static create(
        statusCode: number,
        message: string,
        data: any = null,
        success: boolean = true
    ): APIResponse {
        return new APIResponse(statusCode, message, data, success);
    }

    // Method to send the response
    format(): { statusCode: number, message: string, data: any, success: boolean } {
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
        };
    }
}

export default APIResponse;