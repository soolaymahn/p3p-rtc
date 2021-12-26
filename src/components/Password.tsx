import React from "react";
import { useEncryption } from "../context/EncryptionProvider";

export const Password: React.FC = () => {
  const { password, setPassword } = useEncryption();

  return (
    <div
      style={{
        maxWidth: "100%",
      }}
    >
      <input
        type="text"
        id="password"
        value={password}
        placeholder="Password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <br />
      <br />
      <br />
    </div>
  );
};
