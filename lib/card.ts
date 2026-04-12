export function generateVirtualCard(userId: string) {
  // Deterministic but unique card based on userId hash
  const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const cardNumber = generateCardNumber(hash);
  const cvv = String(((hash * 7) % 900) + 100);
  const expMonth = String(((hash % 12) + 1)).padStart(2, "0");
  const expYear = String(2027 + (hash % 4));

  return {
    cardNumber,
    cvv,
    expiry: `${expMonth}/${expYear}`,
    type: (hash % 2 === 0 ? "VISA" : "MASTERCARD") as "VISA" | "MASTERCARD",
  };
}

function generateCardNumber(seed: number): string {
  let num = "";
  let s = seed;
  for (let i = 0; i < 16; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    num += Math.abs(s % 10).toString();
  }
  // Format as XXXX XXXX XXXX XXXX
  return num.match(/.{1,4}/g)!.join(" ");
}

export function maskCardNumber(cardNumber: string): string {
  const parts = cardNumber.split(" ");
  return `${parts[0]} **** **** ${parts[3]}`;
}
