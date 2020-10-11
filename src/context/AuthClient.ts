type AuthStateParams = {
  token?: string;
  tokenExpiry?: Date;
  principal?: string;
};

export class AuthState {
  constructor(
    private token?: string,
    private tokenExpiry?: Date,
    private principal?: string
  ) {}

  init({ token, tokenExpiry, principal }: AuthStateParams) {
    this.token = token;
    this.principal = principal;
    this.tokenExpiry = tokenExpiry;
  }

  getTokenInfo() {
    return {
      token: this.token,
      principal: this.principal,
      tokenExpiry: this.tokenExpiry,
    };
  }

  setTokenInfo(token: string, tokenExpiry: Date, principal: string) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
    this.principal = principal;
  }

  hasValidToken() {
    if (!this.token || !this.tokenExpiry || !this.principal) {
      return false;
    }

    if (this.tokenExpiry < new Date()) {
      return false;
    }

    return true;
  }
}
