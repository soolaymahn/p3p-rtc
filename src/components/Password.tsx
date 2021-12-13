import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEncryption } from "../context/EncryptionProvider";

export const Password: React.FC = () => {
  const { password, setPassword } = useEncryption();
  return (
    <>
      <input
        type="text"
        value={password}
        onChange={(e) => {
          console.log("set peerId", e.target.value);
          setPassword(e.target.value);
        }}
      />
      <br />
    </>
  );
};
