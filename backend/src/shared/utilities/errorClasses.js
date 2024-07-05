class BadRequestException extends Error {
    constructor(message) {
      super(message);
      this.name = 'BadRequestException';
      this.statusCode = 400;
    }
  }
  
  class NotFoundException extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundException';
      this.statusCode = 404;
    }
  }
  
  class BadGatewayException extends Error {
    constructor(message) {
      super(message);
      this.name = 'BadGatewayException';
      this.statusCode = 502; 
    }
  }

  class ConflictException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictException';
      this.statusCode = 409;
    }
  }
  
  class UnprocessableEntityException extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnprocessableEntityException';
      this.statusCode = 422;
    }
  }
  
  class InternalServerErrorException extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalServerErrorException';
      this.statusCode = 500;
    }
  }
  
  class NotAcceptableException extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotAcceptableException';
      this.statusCode = 406;
    }
  }
  
  class ForbiddenException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenException';
      this.statusCode = 403;
    }
  }
  
  class UnauthorizedException extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedException';
      this.statusCode = 401;
    }
  }
  
  export {
    BadRequestException,
    NotFoundException,
    ConflictException,
    UnprocessableEntityException,
    InternalServerErrorException,
    NotAcceptableException,
    ForbiddenException,
    UnauthorizedException,
    BadGatewayException
  };
  