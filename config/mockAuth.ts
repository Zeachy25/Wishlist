export const MOCK_CREDENTIALS = {
  email: 'test@example.com',
  password: 'Password123',
  name: 'Test User',
};

export type AuthResult = {
  success: boolean;
  user?: { email: string; name: string };
  message?: string;
};

// Simulate network delay and response
export function signin(email: string, password: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        resolve({ success: true, user: { email: MOCK_CREDENTIALS.email, name: MOCK_CREDENTIALS.name } });
      } else {
        resolve({ success: false, message: 'Invalid credentials' });
      }
    }, 600);
  });
}

export function getMockCredentials() {
  return { email: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password };
}
