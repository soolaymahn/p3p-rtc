import React from "react";
import { useEffect } from "react";
import { useEncryption } from "../context/EncryptionProvider";

export const Password: React.FC = () => {
  const { password, setPassword, encrypt, decrypt } = useEncryption();

  useEffect(() => {
    const test = encrypt("test");

    console.log({ msg: test });
    console.log({ msg: decrypt(test) });
  }, [decrypt, encrypt]);
  return (
    <>
      <input
        type="text"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <br />
    </>
  );
};
