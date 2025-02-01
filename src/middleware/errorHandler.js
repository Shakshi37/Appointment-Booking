const handleMongoError = (err) => {
    if (err.name === 'MongoServerError') {
        switch (err.code) {
            case 11000:
                return {
                    message: 'Duplicate key error: A record with this key already exists.',
                    status: 400,
                };
            case 18:
                return {
                    message: 'Authentication failed: Check your username and password.',
                    status: 401,
                };
            default:
                return {
                    message: `MongoDB Server Error: ${err.message}`,
                    status: 500,
                };
        }
    } else if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return {
            message: `Validation Error: ${messages.join(', ')}`,
            status: 400,
        };
    } else if (err.name === 'CastError') {
        return {
            message: `Invalid ${err.path}: ${err.value}`,
            status: 400,
        };
    } else {
        return {
            message: `Unknown Error: ${err.message}`,
            status: 500,
        };
    }
};

module.exports = handleMongoError;
