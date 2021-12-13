import React, { createContext, memo, useCallback, useState } from "react";
import { useContext } from "react";
import { sjclDecrypt, sjclEncrypt } from "../utils/encryption";

interface EncryptionContextInterface {
  password: string;
  setPassword: (password: string) => void;
  encrypt: (plaintext: string) => string;
  decrypt: (ciphertext: string) => string;
}

const EncryptionContext = createContext<EncryptionContextInterface>({
  password: "",
  setPassword: () => {},
  encrypt: () => "",
  decrypt: () => "",
});

// eslint-disable-next-line react/display-name
export const EncryptionProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    const [password, setPassword] = useState("initial");

    const setPasswordInternal = useCallback((password: string) => {
      setPassword(password);
    }, []);

    const encrypt = useCallback(
      (plaintext) => {
        return sjclEncrypt(plaintext, password, "C2BF1CBB C2BBC1CF") as string;
      },
      [password]
    );

    const decrypt = useCallback(
      (ciphertext) => {
        return sjclDecrypt(ciphertext, password);
      },
      [password]
    );

    return (
      <EncryptionContext.Provider
        value={{ password, setPassword: setPasswordInternal, encrypt, decrypt }}
      >
        {children}
      </EncryptionContext.Provider>
    );
  }
);

export function useEncryption() {
  return useContext(EncryptionContext);
}
