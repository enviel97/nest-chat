interface IAuthService {
  validateUser(validationRule: UserValidation);
}

interface AuthenticatedRequest extends Request {
  user: User;
}
