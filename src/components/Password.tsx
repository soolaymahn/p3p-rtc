import React from "react";
import { useEncryption } from "../context/EncryptionProvider";

export const Password: React.FC = () => {
  const { password, setPassword } = useEncryption();

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
