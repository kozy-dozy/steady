export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY!;
    const body = new URLSearchParams({ secret, response: token });

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    })

    const data = await res.json()

    return data.success === true;
  } catch (err) {
    console.error('reCAPTCHA verification failed:', err);
    return false;
  }
}
