export class UserNotFoundException extends Error {
  constructor(message: string = 'User not found') {
    super(message);
  }
}
