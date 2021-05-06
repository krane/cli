type AuthStateParams = {
  token?: string;
  tokenExpiry?: Date;
  user?: string;
};

export class AuthState {
  constructor(
    private token?: string,
    private tokenExpiry?: Date,
    private user?: string
  ) {}

  init({ token, tokenExpiry, user }: AuthStateParams) {
    this.token = token;
    this.user = user;
    this.tokenExpiry = tokenExpiry;
  }

  getTokenInfo() {
    return {
      token: this.token,
      user: this.user,
      tokenExpiry: this.tokenExpiry,
    };
  }

  setToken(token: string) {
    this.token = token;
  }

  setTokenInfo(token: string, tokenExpiry: Date, user: string) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
    this.user = user;
  }

  hasValidToken() {
    if (!this.token || !this.tokenExpiry || !this.user) {
      return false;
    }

    if (this.tokenExpiry < new Date()) {
      return false;
    }

    return true;
  }
}
