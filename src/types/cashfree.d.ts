declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeConfig {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_modal';
  }

  interface CheckoutResult {
    error?: { message: string };
    paymentDetails?: {
      paymentMessage: string;
      [key: string]: unknown;
    };
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>;
  }

  export function load(config: CashfreeConfig): Promise<CashfreeInstance>;
}
