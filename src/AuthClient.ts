type AuthStateParams = {
  token?: string;
  tokenExpiry?: Date;
};

export class AuthState {
  constructor(private token?: string, private tokenExpiry?: Date) {}

  init({ token, tokenExpiry }: AuthStateParams) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
  }

  getTokenInfo() {
    return {
      token: this.token,
      tokenExpiry: this.tokenExpiry,
    };
  }

  setTokenInfo(token: string, tokenExpiry: Date) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
  }

  hasValidToken() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }

    if (this.tokenExpiry < new Date()) {
      return false;
    }

    return true;
  }
}
