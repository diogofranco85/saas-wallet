export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: any) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}