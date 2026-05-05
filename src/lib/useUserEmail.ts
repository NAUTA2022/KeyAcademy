import { useEffect, useState } from 'react';
import { useActiveWallet } from 'thirdweb/react';
import { getUserEmail } from 'thirdweb/wallets/in-app';
import { client } from './thirdweb';

export function useUserEmail() {
  const wallet = useActiveWallet();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) { setEmail(null); return; }
    getUserEmail({ client })
      .then((e) => setEmail(e ?? null))
      .catch(() => setEmail(null));
  }, [wallet]);

  return email;
}

export const ADMIN_EMAIL = 'andresquinteros2017@gmail.com';
