import { validate } from 'class-validator';
import { UserCredentials } from './user-credentials.model';

describe('UserCredentials', () => {
  const userCredentials = new UserCredentials('username', 'password');

  it('should return empty when validate success', async () => {
    const result = await validate(userCredentials);

    expect(result).toHaveLength(0);
  });

  it('should return error when username is missing', async () => {
    userCredentials.username = '';
    const result = await validate(userCredentials);

    expect(result).not.toHaveLength(0);
    expect(JSON.stringify(result)).toContain('username should not be empty');
  });

  it('should return error when password is missing', async () => {
    userCredentials.password = '';
    const result = await validate(userCredentials);

    expect(result).not.toHaveLength(0);
    expect(JSON.stringify(result)).toContain('password should not be empty');
  });

  it('should return error when password is invalid', async () => {
    userCredentials.password = 'pass';
    const result = await validate(userCredentials);

    expect(result).not.toHaveLength(0);
    expect(JSON.stringify(result)).toContain(
      'password must be longer than or equal to 8 characters',
    );
  });
});
